"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { X, Loader2 } from "lucide-react";

interface CreateTimetableModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTimetableModal({
  open,
  onClose,
  onSuccess,
}: CreateTimetableModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const createMutation = api.timetable.create.useMutation({
    onSuccess: () => {
      onSuccess();
      setName("");
      setDescription("");
    },
  });

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name, description: description || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create Timetable</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Timetable Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Fall 2024 Schedule"
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Description (Optional)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your timetable"
              rows={3}
              maxLength={500}
            />
          </div>

          {createMutation.error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {createMutation.error.message}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createMutation.isPending || !name.trim()}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Timetable"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
