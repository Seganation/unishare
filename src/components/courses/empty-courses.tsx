"use client";

import Link from "next/link";
import { BookOpen, Plus, FileText, Users, Calendar } from "lucide-react";
import { Button } from "~/components/ui/button";

export function EmptyCourses() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20">
      {/* Icon Container with Gradient */}
      <div className="relative mb-8">
        <div className="bg-primary/10 flex h-32 w-32 items-center justify-center rounded-full">
          <div className="bg-primary flex h-24 w-24 items-center justify-center rounded-full">
            <BookOpen className="text-primary-foreground h-12 w-12" />
          </div>
        </div>
        {/* Decorative Circles */}
        <div className="bg-primary/30 absolute -top-2 -right-2 h-8 w-8 animate-pulse rounded-full" />
        <div className="bg-primary/20 absolute -bottom-2 -left-2 h-6 w-6 animate-pulse rounded-full delay-75" />
      </div>

      {/* Content */}
      <h3 className="text-foreground mb-3 text-center text-2xl font-bold md:text-3xl">
        No courses yet
      </h3>
      <p className="text-muted-foreground mb-8 max-w-md text-center leading-relaxed">
        Start organizing your academic life by creating your first course. Add
        resources, collaborate with classmates, and stay on top of your studies!
      </p>

      {/* CTA Button */}
      <Link href="/courses/new">
        <Button
          size="lg"
          className="group font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
        >
          <Plus className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
          Create Your First Course
        </Button>
      </Link>

      {/* Optional: Feature Highlights */}
      <div className="mt-12 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-3">
        <div className="p-4 text-center">
          <div className="bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg">
            <FileText className="text-primary h-6 w-6" />
          </div>
          <h4 className="text-foreground mb-1 font-semibold">
            Organize Resources
          </h4>
          <p className="text-muted-foreground text-sm">
            Keep all your course materials in one place
          </p>
        </div>
        <div className="p-4 text-center">
          <div className="bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg">
            <Users className="text-primary h-6 w-6" />
          </div>
          <h4 className="text-foreground mb-1 font-semibold">Collaborate</h4>
          <p className="text-muted-foreground text-sm">
            Share and work together with classmates
          </p>
        </div>
        <div className="p-4 text-center">
          <div className="bg-primary/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg">
            <Calendar className="text-primary h-6 w-6" />
          </div>
          <h4 className="text-foreground mb-1 font-semibold">Stay Organized</h4>
          <p className="text-muted-foreground text-sm">
            Track deadlines and manage your time
          </p>
        </div>
      </div>
    </div>
  );
}
