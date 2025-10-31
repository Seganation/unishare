"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import Image from "next/image";

export default function AdminApprovalsPage() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const utils = api.useUtils();

  // Fetch pending users
  const { data: pendingUsers, isLoading } =
    api.admin.getPendingUsers.useQuery();

  // Approve mutation
  const approveMutation = api.admin.approveUser.useMutation({
    onSuccess: () => {
      // Refetch pending users
      void utils.admin.getPendingUsers.invalidate();
      setSelectedUser(null);
    },
  });

  // Reject mutation
  const rejectMutation = api.admin.rejectUser.useMutation({
    onSuccess: () => {
      // Refetch pending users
      void utils.admin.getPendingUsers.invalidate();
      setSelectedUser(null);
    },
  });

  const handleApprove = (userId: string) => {
    if (confirm("Are you sure you want to approve this user?")) {
      approveMutation.mutate({ userId });
    }
  };

  const handleReject = (userId: string) => {
    const reason = prompt(
      "Enter rejection reason (optional):"
    );
    if (confirm("Are you sure you want to reject this user?")) {
      rejectMutation.mutate({ userId, reason: reason ?? undefined });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-gray-600">Loading pending approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Student Approvals
          </h1>
          <p className="mt-2 text-gray-600">
            Review and approve pending student registrations
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 rounded-lg bg-blue-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Pending Approvals
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {pendingUsers?.length ?? 0}
              </p>
            </div>
            <div className="text-5xl">📬</div>
          </div>
        </div>

        {/* Pending Users List */}
        {!pendingUsers || pendingUsers.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow">
            <div className="mb-4 text-6xl">✅</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              All caught up!
            </h2>
            <p className="text-gray-600">
              There are no pending approvals at the moment.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg"
              >
                {/* User Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>

                {/* University & Faculty */}
                <div className="mb-4 space-y-1 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">University:</span>{" "}
                    {user.university.name}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Faculty:</span>{" "}
                    {user.faculty.name}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Registered:</span>{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Student ID Preview */}
                <div className="mb-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Student ID:
                  </p>
                  <div className="relative h-40 overflow-hidden rounded-md bg-gray-100">
                    <Image
                      src={user.studentIdUrl}
                      alt="Student ID"
                      fill
                      className="object-contain"
                      onClick={() => window.open(user.studentIdUrl, "_blank")}
                    />
                  </div>
                  <button
                    onClick={() => window.open(user.studentIdUrl, "_blank")}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    View full size →
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(user.id)}
                    disabled={
                      approveMutation.isPending || rejectMutation.isPending
                    }
                    className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {approveMutation.isPending && selectedUser === user.id
                      ? "Approving..."
                      : "✓ Approve"}
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    disabled={
                      approveMutation.isPending || rejectMutation.isPending
                    }
                    className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {rejectMutation.isPending && selectedUser === user.id
                      ? "Rejecting..."
                      : "✗ Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
