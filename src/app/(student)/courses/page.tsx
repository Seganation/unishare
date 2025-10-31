import Link from "next/link";
import {
  Plus,
  BookOpen,
  Users,
  FileText,
  TrendingUp,
  Sparkles,
  Zap,
  Share2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { CourseList } from "~/components/courses/course-list";
import { api } from "~/trpc/server";

export default async function CoursesPage() {
  // Fetch user's courses and stats
  const userCourses = await api.course.getUserCourses();

  // Calculate stats
  const totalCourses = userCourses.length;
  const ownedCourses = userCourses.filter((c) => c.role === "OWNER").length;
  const sharedCourses = userCourses.filter((c) => c.role !== "OWNER").length;
  const totalResources = userCourses.reduce(
    (sum, c) => sum + (c._count?.resources ?? 0),
    0,
  );
  const totalCollaborators = userCourses.reduce(
    (sum, c) => sum + (c._count?.collaborators ?? 0),
    0,
  );

  const stats = [
    {
      label: "Total Courses",
      value: totalCourses,
      icon: BookOpen,
      color: "from-purple-500 to-indigo-600",
      bgColor: "from-purple-50 to-indigo-50",
      iconBg: "bg-gradient-to-br from-purple-100 to-indigo-100",
      textColor: "text-purple-700",
    },
    {
      label: "Resources",
      value: totalResources,
      icon: FileText,
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-50 to-cyan-50",
      iconBg: "bg-gradient-to-br from-blue-100 to-cyan-100",
      textColor: "text-blue-700",
    },
    {
      label: "Collaborators",
      value: totalCollaborators,
      icon: Users,
      color: "from-emerald-500 to-teal-600",
      bgColor: "from-emerald-50 to-teal-50",
      iconBg: "bg-gradient-to-br from-emerald-100 to-teal-100",
      textColor: "text-emerald-700",
    },
    {
      label: "Shared with Me",
      value: sharedCourses,
      icon: Share2,
      color: "from-orange-500 to-amber-600",
      bgColor: "from-orange-50 to-amber-50",
      iconBg: "bg-gradient-to-br from-orange-100 to-amber-100",
      textColor: "text-orange-700",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Header with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 px-4 py-12 sm:py-16">
        {/* Animated Background Pattern */}
        <div className="pattern-dots absolute inset-0 opacity-10" />

        {/* Floating Decorative Circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 backdrop-blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/5 backdrop-blur-3xl" />
          <div className="absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-white/5" />
        </div>

        {/* Content */}
        <div className="container relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Title Section */}
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-6 w-6 animate-pulse text-yellow-300" />
                <span className="text-sm font-semibold uppercase tracking-wider text-purple-200">
                  Dashboard
                </span>
              </div>
              <h1 className="mb-3 text-4xl font-black text-white drop-shadow-lg md:text-5xl lg:text-6xl">
                My Courses
              </h1>
              <p className="max-w-xl text-lg text-purple-100">
                Organize your academic life in one place. Create, share, and
                collaborate on course materials.
              </p>
            </div>

            {/* Action Button */}
            <Link href="/courses/new">
              <Button
                size="lg"
                className="group relative h-14 overflow-hidden bg-white px-8 text-base font-bold text-purple-700 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-purple-900/50 focus-visible:ring-4 focus-visible:ring-white/50"
              >
                {/* Button shimmer effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-purple-100 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <span className="relative flex items-center">
                  <Plus className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
                  Create New Course
                  <Zap className="ml-2 h-4 w-4 animate-pulse" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="container mx-auto max-w-7xl px-4">
        <div className="-mt-8 mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-10 ${stat.bgColor}`}
                />

                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                {/* Content */}
                <div className="relative">
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${stat.iconBg}`}
                    >
                      <Icon className={`h-7 w-7 ${stat.textColor}`} />
                    </div>
                    <TrendingUp className="h-5 w-5 text-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-black text-gray-900">
                    {stat.value}
                  </p>
                </div>

                {/* Bottom Accent */}
                <div
                  className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r transition-all duration-500 group-hover:w-full ${stat.color}`}
                />
              </div>
            );
          })}
        </div>

        {/* Course List Section */}
        <div>
          <div className="mb-6 flex items-center gap-3">
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" />
            <h2 className="text-2xl font-bold text-gray-900">All Courses</h2>
          </div>
          <CourseList />
        </div>
      </div>
    </div>
  );
}
