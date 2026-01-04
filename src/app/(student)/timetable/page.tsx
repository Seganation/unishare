"use client";

import { useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
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
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Plus,
  Calendar as CalendarIcon,
  Share2,
  Eye,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { CreateTimetableModal } from "~/components/timetable/create-timetable-modal";
import { CreateEventModal } from "~/components/timetable/create-event-modal";
import { ShareTimetableModal } from "~/components/timetable/share-timetable-modal";
import { EventDetailsModal } from "~/components/timetable/event-details-modal";
import { Loader } from "~/components/ai-elements/loader";
import type { Event as PrismaEvent, Course } from "@prisma/client";

// Calendar event type
type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: PrismaEvent & { course: Course };
};

// Create draggable calendar with proper typing
const DraggableCalendar = withDragAndDrop<CalendarEvent, object>(BigCalendar);

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

// Helper function to detect conflicts in a timetable
function detectConflicts(events: (PrismaEvent & { course: Course })[]): Array<{
  event1: PrismaEvent & { course: Course };
  event2: PrismaEvent & { course: Course };
}> {
  const conflicts: Array<{
    event1: PrismaEvent & { course: Course };
    event2: PrismaEvent & { course: Course };
  }> = [];

  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const event1 = events[i]!;
      const event2 = events[j]!;

      if (
        event1.dayOfWeek === event2.dayOfWeek &&
        timesOverlap(
          event1.startTime,
          event1.endTime,
          event2.startTime,
          event2.endTime,
        )
      ) {
        conflicts.push({ event1, event2 });
      }
    }
  }

  return conflicts;
}

// Custom Event Component with View Icon
function CustomEvent({
  event,
  onViewClick,
}: {
  event: CalendarEvent;
  onViewClick: (event: CalendarEvent) => void;
}) {
  return (
    <div className="flex h-full w-full items-center justify-between gap-1 overflow-hidden">
      <span className="min-w-0 flex-1 truncate text-xs leading-tight font-medium">
        {event.title}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewClick(event);
        }}
        className="flex-shrink-0 rounded p-0.5 transition-colors hover:bg-white/30"
        title="View details"
      >
        <Eye className="h-3 w-3" />
      </button>
    </div>
  );
}

