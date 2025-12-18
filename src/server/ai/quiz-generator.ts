/**
 * AI Quiz Generator
 *
 * Generates quizzes from course content using AI
 */

import { generateText } from "ai";
import { z } from "zod";
import { models } from "./config";
import { QUIZ_GENERATION_SYSTEM_PROMPT, buildQuizPrompt } from "./prompts";

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

  // Use optimized prompts from centralized config
  const result = await generateText({
    model: models.pro, // Use pro model for better quiz quality
    system: QUIZ_GENERATION_SYSTEM_PROMPT,
    prompt: buildQuizPrompt({
      topic,
      questionCount,
      difficulty,
      questionTypes,
      courseContext,
      noteContent,
    }),
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
    tokensUsed: result.usage?.totalTokens,
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
