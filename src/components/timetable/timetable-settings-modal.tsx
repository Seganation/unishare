"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  X,
  Settings,
  Edit3,
  Trash2,
  LogOut,
  Star,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

interface TimetableSettingsModalProps {
  open: boolean;
  onClose: () => void;
  timetableId: string;
  timetableName: string;
  timetableDescription?: string | null;
  isOwner: boolean;
  isDefault: boolean;
  onSuccess?: () => void;
}

export function TimetableSettingsModal({
  open,
  onClose,
  timetableId,
  timetableName,
  timetableDescription,
  isOwner,
  isDefault,
  onSuccess,
}: TimetableSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"general" | "danger">("general");
  const [name, setName] = useState(timetableName);
  const [description, setDescription] = useState(timetableDescription ?? "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const utils = api.useUtils();

  const updateMutation = api.timetable.update.useMutation({
    onSuccess: () => {
      void utils.timetable.getUserTimetables.invalidate();
      onSuccess?.();
    },
  });

  const deleteMutation = api.timetable.delete.useMutation({
    onSuccess: () => {
      void utils.timetable.getUserTimetables.invalidate();
      onSuccess?.();
      onClose();
    },
  });

  // Note: These mutations need to be added to the backend
  const setDefaultMutation = api.timetable.setDefaultTimetable?.useMutation({
    onSuccess: () => {
      void utils.timetable.getUserTimetables.invalidate();
      onSuccess?.();
    },
  });

  const leaveMutation = api.timetable.leaveTimetable?.useMutation({
    onSuccess: () => {
      void utils.timetable.getUserTimetables.invalidate();
      onSuccess?.();
      onClose();
    },
  });

  if (!open) return null;

  const handleUpdate = () => {
    updateMutation.mutate({
      id: timetableId,
      name,
      description: description || undefined,
    });
  };

  const handleSetDefault = () => {
    if (!setDefaultMutation) {
      alert("This feature requires backend support. Please implement setDefaultTimetable mutation.");
      return;
    }
    setDefaultMutation.mutate({ timetableId });
  };

  const handleDelete = () => {
    deleteMutation.mutate({ id: timetableId });
  };

  const handleLeave = () => {
    if (!leaveMutation) {
      alert("This feature requires backend support. Please implement leaveTimetable mutation.");
      return;
    }
    leaveMutation.mutate({ timetableId });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="border-border bg-card relative w-full max-w-lg overflow-hidden rounded-3xl border-2 shadow-2xl">
        {/* Header */}
        <div className="bg-primary relative overflow-hidden px-6 py-8">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Settings className="h-6 w-6 text-white/80" />
                <span className="text-sm font-semibold uppercase tracking-wider text-white/80">
                  Settings
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white">Timetable Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 transition-all hover:bg-white/20"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="flex">
            <button
              onClick={() => setActiveTab("general")}
              className={`flex-1 border-b-2 px-6 py-4 text-sm font-semibold transition-all ${
                activeTab === "general"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab("danger")}
              className={`flex-1 border-b-2 px-6 py-4 text-sm font-semibold transition-all ${
                activeTab === "danger"
                  ? "border-red-500 text-red-600 dark:text-red-400"
                  : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Danger Zone
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[50vh] overflow-y-auto p-6">
          {activeTab === "general" ? (
            <div className="space-y-6">
              {/* Set as Default */}
              <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-5 dark:border-amber-800 dark:from-amber-950/20 dark:to-yellow-950/20">
                <div className="mb-3 flex items-center gap-2">
                  <Star
                    className={`h-5 w-5 ${
                      isDefault
                        ? "fill-amber-500 text-amber-500"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  />
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Default Timetable
                  </h3>
                </div>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  {isDefault
                    ? "This is your default timetable. You'll receive notifications for classes in this schedule."
                    : "Set this as your default timetable to receive class notifications and show it first when you visit this page."}
                </p>
                <Button
                  onClick={handleSetDefault}
                  disabled={isDefault || !setDefaultMutation}
                  className={`w-full ${
                    isDefault
                      ? "bg-amber-500 text-white"
                      : "bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30"
                  }`}
                >
                  {isDefault ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Currently Default
                    </>
                  ) : (
                    <>
                      <Star className="mr-2 h-4 w-4" />
                      Set as Default
                    </>
                  )}
                </Button>
              </div>

              {/* Edit Name and Description (Owner only) */}
              {isOwner && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Timetable Name
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Fall 2024 Schedule"
                      className="border-2"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Description{" "}
                      <span className="font-normal text-gray-500">(optional)</span>
                    </label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a description for this timetable..."
                      rows={3}
                      className="border-2 resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleUpdate}
                    disabled={
                      updateMutation.isPending ||
                      (name === timetableName &&
                        description === (timetableDescription ?? ""))
                    }
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Leave Timetable (non-owner) */}
              {!isOwner && (
                <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-5 dark:border-orange-800 dark:bg-orange-950/20">
                  <div className="mb-3 flex items-center gap-2">
                    <LogOut className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Leave Timetable
                    </h3>
                  </div>
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    You will no longer have access to this timetable and won't receive any
                    notifications from it.
                  </p>

                  {!showLeaveConfirm ? (
                    <Button
                      onClick={() => setShowLeaveConfirm(true)}
                      variant="outline"
                      className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Leave Timetable
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 rounded-lg bg-orange-100 p-3 dark:bg-orange-900/30">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                          Are you sure? This action cannot be undone.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setShowLeaveConfirm(false)}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleLeave}
                          disabled={leaveMutation?.isPending}
                          className="flex-1 bg-orange-600 text-white hover:bg-orange-700"
                        >
                          {leaveMutation?.isPending ? "Leaving..." : "Confirm Leave"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Delete Timetable (owner only) */}
              {isOwner && (
                <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-950/20">
                  <div className="mb-3 flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Delete Timetable
                    </h3>
                  </div>
                  <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    Permanently delete this timetable and all its events. This action cannot
                    be undone.
                  </p>

                  {!showDeleteConfirm ? (
                    <Button
                      onClick={() => setShowDeleteConfirm(true)}
                      variant="outline"
                      className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Timetable
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 rounded-lg bg-red-100 p-3 dark:bg-red-900/30">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                          This will permanently delete the timetable and all events. All
                          collaborators will lose access.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setShowDeleteConfirm(false)}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleDelete}
                          disabled={deleteMutation.isPending}
                          className="flex-1 bg-red-600 text-white hover:bg-red-700"
                        >
                          {deleteMutation.isPending ? "Deleting..." : "Delete Forever"}
                        </Button>
                      </div>
                    </div>
                  )}
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
