"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { X, Search, UserPlus, Users } from "lucide-react";
import { Loader } from "~/components/ai-elements/loader";

interface ShareTimetableModalProps {
  open: boolean;
  onClose: () => void;
  timetableId: string;
  timetableName: string;
}

export function ShareTimetableModal({
  open,
  onClose,
  timetableId,
  timetableName,
}: ShareTimetableModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<"VIEWER" | "CONTRIBUTOR">(
    "VIEWER",
  );

  const { data: searchResults, isLoading: isSearching } =
    api.timetable.searchUsers.useQuery(
      { query: searchQuery, timetableId },
      { enabled: searchQuery.length >= 3 },
    );

  const inviteMutation = api.timetable.inviteCollaborator.useMutation({
    onSuccess: () => {
      setSearchQuery("");
    },
  });

  if (!open) return null;

  const handleInvite = (userId: string) => {
    inviteMutation.mutate({
      timetableId,
      userId,
      role: selectedRole,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Share Timetable
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {timetableName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Role Selector */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Invite as
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedRole("VIEWER")}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  selectedRole === "VIEWER"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                    : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  Viewer
                </div>
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Can view only
                </div>
              </button>
              <button
                onClick={() => setSelectedRole("CONTRIBUTOR")}
                className={`rounded-lg border-2 p-4 text-left transition-all ${
                  selectedRole === "CONTRIBUTOR"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                    : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  Contributor
                </div>
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Can edit events
                </div>
              </button>
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Search for students
            </label>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email (min 3 characters)"
                className="pl-10"
              />
            </div>
            {searchQuery.length > 0 && searchQuery.length < 3 && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Type at least 3 characters to search
              </p>
            )}
          </div>

          {/* Search Results */}
          <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            {isSearching && searchQuery.length >= 3 && (
              <div className="flex items-center justify-center p-8">
                <Loader />
              </div>
            )}

            {!isSearching && searchQuery.length >= 3 && searchResults && (
              <>
                {searchResults.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Users className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                    <p className="text-sm">No students found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <div className="flex items-center gap-3">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.name}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleInvite(user.id)}
                          disabled={inviteMutation.isPending}
                        >
                          <UserPlus className="mr-1 h-4 w-4" />
                          Invite
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {searchQuery.length < 3 && (
              <div className="p-8 text-center text-gray-400">
                <Search className="mx-auto mb-2 h-8 w-8" />
                <p className="text-sm">Search for students to invite</p>
              </div>
            )}
          </div>

          {inviteMutation.isSuccess && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
              Invitation sent successfully!
            </div>
          )}

          {inviteMutation.error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {inviteMutation.error.message}
            </div>
          )}

          <Button onClick={onClose} variant="outline" className="w-full">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
