"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { AIChatInterface } from "~/components/ai/ai-chat-interface";
import { ChatHistorySidebar } from "~/components/ai/conversation-history-sidebar";
import { Skeleton } from "~/components/ui/skeleton";

export default function AIPage() {
  const router = useRouter();
  const params = useParams();
  const conversationIdFromUrl = params.id
    ? Array.isArray(params.id)
      ? params.id[0]
      : params.id
    : undefined;

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | undefined
  >(conversationIdFromUrl);

  // Sync state with URL params when URL changes
  useEffect(() => {
    setSelectedConversationId(conversationIdFromUrl);
  }, [conversationIdFromUrl]);

  const handleNewChat = useCallback(() => {
    setSelectedConversationId(undefined);
    router.push("/ai");
  }, [router]);

  const handleSelectConversation = useCallback(
    (conversationId: string | undefined) => {
      setSelectedConversationId(conversationId);
      // Update URL when selecting a conversation
      if (conversationId) {
        router.push(`/ai/${conversationId}`);
      } else {
        router.push("/ai");
      }
    },
    [router],
  );

  const handleConversationCreated = useCallback(
    (conversationId: string) => {
      console.log("🎉 New conversation created:", conversationId);
      // Update selected conversation ID and URL
      setSelectedConversationId(conversationId);
      router.push(`/ai/${conversationId}`);
    },
    [router],
  );

  return (
    <div className="fixed inset-0 top-16 flex overflow-hidden">
      {/* Chat History Sidebar */}
      <div className="hidden h-full w-[280px] shrink-0 border-r lg:block">
        <Suspense fallback={<Skeleton className="h-full w-full" />}>
          <ChatHistorySidebar
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
          />
        </Suspense>
      </div>

      {/* Chat Interface - NO KEY PROP, component manages its own state */}
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<Skeleton className="h-full w-full" />}>
          <AIChatInterface
            conversationId={selectedConversationId}
            onConversationCreated={handleConversationCreated}
            suggestions={[
              "Explain the concept of database normalization with examples",
              "Generate study notes for React Hooks",
              "Summarize the key points about object-oriented programming",
              "What are the differences between SQL and NoSQL databases?",
              "Help me understand Big O notation",
            ]}
          />
        </Suspense>
      </div>
    </div>
  );
}
