/**
 * AI Chat API Route - Streaming endpoint for chat interface
 *
 * This route integrates with Vercel AI SDK to provide streaming chat responses
 * using the local Ollama server.
 *
 * @see https://sdk.vercel.ai/docs/ai-sdk-core/overview
 */

import { streamText, convertToModelMessages, createIdGenerator } from "ai";
import type { UIMessage } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { env } from "~/env";

// Create Ollama provider instance using OpenAI-compatible API
const ollama = createOpenAICompatible({
  name: "ollama",
  baseURL: `${env.OLLAMA_BASE_URL}/v1`,
});

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes max

export async function POST(req: Request) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Parse request body - now receiving only the last message
    const json = (await req.json()) as {
      message: UIMessage; // Single message instead of array
      conversationId?: string;
      courseId?: string;
      noteId?: string;
      model?: string;
      temperature?: number;
    };

    const {
      message,
      conversationId,
      courseId,
      noteId,
      model = env.OLLAMA_MODEL,
      temperature = 0.7,
    } = json;

    console.log("=== CHAT API REQUEST ===");
    console.log("Received conversationId:", conversationId);
    console.log("New message:", message.parts[0]);
    console.log("========================");

    // If conversationId provided, verify ownership and load context + previous messages
    let conversation: {
      id: string;
      userId: string;
      model: string;
      temperature: number;
      note?: { title: string; content: unknown } | null;
      course?: { title: string } | null;
      messages: Array<{ id: string; role: string; content: string }>;
    } | null = null;

    // Variable to store the active conversation ID
    let activeConversationId = conversationId;
    let previousMessages: UIMessage[] = [];

    if (conversationId) {
      // Check if conversation already exists and load previous messages
      conversation = await db.aiConversation.findFirst({
        where: {
          id: conversationId,
          userId: session.user.id,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              role: true,
              data: true,
            },
          },
          note: {
            select: {
              title: true,
              content: true,
            },
          },
          course: {
            select: {
              title: true,
            },
          },
        },
      });

      // Load messages in UIMessage format (recommended by AI SDK)
      if (conversation?.messages) {
        previousMessages = conversation.messages.map((msg) => {
          const uiMessage = msg.data as UIMessage;
          // Ensure message has required fields
          return {
            id: uiMessage.id || msg.id,
            role: uiMessage.role,
            parts: uiMessage.parts,
            ...(uiMessage.createdAt && {
              createdAt: new Date(uiMessage.createdAt),
            }),
            ...(uiMessage.metadata && { metadata: uiMessage.metadata }),
          };
        });
      }

      // If doesn't exist, create it with the client-provided ID
      if (!conversation) {
        // Extract text from the new message
        const textParts = message.parts.filter((p) => p.type === "text");
        const userContent =
          textParts.map((p) => p.text).join(" ") || "New conversation";

        // Generate a concise title for the conversation
        let conversationTitle = userContent.substring(0, 50);
        try {
          // Use AI to generate a short, descriptive title
          const titleResult = await streamText({
            model: ollama(model) as never,
            messages: [
              {
                role: "system",
                content:
                  "Generate a very short, concise title (max 6 words) for this conversation. Only return the title, nothing else.",
              },
              {
                role: "user",
                content: userContent,
              },
            ],
            temperature: 0.3,
          });

          const titleText = await titleResult.text;
          if (titleText && titleText.length < 100) {
            conversationTitle = titleText.trim();
          }
        } catch (titleError) {
          console.error("Error generating title:", titleError);
          // Fall back to truncated user content
        }

        // Create new conversation with client-provided ID
        conversation = await db.aiConversation.create({
          data: {
            id: conversationId,
            title: conversationTitle,
            userId: session.user.id,
            courseId,
            noteId,
            model,
            temperature,
          },
          include: {
            messages: {
              select: {
                id: true,
                role: true,
                data: true,
              },
            },
            note: {
              select: {
                title: true,
                content: true,
              },
            },
            course: {
              select: {
                title: true,
              },
            },
          },
        });

        activeConversationId = conversationId;
        console.log(
          "✅ Created conversation with client ID:",
          activeConversationId,
        );
      }
    } else {
      return new Response("No conversation ID provided", { status: 400 });
    }

    // Build system message based on context
    let systemMessage = `You are a helpful teaching assistant for university students. Provide clear, educational responses. Format your responses using markdown with proper headings, bullet points, and code blocks where appropriate.`;

    if (conversation?.note) {
      systemMessage = `You are helping with a note titled "${conversation.note.title}". The current note content is available as context. Provide helpful, educational responses related to this note.`;
    } else if (conversation?.course) {
      systemMessage = `You are helping with a course titled "${conversation.course.title}". Provide helpful, educational responses related to this course.`;
    }

    // Combine previous messages with the new message
    const allMessages = [...previousMessages, message];

    // Variable to capture token usage from streamText
    let tokenUsage: number | undefined;

    // Create streaming response
    const result = streamText({
      model: ollama(model) as never,
      messages: convertToModelMessages(allMessages),
      system: systemMessage,
      temperature,
      async onFinish({ usage }) {
        // Capture token usage for saving later
        tokenUsage = usage.totalTokens;
      },
    });

    // Convert to UI message stream response with server-side message ID generation
    // This ensures consistent IDs across sessions (important for persistence)
    // Using toUIMessageStreamResponse() for compatibility with DefaultChatTransport
    return result.toUIMessageStreamResponse({
      originalMessages: allMessages,
      generateMessageId: createIdGenerator({
        prefix: "msg",
        size: 16,
      }),
      async onFinish({ messages }) {
        // Save ALL messages (recommended by AI SDK)
        // The messages parameter contains the complete conversation (previous + new)
        try {
          // Get only the NEW messages that aren't in the database yet
          const existingMessageIds = new Set(previousMessages.map((m) => m.id));
          const newMessages = messages.filter(
            (msg) => !existingMessageIds.has(msg.id),
          );

          console.log(
            `💾 Saving ${newMessages.length} new messages out of ${messages.length} total`,
          );

          for (const msg of newMessages) {
            await db.aiMessage.create({
              data: {
                id: msg.id,
                conversationId: activeConversationId!,
                role: msg.role.toUpperCase() as "USER" | "ASSISTANT" | "SYSTEM",
                data: msg, // Store complete UIMessage object
                tokensUsed: msg.role === "assistant" ? tokenUsage : undefined,
              },
            });
          }

          // Update conversation timestamp
          await db.aiConversation.update({
            where: { id: activeConversationId! },
            data: { updatedAt: new Date() },
          });

          console.log("✅ Saved messages successfully");
        } catch (error) {
          console.error("❌ Error saving messages:", error);
        }
      },
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process AI request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
