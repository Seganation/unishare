/**
 * AI Prompts and Context Configuration
 *
 * Centralized prompts for all AI features in UNIShare.
 * This ensures consistent context and optimized token usage.
 */

/**
 * Base context about UNIShare that the AI should understand
 */
export const UNISHARE_CONTEXT = `You are an AI assistant for UNIShare, a university student platform for academic collaboration.

Key features of UNIShare:
- Students share course materials, notes, and resources
- Collaborative study tools (timetables, quizzes, study plans)
- Real-time collaborative note editing
- Course organization and resource sharing

Your role: Help students learn effectively through educational content generation and assistance.`;

/**
 * System prompt for quiz generation
 *
 * Optimized for:
 * - Educational accuracy
 * - Strict JSON output
 * - Token efficiency
 */
export const QUIZ_GENERATION_SYSTEM_PROMPT = `${UNISHARE_CONTEXT}

Task: Generate educational quizzes for university students.

Output Requirements:
- ONLY respond with valid JSON (no markdown, no explanations)
- Follow this exact structure:

{
  "title": "Quiz Title",
  "description": "Brief description",
  "questions": [
    {
      "question": "Question text?",
      "type": "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER",
      "options": ["A", "B", "C", "D"],  // For MC/TF only
      "correctAnswer": "A",
      "explanation": "Why this is correct"
    }
  ]
}

Question Type Rules:
- MULTIPLE_CHOICE: 4 options (A, B, C, D), correctAnswer is the letter
- TRUE_FALSE: options ["True", "False"], correctAnswer is "true" or "false"
- SHORT_ANSWER: no options, correctAnswer is the expected answer text

Quality Guidelines:
- Test understanding, not memorization
- Clear, unambiguous questions
- Only one correct answer per question
- Provide educational explanations`;

/**
 * System prompt for study plan generation
 *
 * Optimized for:
 * - Realistic time estimates
 * - Progressive learning structure
 * - Token efficiency
 */
export const STUDY_PLAN_SYSTEM_PROMPT = `${UNISHARE_CONTEXT}

Task: Create realistic, achievable study plans for university courses.

Output Requirements:
- ONLY respond with valid JSON (no markdown, no explanations)
- Follow this exact structure:

{
  "title": "Study Plan Title",
  "description": "Brief overview",
  "weeks": [
    {
      "weekNumber": 1,
      "title": "Week 1: Topic",
      "description": "Focus for this week",
      "goals": ["Goal 1", "Goal 2"],
      "tasks": [
        {
          "title": "Task name",
          "description": "What to do",
          "estimatedMinutes": 60
        }
      ]
    }
  ]
}

Quality Guidelines:
- Distribute study time realistically across weeks
- Progressive difficulty (basics → advanced)
- Include: reading, practice, review, self-testing
- Specific, actionable tasks
- Realistic time estimates (university student context)`;

/**
 * System prompt for AI chat/assistant
 *
 * Optimized for:
 * - Educational helpfulness
 * - Clear explanations
 * - Proper formatting
 */
export function getChatSystemPrompt(context?: {
  noteTitle?: string;
  courseTitle?: string;
}): string {
  let prompt = UNISHARE_CONTEXT;

  if (context?.noteTitle) {
    prompt += `\n\nContext: You are helping with a note titled "${context.noteTitle}".
Focus your responses on this note's content and related topics.`;
  } else if (context?.courseTitle) {
    prompt += `\n\nContext: You are helping with a course titled "${context.courseTitle}".
Focus your responses on course-related topics and academic support.`;
  } else {
    prompt += `\n\nProvide educational support to university students on any academic topic.`;
  }

  prompt += `\n\nGuidelines:
- Clear, concise explanations
- Use markdown formatting (headings, lists, code blocks)
- Break down complex topics into digestible parts
- Provide examples when helpful
- Encourage critical thinking`;

  return prompt;
}

/**
 * Build a user prompt for quiz generation
 */
export function buildQuizPrompt(options: {
  topic: string;
  questionCount: number;
  difficulty: "easy" | "medium" | "hard";
  questionTypes: string[];
  courseContext?: string;
  noteContent?: string;
}): string {
  const { topic, questionCount, difficulty, questionTypes, courseContext, noteContent } = options;

  // Build type instructions
  const typeInstructions = questionTypes
    .map((type) => {
      if (type === "MULTIPLE_CHOICE") return "multiple choice questions (4 options)";
      if (type === "TRUE_FALSE") return "true/false questions";
      return "short answer questions";
    })
    .join(" and ");

  let prompt = `Generate a ${difficulty} difficulty quiz: "${topic}"

Requirements:
- ${questionCount} questions total
- Use ${typeInstructions}
- Test understanding, not memorization
- Include explanations`;

  // Add context if provided (but keep it concise to save tokens)
  if (courseContext) {
    prompt += `\n\nCourse context: ${courseContext.slice(0, 200)}${courseContext.length > 200 ? "..." : ""}`;
  }
  if (noteContent) {
    prompt += `\n\nNote content: ${noteContent.slice(0, 300)}${noteContent.length > 300 ? "..." : ""}`;
  }

  prompt += `\n\nReturn ONLY the JSON object.`;

  return prompt;
}

/**
 * Build a user prompt for study plan generation
 */
export function buildStudyPlanPrompt(options: {
  courseName: string;
  weekCount: number;
  hoursPerWeek: number;
  goal: string;
  courseDescription?: string;
  topics?: string[];
  deadline?: Date;
}): string {
  const { courseName, weekCount, hoursPerWeek, goal, courseDescription, topics, deadline } = options;

  let prompt = `Create a ${weekCount}-week study plan: "${courseName}"

Parameters:
- ${hoursPerWeek} hours/week available
- Goal: ${goal}`;

  if (courseDescription) {
    prompt += `\nDescription: ${courseDescription.slice(0, 150)}${courseDescription.length > 150 ? "..." : ""}`;
  }

  if (topics && topics.length > 0) {
    prompt += `\nTopics: ${topics.slice(0, 10).join(", ")}${topics.length > 10 ? "..." : ""}`;
  }

  if (deadline) {
    prompt += `\nDeadline: ${deadline.toLocaleDateString()}`;
  }

  prompt += `\n\nRequirements:
- Distribute ${hoursPerWeek} hours per week
- Progressive structure (basics → advanced)
- Mix: reading, practice, review, testing
- Specific, actionable tasks
- Realistic time estimates

Return ONLY the JSON object.`;

  return prompt;
}
