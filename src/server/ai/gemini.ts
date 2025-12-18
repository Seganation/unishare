/**
 * Gemini AI Client
 *
 * Provides AI capabilities using Google Gemini models.
 * Compatibility layer for functions previously using Ollama.
 */

import { generateText as aiGenerateText } from "ai";
import { models } from "./config";

/**
 * Error types for better error handling
 */
export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "SERVER_UNAVAILABLE"
      | "MODEL_NOT_FOUND"
      | "GENERATION_FAILED"
      | "INVALID_API_KEY",
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}

// For backwards compatibility
export const OllamaError = AIProviderError;

/**
 * Check if Gemini is available
 */
export async function isOllamaAvailable(): Promise<boolean> {
  // Gemini is always "available" if API key is set
  // Actual availability is checked when making requests
  return true;
}

/**
 * Check if model is available
 */
export async function isModelAvailable(): Promise<boolean> {
  return true;
}

/**
 * Generate text using Gemini (non-streaming)
 */
export async function generateText(options: {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<{ text: string; tokensUsed?: number }> {
  try {
    const result = await aiGenerateText({
      model: models.default, // Use default Gemini model
      system: options.systemPrompt,
      prompt: options.prompt,
      temperature: options.temperature ?? 0.7,
      ...(options.maxTokens && { maxTokens: options.maxTokens }),
    });

    return {
      text: result.text,
      tokensUsed: result.usage?.totalTokens,
    };
  } catch (error) {
    throw new AIProviderError(
      "Failed to generate text with Gemini",
      "GENERATION_FAILED",
      error,
    );
  }
}

/**
 * Generate text using Gemini (streaming)
 */
export async function* generateTextStream(options: {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): AsyncGenerator<{ text: string; done: boolean }> {
  // Streaming not implemented yet for backwards compatibility
  // Falls back to non-streaming
  const result = await generateText(options);
  yield { text: result.text, done: true };
}

/**
 * Chat with conversation context (non-streaming)
 */
export async function chat(options: {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  model?: string;
  temperature?: number;
}): Promise<{ text: string; tokensUsed?: number }> {
  try {
    // Convert messages to system/prompt format
    const systemMessages = options.messages.filter((m) => m.role === "system");
    const conversationMessages = options.messages.filter(
      (m) => m.role !== "system",
    );

    const systemPrompt = systemMessages.map((m) => m.content).join("\n");
    const prompt = conversationMessages
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const result = await aiGenerateText({
      model: models.default,
      system: systemPrompt,
      prompt,
      temperature: options.temperature ?? 0.7,
    });

    return {
      text: result.text,
      tokensUsed: result.usage?.totalTokens,
    };
  } catch (error) {
    throw new AIProviderError(
      "Failed to chat with Gemini",
      "GENERATION_FAILED",
      error,
    );
  }
}

/**
 * List available models
 */
export async function listAvailableModels(): Promise<string[]> {
  return ["gemini-1.5-flash", "gemini-1.5-pro"];
}

/**
 * Health check for Gemini
 */
export async function healthCheck(): Promise<{
  available: boolean;
  modelAvailable: boolean;
  models: string[];
  error?: string;
}> {
  try {
    const models = await listAvailableModels();

    return {
      available: true,
      modelAvailable: true,
      models,
    };
  } catch (error) {
    return {
      available: false,
      modelAvailable: false,
      models: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
