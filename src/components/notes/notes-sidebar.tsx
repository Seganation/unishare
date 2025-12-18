"use client";

import { useState } from "react";
import {
  Plus,
  FileText,
  MoreVertical,
  Trash2,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
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
  parentId: string | null;
  children?: NotePage[];
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

  const handleCreatePage = async (parentId?: string) => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/notes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, parentId }),
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

  // Recursive component for rendering a page and its children
  const PageItem = ({
    page,
    depth = 0,
  }: {
    page: NotePage;
    depth?: number;
  }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = page.children && page.children.length > 0;

    return (
      <div key={page.id}>
        <div
          className={cn(
            "group relative flex items-center gap-2 rounded-lg py-2 text-sm transition-colors",
            currentPageId === page.id
              ? "bg-primary/10 text-primary"
              : "hover:bg-muted",
          )}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}

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
                <DropdownMenuItem onClick={() => handleCreatePage(page.id)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add sub-page
                </DropdownMenuItem>
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

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div>
            {page.children!.map((child) => (
              <PageItem key={child.id} page={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Filter to show only top-level pages (no parent)
  const topLevelPages = pages.filter((page) => !page.parentId);

  return (
    <div className="border-border bg-card flex h-full w-64 flex-col border-r">
      {/* Header */}
      <div className="border-border flex items-center justify-between border-b p-4">
        <h2 className="font-semibold">Pages</h2>
        {canEdit && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleCreatePage()}
            disabled={isCreating}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto p-2">
        {topLevelPages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <FileText className="text-muted-foreground/50 mb-2 h-12 w-12" />
            <p className="text-muted-foreground text-sm">No pages yet</p>
            {canEdit && (
              <p className="text-muted-foreground/70 mt-1 text-xs">
                Click + to create one
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {topLevelPages.map((page) => (
              <PageItem key={page.id} page={page} depth={0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
