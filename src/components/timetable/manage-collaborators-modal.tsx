"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { X, Users, Crown, Eye, Edit3, Trash2, UserMinus } from "lucide-react";
import { Loader } from "~/components/ai-elements/loader";
import type { CollaboratorRole } from "@prisma/client";

interface ManageCollaboratorsModalProps {
  open: boolean;
  onClose: () => void;
  timetableId: string;
  timetableName: string;
  isOwner: boolean;
}

export function ManageCollaboratorsModal({
  open,
  onClose,
  timetableId,
  timetableName,
  isOwner,
}: ManageCollaboratorsModalProps) {
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const { data: timetable, refetch } = api.timetable.getById.useQuery(
    { id: timetableId },
    { enabled: open },
  );

  // Note: These mutations need to be added to the backend
  const updateRoleMutation = api.timetable.updateCollaboratorRole?.useMutation({
    onSuccess: () => {
      void refetch();
      setChangingRoleId(null);
    },
  });

  const removeCollaboratorMutation = api.timetable.removeCollaborator?.useMutation({
    onSuccess: () => {
      void refetch();
      setRemovingId(null);
    },
  });

  if (!open) return null;

  const collaborators = timetable?.collaborators ?? [];
  const acceptedCollaborators = collaborators.filter((c) => c.status === "ACCEPTED");
  const pendingCollaborators = collaborators.filter((c) => c.status === "PENDING");

  const handleChangeRole = (collaboratorId: string, newRole: CollaboratorRole) => {
    if (!updateRoleMutation) {
      alert("This feature requires backend support. Please implement updateCollaboratorRole mutation.");
      return;
    }
    setChangingRoleId(collaboratorId);
    updateRoleMutation.mutate({
      collaboratorId,
      role: newRole,
    });
  };

  const handleRemove = (collaboratorId: string) => {
    if (!removeCollaboratorMutation) {
      alert("This feature requires backend support. Please implement removeCollaborator mutation.");
      return;
    }
    if (confirm("Are you sure you want to remove this collaborator?")) {
      setRemovingId(collaboratorId);
      removeCollaboratorMutation.mutate({ collaboratorId });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="border-border bg-card relative w-full max-w-2xl overflow-hidden rounded-3xl border-2 shadow-2xl">
        {/* Header with gradient */}
        <div className="bg-primary relative overflow-hidden px-6 py-8">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Users className="h-6 w-6 text-white/80" />
                <span className="text-sm font-semibold uppercase tracking-wider text-white/80">
                  Collaborators
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white">{timetableName}</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 transition-all hover:bg-white/20"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {!timetable ? (
            <div className="flex items-center justify-center py-12">
              <Loader size={48} />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Owner */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  <Crown className="h-4 w-4 text-amber-500" />
                  Owner
                </h3>
                <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 dark:border-amber-800 dark:from-amber-950/20 dark:to-yellow-950/20">
                  <div className="flex items-center gap-4">
                    {timetable.creator.profileImage ? (
                      <img
                        src={timetable.creator.profileImage}
                        alt={timetable.creator.name}
                        className="h-12 w-12 rounded-full border-2 border-amber-300"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-amber-300 bg-gradient-to-br from-amber-400 to-yellow-500 text-lg font-bold text-white">
                        {timetable.creator.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {timetable.creator.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {timetable.creator.email}
                      </p>
                    </div>
                    <div className="rounded-full bg-amber-200 px-3 py-1 text-sm font-semibold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      Owner
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Collaborators */}
              {acceptedCollaborators.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Active Collaborators ({acceptedCollaborators.length})
                  </h3>
                  <div className="space-y-3">
                    {acceptedCollaborators.map((collaborator) => (
                      <div
                        key={collaborator.id}
                        className="border-border bg-card group relative overflow-hidden rounded-2xl border p-4 transition-all hover:shadow-md"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex min-w-0 flex-1 items-center gap-4">
                            {collaborator.user.profileImage ? (
                              <img
                                src={collaborator.user.profileImage}
                                alt={collaborator.user.name}
                                className="h-11 w-11 rounded-full"
                              />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500 font-bold text-white">
                                {collaborator.user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold text-gray-900 dark:text-white">
                                {collaborator.user.name}
                              </p>
                              <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                                {collaborator.user.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Role Selector */}
                            {isOwner ? (
                              <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
                                <button
                                  onClick={() => handleChangeRole(collaborator.id, "VIEWER")}
                                  disabled={
                                    collaborator.role === "VIEWER" ||
                                    changingRoleId === collaborator.id
                                  }
                                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                                    collaborator.role === "VIEWER"
                                      ? "bg-violet-500 text-white shadow-sm"
                                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                                  }`}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  Viewer
                                </button>
                                <button
                                  onClick={() =>
                                    handleChangeRole(collaborator.id, "CONTRIBUTOR")
                                  }
                                  disabled={
                                    collaborator.role === "CONTRIBUTOR" ||
                                    changingRoleId === collaborator.id
                                  }
                                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                                    collaborator.role === "CONTRIBUTOR"
                                      ? "bg-violet-500 text-white shadow-sm"
                                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                                  }`}
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                  Contributor
                                </button>
                              </div>
                            ) : (
                              <div className="rounded-full bg-violet-100 px-3 py-1.5 text-sm font-semibold text-violet-700 dark:bg-violet-900 dark:text-violet-200">
                                {collaborator.role === "VIEWER" ? "Viewer" : "Contributor"}
                              </div>
                            )}

                            {/* Remove Button */}
                            {isOwner && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemove(collaborator.id)}
                                disabled={removingId === collaborator.id}
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950"
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Invitations */}
              {pendingCollaborators.length > 0 && isOwner && (
                <div>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Pending Invitations ({pendingCollaborators.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingCollaborators.map((collaborator) => (
                      <div
                        key={collaborator.id}
                        className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 font-bold text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                              {collaborator.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700 dark:text-gray-300">
                                {collaborator.user.name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Invitation sent • {collaborator.role.toLowerCase()}
                              </p>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemove(collaborator.id)}
                            disabled={removingId === collaborator.id}
                            className="text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {acceptedCollaborators.length === 0 && pendingCollaborators.length === 0 && (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <Users className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    No collaborators yet
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Share this timetable to collaborate with others
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
          <Button onClick={onClose} variant="outline" className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
