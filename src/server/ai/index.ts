/**
 * AI Module - Google Gemini Integration
 *
 * This module provides AI capabilities using Google Gemini models.
 */

export {
  isOllamaAvailable,
  isModelAvailable,
  generateText,
  generateTextStream,
  chat,
  listAvailableModels,
  healthCheck,
  OllamaError,
  AIProviderError,
} from "./gemini";

export { generateQuiz, gradeQuizAttempt } from "./quiz-generator";
export type { QuizQuestion, GeneratedQuiz } from "./quiz-generator";

export { generateStudyPlan } from "./study-plan-generator";
export type { StudyPlanTask, StudyPlanWeek, GeneratedStudyPlan } from "./study-plan-generator";

export type { Message } from "./types";
