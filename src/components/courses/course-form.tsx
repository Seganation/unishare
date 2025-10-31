"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Check, Book, Sparkles } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { courseColorOptions, getCourseColor } from "~/lib/course-colors";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { cn } from "~/lib/utils";

interface CourseFormProps {
  mode?: "create" | "edit";
  initialData?: {
    id?: string;
    title: string;
    description?: string | null;
    color: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CourseForm({
  mode = "create",
  initialData,
  onSuccess,
  onCancel,
}: CourseFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    initialData?.color ?? courseColorOptions[0]!,
  );

  // tRPC mutations
  const createMutation = api.course.create.useMutation({
    onSuccess: () => {
      toast.success("Course created successfully!");
      router.push("/courses");
      router.refresh();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create course");
    },
  });

  const updateMutation = api.course.update.useMutation({
    onSuccess: () => {
      toast.success("Course updated successfully!");
      router.refresh();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update course");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a course title");
      return;
    }

    if (mode === "create") {
      createMutation.mutate({
        title: title.trim(),
        description: description.trim() || undefined,
        color: selectedColor,
      });
    } else if (initialData?.id) {
      updateMutation.mutate({
        id: initialData.id,
        title: title.trim(),
        description: description.trim() || undefined,
        color: selectedColor,
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Calculate character count percentages for visual indicators
  const titlePercentage = (title.length / 100) * 100;
  const descriptionPercentage = (description.length / 500) * 100;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Title Section - Enhanced */}
      <div className="space-y-3">
        <Label
          htmlFor="title"
          className="flex items-center gap-2 text-sm font-bold text-gray-800"
        >
          <Sparkles className="h-4 w-4 text-purple-600" />
          Course Title <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Data Structures & Algorithms"
            maxLength={100}
            className={cn(
              "input-primary text-lg font-medium transition-all duration-300",
              title.length > 0 && "border-purple-400 ring-2 ring-purple-100",
            )}
            disabled={isLoading}
            required
          />
          {/* Animated underline on focus */}
          <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300 focus-within:w-full" />
        </div>
        {/* Character Counter with Visual Indicator */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span
              className={cn(
                "font-medium transition-colors",
                titlePercentage > 90
                  ? "text-orange-600"
                  : titlePercentage > 0
                    ? "text-purple-600"
                    : "text-gray-500",
              )}
            >
              {title.length}/100 characters
            </span>
            {titlePercentage > 90 && (
              <span className="text-orange-600 font-semibold animate-pulse">
                {100 - title.length} left
              </span>
            )}
          </div>
          {/* Progress Bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={cn(
                "h-full transition-all duration-300 rounded-full",
                titlePercentage > 90
                  ? "bg-gradient-to-r from-orange-500 to-red-500"
                  : "bg-gradient-to-r from-purple-500 to-indigo-500",
              )}
              style={{ width: `${titlePercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Description Section - Enhanced */}
      <div className="space-y-3">
        <Label
          htmlFor="description"
          className="flex items-center gap-2 text-sm font-bold text-gray-800"
        >
          <Book className="h-4 w-4 text-indigo-600" />
          Description <span className="text-xs font-normal text-gray-500">(Optional)</span>
        </Label>
        <div className="relative">
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a brief description to help others understand what this course is about..."
            maxLength={500}
            rows={4}
            className={cn(
              "input-primary resize-none transition-all duration-300",
              description.length > 0 && "border-indigo-400 ring-2 ring-indigo-100",
            )}
            disabled={isLoading}
          />
        </div>
        {/* Character Counter with Visual Indicator */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span
              className={cn(
                "font-medium transition-colors",
                descriptionPercentage > 90
                  ? "text-orange-600"
                  : descriptionPercentage > 0
                    ? "text-indigo-600"
                    : "text-gray-500",
              )}
            >
              {description.length}/500 characters
            </span>
            {descriptionPercentage > 90 && (
              <span className="text-orange-600 font-semibold animate-pulse">
                {500 - description.length} left
              </span>
            )}
          </div>
          {/* Progress Bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={cn(
                "h-full transition-all duration-300 rounded-full",
                descriptionPercentage > 90
                  ? "bg-gradient-to-r from-orange-500 to-red-500"
                  : "bg-gradient-to-r from-indigo-500 to-purple-500",
              )}
              style={{ width: `${descriptionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Color Picker - Enhanced with Beautiful Swatches */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2 text-sm font-bold text-gray-800">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
            <div className="h-3 w-3 rounded-full bg-white" />
          </div>
          Choose a Color <span className="text-red-500">*</span>
        </Label>

        {/* Color Swatches Grid */}
        <div className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5 shadow-inner">
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-8">
            {courseColorOptions.map((colorHex) => {
              const colorData = getCourseColor(colorHex);
              const isSelected = selectedColor === colorHex;

              return (
                <button
                  key={colorHex}
                  type="button"
                  onClick={() => setSelectedColor(colorHex)}
                  disabled={isLoading}
                  className={cn(
                    "group relative aspect-square w-full rounded-xl transition-all duration-300",
                    "hover:scale-110 hover:rotate-3 focus:scale-110 focus:outline-none",
                    "hover:shadow-xl focus:shadow-xl",
                    isSelected && "scale-110 ring-4 ring-offset-2 shadow-2xl",
                    isSelected && colorData.ring,
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                  style={{
                    background: `linear-gradient(135deg, ${colorHex} 0%, ${colorHex}dd 100%)`,
                  }}
                  aria-label={`Select ${colorData.name} color`}
                >
                  {/* Checkmark for Selected */}
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in-50 duration-300">
                      <div className="glass flex h-8 w-8 items-center justify-center rounded-full shadow-2xl ring-2 ring-white/50">
                        <Check className="h-5 w-5 text-white drop-shadow-lg font-bold" strokeWidth={3} />
                      </div>
                    </div>
                  )}

                  {/* Hover Shimmer Effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Subtle Inner Glow */}
                  <div className="absolute inset-0 rounded-xl bg-white opacity-0 transition-opacity group-hover:opacity-20" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Color Display */}
        <div className="flex items-center justify-between rounded-lg bg-purple-50 px-4 py-2.5 border border-purple-200">
          <div className="flex items-center gap-3">
            <div
              className="h-6 w-6 rounded-full shadow-md ring-2 ring-white"
              style={{ backgroundColor: selectedColor }}
            />
            <span className="text-sm font-semibold text-gray-700">
              Selected Color:{" "}
              <span className="text-purple-700">
                {getCourseColor(selectedColor).name}
              </span>
            </span>
          </div>
          <Sparkles className="h-4 w-4 text-purple-500" />
        </div>
      </div>

      {/* Live Preview Card - Matches Enhanced CourseCard Design */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-sm font-bold text-gray-800">
            <Sparkles className="h-4 w-4 text-purple-600" />
            Live Preview
          </Label>
          <span className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
            Real-time
          </span>
        </div>

        {/* Preview Container with Animated Border */}
        <div className="relative rounded-2xl border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/50 p-6 backdrop-blur-sm">
          {/* Animated Corner Accents */}
          <div className="absolute -left-1 -top-1 h-4 w-4 rounded-tl-2xl border-l-4 border-t-4 border-purple-500 animate-pulse" />
          <div className="absolute -right-1 -top-1 h-4 w-4 rounded-tr-2xl border-r-4 border-t-4 border-purple-500 animate-pulse" />
          <div className="absolute -bottom-1 -left-1 h-4 w-4 rounded-bl-2xl border-b-4 border-l-4 border-purple-500 animate-pulse" />
          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-br-2xl border-b-4 border-r-4 border-purple-500 animate-pulse" />

          {/* Course Card Preview */}
          <div className="mx-auto max-w-sm">
            <div className="group relative">
              <div className="card-elevated hover-lift overflow-hidden border-2 border-gray-100 hover:border-gray-200">
                {/* Color Header with All Enhancements from CourseCard */}
                <div
                  className={cn(
                    "relative h-36 overflow-hidden bg-gradient-to-br",
                    getCourseColor(selectedColor).gradient,
                  )}
                  style={{ backgroundColor: selectedColor }}
                >
                  {/* Decorative Pattern Overlay */}
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

                  {/* Shimmer Effect on Hover */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                </div>

                {/* Content Section */}
                <div className="relative p-6">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50" />

                  <div className="relative">
                    {/* Title */}
                    <h3 className="mb-2 line-clamp-1 text-xl font-bold text-gray-900 transition-all duration-300 group-hover:text-purple-600">
                      {title || "Your Course Title"}
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

                    {/* Stats Section */}
                    <div className="flex items-center gap-5 border-t border-gray-200 pt-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="rounded-lg bg-purple-100 p-1.5">
                          <Book className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="font-medium text-gray-500">0 resources</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Hover Indicator */}
                <div className="h-1 w-0 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 transition-all duration-500 group-hover:w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Enhanced */}
      <div className="flex items-center gap-4 border-t-2 border-gray-200 pt-6">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className={cn(
              "flex-1 h-12 text-base font-semibold",
              "border-2 border-gray-300 hover:border-gray-400",
              "hover:bg-gray-50 active:scale-95",
              "transition-all duration-200 shadow-sm hover:shadow-md",
              "focus-visible:ring-4 focus-visible:ring-gray-200",
            )}
          >
            <X className="mr-2 h-5 w-5" />
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading || !title.trim()}
          className={cn(
            "flex-1 h-12 text-base font-bold",
            "bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600",
            "hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700",
            "active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
            "shadow-lg hover:shadow-xl transition-all duration-300",
            "focus-visible:ring-4 focus-visible:ring-purple-200",
            "relative overflow-hidden group",
          )}
        >
          {/* Button Shimmer Effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

          <span className="relative flex items-center justify-center">
            {isLoading ? (
              <>
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {mode === "create" ? "Creating Course..." : "Updating Course..."}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                {mode === "create" ? "Create Course" : "Update Course"}
              </>
            )}
          </span>
        </Button>
      </div>
    </form>
  );
}
