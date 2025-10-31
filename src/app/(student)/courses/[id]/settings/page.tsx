"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  ArrowLeft,
  Settings,
  Palette,
  Trash2,
  AlertTriangle,
  Save,
  Sparkles,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import { CourseForm } from "~/components/courses/course-form";

type TabType = "general" | "danger";

export default function CourseSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [isDeleting, setIsDeleting] = useState(false);

  const utils = api.useUtils();

  const { data: course, isLoading } = api.course.getById.useQuery({
    id: courseId,
  });

  const deleteCourse = api.course.delete.useMutation({
    onSuccess: () => {
      toast.success("Course deleted successfully");
      router.push("/courses");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to delete course");
      setIsDeleting(false);
    },
  });

  const handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete "${course?.title}"? This action cannot be undone and will delete all resources and collaborator access.`,
      )
    ) {
      setIsDeleting(true);
      deleteCourse.mutate({ id: courseId });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Skeleton className="mb-8 h-10 w-32" />
          <Skeleton className="mb-6 h-12 w-64" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!course || course.userRole !== "OWNER") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Access Denied
          </h1>
          <p className="mb-6 text-gray-600">
            Only the course owner can access settings.
          </p>
          <Button onClick={() => router.push(`/courses/${courseId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: typeof Settings }[] = [
    { id: "general", label: "General", icon: Settings },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push(`/courses/${courseId}`)}
          className="mb-8 hover:bg-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Course
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-6 w-6 animate-pulse text-purple-600" />
            <span className="text-sm font-semibold uppercase tracking-wider text-purple-600">
              Course Settings
            </span>
          </div>
          <h1 className="text-4xl font-black text-gray-900">{course.title}</h1>
          <p className="mt-2 text-gray-600">
            Manage your course settings and preferences
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="flex gap-2 rounded-2xl border-2 border-gray-200 bg-white p-2 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "group relative flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-50",
                  )}
                >
                  {/* Active shimmer effect */}
                  {isActive && (
                    <div className="absolute inset-0 -translate-x-full rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                  )}

                  <Icon
                    className={cn(
                      "relative h-5 w-5 transition-transform group-hover:scale-110",
                      isActive && "drop-shadow-md",
                    )}
                  />
                  <span className="relative">{tab.label}</span>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -bottom-2 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-lg">
          {activeTab === "general" && (
            <div className="space-y-6">
              {/* Section Header */}
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <Palette className="h-5 w-5 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Course Information
                  </h2>
                </div>
                <p className="text-sm text-gray-600">
                  Update your course title, description, and color theme
                </p>
              </div>

              {/* Course Form */}
              <CourseForm
                mode="edit"
                initialData={{
                  id: course.id,
                  title: course.title,
                  description: course.description,
                  color: course.color,
                }}
                onSuccess={() => {
                  void utils.course.getById.invalidate({ id: courseId });
                  toast.success("Course updated successfully!");
                }}
                onCancel={() => router.push(`/courses/${courseId}`)}
              />
            </div>
          )}

          {activeTab === "danger" && (
            <div className="space-y-6">
              {/* Section Header */}
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Danger Zone
                  </h2>
                </div>
                <p className="text-sm text-gray-600">
                  Irreversible and destructive actions
                </p>
              </div>

              {/* Delete Course Card */}
              <div className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-6">
                <div className="mb-4 flex items-start gap-4">
                  <div className="rounded-lg bg-red-100 p-3">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-bold text-gray-900">
                      Delete This Course
                    </h3>
                    <p className="mb-4 text-sm text-gray-700">
                      Once you delete a course, there is no going back. This
                      will permanently delete:
                    </p>
                    <ul className="mb-4 space-y-1 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        All resources and uploaded files
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        All collaborator access
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        All notes and collaborative content
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        All events and calendar items
                      </li>
                    </ul>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Course Permanently
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
