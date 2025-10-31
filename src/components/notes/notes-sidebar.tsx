"use client";

import { useState } from "react";
import { Plus, FileText, MoreVertical, Trash2, Edit2, GripVertical } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";

interface NotePage {
  id: string;
  title: string;
  icon: string | null;
  order: number;
  updatedAt: Date;
}

interface NotesSidebarProps {
  courseId: string;
  currentPageId: string | null;
  pages: NotePage[];
  canEdit: boolean;
}

export function NotesSidebar({
  courseId,
  currentPageId,
  pages,
  canEdit,
}: NotesSidebarProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePage = async () => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/notes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      if (response.ok) {
        const newPage = await response.json();
        router.push(`/courses/${courseId}/notes/${newPage.id}`);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to create page:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      await fetch(`/api/notes/${pageId}`, {
        method: "DELETE",
      });

      if (currentPageId === pageId) {
        router.push(`/courses/${courseId}/notes`);
      }
      router.refresh();
    } catch (error) {
      console.error("Failed to delete page:", error);
    }
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h2 className="font-semibold text-gray-900">Pages</h2>
        {canEdit && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCreatePage}
            disabled={isCreating}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto p-2">
        {pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <FileText className="mb-2 h-12 w-12 text-gray-300" />
            <p className="text-sm text-gray-500">No pages yet</p>
            {canEdit && (
              <p className="mt-1 text-xs text-gray-400">
                Click + to create one
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {pages.map((page) => (
              <div
                key={page.id}
                className={cn(
                  "group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  currentPageId === page.id
                    ? "bg-purple-50 text-purple-700"
                    : "hover:bg-gray-100 text-gray-700",
                )}
              >
                <Link
                  href={`/courses/${courseId}/notes/${page.id}`}
                  className="flex flex-1 items-center gap-2 overflow-hidden"
                >
                  {page.icon ? (
                    <span className="text-base">{page.icon}</span>
                  ) : (
                    <FileText className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="truncate font-medium">{page.title}</span>
                </Link>

                {canEdit && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleDeletePage(page.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
