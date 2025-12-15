/**
 * AI Types
 *
 * Type definitions for AI-related functionality
 */

/**
 * Message type for chat conversations
 */
export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

/**
 * AI generation options
 */
export interface GenerationOptions {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * AI chat options
 */
export interface ChatOptions {
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  model?: string;
  temperature?: number;
}

/**
 * Note generation context
 */
export interface NoteGenerationContext {
  courseName?: string;
  topic: string;
  context?: string;
  format?: "markdown" | "plain";
}
