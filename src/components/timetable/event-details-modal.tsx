"use client";

import { useState, useMemo } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  X,
  Loader2,
  Edit2,
  Trash2,
  Save,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  AlertCircle,
  Info,
} from "lucide-react";
import type { Event as PrismaEvent, Course } from "@prisma/client";

interface EventDetailsModalProps {
  open: boolean;
  onClose: () => void;
  event: (PrismaEvent & { course: Course }) | null;
  canEdit: boolean;
  onSuccess: () => void;
  allEvents?: (PrismaEvent & { course: Course })[];
}

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

// Helper function to check if two time ranges overlap
function timesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string,
): boolean {
  const s1 = new Date(`2000-01-01T${start1}`);
  const e1 = new Date(`2000-01-01T${end1}`);
  const s2 = new Date(`2000-01-01T${start2}`);
  const e2 = new Date(`2000-01-01T${end2}`);
  return s1 < e2 && s2 < e1;
}

export function EventDetailsModal({
  open,
  onClose,
  event,
  canEdit,
  onSuccess,
  allEvents = [],
}: EventDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit form state
  const [title, setTitle] = useState(event?.title ?? "");
  const [dayOfWeek, setDayOfWeek] = useState(event?.dayOfWeek ?? 1);
  const [startTime, setStartTime] = useState(event?.startTime ?? "09:00");
  const [endTime, setEndTime] = useState(event?.endTime ?? "11:00");
  const [location, setLocation] = useState(event?.location ?? "");

  // Reset form when event changes
  useMemo(() => {
    if (event) {
      setTitle(event.title);
      setDayOfWeek(event.dayOfWeek);
      setStartTime(event.startTime);
      setEndTime(event.endTime);
      setLocation(event.location ?? "");
      setIsEditing(false);
      setShowDeleteConfirm(false);
    }
  }, [event]);

  const updateMutation = api.timetable.updateEvent.useMutation({
    onSuccess: () => {
      onSuccess();
      setIsEditing(false);
    },
  });

  const deleteMutation = api.timetable.deleteEvent.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  // Validation for editing
  const validation = useMemo(() => {
    if (!event || !isEditing) {
      return { hasOverlap: false, overlappingEvent: null };
    }

    const eventsOnDay = allEvents.filter(
      (e) => e.dayOfWeek === dayOfWeek && e.id !== event.id,
    );

    const overlapping = eventsOnDay.find((e) =>
      timesOverlap(startTime, endTime, e.startTime, e.endTime),
    );

    return {
      hasOverlap: !!overlapping,
      overlappingEvent: overlapping,
    };
  }, [event, allEvents, dayOfWeek, startTime, endTime, isEditing]);

  const isValidTimeRange = useMemo(() => {
    if (!startTime || !endTime) return true;
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return end > start;
  }, [startTime, endTime]);

  if (!open || !event) return null;

  const handleSave = () => {
    if (validation.hasOverlap || !isValidTimeRange || !title.trim()) {
      return;
    }

    updateMutation.mutate({
      eventId: event.id,
      title,
      dayOfWeek,
      startTime,
      endTime,
      location: location || undefined,
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate({ eventId: event.id });
  };

  const canSave = title.trim() && isValidTimeRange && !validation.hasOverlap;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1">
            <div
              className="mb-2 inline-block rounded-md px-3 py-1 text-sm font-semibold text-white"
              style={{ backgroundColor: event.course.color }}
            >
              {event.course.code}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? "Edit Class" : "Class Details"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {!isEditing ? (
          /* View Mode */
          <div className="space-y-6">
            {/* Course Info */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <BookOpen className="h-5 w-5" />
                <span className="text-sm font-medium">Course</span>
              </div>
              <h3 className="mt-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                {event.course.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {event.course.code}
              </p>
            </div>

            {/* Class Title */}
            <div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-medium">Class Type</span>
              </div>
              <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {event.title}
              </p>
            </div>

            {/* Day & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm font-medium">Day</span>
                </div>
                <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {DAYS.find((d) => d.value === event.dayOfWeek)?.label}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="h-5 w-5" />
                  <span className="text-sm font-medium">Time</span>
                </div>
                <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {event.startTime} - {event.endTime}
                </p>
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="h-5 w-5" />
                  <span className="text-sm font-medium">Location</span>
                </div>
                <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {event.location}
                </p>
              </div>
            )}

            {/* Course Description */}
            {event.course.description && (
              <div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Info className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    Course Description
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {event.course.description}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {canEdit && (
              <div className="flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="default"
                  className="flex-1"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Class
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="destructive"
                  className="flex-1"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}

            {!canEdit && (
              <div className="rounded-lg bg-blue-50 p-3 text-center dark:bg-blue-900/20">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You have view-only access to this class
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Edit Mode */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="space-y-4"
          >
            {/* Course (read-only) */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <BookOpen className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Course (cannot be changed)
                </span>
              </div>
              <p className="mt-2 font-semibold text-gray-900 dark:text-gray-100">
                {event.course.title} ({event.course.code})
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Class Type <span className="text-red-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Lecture, Tutorial, Lab"
                required
                maxLength={100}
              />
            </div>

            {/* Day */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Day of Week <span className="text-red-500">*</span>
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                required
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 font-medium text-gray-900 transition-all hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-indigo-800"
              >
                {DAYS.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  End Time <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Location (Optional)
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Room A101, Lab C201"
                maxLength={100}
              />
            </div>

            {/* Validation Messages */}
            {!isValidTimeRange && startTime && endTime && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                <div className="text-sm text-red-700 dark:text-red-300">
                  End time must be after start time
                </div>
              </div>
            )}

            {validation.hasOverlap && validation.overlappingEvent && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                <div className="text-sm text-red-700 dark:text-red-300">
                  <p className="font-semibold">Time conflict detected</p>
                  <p className="mt-1">
                    Overlaps with {validation.overlappingEvent.title} (
                    {validation.overlappingEvent.startTime} -{" "}
                    {validation.overlappingEvent.endTime})
                  </p>
                </div>
              </div>
            )}

            {updateMutation.error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">
                {updateMutation.error.message}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  // Reset form
                  setTitle(event.title);
                  setDayOfWeek(event.dayOfWeek);
                  setStartTime(event.startTime);
                  setEndTime(event.endTime);
                  setLocation(event.location ?? "");
                }}
                className="flex-1"
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!canSave || updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && !isEditing && (
          <div className="mt-6 rounded-lg border-2 border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="mb-4 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-300">
                  Delete this class?
                </p>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                  This will permanently remove this class from your timetable.
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="flex-1"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Yes, Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
