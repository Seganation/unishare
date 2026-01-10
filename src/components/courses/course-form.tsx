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
          className="text-foreground flex items-center gap-2 text-base font-bold md:text-lg"
        >
          <Sparkles className="text-primary h-5 w-5" />
          Course Title <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Data Structures & Algorithms"
            maxLength={100}
            className={cn(
              "input-primary h-14 text-xl font-medium transition-all duration-300",
              title.length > 0 && "border-primary ring-primary/20 ring-2",
            )}
            disabled={isLoading}
            required
          />
          {/* Animated underline on focus */}
          <div className="bg-primary absolute bottom-0 left-0 h-1 w-0 transition-all duration-300 focus-within:w-full" />
        </div>
        {/* Character Counter with Visual Indicator */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span
              className={cn(
                "font-medium transition-colors",
                titlePercentage > 90
                  ? "text-orange-600 dark:text-orange-500"
                  : titlePercentage > 0
                    ? "text-primary"
                    : "text-muted-foreground",
              )}
            >
              {title.length}/100 characters
            </span>
            {titlePercentage > 90 && (
              <span className="animate-pulse font-semibold text-orange-600 dark:text-orange-500">
                {100 - title.length} left
              </span>
            )}
          </div>
          {/* Progress Bar */}
          <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                titlePercentage > 90 ? "bg-orange-500" : "bg-primary",
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
          className="text-foreground flex items-center gap-2 text-base font-bold md:text-lg"
        >
          <Book className="text-primary h-5 w-5" />
          Description{" "}
          <span className="text-muted-foreground text-sm font-normal">
            (Optional)
          </span>
        </Label>
        <div className="relative">
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a brief description to help others understand what this course is about..."
            maxLength={500}
            rows={5}
            className={cn(
              "input-primary text-lg resize-none p-5 transition-all duration-300",
              description.length > 0 && "border-primary ring-primary/20 ring-2",
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
                  ? "text-orange-600 dark:text-orange-500"
                  : descriptionPercentage > 0
                    ? "text-primary"
                    : "text-muted-foreground",
              )}
            >
              {description.length}/500 characters
            </span>
            {descriptionPercentage > 90 && (
              <span className="animate-pulse font-semibold text-orange-600 dark:text-orange-500">
                {500 - description.length} left
              </span>
            )}
          </div>
          {/* Progress Bar */}
          <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                descriptionPercentage > 90 ? "bg-orange-500" : "bg-primary",
              )}
              style={{ width: `${descriptionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Color Picker - Enhanced with Beautiful Swatches */}
      <div className="space-y-4">
        <Label className="text-foreground flex items-center gap-2 text-base font-bold md:text-lg">
          <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full">
            <div className="bg-primary-foreground h-3.5 w-3.5 rounded-full" />
          </div>
          Choose a Color <span className="text-destructive">*</span>
        </Label>

        {/* Color Swatches Grid */}
        <div className="border-border bg-card rounded-xl border-2 p-5 shadow-inner">
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
                    isSelected && "scale-110 shadow-2xl ring-4 ring-offset-2",
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
                    <div className="animate-in zoom-in-50 absolute inset-0 flex items-center justify-center duration-300">
                      <div className="glass flex h-10 w-10 items-center justify-center rounded-full shadow-2xl ring-2 ring-white/50">
                        <Check
                          className="h-6 w-6 font-bold text-white drop-shadow-lg"
                          strokeWidth={3}
                        />
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
        <div className="border-primary/30 bg-primary/5 flex items-center justify-between rounded-lg border px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div
              className="ring-background h-7 w-7 rounded-full shadow-md ring-2"
              style={{ backgroundColor: selectedColor }}
            />
            <span className="text-foreground text-base font-semibold">
              Selected Color:{" "}
              <span className="text-primary">
                {getCourseColor(selectedColor).name}
              </span>
            </span>
          </div>
          <Sparkles className="text-primary h-5 w-5" />
        </div>
      </div>

      {/* Live Preview Card - Matches Enhanced CourseCard Design */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-foreground flex items-center gap-2 text-base font-bold md:text-lg">
            <Sparkles className="text-primary h-5 w-5" />
            Live Preview
          </Label>
          <span className="bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
            Real-time
          </span>
        </div>

        {/* Preview Container with Animated Border */}
        <div className="border-primary/30 bg-card relative rounded-2xl border-2 border-dashed p-6 backdrop-blur-sm">
          {/* Animated Corner Accents */}
          <div className="border-primary absolute -top-1 -left-1 h-4 w-4 animate-pulse rounded-tl-2xl border-t-4 border-l-4" />
          <div className="border-primary absolute -top-1 -right-1 h-4 w-4 animate-pulse rounded-tr-2xl border-t-4 border-r-4" />
          <div className="border-primary absolute -bottom-1 -left-1 h-4 w-4 animate-pulse rounded-bl-2xl border-b-4 border-l-4" />
          <div className="border-primary absolute -right-1 -bottom-1 h-4 w-4 animate-pulse rounded-br-2xl border-r-4 border-b-4" />

          {/* Course Card Preview */}
          <div className="mx-auto max-w-sm">
            <div className="group relative">
              <div className="card-elevated hover-lift border-border hover:border-primary/50 overflow-hidden border-2">
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

                  {/* Shimmer Effect on Hover */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                </div>

                {/* Content Section */}
                <div className="relative p-6">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50" />

                  <div className="relative">
                    {/* Title */}
                    <h3 className="text-foreground group-hover:text-primary mb-2 line-clamp-1 text-xl font-bold transition-all duration-300">
                      {title || "Your Course Title"}
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

                    {/* Stats Section */}
                    <div className="border-border flex items-center gap-5 border-t pt-4 text-sm">
                      <div className="text-muted-foreground flex items-center gap-2">
                        <div className="bg-primary/10 rounded-lg p-1.5">
                          <Book className="text-primary h-4 w-4" />
                        </div>
                        <span className="text-muted-foreground font-medium">
                          0 resources
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Hover Indicator */}
                <div className="bg-primary h-1 w-0 transition-all duration-500 group-hover:w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Enhanced */}
      <div className="border-border flex items-center gap-6 border-t-2 pt-10">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className={cn(
              "h-14 flex-1 text-lg font-semibold",
              "border-border hover:border-primary/50 border-2",
              "hover:bg-muted active:scale-95",
              "shadow-sm transition-all duration-200 hover:shadow-md",
              "focus-visible:ring-primary/20 focus-visible:ring-4",
            )}
          >
            <X className="mr-2 h-6 w-6" />
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading || !title.trim()}
          className={cn(
            "h-14 flex-1 text-lg font-bold",
            "bg-primary hover:bg-primary/90",
            "active:scale-95 disabled:cursor-not-allowed disabled:opacity-50",
            "shadow-lg transition-all duration-300 hover:shadow-xl",
            "focus-visible:ring-primary/20 focus-visible:ring-4",
            "group relative overflow-hidden",
          )}
        >
          {/* Button Shimmer Effect */}
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

          <span className="relative flex items-center justify-center">
            {isLoading ? (
              <>
                <div className="border-primary-foreground mr-2 h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
                {mode === "create"
                  ? "Creating Course..."
                  : "Updating Course..."}
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
