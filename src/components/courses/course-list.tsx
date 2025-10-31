"use client";

import { CourseCard } from "./course-card";
import { EmptyCourses } from "./empty-courses";
import { api } from "~/trpc/react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  color: string;
  createdBy: string;
  _count?: {
    resources: number;
    collaborators: number;
  };
}

interface SharedCourse extends Course {
  creator: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
  };
  collaborators: Array<{
    role: "VIEWER" | "CONTRIBUTOR";
  }>;
}

export function CourseList() {
  const { data, isLoading } = api.course.getAll.useQuery();
  const toggleFavoriteMutation = api.course.toggleFavorite.useMutation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="border-border bg-card animate-pulse overflow-hidden rounded-xl border"
          >
            <div className="bg-muted h-32" />
            <div className="space-y-3 p-6">
              <div className="bg-muted h-6 w-3/4 rounded" />
              <div className="bg-muted h-4 w-full rounded" />
              <div className="bg-muted h-4 w-2/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const ownedCourses = data?.owned ?? [];
  const sharedCourses = data?.shared ?? [];
  const hasAnyCourses = ownedCourses.length > 0 || sharedCourses.length > 0;

  if (!hasAnyCourses) {
    return <EmptyCourses />;
  }

  const handleToggleFavorite = (courseId: string) => {
    toggleFavoriteMutation.mutate({ courseId });
  };

  return (
    <div className="space-y-12">
      {/* Owned Courses */}
      {ownedCourses.length > 0 && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-foreground text-2xl font-bold">My Courses</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {ownedCourses.length}{" "}
                {ownedCourses.length === 1 ? "course" : "courses"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ownedCourses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                color={course.color}
                resourceCount={course._count?.resources ?? 0}
                collaboratorCount={course._count?.collaborators ?? 0}
                role="OWNER"
                onToggleFavorite={() => handleToggleFavorite(course.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Shared Courses */}
      {sharedCourses.length > 0 && (
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-foreground text-2xl font-bold">
                Shared With Me
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {sharedCourses.length}{" "}
                {sharedCourses.length === 1 ? "course" : "courses"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sharedCourses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                color={course.color}
                resourceCount={course._count?.resources ?? 0}
                collaboratorCount={course._count?.collaborators ?? 0}
                isShared={true}
                sharedBy={{
                  name: course.creator.name,
                  profileImage: course.creator.profileImage,
                }}
                role={course.collaborators[0]?.role ?? "VIEWER"}
                onToggleFavorite={() => handleToggleFavorite(course.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
