"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { ResourceCard } from "~/components/resources/resource-card";
import { ResourceForm } from "~/components/resources/resource-form";
import { Skeleton } from "~/components/ui/skeleton";
import {
  ArrowLeft,
  Plus,
  Users,
  Star,
  Settings,
  MoreVertical,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const [showResourceForm, setShowResourceForm] = useState(false);

  const utils = api.useUtils();

  const { data: course, isLoading } = api.course.getById.useQuery({
    id: courseId,
  });

  const toggleFavorite = api.course.toggleFavorite.useMutation({
    onSuccess: (data) => {
      void utils.course.getById.invalidate({ id: courseId });
      toast.success(
        data.favorited ? "Added to favorites" : "Removed from favorites",
      );
    },
  });

  const deleteResource = api.resource.delete.useMutation({
    onSuccess: () => {
      void utils.course.getById.invalidate({ id: courseId });
      toast.success("Resource deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to delete resource");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <Skeleton className="mb-6 h-10 w-32" />
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-8">
            <Skeleton className="mb-4 h-8 w-64" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Resources Skeleton */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Course Not Found
          </h1>
          <Button onClick={() => router.push("/courses")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const userRole = course.userRole;
  const canEdit = userRole === "OWNER" || userRole === "CONTRIBUTOR";
  const isOwner = userRole === "OWNER";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/courses")}
          className="mb-6 hover:bg-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>

        {/* Course Header */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-start justify-between">
            {/* Title & Info */}
            <div className="flex-1">
              <div className="mb-4 flex items-center gap-3">
                {/* Color Indicator */}
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: course.color }}
                />
                <h1 className="text-3xl font-bold text-gray-900">
                  {course.title}
                </h1>
                {course.isFavorite && (
                  <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
                )}
              </div>

              {course.description && (
                <p className="mb-4 max-w-3xl text-gray-600">
                  {course.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{course._count.collaborators} members</span>
                </div>
                <Badge variant="secondary">{userRole}</Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleFavorite.mutate({ courseId })}
                disabled={toggleFavorite.isPending}
              >
                <Star
                  className={cn(
                    "h-4 w-4",
                    course.isFavorite && "fill-yellow-500 text-yellow-500",
                  )}
                />
              </Button>

              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/courses/${courseId}/settings`)
                      }
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Course Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/courses/${courseId}/collaborators`)
                      }
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Manage Collaborators
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Collaborators Preview */}
          {course.collaborators.length > 0 && (
            <div className="border-t border-gray-100 pt-6">
              <h3 className="mb-3 text-sm font-medium text-gray-700">
                Collaborators
              </h3>
              <div className="flex items-center gap-2">
                {course.collaborators.slice(0, 8).map((collab) => (
                  <Avatar
                    key={collab.id}
                    className="h-8 w-8 border-2 border-white"
                  >
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-xs text-white">
                      {collab.user.name?.[0]?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {course.collaborators.length > 8 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium text-gray-600">
                    +{course.collaborators.length - 8}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Resources Section */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Resources</h2>
          {canEdit && (
            <Button onClick={() => setShowResourceForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Custom Resource
            </Button>
          )}
        </div>

        {/* Resources Grid */}
        {course.resources.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {course.resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                id={resource.id}
                title={resource.title}
                type={resource.type}
                description={resource.description}
                deadline={resource.deadline}
                fileUrls={resource.fileUrls}
                allowFiles={resource.allowFiles}
                userRole={userRole}
                courseId={courseId}
                onAddFile={() => {
                  toast.info("File upload coming soon!");
                  // TODO: Implement file upload modal
                }}
                onDelete={
                  isOwner && resource.type === "CUSTOM"
                    ? () => {
                        if (
                          confirm(
                            "Are you sure you want to delete this resource?",
                          )
                        ) {
                          deleteResource.mutate({ id: resource.id });
                        }
                      }
                    : undefined
                }
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center">
            <p className="text-gray-500">No resources yet</p>
            {canEdit && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowResourceForm(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Resource
              </Button>
            )}
          </div>
        )}

        {/* Resource Form Modal */}
        <ResourceForm
          courseId={courseId}
          open={showResourceForm}
          onOpenChange={setShowResourceForm}
        />
      </div>
    </div>
  );
}
