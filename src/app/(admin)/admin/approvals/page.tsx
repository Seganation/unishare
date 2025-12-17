// src/app/(admin)/admin/approvals/page.tsx
"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Sparkles,
  TrendingUp,
  Shield,
  UserCheck,
  Book,
} from "lucide-react";
import { LogoutButton } from "~/components/logout-button";

export default function AdminApprovalsPage() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const utils = api.useUtils();

  // Fetch pending users
  const { data: pendingUsers, isLoading } =
    api.admin.getPendingUsers.useQuery();

  // Fetch dashboard stats
  const { data: stats } = api.admin.getDashboardStats.useQuery();

  // Approve mutation
  const approveMutation = api.admin.approveUser.useMutation({
    onSuccess: () => {
      void utils.admin.getPendingUsers.invalidate();
      void utils.admin.getDashboardStats.invalidate();
      setSelectedUser(null);
    },
  });

  // Reject mutation
  const rejectMutation = api.admin.rejectUser.useMutation({
    onSuccess: () => {
      void utils.admin.getPendingUsers.invalidate();
      void utils.admin.getDashboardStats.invalidate();
      setSelectedUser(null);
    },
  });

  const handleApprove = (userId: string) => {
    if (confirm("Are you sure you want to approve this user?")) {
      setSelectedUser(userId);
      approveMutation.mutate({ userId });
    }
  };

  const handleReject = (userId: string) => {
    const reason = prompt("Enter rejection reason (optional):");
    if (confirm("Are you sure you want to reject this user?")) {
      setSelectedUser(userId);
      rejectMutation.mutate({ userId, reason: reason ?? undefined });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 animate-spin text-5xl">⏳</div>
          <p className="text-muted-foreground text-lg">
            Loading pending approvals...
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Pending Approvals",
      value: stats?.pendingUsers ?? 0,
      icon: Clock,
      color: "from-amber-500 to-orange-600",
      bgColor: "from-amber-50 to-orange-50",
      iconBg: "bg-gradient-to-br from-amber-100 to-orange-100",
      textColor: "text-amber-700",
    },
    {
      label: "Approved Users",
      value: stats?.approvedUsers ?? 0,
      icon: UserCheck,
      color: "from-emerald-500 to-teal-600",
      bgColor: "from-emerald-50 to-teal-50",
      iconBg: "bg-gradient-to-br from-emerald-100 to-teal-100",
      textColor: "text-emerald-700",
    },
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-50 to-cyan-50",
      iconBg: "bg-gradient-to-br from-blue-100 to-cyan-100",
      textColor: "text-blue-700",
    },
    {
      label: "Administrators",
      value: stats?.adminUsers ?? 0,
      icon: Shield,
      color: "from-purple-500 to-indigo-600",
      bgColor: "from-purple-50 to-indigo-50",
      iconBg: "bg-gradient-to-br from-purple-100 to-indigo-100",
      textColor: "text-purple-700",
    },
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="border-border bg-card/80 sticky top-0 z-50 border-b backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              href="/admin/approvals"
              className="group flex items-center gap-2"
            >
              <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-105">
                <Book className="text-primary-foreground h-6 w-6" />
              </div>
              <span className="font-unishare text-primary text-xl font-bold">
                UNIShare Admin
              </span>
            </Link>

            {/* Logout Button */}
            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* Hero Header with Gradient Background */}
      <div className="bg-primary relative overflow-hidden px-4 py-12 sm:py-16">
        {/* Animated Background Pattern */}
        <div className="pattern-dots absolute inset-0 opacity-10" />

        {/* Floating Decorative Circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="bg-primary-foreground/5 absolute -top-20 -right-20 h-64 w-64 rounded-full backdrop-blur-3xl" />
          <div className="bg-primary-foreground/5 absolute -bottom-20 -left-20 h-80 w-80 rounded-full backdrop-blur-3xl" />
          <div className="bg-primary-foreground/5 absolute top-1/3 right-1/4 h-40 w-40 rounded-full" />
        </div>

        {/* Content */}
        <div className="relative container mx-auto max-w-7xl">
          <div className="flex flex-col gap-4">
            {/* Title Section */}
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-6 w-6 animate-pulse text-yellow-300" />
                <span className="text-primary-foreground/70 text-sm font-semibold tracking-wider uppercase">
                  Admin Panel
                </span>
              </div>
              <h1 className="text-primary-foreground mb-3 text-4xl font-black drop-shadow-lg md:text-5xl lg:text-6xl">
                Student Approvals
              </h1>
              <p className="text-primary-foreground/80 max-w-2xl text-lg">
                Review and approve pending student registrations. Verify student
                IDs and grant access to the platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="container mx-auto max-w-7xl px-4">
        <div className="-mt-8 mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="group border-border bg-card relative overflow-hidden rounded-2xl border-2 p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-linear-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-10 ${stat.bgColor}`}
                />

                {/* Shimmer Effect */}
                <div className="via-primary/10 absolute inset-0 -translate-x-full bg-linear-to-r from-transparent to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

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
                  <p className="text-muted-foreground mb-1 text-sm font-semibold tracking-wide uppercase">
                    {stat.label}
                  </p>
                  <p className="text-foreground text-4xl font-black">
                    {stat.value}
                  </p>
                </div>

                {/* Bottom Accent */}
                <div
                  className={`absolute bottom-0 left-0 h-1 w-0 bg-linear-to-r transition-all duration-500 group-hover:w-full ${stat.color}`}
                />
              </div>
            );
          })}
        </div>

        {/* Pending Users Section */}
        <div>
          <div className="mb-6 flex items-center gap-3">
            <div className="bg-primary h-1 w-12 rounded-full" />
            <h2 className="text-foreground text-2xl font-bold">
              Pending Approvals
            </h2>
          </div>

          {!pendingUsers || pendingUsers.length === 0 ? (
            <div className="border-border bg-card rounded-2xl border-2 p-16 text-center shadow-lg">
              <div className="mb-6 text-7xl">✅</div>
              <h2 className="text-foreground mb-3 text-2xl font-bold">
                All caught up!
              </h2>
              <p className="text-muted-foreground text-lg">
                There are no pending approvals at the moment.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="group border-border bg-card relative overflow-hidden rounded-2xl border-2 p-6 shadow-lg transition-all duration-300 hover:shadow-2xl"
                >
                  {/* Background Shimmer */}
                  <div className="via-primary/5 absolute inset-0 -translate-x-full bg-linear-to-r from-transparent to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                  {/* Content */}
                  <div className="relative space-y-4">
                    {/* User Info */}
                    <div>
                      <h3 className="text-foreground text-xl font-bold">
                        {user.name}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {user.email}
                      </p>
                    </div>

                    {/* University & Faculty */}
                    <div className="border-border space-y-2 rounded-lg border bg-linear-to-br from-slate-50 to-slate-100 p-3 text-sm dark:from-slate-900 dark:to-slate-800">
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground font-medium">
                          University:
                        </span>
                        <span className="text-foreground flex-1 font-semibold">
                          {user.university.name}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground font-medium">
                          Faculty:
                        </span>
                        <span className="text-foreground flex-1 font-semibold">
                          {user.faculty.name}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground font-medium">
                          Registered:
                        </span>
                        <span className="text-foreground flex-1">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Student ID Preview */}
                    <div>
                      <p className="text-muted-foreground mb-2 text-sm font-semibold tracking-wide uppercase">
                        Student ID
                      </p>
                      <div className="border-border hover:border-primary relative h-48 cursor-pointer overflow-hidden rounded-xl border-2 bg-slate-100 transition-all dark:bg-slate-900">
                        <Image
                          src={user.studentIdUrl}
                          alt="Student ID"
                          fill
                          className="object-contain p-2 transition-transform hover:scale-105"
                          onClick={() =>
                            window.open(user.studentIdUrl, "_blank")
                          }
                        />
                      </div>
                      <button
                        onClick={() => window.open(user.studentIdUrl, "_blank")}
                        className="mt-2 text-xs font-medium text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View full size →
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleApprove(user.id)}
                        disabled={
                          approveMutation.isPending || rejectMutation.isPending
                        }
                        className="group/btn flex flex-1 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:from-emerald-700 hover:to-teal-700 focus:ring-4 focus:ring-emerald-500/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                      >
                        <CheckCircle className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                        {approveMutation.isPending && selectedUser === user.id
                          ? "Approving..."
                          : "Approve"}
                      </button>
                      <button
                        onClick={() => handleReject(user.id)}
                        disabled={
                          approveMutation.isPending || rejectMutation.isPending
                        }
                        className="group/btn flex flex-1 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-red-600 to-rose-600 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:from-red-700 hover:to-rose-700 focus:ring-4 focus:ring-red-500/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                      >
                        <XCircle className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                        {rejectMutation.isPending && selectedUser === user.id
                          ? "Rejecting..."
                          : "Reject"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
