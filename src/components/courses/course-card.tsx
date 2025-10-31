"use client";

import Link from "next/link";
import { Book, Users, FileText, Heart, Sparkles } from "lucide-react";
import { getCourseColor } from "~/lib/course-colors";
import { cn } from "~/lib/utils";
import Image from "next/image";

interface CourseCardProps {
  id: string;
  title: string;
  description?: string | null;
  color: string;
  resourceCount?: number;
  collaboratorCount?: number;
  isFavorited?: boolean;
  isShared?: boolean;
  sharedBy?: {
    name: string;
    profileImage?: string | null;
  };
  role?: "OWNER" | "CONTRIBUTOR" | "VIEWER";
  onToggleFavorite?: () => void;
}

export function CourseCard({
  id,
  title,
  description,
  color,
  resourceCount = 0,
  collaboratorCount = 0,
  isFavorited = false,
  isShared = false,
  sharedBy,
  role = "OWNER",
  onToggleFavorite,
}: CourseCardProps) {
  const colorClasses = getCourseColor(color);

  return (
    <div className="group relative">
      {/* Favorite Button - Enhanced */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite();
          }}
          className={cn(
            "absolute -right-2 -top-2 z-20 rounded-full p-2.5 shadow-lg backdrop-blur-md transition-all duration-300",
            "hover:scale-110 active:scale-95",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-200",
            isFavorited
              ? "bg-gradient-to-br from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600"
              : "bg-white/90 text-gray-400 hover:bg-white hover:text-red-500 hover:shadow-xl",
          )}
          aria-label={
            isFavorited ? "Remove from favorites" : "Add to favorites"
          }
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-all duration-300",
              isFavorited && "fill-current scale-110",
            )}
          />
        </button>
      )}

      <Link href={`/courses/${id}`}>
        <div
          className={cn(
            "card-elevated hover-lift group relative overflow-hidden",
            "border-2 border-gray-100 hover:border-gray-200",
          )}
        >
          {/* Color Header with Enhanced Gradient & Pattern */}
          <div
            className={cn(
              "relative h-36 overflow-hidden bg-gradient-to-br",
              colorClasses.gradient,
            )}
            style={{ backgroundColor: color }}
          >
            {/* Decorative Pattern Overlay - PLACEHOLDER */}
            <div className="pattern-dots absolute inset-0 opacity-20" />

            {/* Animated Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />

            {/* Floating Decorative Circles */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/10 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute right-1/4 top-1/3 h-16 w-16 rounded-full bg-white/5" />
            </div>

            {/* Course Icon with Glass Effect */}
            <div className="absolute left-5 top-5">
              <div className="glass flex h-14 w-14 items-center justify-center rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl">
                <Book className="h-7 w-7 text-white drop-shadow-md" />
              </div>
            </div>

            {/* Role Badge (if shared) - Enhanced */}
            {isShared && role !== "OWNER" && (
              <div className="absolute right-5 top-5">
                <div
                  className={cn(
                    "glass rounded-full px-4 py-1.5 text-xs font-bold shadow-lg backdrop-blur-md transition-all duration-300",
                    "group-hover:scale-105",
                    role === "CONTRIBUTOR"
                      ? "bg-blue-500/20 text-blue-50 ring-2 ring-blue-300/50"
                      : "bg-gray-800/20 text-gray-50 ring-2 ring-gray-300/50",
                  )}
                >
                  {role === "CONTRIBUTOR" ? "✏️ Contributor" : "👁️ Viewer"}
                </div>
              </div>
            )}

            {/* Shimmer Effect on Hover */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          </div>

          {/* Content Section - Enhanced */}
          <div className="relative p-6">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50" />

            <div className="relative">
              {/* Title with Gradient on Hover */}
              <h3 className="mb-2 line-clamp-1 text-xl font-bold text-gray-900 transition-all duration-300 group-hover:text-purple-600">
                {title}
              </h3>

              {/* Description */}
              {description ? (
                <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600">
                  {description}
                </p>
              ) : (
                <p className="mb-4 text-sm italic text-gray-400">
                  No description provided
                </p>
              )}

              {/* Shared By Section - Enhanced */}
              {isShared && sharedBy && (
                <div className="mb-4 flex items-center gap-2.5 rounded-lg bg-purple-50/50 p-2.5 text-sm transition-all duration-300 group-hover:bg-purple-50">
                  {/* Avatar with Placeholder */}
                  {sharedBy.profileImage ? (
                    <Image
                      src={sharedBy.profileImage}
                      alt={sharedBy.name}
                      width={28}
                      height={28}
                      className="rounded-full ring-2 ring-purple-200"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-bold text-white ring-2 ring-purple-200 shadow-sm">
                      {sharedBy.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-700">
                      Shared by {sharedBy.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Stats Section - Enhanced with Icons */}
              <div className="flex items-center gap-5 border-t border-gray-200 pt-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600 transition-colors group-hover:text-purple-600">
                  <div className="rounded-lg bg-purple-100 p-1.5 transition-colors group-hover:bg-purple-200">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="font-medium">
                    {resourceCount}{" "}
                    <span className="hidden font-normal text-gray-500 sm:inline">
                      resource{resourceCount !== 1 ? "s" : ""}
                    </span>
                  </span>
                </div>

                {collaboratorCount > 0 && (
                  <div className="flex items-center gap-2 text-gray-600 transition-colors group-hover:text-indigo-600">
                    <div className="rounded-lg bg-indigo-100 p-1.5 transition-colors group-hover:bg-indigo-200">
                      <Users className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span className="font-medium">
                      {collaboratorCount}{" "}
                      <span className="hidden font-normal text-gray-500 sm:inline">
                        member{collaboratorCount !== 1 ? "s" : ""}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Hover Indicator */}
          <div className="h-1 w-0 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 transition-all duration-500 group-hover:w-full" />

          {/* Overall Hover Glow Effect */}
          <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 shadow-2xl ring-4 ring-purple-400/20 transition-all duration-300 group-hover:opacity-100" />
        </div>
      </Link>
    </div>
  );
}
