"use client";

import { useState, useMemo } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { X, Loader2, Star, AlertCircle, Info } from "lucide-react";

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
  timetableId: string;
  onSuccess: () => void;
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

export function CreateEventModal({
  open,
  onClose,
  timetableId,
  onSuccess,
}: CreateEventModalProps) {
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState(1); // Monday
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");
  const [location, setLocation] = useState("");

  // Get user's favorite courses
  const { data: courses } = api.course.getUserCourses.useQuery();
  const favoriteCourses = courses?.filter((c) => c.isFavorited) ?? [];

  // Get existing timetable data to check for overlaps
  const { data: timetables } = api.timetable.getUserTimetables.useQuery();
  const currentTimetable = useMemo(() => {
    if (!timetables) return null;
    return [...(timetables.owned ?? []), ...(timetables.shared ?? [])].find(
      (t) => t.id === timetableId,
    );
  }, [timetables, timetableId]);

  // Check for time conflicts and course instance count
  const validation = useMemo(() => {
    if (!currentTimetable || !courseId || !startTime || !endTime) {
      return { hasOverlap: false, courseCount: 0, overlappingEvent: null };
    }

    const eventsOnDay = currentTimetable.events.filter(
      (e) => e.dayOfWeek === dayOfWeek,
    );

    // Check for overlaps with any class
    const overlapping = eventsOnDay.find((e) =>
      timesOverlap(startTime, endTime, e.startTime, e.endTime),
    );

    // Count instances of the same course on this day
    const courseInstancesOnDay = eventsOnDay.filter(
      (e) => e.courseId === courseId,
    ).length;

    return {
      hasOverlap: !!overlapping,
      overlappingEvent: overlapping,
      courseCount: courseInstancesOnDay,
    };
  }, [currentTimetable, courseId, dayOfWeek, startTime, endTime]);

  // Check if end time is after start time
  const isValidTimeRange = useMemo(() => {
    if (!startTime || !endTime) return true;
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return end > start;
  }, [startTime, endTime]);

  const createMutation = api.timetable.createEvent.useMutation({
    onSuccess: () => {
      onSuccess();
      resetForm();
    },
  });

  const resetForm = () => {
    setCourseId("");
    setTitle("");
    setDayOfWeek(1);
    setStartTime("09:00");
    setEndTime("11:00");
    setLocation("");
  };

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate before submitting
    if (validation.hasOverlap) {
      return; // Don't submit if there's an overlap
    }

    if (validation.courseCount >= 3) {
      return; // Don't submit if already 3 instances
    }

    if (!isValidTimeRange) {
      return; // Don't submit if end time is before start time
    }

    createMutation.mutate({
      timetableId,
      courseId,
      title,
      dayOfWeek,
      startTime,
      endTime,
      location: location || undefined,
    });
  };

  const canSubmit =
    courseId &&
    title.trim() &&
    isValidTimeRange &&
    !validation.hasOverlap &&
    validation.courseCount < 3 &&
    !createMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Add Class
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {favoriteCourses.length === 0 ? (
          <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4 text-center">
            <Star className="mx-auto mb-2 h-8 w-8 text-yellow-600" />
            <p className="font-semibold text-yellow-900">No Favorite Courses</p>
            <p className="mt-1 text-sm text-yellow-700">
              You need to favorite courses before adding them to your timetable
            </p>
            <Button onClick={onClose} variant="outline" className="mt-4">
              Go to Courses
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 font-medium text-gray-900 transition-all hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-indigo-800"
              >
                <option value="">Select a course</option>
                {favoriteCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Only your favorited courses are shown
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Lecture, Tutorial, Lab"
                required
                maxLength={100}
              />
            </div>

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

            {validation.courseCount >= 3 && courseId && (
              <div className="flex items-start gap-2 rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                <div className="text-sm text-orange-700 dark:text-orange-300">
                  Maximum 3 classes per course per day. This course already has{" "}
                  {validation.courseCount} classes on this day.
                </div>
              </div>
            )}

            {courseId &&
              validation.courseCount > 0 &&
              validation.courseCount < 3 &&
              !validation.hasOverlap && (
                <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                  <Info className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    This course has {validation.courseCount} class
                    {validation.courseCount > 1 ? "es" : ""} on this day. You
                    can add {3 - validation.courseCount} more.
                  </div>
                </div>
              )}

            {createMutation.error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-300">
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
              <Button type="submit" className="flex-1" disabled={!canSubmit}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Class"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
