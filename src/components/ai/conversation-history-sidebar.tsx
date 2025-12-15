"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { MessageSquare, Trash2, Plus } from "lucide-react";

interface ChatHistorySidebarProps {
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string | undefined) => void;
  onNewChat: () => void;
}

export function ChatHistorySidebar({
  selectedConversationId,
  onSelectConversation,
  onNewChat,
}: ChatHistorySidebarProps) {
  const [limit, setLimit] = useState(5);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data, refetch, isFetching } = api.ai.getConversations.useQuery(
    { limit },
    {
      refetchOnWindowFocus: false, // Don't refetch on every window focus - it's too aggressive
      refetchOnMount: false, // Don't refetch on component mount if data exists
      staleTime: 30000, // Consider data fresh for 30 seconds
    },
  );

  const conversations = data?.conversations;
  const total = data?.total ?? 0;
  const hasMore = data?.hasMore ?? false;

  const deleteConversation = api.ai.deleteConversation.useMutation({
    onSuccess: () => {
      refetch();
      if (selectedConversationId) {
        onSelectConversation(undefined);
      }
    },
  });

  const handleDelete = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (confirm("Delete this conversation? This action cannot be undone.")) {
      await deleteConversation.mutateAsync({ id: conversationId });
    }
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    setLimit((prev) => prev + 10);
    await refetch();
    setIsLoadingMore(false);
  };

  return (
    <div className="flex h-full flex-col border-r">
      {/* Header */}
      <div className="shrink-0 border-b p-4">
        <Button onClick={onNewChat} className="w-full" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {conversations?.map((conversation) => {
            const isSelected = selectedConversationId === conversation.id;

            return (
              <div
                key={conversation.id}
                className={cn(
                  "group hover:bg-accent relative flex w-full cursor-pointer items-center gap-2 rounded-lg p-2.5 transition-colors",
                  isSelected && "bg-accent",
                )}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <MessageSquare className="text-muted-foreground h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 text-sm leading-tight">
                  {conversation.title || "Untitled Chat"}
                </span>
                <button
                  className="hover:bg-destructive/10 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => handleDelete(e, conversation.id)}
                >
                  <Trash2 className="text-destructive h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}

          {/* Load More Button */}
          {hasMore && (
            <div className="px-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={handleLoadMore}
                disabled={isLoadingMore || isFetching}
              >
                {isLoadingMore || isFetching ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="shrink-0 border-t p-4">
        <p className="text-muted-foreground text-center text-xs">
          Showing {conversations?.length || 0} of {total}
        </p>
      </div>
    </div>
  );
}
