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
    <div className="group relative h-full">
      {/* Favorite Button - Enhanced */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite();
          }}
          className={cn(
            "absolute -top-2 -right-2 z-20 rounded-full p-2.5 shadow-lg backdrop-blur-md transition-all duration-300",
            "hover:scale-110 active:scale-95",
            "focus-visible:ring-primary/30 focus-visible:ring-4 focus-visible:outline-none",
            isFavorited
              ? "bg-gradient-to-br from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600"
              : "bg-card/90 text-muted-foreground hover:bg-card border-border border hover:text-red-500 hover:shadow-xl",
          )}
          aria-label={
            isFavorited ? "Remove from favorites" : "Add to favorites"
          }
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-all duration-300",
              isFavorited && "scale-110 fill-current",
            )}
          />
        </button>
      )}

      <Link href={`/courses/${id}`} className="block h-full">
        <div
          className={cn(
            "card-elevated hover-lift group relative flex h-full flex-col overflow-hidden",
            "border-border hover:border-primary/30 border-2",
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
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/10 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute top-1/3 right-1/4 h-16 w-16 rounded-full bg-white/5" />
            </div>

            {/* Course Icon with Glass Effect */}
            <div className="absolute top-5 left-5">
              <div className="glass flex h-14 w-14 items-center justify-center rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl">
                <Book className="h-7 w-7 text-white drop-shadow-md" />
              </div>
            </div>

            {/* Role Badge (if shared) - Enhanced */}
            {isShared && role !== "OWNER" && (
              <div className="absolute top-5 right-5">
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
          <div className="bg-card relative flex flex-1 flex-col p-6">
            {/* Background Gradient */}
            <div className="to-muted/20 absolute inset-0 bg-gradient-to-b from-transparent" />

            <div className="relative flex flex-1 flex-col">
              {/* Title with Gradient on Hover */}
              <h3 className="text-foreground group-hover:text-primary mb-2 line-clamp-1 text-xl font-bold transition-all duration-300">
                {title}
              </h3>

              {/* Description */}
              {description ? (
                <p className="text-muted-foreground mb-4 line-clamp-2 text-sm leading-relaxed">
                  {description}
                </p>
              ) : (
                <p className="text-muted-foreground/60 mb-4 text-sm italic">
                  No description provided
                </p>
              )}

              {/* Shared By Section - Enhanced */}
              {isShared && sharedBy && (
                <div className="bg-muted/30 group-hover:bg-muted/50 mb-4 flex items-center gap-2.5 rounded-lg p-2.5 text-sm transition-all duration-300">
                  {/* Avatar with Placeholder */}
                  {sharedBy.profileImage ? (
                    <Image
                      src={sharedBy.profileImage}
                      alt={sharedBy.name}
                      width={28}
                      height={28}
                      className="ring-border rounded-full ring-2"
                    />
                  ) : (
                    <div className="bg-primary text-primary-foreground ring-border flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-sm ring-2">
                      {sharedBy.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs font-medium">
                      Shared by {sharedBy.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Stats Section - Enhanced with Icons */}
              <div className="border-border mt-auto flex items-center gap-5 border-t pt-4 text-sm">
                <div className="text-muted-foreground group-hover:text-primary flex items-center gap-2 transition-colors">
                  <div className="bg-primary/10 group-hover:bg-primary/20 rounded-lg p-1.5 transition-colors">
                    <FileText className="text-primary h-4 w-4" />
                  </div>
                  <span className="font-medium">
                    {resourceCount}{" "}
                    <span className="text-muted-foreground hidden font-normal sm:inline">
                      resource{resourceCount !== 1 ? "s" : ""}
                    </span>
                  </span>
                </div>

                {collaboratorCount > 0 && (
                  <div className="text-muted-foreground group-hover:text-primary flex items-center gap-2 transition-colors">
                    <div className="bg-primary/10 group-hover:bg-primary/20 rounded-lg p-1.5 transition-colors">
                      <Users className="text-primary h-4 w-4" />
                    </div>
                    <span className="font-medium">
                      {collaboratorCount}{" "}
                      <span className="text-muted-foreground hidden font-normal sm:inline">
                        member{collaboratorCount !== 1 ? "s" : ""}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Hover Indicator */}
          <div className="bg-primary h-1 w-0 transition-all duration-500 group-hover:w-full" />

          {/* Overall Hover Glow Effect */}
          <div className="ring-primary/20 pointer-events-none absolute inset-0 rounded-xl opacity-0 shadow-2xl ring-4 transition-all duration-300 group-hover:opacity-100" />
        </div>
      </Link>
    </div>
  );
}
