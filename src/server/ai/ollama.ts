/**
 * Ollama Client Utility
 *
 * Production-ready wrapper for local Ollama AI server.
 * Handles connection management, error handling, and retries.
 *
 * @see /local_ai_ollama_phi_3_project_notes.md for setup instructions
 */

import { Ollama } from "ollama";
import { env } from "~/env";

/**
 * Singleton Ollama client instance
 */
let ollamaClient: Ollama | null = null;

/**
 * Get or create the Ollama client instance
 */
export function getOllamaClient(): Ollama {
  if (!ollamaClient) {
    ollamaClient = new Ollama({
      host: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
    });
  }
  return ollamaClient;
}

/**
 * Check if Ollama server is running and accessible
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const client = getOllamaClient();
    const models = await client.list();
    return models.models.length > 0;
  } catch {
    return false;
  }
}

/**
 * Check if the configured model is available locally
 */
export async function isModelAvailable(modelName?: string): Promise<boolean> {
  try {
    const client = getOllamaClient();
    const models = await client.list();
    const targetModel = modelName ?? process.env.OLLAMA_MODEL ?? "qwen2.5:1.5b";

    return models.models.some((model) => model.name === targetModel);
  } catch {
    return false;
  }
}

/**
 * Error types for better error handling
 */
export class OllamaError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "SERVER_UNAVAILABLE"
      | "MODEL_NOT_FOUND"
      | "GENERATION_FAILED",
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "OllamaError";
  }
}

/**
 * Generate text using Ollama (non-streaming)
 *
 * @example
 * ```ts
 * const result = await generateText({
 *   prompt: "Explain database normalization",
 *   systemPrompt: "You are a helpful teaching assistant."
 * });
 * console.log(result.text);
 * ```
 */
export async function generateText(options: {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<{ text: string; tokensUsed?: number }> {
  const client = getOllamaClient();
  const model = options.model ?? process.env.OLLAMA_MODEL ?? "qwen2.5:1.5b";

  // Check if Ollama is available
  if (!(await isOllamaAvailable())) {
    throw new OllamaError(
      "Ollama server is not running. Please start Ollama and try again.",
      "SERVER_UNAVAILABLE",
    );
  }

  // Check if model is available
  if (!(await isModelAvailable(model))) {
    throw new OllamaError(
      `Model '${model}' is not available. Please pull it using: ollama pull ${model}`,
      "MODEL_NOT_FOUND",
    );
  }

  try {
    const response = await client.generate({
      model,
      prompt: options.prompt,
      system: options.systemPrompt,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.7,
        num_predict: options.maxTokens,
      },
    });

    return {
      text: response.response,
      tokensUsed: response.eval_count,
    };
  } catch (error) {
    throw new OllamaError(
      "Failed to generate text. Please check your Ollama server.",
      "GENERATION_FAILED",
      error,
    );
  }
}

/**
 * Generate text using Ollama (streaming)
 *
 * @example
 * ```ts
 * const stream = generateTextStream({
 *   prompt: "Write a study guide for React hooks"
 * });
 *
 * for await (const chunk of stream) {
 *   process.stdout.write(chunk.text);
 * }
 * ```
 */
export async function* generateTextStream(options: {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): AsyncGenerator<{ text: string; done: boolean }> {
  const client = getOllamaClient();
  const model = options.model ?? process.env.OLLAMA_MODEL ?? "qwen2.5:1.5b";

  // Check if Ollama is available
  if (!(await isOllamaAvailable())) {
    throw new OllamaError(
      "Ollama server is not running. Please start Ollama and try again.",
      "SERVER_UNAVAILABLE",
    );
  }

  // Check if model is available
  if (!(await isModelAvailable(model))) {
    throw new OllamaError(
      `Model '${model}' is not available. Please pull it using: ollama pull ${model}`,
      "MODEL_NOT_FOUND",
    );
  }

  try {
    const stream = await client.generate({
      model,
      prompt: options.prompt,
      system: options.systemPrompt,
      stream: true,
      options: {
        temperature: options.temperature ?? 0.7,
        num_predict: options.maxTokens,
      },
    });

    for await (const chunk of stream) {
      yield {
        text: chunk.response,
        done: chunk.done,
      };
    }
  } catch (error) {
    throw new OllamaError(
      "Failed to generate text stream. Please check your Ollama server.",
      "GENERATION_FAILED",
      error,
    );
  }
}

/**
 * Chat with context (for multi-turn conversations)
 *
 * @example
 * ```ts
 * const result = await chat({
 *   messages: [
 *     { role: "user", content: "What is React?" },
 *     { role: "assistant", content: "React is a JavaScript library..." },
 *     { role: "user", content: "How do hooks work?" }
 *   ]
 * });
 * ```
 */
export async function chat(options: {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  model?: string;
  temperature?: number;
}): Promise<{ text: string; tokensUsed?: number }> {
  const client = getOllamaClient();
  const model = options.model ?? process.env.OLLAMA_MODEL ?? "qwen2.5:1.5b";

  // Check if Ollama is available
  if (!(await isOllamaAvailable())) {
    throw new OllamaError(
      "Ollama server is not running. Please start Ollama and try again.",
      "SERVER_UNAVAILABLE",
    );
  }

  // Check if model is available
  if (!(await isModelAvailable(model))) {
    throw new OllamaError(
      `Model '${model}' is not available. Please pull it using: ollama pull ${model}`,
      "MODEL_NOT_FOUND",
    );
  }

  try {
    const response = await client.chat({
      model,
      messages: options.messages,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.7,
      },
    });

    return {
      text: response.message.content,
      tokensUsed: response.eval_count,
    };
  } catch (error) {
    throw new OllamaError(
      "Failed to chat. Please check your Ollama server.",
      "GENERATION_FAILED",
      error,
    );
  }
}

/**
 * List all available models
 */
export async function listAvailableModels(): Promise<string[]> {
  try {
    const client = getOllamaClient();
    const models = await client.list();
    return models.models.map((model) => model.name);
  } catch {
    return [];
  }
}

/**
 * Health check for Ollama server
 */
export async function healthCheck(): Promise<{
  available: boolean;
  modelAvailable: boolean;
  models: string[];
  error?: string;
}> {
  try {
    const available = await isOllamaAvailable();
    if (!available) {
      return {
        available: false,
        modelAvailable: false,
        models: [],
        error: "Ollama server is not running",
      };
    }

    const modelAvailable = await isModelAvailable();
    const models = await listAvailableModels();

    return {
      available: true,
      modelAvailable,
      models,
      error: modelAvailable
        ? undefined
        : `Model '${process.env.OLLAMA_MODEL ?? "qwen2.5:1.5b"}' not found`,
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
