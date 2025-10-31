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
            className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            <div className="h-32 bg-gray-200" />
            <div className="space-y-3 p-6">
              <div className="h-6 w-3/4 rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-2/3 rounded bg-gray-200" />
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
              <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
              <p className="mt-1 text-sm text-gray-500">
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
              <h2 className="text-2xl font-bold text-gray-900">
                Shared With Me
              </h2>
              <p className="mt-1 text-sm text-gray-500">
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
