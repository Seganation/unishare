"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { X, Loader2, Star } from "lucide-react";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Add Class</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
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
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 font-medium transition-all hover:border-indigo-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
              <label className="mb-2 block text-sm font-semibold text-gray-700">
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
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Day of Week <span className="text-red-500">*</span>
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                required
                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 font-medium transition-all hover:border-indigo-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
                <label className="mb-2 block text-sm font-semibold text-gray-700">
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
                <label className="mb-2 block text-sm font-semibold text-gray-700">
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
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Location (Optional)
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Room A101, Lab C201"
                maxLength={100}
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
                disabled={createMutation.isPending || !courseId || !title.trim()}
              >
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
