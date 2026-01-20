"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { api } from "~/trpc/react";
import type { UIMessage } from "ai";
import { useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  ConversationEmptyState,
} from "~/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "~/components/ai-elements/message";
import { Suggestions, Suggestion } from "~/components/ai-elements/suggestion";
import {
  PromptInput,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  type PromptInputMessage,
} from "~/components/ai-elements/prompt-input";
import { Card, CardContent } from "~/components/ui/card";
import { Loader } from "~/components/ai-elements/loader";
import { CopyIcon, RefreshCcwIcon, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Badge } from "~/components/ui/badge";

interface AIChatInterfaceProps {
  conversationId?: string;
  courseId?: string;
  noteId?: string;
  model?: string;
  temperature?: number;
  suggestions?: string[];
  title?: string;
  description?: string;
  onConversationCreated?: (conversationId: string) => void;
}

export function AIChatInterface({
  conversationId,
  courseId,
  noteId,
  model,
  temperature = 0.7,
  suggestions = [
    "Explain the concept of database normalization with examples",
    "Generate study notes for React Hooks",
    "Summarize the key points about object-oriented programming",
    "What are the differences between SQL and NoSQL databases?",
  ],
  title = "AI Study Assistant",
  description = "Chat with AI to help with your studies",
  onConversationCreated,
}: AIChatInterfaceProps) {
  // In AI SDK 5.0, useChat no longer manages input state
  // We manage it completely outside the hook
  const [input, setInput] = useState("");

  // Only generate a stable ID for NEW conversations (when conversationId is undefined)
  // For existing conversations, we don't need a stable ID
  const [stableId] = useState(() => (conversationId ? undefined : nanoid()));
  const conversationIdRef = useRef(conversationId || stableId);

  // Track if this is a newly created conversation (generated client-side)
  const [isNewConversation, setIsNewConversation] = useState(!conversationId);
  const queryClient = useQueryClient();

  // When switching to a different conversation (via sidebar or URL), update the ref
  useEffect(() => {
    if (conversationId) {
      conversationIdRef.current = conversationId;
      // Only clear isNewConversation if we have a stable ID and it's different
      if (stableId && conversationId !== stableId) {
        setIsNewConversation(false);
      }
    }
  }, [conversationId, stableId]);

  // Only fetch conversation if:
  // 1. conversationId exists (from URL or sidebar click)
  // 2. It's NOT a newly created conversation (stableId is undefined for existing conversations)
  const { data: conversation, isLoading } = api.ai.getConversation.useQuery(
    { id: conversationId ?? "" },
    {
      enabled: !!conversationId && !stableId,
      retry: false, // Don't retry on 404 for new conversations
    },
  );

  // Messages are now stored in UIMessage format - no conversion needed
  const initialMessages: UIMessage[] =
    conversation?.messages.map((msg) => {
      const uiMessage = msg.data as unknown as UIMessage;
      return {
        id: uiMessage.id || msg.id,
        role: uiMessage.role,
        parts: uiMessage.parts ?? [],
      };
    }) ?? [];

  const { messages, sendMessage, status, regenerate, error } = useChat({
    // For new conversations, use stableId. For existing, use conversationId
    id: stableId || conversationId,
    // Pass initialMessages for existing conversations
    messages: initialMessages.length > 0 ? initialMessages : undefined,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      // Follow documentation pattern: send only the last message
      prepareSendMessagesRequest({ messages }) {
        return {
          body: {
            message: messages[messages.length - 1],
            conversationId: conversationIdRef.current,
            courseId,
            noteId,
            model,
            temperature,
          },
        };
      },
    }),
    onError: (error: Error) => {
      console.error("❌ Chat error:", error);
    },
    onFinish: async (options) => {
      console.log("✅ Chat finished", options);

      // If this was a new conversation, notify parent NOW (after stream completes)
      if (isNewConversation && conversationIdRef.current) {
        console.log(
          "⚡ Notifying parent of conversation ID after stream:",
          conversationIdRef.current,
        );
        onConversationCreated?.(conversationIdRef.current);
        setIsNewConversation(false);
      }

      // Don't invalidate - just let the staleTime handle it
      // This preserves "load more" pagination state in the sidebar
    },
  });

  // Clear isNewConversation flag when conversation exists in DB
  useEffect(() => {
    if (conversationId && !isNewConversation && conversation) {
      // Conversation loaded successfully from DB
      setIsNewConversation(false);
    }
  }, [conversationId, conversation, isNewConversation]);

  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      const hasText = Boolean(message.text);
      const hasAttachments = Boolean(message.files?.length);

      if (!(hasText || hasAttachments)) {
        return;
      }

      console.log(
        "📤 Sending message with conversationId:",
        conversationIdRef.current,
      );

      sendMessage({ text: message.text || "Sent with attachments" });
      setInput("");
    },
    [sendMessage],
  );

  const handleSuggestionClick = useCallback(
    async (suggestion: string) => {
      // Generate conversation ID IMMEDIATELY if new conversation
      if (!conversationIdRef.current) {
        const newId = nanoid();
        console.log("⚡ Generated conversation ID:", newId);
        conversationIdRef.current = newId;
        setIsNewConversation(true);
        onConversationCreated?.(newId);
      }

      console.log(
        "📤 Sending suggestion with conversationId:",
        conversationIdRef.current,
      );

      sendMessage({ text: suggestion });
      setInput("");
    },
    [sendMessage, onConversationCreated],
  );

  return (
    <Card className="flex h-full w-full flex-col overflow-hidden border-0 shadow-none">
      <CardContent className="flex min-w-0 flex-1 flex-col overflow-hidden p-0">
        {error && (
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message === "Failed to fetch"
                ? "Unable to connect to AI server. Please make sure Ollama is running."
                : error.message}
            </AlertDescription>
          </Alert>
        )}

        <Conversation className="min-w-0 flex-1">
          <ConversationContent className="w-full overflow-x-hidden">
            {/* Show suggestions only if: no messages, not loading query, not streaming, and it's truly a new conversation */}
            {messages.length === 0 &&
              !isLoading &&
              status !== "streaming" &&
              status !== "submitted" &&
              isNewConversation &&
              suggestions && (
                <ConversationEmptyState title={title} description={description}>
                  <Suggestions className="mt-4">
                    {suggestions.map((suggestion, i) => (
                      <Suggestion
                        key={i}
                        suggestion={suggestion}
                        onClick={handleSuggestionClick}
                      />
                    ))}
                  </Suggestions>
                </ConversationEmptyState>
              )}

            {/* Show loader when loading existing conversation OR when first message is being sent */}
            {isLoading ||
            (messages.length === 0 &&
              initialMessages.length === 0 &&
              (status === "streaming" || status === "submitted")) ? (
              <div className="flex h-full items-center justify-center">
                <Loader />
              </div>
            ) : (
              // Use messages from useChat, but fallback to initialMessages if useChat hasn't populated yet
              (messages.length > 0 ? messages : initialMessages)
                .filter(
                  (message, index, self) =>
                    index === self.findIndex((m) => m.id === message.id),
                )
                .map((message) => (
                  <div key={message.id}>
                    {(message.parts ?? []).map((part, i) => {
                      if (part.type === "text") {
                        return (
                          <Message
                            key={`${message.id}-${i}`}
                            from={message.role}
                          >
                            <MessageContent className="max-w-full overflow-hidden">
                              <MessageResponse className="prose prose-base overflow-wrap-anywhere max-w-none text-base break-words [&_code]:break-all [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre_code]:whitespace-pre-wrap">
                                {part.text}
                              </MessageResponse>
                            </MessageContent>
                            {message.role === "assistant" &&
                              i === message.parts.length - 1 && (
                                <MessageActions>
                                  <MessageAction
                                    onClick={() =>
                                      regenerate({ messageId: message.id })
                                    }
                                    label="Retry"
                                  >
                                    <RefreshCcwIcon className="size-3" />
                                  </MessageAction>
                                  <MessageAction
                                    onClick={() =>
                                      navigator.clipboard.writeText(part.text)
                                    }
                                    label="Copy"
                                  >
                                    <CopyIcon className="size-3" />
                                  </MessageAction>
                                </MessageActions>
                              )}
                          </Message>
                        );
                      }
                      return null;
                    })}
                  </div>
                ))
            )}
            {(status === "submitted" || status === "streaming") && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="w-full border-t">
          <div className="mx-auto w-full max-w-3xl">
            <PromptInput onSubmit={handleSubmit}>
              <PromptInputBody>
                <PromptInputTextarea
                  onChange={(e) => setInput(e.target.value)}
                  value={input}
                  placeholder="Ask AI anything..."
                />
              </PromptInputBody>
              <PromptInputFooter>
                <Badge variant="secondary" className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-normal">
                  <Sparkles className="size-3" />
                  Gemini 2.5 Flash
                </Badge>
                <PromptInputSubmit
                  disabled={
                    !input || status === "streaming" || status === "submitted"
                  }
                  status={status}
                />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
