"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { api } from "~/trpc/react";
import type { UIMessage } from "ai";
import { useQueryClient } from "@tanstack/react-query";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "~/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "~/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  type PromptInputMessage,
} from "~/components/ai-elements/prompt-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Loader } from "~/components/ai-elements/loader";
import { Sparkles, CopyIcon, RefreshCcwIcon } from "lucide-react";
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
  const [input, setInput] = useState("");
  const [loadingConversation, setLoadingConversation] = useState(false);

  // Track the active conversation ID using a ref to avoid stale closures
  const conversationIdRef = useRef<string | undefined>(conversationId);
  const queryClient = useQueryClient();

  // Fetch conversation messages when conversationId prop changes
  const { data: conversation, isLoading } = api.ai.getConversation.useQuery(
    { id: conversationId ?? "" },
    { enabled: !!conversationId },
  );

  // Convert database messages to UI messages format
  const initialMessages: UIMessage[] =
    conversation?.messages.map((msg) => {
      const messageData = msg.data as any;
      return {
        id: msg.id,
        role: msg.role.toLowerCase() as "user" | "assistant",
        parts: messageData?.parts ?? [
          {
            type: "text" as const,
            text:
              typeof messageData === "string"
                ? messageData
                : JSON.stringify(messageData),
          },
        ],
      };
    }) ?? [];

  const { messages, sendMessage, status, regenerate, error, setMessages } =
    useChat({
      id: conversationId, // Use conversation ID as stable chat ID
      messages: initialMessages,
      transport: new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest({ messages }) {
          return {
            body: {
              message: messages[messages.length - 1],
              conversationId,
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
      onFinish: async () => {
        console.log("✅ Chat finished");

        // Refresh conversation list in sidebar
        await queryClient.invalidateQueries({
          queryKey: [["ai", "getConversations"]],
        });
      },
    });

  // When conversationId prop changes, update the ref and load messages
  useEffect(() => {
    if (conversationId !== conversationIdRef.current) {
      console.log("🔄 Conversation changed:", conversationId);
      conversationIdRef.current = conversationId;

      // Clear messages for new chat or load existing messages
      if (!conversationId) {
        setMessages([]);
        setLoadingConversation(false);
      } else if (initialMessages.length > 0) {
        setMessages(initialMessages);
        setLoadingConversation(false);
      } else {
        setLoadingConversation(isLoading);
      }
    }
  }, [conversationId, initialMessages, isLoading, setMessages]);

  // Set loading state when fetching conversation
  useEffect(() => {
    if (conversationId && isLoading) {
      setLoadingConversation(true);
    }
  }, [conversationId, isLoading]);

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const hasText = Boolean(message.text);
      const hasAttachments = Boolean(message.files?.length);

      if (!(hasText || hasAttachments)) {
        return;
      }

      // Use the current conversation ID from ref
      const currentConvId = conversationIdRef.current;
      console.log("📤 Sending message with conversationId:", currentConvId);

      sendMessage(
        {
          text: message.text || "Sent with attachments",
          files: message.files,
        },
        {
          body: {
            conversationId: currentConvId,
          },
        },
      );
      setInput("");
    },
    [sendMessage],
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      const currentConvId = conversationIdRef.current;
      console.log("📤 Sending suggestion with conversationId:", currentConvId);

      sendMessage(
        { text: suggestion },
        {
          body: {
            conversationId: currentConvId,
          },
        },
      );
    },
    [sendMessage],
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

        {loadingConversation ? (
          <div className="flex h-full items-center justify-center">
            <Loader />
          </div>
        ) : (
          <Conversation className="min-w-0 flex-1">
            <ConversationContent className="overflow-x-hidden">
              {messages.length === 0 && suggestions && (
                <div className="flex h-full items-center justify-center">
                  <div className="grid max-w-2xl gap-2 p-4 sm:grid-cols-2">
                    {suggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="bg-card hover:bg-accent rounded-lg border p-4 text-left text-sm transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Display all messages (initial + new) */}
              {messages
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
                                    onClick={() => regenerate()}
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
                ))}
              {status === "submitted" && <Loader />}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        )}

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
                  disabled={!input && !status}
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
