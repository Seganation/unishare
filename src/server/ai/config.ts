/**
 * AI Model Configuration
 *
 * Centralized configuration for AI models used throughout the application.
 * Uses Vercel AI SDK v5 with Google Gemini provider.
 */

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { env } from "~/env";

/**
 * Create Google provider with proper configuration
 * Uses v1 API which is stable for Gemini 1.5 models
 */
const google = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
});

/**
 * Get the configured AI model
 *
 * Uses Google Gemini 2.5 Flash by default (stable, free tier available)
 * Can be overridden with AI_MODEL environment variable
 */
export function getModel() {
  const modelName = env.AI_MODEL ?? "gemini-2.5-flash";
  return google(modelName);
}

/**
 * Model options for different use cases
 */
export const models = {
  /**
   * Fast model for general use (chat, quick responses)
   * - Gemini 2.5 Flash (Stable)
   * - Speed: Very fast
   * - Context: 1M tokens
   * - Free tier available
   */
  fast: google("gemini-2.5-flash"),

  /**
   * Pro model for complex tasks (quiz/study plan generation)
   * - Gemini 2.5 Pro (Stable, most powerful)
   * - Quality: Highest quality outputs
   * - Context: 2M tokens
   */
  pro: google("gemini-2.5-pro"),

  /**
   * Default model (same as fast)
   */
  default: google("gemini-2.5-flash"),
} as const;

/**
 * Get model by name for dynamic selection
 */
export function getModelByName(name: keyof typeof models) {
  return models[name];
}
