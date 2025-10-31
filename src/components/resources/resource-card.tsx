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
    bg: "bg-gradient-to-br from-blue-50 via-blue-50/50 to-indigo-50",
    border: "border-blue-200 hover:border-blue-300",
    text: "text-blue-700",
    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    badgeBg: "bg-blue-100 text-blue-700 border-blue-200",
    glow: "shadow-blue-200/50",
    ring: "ring-blue-400",
  },
  TASK: {
    bg: "bg-gradient-to-br from-emerald-50 via-green-50/50 to-teal-50",
    border: "border-emerald-200 hover:border-emerald-300",
    text: "text-emerald-700",
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    badgeBg: "bg-emerald-100 text-emerald-700 border-emerald-200",
    glow: "shadow-emerald-200/50",
    ring: "ring-emerald-400",
  },
  CONTENT: {
    bg: "bg-gradient-to-br from-orange-50 via-orange-50/50 to-amber-50",
    border: "border-orange-200 hover:border-orange-300",
    text: "text-orange-700",
    iconBg: "bg-gradient-to-br from-orange-500 to-amber-600",
    badgeBg: "bg-orange-100 text-orange-700 border-orange-200",
    glow: "shadow-orange-200/50",
    ring: "ring-orange-400",
  },
  NOTES: {
    bg: "bg-gradient-to-br from-purple-50 via-purple-50/50 to-pink-50",
    border: "border-purple-200 hover:border-purple-300",
    text: "text-purple-700",
    iconBg: "bg-gradient-to-br from-purple-500 to-pink-600",
    badgeBg: "bg-purple-100 text-purple-700 border-purple-200",
    glow: "shadow-purple-200/50",
    ring: "ring-purple-400",
  },
  CUSTOM: {
    bg: "bg-gradient-to-br from-gray-50 via-slate-50/50 to-zinc-50",
    border: "border-gray-200 hover:border-gray-300",
    text: "text-gray-700",
    iconBg: "bg-gradient-to-br from-gray-500 to-slate-600",
    badgeBg: "bg-gray-100 text-gray-700 border-gray-200",
    glow: "shadow-gray-200/50",
    ring: "ring-gray-400",
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
        "group relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 bg-white",
        "hover:shadow-2xl hover:-translate-y-1",
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
                "group-hover:scale-110 group-hover:shadow-2xl group-hover:rotate-3",
                colors.iconBg,
              )}
            >
              <Icon className="h-7 w-7 text-white drop-shadow-md" />
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-xl bg-white/20" />
            </div>

            {/* Title & Type */}
            <div className="min-w-0 flex-1">
              <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-purple-700">
                {title}
              </h3>
              <Badge
                className={cn(
                  "text-xs font-semibold border shadow-sm",
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
          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600">
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
                ? "bg-gradient-to-r from-red-100 to-red-50 text-red-700 border-red-300 animate-pulse"
                : isDeadlineNear
                  ? "bg-gradient-to-r from-amber-100 to-yellow-50 text-amber-700 border-amber-300"
                  : "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border-gray-300",
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
              <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs">
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
                {fileUrls.slice(0, 3).map((url, idx) => {
                  const fileName = url.split("/").pop() ?? "File";
                  return (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "group/file flex items-center gap-3 rounded-xl border-2 border-gray-200 bg-white p-3.5",
                        "transition-all duration-300 hover:border-purple-300 hover:bg-purple-50/50",
                        "hover:shadow-md hover:scale-102 active:scale-98",
                        "focus-visible:ring-4 focus-visible:ring-purple-200",
                      )}
                    >
                      <div className="rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 p-2 transition-all duration-300 group-hover/file:from-purple-200 group-hover/file:to-indigo-200">
                        <File className="h-4 w-4 text-purple-700" />
                      </div>
                      <span className="flex-1 truncate text-sm font-medium text-gray-700 group-hover/file:text-purple-700">
                        {fileName}
                      </span>
                      <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 transition-all group-hover/file:opacity-100 group-hover/file:text-purple-600" />
                    </a>
                  );
                })}
                {fileCount > 3 && (
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-gray-100 py-2 text-xs font-medium text-gray-600">
                    <File className="h-3.5 w-3.5" />
                    +{fileCount - 3} more file{fileCount - 3 !== 1 ? "s" : ""}
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
                  "hover:border-purple-400 hover:bg-purple-50",
                  "transition-all duration-300 hover:scale-102",
                  "focus-visible:ring-4 focus-visible:ring-purple-200",
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
              "w-full border-2 h-12 font-semibold",
              "bg-gradient-to-r from-purple-50 to-pink-50",
              "border-purple-300 hover:border-purple-400",
              "hover:from-purple-100 hover:to-pink-100",
              "transition-all duration-300 hover:scale-102 hover:shadow-lg",
              "focus-visible:ring-4 focus-visible:ring-purple-200",
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
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover/notes:translate-x-full" />

            <span className="relative flex items-center justify-center text-purple-700">
              <StickyNote className="mr-2 h-5 w-5" />
              Open Collaborative Notes
              <ExternalLink className="ml-2 h-4 w-4 opacity-70" />
            </span>
          </Button>
        )}

        {/* Empty State - Enhanced */}
        {allowFiles && fileCount === 0 && !canEdit && (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 py-8 text-center">
            <div className="mb-3 rounded-full bg-gray-100 p-4">
              <File className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              No files uploaded yet
            </p>
            <p className="mt-1 text-xs text-gray-400">
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
