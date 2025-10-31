import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CourseForm } from "~/components/courses/course-form";

export default function NewCoursePage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {/* Back Button */}
      <Link
        href="/courses"
        className="group text-muted-foreground hover:text-primary mb-6 inline-flex items-center gap-2 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span className="font-medium">Back to Courses</span>
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-foreground mb-2 text-3xl font-bold md:text-4xl">
          Create New Course
        </h1>
        <p className="text-muted-foreground">
          Add a new course to organize your resources and collaborate with
          classmates
        </p>
      </div>

      {/* Form Card */}
      <div className="border-border bg-card rounded-xl border p-6 shadow-lg md:p-8">
        <CourseForm mode="create" />
      </div>

      {/* Help Text */}
      <div className="border-primary/30 bg-primary/5 mt-6 rounded-lg border p-4">
        <p className="text-foreground text-sm">
          <strong>Tip:</strong> After creating your course, 4 predefined
          resource cards (Assignments, Tasks, Content, Notes) will be
          automatically created to help you get started!
        </p>
      </div>
    </div>
  );
}
