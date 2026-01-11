"use client";

import {
  FileText,
  CheckSquare,
  FolderOpen,
  StickyNote,
  Download,
  Trash2,
  Calendar,
  Plus,
  ExternalLink,
  File,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { format } from "date-fns";

interface ResourceCardProps {
  id: string;
  title: string;
  type: "ASSIGNMENT" | "TASK" | "CONTENT" | "NOTES" | "CUSTOM";
  description?: string | null;
  deadline?: Date | null;
  fileUrls: string[];
  allowFiles: boolean;
  userRole: "OWNER" | "CONTRIBUTOR" | "VIEWER";
  courseId?: string; // Optional courseId for NOTES navigation
  onAddFile?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

const resourceIcons = {
  ASSIGNMENT: FileText,
  TASK: CheckSquare,
  CONTENT: FolderOpen,
  NOTES: StickyNote,
  CUSTOM: FileText,
};

const resourceColors = {
  ASSIGNMENT: {
    bg: "bg-card",
    border:
      "border-blue-500/20 hover:border-blue-500/40 dark:border-blue-400/20 dark:hover:border-blue-400/40",
    text: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-500 dark:bg-blue-600",
    badgeBg:
      "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    glow: "shadow-blue-500/20 dark:shadow-blue-400/20",
    ring: "ring-blue-500/30 dark:ring-blue-400/30",
  },
  TASK: {
    bg: "bg-card",
    border:
      "border-emerald-500/20 hover:border-emerald-500/40 dark:border-emerald-400/20 dark:hover:border-emerald-400/40",
    text: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500 dark:bg-emerald-600",
    badgeBg:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    glow: "shadow-emerald-500/20 dark:shadow-emerald-400/20",
    ring: "ring-emerald-500/30 dark:ring-emerald-400/30",
  },
  CONTENT: {
    bg: "bg-card",
    border:
      "border-orange-500/20 hover:border-orange-500/40 dark:border-orange-400/20 dark:hover:border-orange-400/40",
    text: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-500 dark:bg-orange-600",
    badgeBg:
      "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
    glow: "shadow-orange-500/20 dark:shadow-orange-400/20",
    ring: "ring-orange-500/30 dark:ring-orange-400/30",
  },
  NOTES: {
    bg: "bg-card",
    border:
      "border-purple-500/20 hover:border-purple-500/40 dark:border-purple-400/20 dark:hover:border-purple-400/40",
    text: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-500 dark:bg-purple-600",
    badgeBg:
      "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
    glow: "shadow-purple-500/20 dark:shadow-purple-400/20",
    ring: "ring-purple-500/30 dark:ring-purple-400/30",
  },
  CUSTOM: {
    bg: "bg-card",
    border: "border-border hover:border-primary/40",
    text: "text-foreground",
    iconBg: "bg-muted-foreground",
    badgeBg: "bg-muted text-muted-foreground border-border",
    glow: "shadow-muted/20",
    ring: "ring-primary/30",
  },
};

export function ResourceCard({
  id,
  title,
  type,
  description,
  deadline,
  fileUrls,
  allowFiles,
  userRole,
  courseId,
  onAddFile,
  onDelete,
  onEdit,
}: ResourceCardProps) {
  const Icon = resourceIcons[type];
  const colors = resourceColors[type];
  const canEdit = userRole === "OWNER" || userRole === "CONTRIBUTOR";
  const canDelete = userRole === "OWNER";
  const fileCount = fileUrls.length;

  // Check if deadline is approaching (within 3 days)
  const isDeadlineNear =
    deadline &&
    new Date(deadline) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const isOverdue = deadline && new Date(deadline) < new Date();

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border-2 bg-white p-6 transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-2xl",
        colors.border,
        colors.glow,
      )}
    >
      {/* Background Gradient */}
      <div className={cn("absolute inset-0 opacity-60", colors.bg)} />

      {/* Shimmer Effect on Hover */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

      {/* Content Container */}
      <div className="relative">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex flex-1 items-start gap-4">
            {/* Icon with Glass Effect */}
            <div
              className={cn(
                "relative flex h-14 w-14 items-center justify-center rounded-xl shadow-lg transition-all duration-300",
                "group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl",
                colors.iconBg,
              )}
            >
              <Icon className="h-7 w-7 text-white drop-shadow-md" />
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-xl bg-white/20" />
            </div>

            {/* Title & Type */}
            <div className="min-w-0 flex-1">
              <h3 className="text-foreground group-hover:text-primary mb-2 line-clamp-2 text-lg font-bold transition-colors">
                {title}
              </h3>
              <Badge
                className={cn(
                  "border text-xs font-semibold shadow-sm",
                  colors.badgeBg,
                )}
              >
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </Badge>
            </div>
          </div>

          {/* Delete Button for Custom Resources */}
          {canDelete && onDelete && type === "CUSTOM" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className={cn(
                "text-red-600 opacity-0 transition-all duration-300",
                "group-hover:opacity-100 hover:bg-red-50 hover:text-red-700",
                "hover:scale-110 active:scale-95",
                "focus-visible:ring-4 focus-visible:ring-red-200",
              )}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-muted-foreground mb-4 line-clamp-2 text-sm leading-relaxed">
            {description}
          </p>
        )}

        {/* Deadline Badge - Enhanced */}
        {deadline && (
          <div
            className={cn(
              "mb-4 flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm shadow-md transition-all duration-300",
              "border-2 font-semibold",
              isOverdue
                ? "animate-pulse border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
                : isDeadlineNear
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "bg-muted text-muted-foreground border-border",
            )}
          >
            {isOverdue ? (
              <AlertCircle className="h-5 w-5 animate-bounce" />
            ) : (
              <Clock className="h-5 w-5" />
            )}
            <span className="flex-1">
              {isOverdue ? "⚠️ Overdue: " : "Due: "}
              {format(new Date(deadline), "MMM dd, yyyy 'at' h:mm a")}
            </span>
            {!isOverdue && isDeadlineNear && (
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs">
                Soon
              </span>
            )}
          </div>
        )}

        {/* Files Section - Enhanced */}
        {allowFiles && (
          <div className="space-y-3">
            {fileCount > 0 && (
              <div className="space-y-2">
                {fileUrls.slice(0, 3).map((fileData, idx) => {
                  // Parse file metadata (handles both new JSON format and old URL-only format)
                  let fileName = "File";
                  let fileUrl = fileData;

                  try {
                    // Try to parse as JSON (new format)
                    const metadata = JSON.parse(fileData);
                    fileName = metadata.name ?? "File";
                    fileUrl = metadata.url ?? fileData;
                  } catch {
                    // Fallback to old format (plain URL)
                    fileName = fileData.split("/").pop() ?? "File";
                    fileUrl = fileData;
                  }

                  return (
                    <a
                      key={idx}
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "group/file border-border bg-card flex items-center gap-3 rounded-xl border-2 p-3.5",
                        "hover:border-primary/40 hover:bg-primary/5 transition-all duration-300",
                        "hover:scale-102 hover:shadow-md active:scale-98",
                        "focus-visible:ring-primary/20 focus-visible:ring-4",
                      )}
                    >
                      <div className="bg-primary/10 group-hover/file:bg-primary/20 rounded-lg p-2 transition-all duration-300">
                        <File className="text-primary h-4 w-4" />
                      </div>
                      <span className="text-foreground group-hover/file:text-primary flex-1 truncate text-sm font-medium">
                        {fileName}
                      </span>
                      <ExternalLink className="text-muted-foreground group-hover/file:text-primary h-4 w-4 opacity-0 transition-all group-hover/file:opacity-100" />
                    </a>
                  );
                })}
                {fileCount > 3 && (
                  <div className="bg-muted text-muted-foreground flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium">
                    <File className="h-3.5 w-3.5" />+{fileCount - 3} more file
                    {fileCount - 3 !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            )}

            {/* Add File Button */}
            {canEdit && onAddFile && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddFile}
                className={cn(
                  "w-full border-2 border-dashed",
                  "hover:border-primary hover:bg-primary/5",
                  "transition-all duration-300 hover:scale-102",
                  "focus-visible:ring-primary/20 focus-visible:ring-4",
                )}
              >
                <Plus className="mr-2 h-4 w-4" />
                {fileCount > 0 ? "Add More Files" : "Add Files"}
              </Button>
            )}
          </div>
        )}

        {/* Notes Special Card - Link to Editor */}
        {type === "NOTES" && (
          <Button
            variant="outline"
            className={cn(
              "h-12 w-full border-2 font-semibold",
              "bg-purple-500/5 dark:bg-purple-500/10",
              "border-purple-500/30 hover:border-purple-500/50",
              "hover:bg-purple-500/10 dark:hover:bg-purple-500/20",
              "transition-all duration-300 hover:scale-102 hover:shadow-lg",
              "focus-visible:ring-4 focus-visible:ring-purple-500/20",
              "group/notes relative overflow-hidden",
            )}
            onClick={() => {
              // Navigate to notes page using courseId
              if (courseId) {
                window.location.href = `/courses/${courseId}/notes`;
              }
            }}
          >
            {/* Button shimmer */}
            <div className="via-primary/20 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent transition-transform duration-700 group-hover/notes:translate-x-full" />

            <span className="relative flex items-center justify-center text-purple-600 dark:text-purple-400">
              <StickyNote className="mr-2 h-5 w-5" />
              Open Collaborative Notes
              <ExternalLink className="ml-2 h-4 w-4 opacity-70" />
            </span>
          </Button>
        )}

        {/* Empty State - Enhanced */}
        {allowFiles && fileCount === 0 && !canEdit && (
          <div className="border-border bg-muted/50 flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-8 text-center">
            <div className="bg-muted mb-3 rounded-full p-4">
              <File className="text-muted-foreground/60 h-8 w-8" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">
              No files uploaded yet
            </p>
            <p className="text-muted-foreground/60 mt-1 text-xs">
              Check back later for updates
            </p>
          </div>
        )}
      </div>

      {/* Bottom Accent Line */}
      <div
        className={cn(
          "absolute bottom-0 left-0 h-1 w-0 transition-all duration-500 group-hover:w-full",
          colors.iconBg,
        )}
      />
    </div>
  );
}
