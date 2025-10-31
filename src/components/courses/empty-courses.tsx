"use client";

import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";

export function EmptyCourses() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20">
      {/* Icon Container with Gradient */}
      <div className="relative mb-8">
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-indigo-100">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600">
            <BookOpen className="h-12 w-12 text-white" />
          </div>
        </div>
        {/* Decorative Circles */}
        <div className="absolute -top-2 -right-2 h-8 w-8 animate-pulse rounded-full bg-purple-200" />
        <div className="absolute -bottom-2 -left-2 h-6 w-6 animate-pulse rounded-full bg-indigo-200 delay-75" />
      </div>

      {/* Content */}
      <h3 className="mb-3 text-center text-2xl font-bold text-gray-800 md:text-3xl">
        No courses yet
      </h3>
      <p className="mb-8 max-w-md text-center leading-relaxed text-gray-500">
        Start organizing your academic life by creating your first course. Add
        resources, collaborate with classmates, and stay on top of your studies!
      </p>

      {/* CTA Button */}
      <Link href="/courses/new">
        <Button
          size="lg"
          className="group bg-gradient-to-r from-purple-600 to-indigo-600 font-semibold text-white shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl"
        >
          <Plus className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
          Create Your First Course
        </Button>
      </Link>

      {/* Optional: Feature Highlights */}
      <div className="mt-12 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-3">
        <div className="p-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
            <FileText className="h-6 w-6 text-purple-600" />
          </div>
          <h4 className="mb-1 font-semibold text-gray-700">
            Organize Resources
          </h4>
          <p className="text-sm text-gray-500">
            Keep all your course materials in one place
          </p>
        </div>
        <div className="p-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
            <Users className="h-6 w-6 text-indigo-600" />
          </div>
          <h4 className="mb-1 font-semibold text-gray-700">Collaborate</h4>
          <p className="text-sm text-gray-500">
            Share and work together with classmates
          </p>
        </div>
        <div className="p-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
            <Calendar className="h-6 w-6 text-purple-600" />
          </div>
          <h4 className="mb-1 font-semibold text-gray-700">Stay Organized</h4>
          <p className="text-sm text-gray-500">
            Track deadlines and manage your time
          </p>
        </div>
      </div>
    </div>
  );
}

// Import needed icons
import { FileText, Users, Calendar } from "lucide-react";
