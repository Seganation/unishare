"use client";

import { useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import type { View } from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addDays,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Plus, Calendar as CalendarIcon, Share2, Settings } from "lucide-react";
import { CreateTimetableModal } from "~/components/timetable/create-timetable-modal";
import { CreateEventModal } from "~/components/timetable/create-event-modal";
import { ShareTimetableModal } from "~/components/timetable/share-timetable-modal";
import { Loader } from "~/components/ai-elements/loader";
import type { Event as PrismaEvent, Course } from "@prisma/client";

// Setup date-fns localizer for react-big-calendar
const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // Start week on Monday
  getDay,
  locales,
});

// Calendar event type
type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: PrismaEvent & { course: Course };
};

export default function TimetablePage() {
  const [view, setView] = useState<View>("week");
  const [date, setDate] = useState(new Date());
  const [selectedTimetableId, setSelectedTimetableId] = useState<string | null>(
    null,
  );
  const [showCreateTimetable, setShowCreateTimetable] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const {
    data: timetables,
    isLoading,
    refetch,
  } = api.timetable.getUserTimetables.useQuery();

  // Select first timetable by default
  const selectedTimetable = selectedTimetableId
    ? [...(timetables?.owned ?? []), ...(timetables?.shared ?? [])].find(
        (t) => t.id === selectedTimetableId,
      )
    : timetables?.owned?.[0];

  // Convert events to calendar format with recurring instances
  const calendarEvents: CalendarEvent[] = [];

  if (selectedTimetable?.events) {
    const today = new Date();
    const weeksToGenerate = 16; // Generate 16 weeks (1 semester)

    selectedTimetable.events.forEach((event) => {
      // Parse time
      const [startHour, startMinute] = event.startTime.split(":").map(Number);
      const [endHour, endMinute] = event.endTime.split(":").map(Number);

      // Generate instances for multiple weeks
      for (let week = -2; week < weeksToGenerate; week++) {
        // Calculate the date for this day of week in this week
        const currentDay = getDay(today);
        const targetDay = event.dayOfWeek;
        const daysUntilTarget = (targetDay - currentDay + 7) % 7;
        const baseDate = addDays(today, daysUntilTarget + week * 7);

        const start = setMinutes(setHours(baseDate, startHour!), startMinute!);
        const end = setMinutes(setHours(baseDate, endHour!), endMinute!);

        calendarEvents.push({
          id: `${event.id}-week${week}`,
          title: `${event.title}${event.location ? ` - ${event.location}` : ""}`,
          start,
          end,
          resource: event,
        });
      }
    });
  }

  // Check if user can edit
  const canEdit = selectedTimetable
    ? selectedTimetable.createdBy === selectedTimetable.creator.id ||
      selectedTimetable.collaborators.some(
        (c) => c.role === "CONTRIBUTOR" && c.status === "ACCEPTED",
      )
    : false;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader size={64} />
      </div>
    );
  }

  const allTimetables = [
    ...(timetables?.owned ?? []),
    ...(timetables?.shared ?? []),
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-primary relative overflow-hidden px-4 py-12">
        <div className="pattern-dots absolute inset-0 opacity-10" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="bg-primary-foreground/5 absolute -top-20 -right-20 h-64 w-64 rounded-full backdrop-blur-3xl" />
          <div className="bg-primary-foreground/5 absolute -bottom-20 -left-20 h-80 w-80 rounded-full backdrop-blur-3xl" />
        </div>

        <div className="relative container mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-yellow-300" />
                <span className="text-primary-foreground/70 text-sm font-semibold tracking-wider uppercase">
                  Schedule
                </span>
              </div>
              <h1 className="text-primary-foreground mb-3 text-4xl font-black drop-shadow-lg md:text-5xl">
                My Timetables
              </h1>
              <p className="text-primary-foreground/80 text-lg">
                Manage your class schedule and share with friends
              </p>
            </div>

            <Button
              size="lg"
              variant="secondary"
              onClick={() => setShowCreateTimetable(true)}
              className="group h-14 px-8 text-base font-bold shadow-2xl"
            >
              <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" />
              Create Timetable
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {allTimetables.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <CalendarIcon className="mb-4 h-16 w-16 text-gray-400 dark:text-gray-500" />
            <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
              No Timetables Yet
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Create your first timetable to start managing your class schedule
            </p>
            <Button onClick={() => setShowCreateTimetable(true)} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Timetable
            </Button>
          </div>
        ) : (
          <>
            {/* Course Colors Legend - Simple & Clean */}
            {selectedTimetable && selectedTimetable.events.length > 0 && (
              <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <h4 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Course Colors
                </h4>
                <div className="flex flex-wrap gap-3">
                  {Array.from(
                    new Set(selectedTimetable.events.map((e) => e.course.id)),
                  ).map((courseId) => {
                    const event = selectedTimetable.events.find(
                      (e) => e.course.id === courseId,
                    );
                    if (!event) return null;
                    return (
                      <div key={courseId} className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-sm"
                          style={{ backgroundColor: event.course.color }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {event.course.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Timetable Selector & Actions */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <select
                value={selectedTimetable?.id ?? ""}
                onChange={(e) => setSelectedTimetableId(e.target.value)}
                className="rounded-lg border-2 border-gray-300 bg-white px-4 py-2 font-semibold text-gray-900 shadow-sm transition-all hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-indigo-800"
              >
                {timetables?.owned && timetables.owned.length > 0 && (
                  <optgroup label="My Timetables">
                    {timetables.owned.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.events.length} classes)
                      </option>
                    ))}
                  </optgroup>
                )}
                {timetables?.shared && timetables.shared.length > 0 && (
                  <optgroup label="Shared with Me">
                    {timetables.shared.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} - by {t.creator.name} ({t.events.length}{" "}
                        classes)
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>

              <div className="flex gap-2">
                {canEdit && (
                  <Button
                    onClick={() => setShowCreateEvent(true)}
                    variant="default"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Class
                  </Button>
                )}
                {selectedTimetable?.createdBy ===
                  selectedTimetable?.creator.id && (
                  <Button
                    onClick={() => setShowShareModal(true)}
                    variant="outline"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                )}
              </div>
            </div>

            {/* Calendar */}
            <div className="rounded-xl border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-900">
              <BigCalendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 700 }}
                date={date}
                onNavigate={(newDate) => setDate(newDate)}
                view={view}
                onView={(newView) => setView(newView)}
                views={["week", "work_week", "day"]}
                defaultView="week"
                step={30}
                timeslots={2}
                min={new Date(2025, 0, 1, 7, 0)} // 7 AM
                max={new Date(2025, 0, 1, 22, 0)} // 10 PM
                eventPropGetter={(event) => ({
                  style: {
                    backgroundColor: event.resource.course.color,
                    borderColor: event.resource.course.color,
                    color: "white",
                    borderRadius: "6px",
                    border: "none",
                    padding: "4px 8px",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                  },
                })}
                formats={{
                  dayFormat: (date, culture, localizer) =>
                    localizer?.format(date, "EEE dd", culture) ?? "",
                  dayHeaderFormat: (date, culture, localizer) =>
                    localizer?.format(date, "EEEE MMM dd", culture) ?? "",
                }}
                messages={{
                  work_week: "Mon-Fri",
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <CreateTimetableModal
        open={showCreateTimetable}
        onClose={() => setShowCreateTimetable(false)}
        onSuccess={() => {
          void refetch();
          setShowCreateTimetable(false);
        }}
      />

      {selectedTimetable && (
        <>
          <CreateEventModal
            open={showCreateEvent}
            onClose={() => setShowCreateEvent(false)}
            timetableId={selectedTimetable.id}
            onSuccess={() => {
              void refetch();
              setShowCreateEvent(false);
            }}
          />

          <ShareTimetableModal
            open={showShareModal}
            onClose={() => setShowShareModal(false)}
            timetableId={selectedTimetable.id}
            timetableName={selectedTimetable.name}
          />
        </>
      )}
    </div>
  );
}
