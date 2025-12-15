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
import { CopyIcon, RefreshCcwIcon } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  const [activeConversationId, setActiveConversationId] =
    useState(conversationId);
  const conversationIdRef = useRef(conversationId);
  const queryClient = useQueryClient();

  // Sync ref immediately when prop changes (before render completes)
  if (conversationIdRef.current !== conversationId) {
    conversationIdRef.current = conversationId;
  }

  // Update active conversation ID when prop changes
  useEffect(() => {
    setActiveConversationId(conversationId);
  }, [conversationId]);

  // Fetch conversation messages when conversationId exists
  // BUT only if it's different from the active one (i.e., user navigated to existing conversation)
  const shouldFetch = conversationId && conversationId !== activeConversationId;
  const { data: conversation, isLoading } = api.ai.getConversation.useQuery(
    { id: conversationId ?? "" },
    { enabled: !!shouldFetch },
  );

  // Convert database messages to UI messages format
  const initialMessages: UIMessage[] =
    conversation?.messages.map((msg) => ({
      id: msg.id,
      role: msg.role.toLowerCase() as "user" | "assistant",
      parts: [
        {
          type: "text" as const,
          text: msg.content,
        },
      ],
    })) ?? [];

  const { messages, sendMessage, status, regenerate, error, setMessages } =
    useChat({
      id: activeConversationId,
      messages: initialMessages.length > 0 ? initialMessages : undefined,
      transport: new DefaultChatTransport({
        api: "/api/chat",
        // Follow documentation pattern: send only the last message
        prepareSendMessagesRequest({ messages, id }) {
          return {
            body: {
              message: messages[messages.length - 1],
              conversationId: conversationIdRef.current || id,
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
        // Refresh conversation list in sidebar
        await queryClient.invalidateQueries({
          queryKey: [["ai", "getConversations"]],
        });
      },
    });

  // Update messages when conversation changes
  useEffect(() => {
    if (
      conversationId &&
      conversationId !== activeConversationId &&
      initialMessages.length > 0
    ) {
      setMessages(initialMessages);
      setActiveConversationId(conversationId);
    } else if (!conversationId && activeConversationId) {
      // Starting new conversation - clear messages
      setMessages([]);
      setActiveConversationId(undefined);
    }
  }, [
    conversationId,
    initialMessages.length,
    activeConversationId,
    setMessages,
  ]);

  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      const hasText = Boolean(message.text);
      const hasAttachments = Boolean(message.files?.length);

      if (!(hasText || hasAttachments)) {
        return;
      }

      // Generate conversation ID IMMEDIATELY if new conversation
      if (!conversationIdRef.current) {
        const newId = nanoid();
        console.log("⚡ Generated conversation ID instantly:", newId);
        conversationIdRef.current = newId;
        setActiveConversationId(newId);
        // Update URL IMMEDIATELY
        onConversationCreated?.(newId);
      }

      console.log(
        "📤 Sending message with conversationId:",
        conversationIdRef.current,
      );

      // In AI SDK 5.0, sendMessage requires a message object with parts
      sendMessage({
        role: "user",
        parts: [
          {
            type: "text",
            text: message.text || "Sent with attachments",
          },
        ],
      });

      // Clear input after sending
      setInput("");
    },
    [sendMessage, onConversationCreated],
  );

  const handleSuggestionClick = useCallback(
    async (suggestion: string) => {
      // Generate conversation ID IMMEDIATELY if new conversation
      if (!conversationIdRef.current) {
        const newId = nanoid();
        console.log("⚡ Generated conversation ID instantly:", newId);
        conversationIdRef.current = newId;
        setActiveConversationId(newId);
        // Update URL IMMEDIATELY
        onConversationCreated?.(newId);
      }

      console.log(
        "📤 Sending suggestion with conversationId:",
        conversationIdRef.current,
      );

      // In AI SDK 5.0, sendMessage requires a message object with parts
      sendMessage({
        role: "user",
        parts: [
          {
            type: "text",
            text: suggestion,
          },
        ],
      });
      setInput("");
    },
    [sendMessage, onConversationCreated],
  );

  return (
    <Card className="flex h-full flex-col overflow-hidden border-0 shadow-none">
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
          <ConversationContent className="overflow-x-hidden">
            {messages.length === 0 && !isLoading && suggestions && (
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

            {isLoading && messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <Loader />
              </div>
            ) : (
              messages
                .filter(
                  (message, index, self) =>
                    index === self.findIndex((m) => m.id === message.id),
                )
                .map((message) => (
                  <div key={message.id}>
                    {message.parts.map((part, i) => {
                      if (part.type === "text") {
                        return (
                          <Message
                            key={`${message.id}-${i}`}
                            from={message.role}
                          >
                            <MessageContent className="max-w-full overflow-x-hidden">
                              <MessageResponse className="prose prose-sm max-w-none break-words [&_code]:break-words [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:whitespace-pre-wrap [&_pre_code]:whitespace-pre">
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
            {status === "submitted" && <Loader />}
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
                <div />
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
