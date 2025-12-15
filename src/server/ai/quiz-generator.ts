/**
 * AI Quiz Generator
 *
 * Generates quizzes from course content using AI
 */

import { generateText } from "./ollama";
import { z } from "zod";

export const QuizQuestionSchema = z.object({
  question: z.string(),
  type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  explanation: z.string().optional(),
});

export const QuizSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  questions: z.array(QuizQuestionSchema),
});

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type GeneratedQuiz = z.infer<typeof QuizSchema>;

/**
 * Generate a quiz from course content
 */
export async function generateQuiz(options: {
  topic: string;
  courseContext?: string;
  noteContent?: string;
  questionCount?: number;
  difficulty?: "easy" | "medium" | "hard";
  questionTypes?: Array<"MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER">;
}): Promise<{ quiz: GeneratedQuiz; tokensUsed?: number }> {
  const {
    topic,
    courseContext,
    noteContent,
    questionCount = 10,
    difficulty = "medium",
    questionTypes = ["MULTIPLE_CHOICE", "TRUE_FALSE"],
  } = options;

  // Build context
  let contextInfo = "";
  if (courseContext) {
    contextInfo += `Course context: ${courseContext}\n`;
  }
  if (noteContent) {
    contextInfo += `Note content: ${noteContent}\n`;
  }

  // Build question type instructions
  const typeInstructions = questionTypes
    .map((type) => {
      if (type === "MULTIPLE_CHOICE") {
        return "multiple choice questions with 4 options (A, B, C, D)";
      } else if (type === "TRUE_FALSE") {
        return "true/false questions";
      } else {
        return "short answer questions";
      }
    })
    .join(" and ");

  const systemPrompt = `You are a quiz generator for university students. Generate educational quizzes that test understanding of concepts.

IMPORTANT: You must respond with ONLY valid JSON, no other text. The JSON must match this exact structure:

{
  "title": "Quiz Title",
  "description": "Brief description",
  "questions": [
    {
      "question": "Question text here?",
      "type": "MULTIPLE_CHOICE",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "A",
      "explanation": "Explanation of why this is correct"
    }
  ]
}

For TRUE_FALSE questions:
- type must be "TRUE_FALSE"
- options should be ["True", "False"]
- correctAnswer must be "true" or "false"

For SHORT_ANSWER questions:
- type must be "SHORT_ANSWER"
- options can be null or omitted
- correctAnswer should be the expected answer

${contextInfo ? `Context:\n${contextInfo}` : ""}`;

  const prompt = `Generate a ${difficulty} difficulty quiz about: "${topic}"

Create exactly ${questionCount} questions using ${typeInstructions}.

Requirements:
- Questions should test understanding, not just memorization
- Include explanations for each answer
- Make questions clear and unambiguous
- For multiple choice, ensure only one answer is clearly correct
- Difficulty level: ${difficulty}

Return ONLY the JSON object, no markdown formatting, no code blocks, no additional text.`;

  const result = await generateText({
    prompt,
    systemPrompt,
    temperature: 0.7,
  });

  // Parse the AI response
  let quizData: GeneratedQuiz;
  try {
    // Clean up the response - remove markdown code blocks if present
    let cleanedText = result.text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/```\n?/g, "");
    }

    const parsed = JSON.parse(cleanedText);
    quizData = QuizSchema.parse(parsed);
  } catch (error) {
    console.error("Failed to parse quiz JSON:", error);
    console.error("Raw response:", result.text);
    throw new Error(
      "Failed to generate quiz. The AI response was not in the expected format.",
    );
  }

  return {
    quiz: quizData,
    tokensUsed: result.tokensUsed,
  };
}

/**
 * Grade a quiz attempt
 */
export function gradeQuizAttempt(
  questions: Array<{
    type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
    correctAnswer: string;
  }>,
  answers: Array<{ questionId: string; userAnswer: string }>,
): {
  score: number;
  results: Array<{ questionId: string; isCorrect: boolean }>;
} {
  const results = answers.map((answer, index) => {
    const question = questions[index];
    if (!question) {
      return { questionId: answer.questionId, isCorrect: false };
    }

    let isCorrect = false;

    if (question.type === "SHORT_ANSWER") {
      // For short answer, do case-insensitive comparison and trim
      isCorrect =
        answer.userAnswer.trim().toLowerCase() ===
        question.correctAnswer.trim().toLowerCase();
    } else {
      // For MC and T/F, exact match
      isCorrect = answer.userAnswer === question.correctAnswer;
    }

    return {
      questionId: answer.questionId,
      isCorrect,
    };
  });

  const correctCount = results.filter((r) => r.isCorrect).length;
  const score = (correctCount / questions.length) * 100;

  return { score, results };
}