export default function TimetablePage() {
  const [view, setView] = useState<View>("week");
  const [date, setDate] = useState(new Date());
  const [selectedTimetableId, setSelectedTimetableId] = useState<string | null>(
    null,
  );
  const [showCreateTimetable, setShowCreateTimetable] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<
    (PrismaEvent & { course: Course }) | null
  >(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<
    (PrismaEvent & { course: Course }) | null
  >(null);

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

  // Detect conflicts in the selected timetable
  const conflicts = selectedTimetable
    ? detectConflicts(selectedTimetable.events)
    : [];
  const hasConflicts = conflicts.length > 0;

  // Mutation for updating event when dragged
  const updateEventMutation = api.timetable.updateEvent.useMutation({
    onSuccess: () => {
      void refetch();
    },
    onError: (error) => {
      // Show error toast or revert
      console.error("Failed to update event:", error);
      void refetch(); // Revert by refetching
    },
  });

  // Mutation for deleting event
  const deleteEventMutation = api.timetable.deleteEvent.useMutation({
    onSuccess: () => {
      void refetch();
      setShowDeleteDialog(false);
      setEventToDelete(null);
    },
  });

  // Handle event drop (dragging to new time/day)
  const handleEventDrop = ({
    event,
    start,
    end,
  }: {
    event: CalendarEvent;
    start: Date;
    end: Date;
  }) => {
    setIsDragging(false);
    setDraggedEventId(null);

    if (!canEdit) return;

    const newDayOfWeek = getDay(start);
    const newStartTime = format(start, "HH:mm");
    const newEndTime = format(end, "HH:mm");

    // Check for overlaps with other events on the new day
    const eventsOnNewDay = selectedTimetable?.events.filter(
      (e) => e.dayOfWeek === newDayOfWeek && e.id !== event.resource.id,
    );

    const hasOverlap = eventsOnNewDay?.some((e) =>
      timesOverlap(newStartTime, newEndTime, e.startTime, e.endTime),
    );

    if (hasOverlap) {
      alert("Cannot move event: Time conflict with another class");
      return;
    }

    // Validate time range
    if (start >= end) {
      alert("Invalid time range");
      return;
    }

    // Update the event
    updateEventMutation.mutate({
      eventId: event.resource.id,
      dayOfWeek: newDayOfWeek,
      startTime: newStartTime,
      endTime: newEndTime,
    });
  };

  // Handle event resize (changing duration)
  const handleEventResize = ({
    event,
    start,
    end,
  }: {
    event: CalendarEvent;
    start: Date;
    end: Date;
  }) => {
    setIsDragging(false);
    setDraggedEventId(null);

    if (!canEdit) return;

    const newStartTime = format(start, "HH:mm");
    const newEndTime = format(end, "HH:mm");
    const dayOfWeek = event.resource.dayOfWeek;

    // Check for overlaps
    const eventsOnDay = selectedTimetable?.events.filter(
      (e) => e.dayOfWeek === dayOfWeek && e.id !== event.resource.id,
    );

    const hasOverlap = eventsOnDay?.some((e) =>
      timesOverlap(newStartTime, newEndTime, e.startTime, e.endTime),
    );

    if (hasOverlap) {
      alert("Cannot resize event: Time conflict with another class");
      return;
    }

    // Validate time range
    if (start >= end) {
      alert("Invalid time range");
      return;
    }

    // Update the event
    updateEventMutation.mutate({
      eventId: event.resource.id,
      startTime: newStartTime,
      endTime: newEndTime,
    });
  };

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

            {/* Conflict Warning */}
            {hasConflicts && (
              <div className="mb-6 rounded-lg border-2 border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                      Schedule Conflicts Detected
                    </h4>
                    <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                      {conflicts.length} time conflict
                      {conflicts.length > 1 ? "s" : ""} found. The following
                      classes overlap:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-amber-800 dark:text-amber-200">
                      {conflicts.slice(0, 3).map((conflict, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="font-medium">
                            {conflict.event1.course.title} (
                            {conflict.event1.startTime} -{" "}
                            {conflict.event1.endTime})
                          </span>
                          <span>↔</span>
                          <span className="font-medium">
                            {conflict.event2.course.title} (
                            {conflict.event2.startTime} -{" "}
                            {conflict.event2.endTime})
                          </span>
                        </li>
                      ))}
                      {conflicts.length > 3 && (
                        <li className="text-xs italic">
                          ... and {conflicts.length - 3} more conflict
                          {conflicts.length - 3 > 1 ? "s" : ""}
                        </li>
                      )}
                    </ul>
                  </div>
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
            <div className="relative rounded-xl border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-900">
              <DraggableCalendar
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
                // Drag and Drop handlers
                onEventDrop={handleEventDrop as any}
                onEventResize={handleEventResize as any}
                onDragStart={(args: any) => {
                  if (canEdit && args.event) {
                    setIsDragging(true);
                    setDraggedEventId(args.event.resource.id);
                  }
                }}
                resizable={canEdit}
                draggableAccessor={() => canEdit}
                // Custom event component with view icon
                components={{
                  event: (props) => (
                    <CustomEvent
                      event={props.event}
                      onViewClick={(event) => {
                        setSelectedEvent(event.resource);
                        setShowEventDetails(true);
                      }}
                    />
                  ),
                }}
                eventPropGetter={(event) => ({
                  style: {
                    backgroundColor: event.resource.course.color,
                    borderColor: event.resource.course.color,
                    color: "white",
                    borderRadius: "6px",
                    border: "none",
                    padding: "4px 6px",
                    fontSize: "0.75rem",
                    fontWeight: "500",
                    cursor: canEdit ? "move" : "default",
                    transition: "all 0.2s",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
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

              {/* Drag-to-Delete Trash Zone - Inside Calendar */}
              {/* {isDragging && canEdit && (
                <div
                  className="animate-in fade-in zoom-in-50 absolute right-4 bottom-4 z-50 duration-200"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.add("scale-110");
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove("scale-110");
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove("scale-110");

                    if (draggedEventId) {
                      const event = selectedTimetable?.events.find(
                        (evt) => evt.id === draggedEventId,
                      );
                      if (event) {
                        setEventToDelete(event);
                        setShowDeleteDialog(true);
                      }
                    }

                    setIsDragging(false);
                    setDraggedEventId(null);
                  }}
                >
                  <div className="flex h-20 w-20 flex-col items-center justify-center rounded-xl border-4 border-dashed border-red-400 bg-red-50 shadow-2xl transition-all hover:border-red-500 hover:bg-red-100 dark:border-red-600 dark:bg-red-900/40 dark:hover:border-red-500 dark:hover:bg-red-900/60">
                    <Trash2 className="h-8 w-8 text-red-500 dark:text-red-400" />
                    <span className="mt-1 text-[10px] font-bold text-red-600 dark:text-red-400">
                      Delete
                    </span>
                  </div>
                </div>
              )} */}
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

          <EventDetailsModal
            open={showEventDetails}
            onClose={() => {
              setShowEventDetails(false);
              setSelectedEvent(null);
            }}
            event={selectedEvent}
            canEdit={canEdit}
            onSuccess={() => {
              void refetch();
            }}
            allEvents={selectedTimetable.events}
          />
        </>
      )}

      {/* Delete Confirmation Dialog (from drag-to-trash) */}
      {showDeleteDialog && eventToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Delete Class?
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete this class?
                </p>
                <div className="mt-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded"
                      style={{ backgroundColor: eventToDelete.course.color }}
                    />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {eventToDelete.course.title}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {eventToDelete.title} • {eventToDelete.startTime} -{" "}
                    {eventToDelete.endTime}
                  </p>
                </div>
                <p className="mt-3 text-xs text-red-600 dark:text-red-400">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setEventToDelete(null);
                }}
                className="flex-1"
                disabled={deleteEventMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (eventToDelete) {
                    deleteEventMutation.mutate({ eventId: eventToDelete.id });
                  }
                }}
                className="flex-1"
                disabled={deleteEventMutation.isPending}
              >
                {deleteEventMutation.isPending ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
