/**
 * AI Module - Local Ollama Integration
 *
 * This module provides AI capabilities using a local Ollama server.
 * All AI processing happens locally and is NOT included in production deployments.
 *
 * @see /local_ai_ollama_phi_3_project_notes.md for setup instructions
 */

export {
  getOllamaClient,
  isOllamaAvailable,
  isModelAvailable,
  generateText,
  generateTextStream,
  chat,
  listAvailableModels,
  healthCheck,
  OllamaError,
} from "./ollama";

export { generateQuiz, gradeQuizAttempt } from "./quiz-generator";
export type { QuizQuestion, GeneratedQuiz } from "./quiz-generator";

export { generateStudyPlan } from "./study-plan-generator";
export type { StudyPlanTask, StudyPlanWeek, GeneratedStudyPlan } from "./study-plan-generator";

export type { Message } from "./types";
