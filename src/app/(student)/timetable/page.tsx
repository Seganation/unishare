"use client";

import { useState, useEffect } from "react";
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
} from "date-fns";
import { enUS } from "date-fns/locale";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Plus,
  Calendar as CalendarIcon,
  Share2,
  Eye,
  AlertTriangle,
  Settings,
  Users,
  Star,
  Sparkles,
} from "lucide-react";
import { CreateTimetableModal } from "~/components/timetable/create-timetable-modal";
import { CreateEventModal } from "~/components/timetable/create-event-modal";
import { ShareTimetableModal } from "~/components/timetable/share-timetable-modal";
import { EventDetailsModal } from "~/components/timetable/event-details-modal";
import { InvitationsBanner } from "~/components/timetable/invitations-banner";
import { ManageCollaboratorsModal } from "~/components/timetable/manage-collaborators-modal";
import { TimetableSettingsModal } from "~/components/timetable/timetable-settings-modal";
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
      <span className="min-w-0 flex-1 truncate text-xs font-medium leading-tight">
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
  const [selectedTimetableId, setSelectedTimetableId] = useState<string | null>(null);
  const [showCreateTimetable, setShowCreateTimetable] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCollaboratorsModal, setShowCollaboratorsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<
    (PrismaEvent & { course: Course }) | null
  >(null);
  const [showEventDetails, setShowEventDetails] = useState(false);

  const {
    data: timetables,
    isLoading,
    refetch,
  } = api.timetable.getUserTimetables.useQuery();

  // Get default timetable ID from user preferences
  const { data: defaultTimetableId } = api.timetable.getDefaultTimetableId.useQuery();

  // Auto-select default timetable or first timetable
  useEffect(() => {
    if (!selectedTimetableId && timetables) {
      if (defaultTimetableId) {
        setSelectedTimetableId(defaultTimetableId);
      } else if (timetables.owned?.[0]) {
        setSelectedTimetableId(timetables.owned[0].id);
      } else if (timetables.shared?.[0]) {
        setSelectedTimetableId(timetables.shared[0].id);
      }
    }
  }, [timetables, selectedTimetableId, defaultTimetableId]);

  // Find selected timetable
  const allTimetables = [
    ...(timetables?.owned ?? []),
    ...(timetables?.shared ?? []),
  ];
  const selectedTimetable = allTimetables.find((t) => t.id === selectedTimetableId);

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

  const isOwner = selectedTimetable
    ? selectedTimetable.createdBy === selectedTimetable.creator.id
    : false;

  // Detect conflicts in the selected timetable
  const conflicts = selectedTimetable ? detectConflicts(selectedTimetable.events) : [];
  const hasConflicts = conflicts.length > 0;

  // Mutation for updating event when dragged
  const updateEventMutation = api.timetable.updateEvent.useMutation({
    onSuccess: () => {
      void refetch();
    },
    onError: (error) => {
      console.error("Failed to update event:", error);
      void refetch(); // Revert by refetching
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
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader size={64} />
          <p className="mt-4 text-lg font-semibold text-gray-600 dark:text-gray-400">
            Loading your timetables...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Main Content with Sidebar Layout */}
      <div className="container mx-auto max-w-7xl px-4 py-6">
        {/* Invitations Banner */}
        <InvitationsBanner />

        {allTimetables.length === 0 ? (
          /* Empty State */
          <div className="border-border bg-card mx-auto flex max-w-2xl flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 text-center shadow-lg">
            <div className="bg-primary/10 mb-6 flex h-24 w-24 items-center justify-center rounded-full">
              <CalendarIcon className="text-primary h-12 w-12" />
            </div>
            <h3 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
              No Timetables Yet
            </h3>
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
              Create your first timetable to start organizing your class schedule
            </p>
            <Button
              onClick={() => setShowCreateTimetable(true)}
              size="lg"
              className="bg-primary text-primary-foreground px-8 text-base font-bold shadow-lg hover:scale-105"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Timetable
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-card sticky top-6 space-y-4 rounded-xl border p-4 shadow-lg">
                {/* Header with Create Button */}
                <div className="flex items-center justify-between border-b pb-3">
                  <h2 className="flex items-center gap-2 text-lg font-bold">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    Timetables
                  </h2>
                  <Button
                    size="sm"
                    onClick={() => setShowCreateTimetable(true)}
                    className="h-8 w-8 p-0"
                    title="Create Timetable"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Timetable Navigation */}
                <div className="space-y-3">
                  {/* My Timetables */}
                  {timetables?.owned && timetables.owned.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        My Timetables
                      </p>
                      <div className="space-y-1">
                        {timetables.owned.map((timetable) => {
                          const isSelected = selectedTimetableId === timetable.id;
                          const isDefault = defaultTimetableId === timetable.id;
                          return (
                            <button
                              key={timetable.id}
                              onClick={() => setSelectedTimetableId(timetable.id)}
                              className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                isSelected
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "hover:bg-accent text-foreground"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="flex items-center gap-1.5 truncate">
                                  {isDefault && (
                                    <Star
                                      className={`h-3.5 w-3.5 flex-shrink-0 ${
                                        isSelected
                                          ? "fill-current text-current"
                                          : "fill-amber-500 text-amber-500"
                                      }`}
                                    />
                                  )}
                                  <span className="truncate">{timetable.name}</span>
                                </span>
                                <span
                                  className={`text-xs flex-shrink-0 ${
                                    isSelected ? "opacity-80" : "text-muted-foreground"
                                  }`}
                                >
                                  {timetable.events.length}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Shared with Me */}
                  {timetables?.shared && timetables.shared.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Shared with Me
                      </p>
                      <div className="space-y-1">
                        {timetables.shared.map((timetable) => {
                          const isSelected = selectedTimetableId === timetable.id;
                          const isDefault = defaultTimetableId === timetable.id;
                          return (
                            <button
                              key={timetable.id}
                              onClick={() => setSelectedTimetableId(timetable.id)}
                              className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                isSelected
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "hover:bg-accent text-foreground"
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="flex items-center gap-1.5 truncate">
                                    {isDefault && (
                                      <Star
                                        className={`h-3.5 w-3.5 flex-shrink-0 ${
                                          isSelected
                                            ? "fill-current text-current"
                                            : "fill-amber-500 text-amber-500"
                                        }`}
                                      />
                                    )}
                                    <span className="truncate">{timetable.name}</span>
                                  </span>
                                  <span
                                    className={`text-xs flex-shrink-0 ${
                                      isSelected ? "opacity-80" : "text-muted-foreground"
                                    }`}
                                  >
                                    {timetable.events.length}
                                  </span>
                                </div>
                                <p
                                  className={`text-xs truncate ${
                                    isSelected ? "opacity-70" : "text-muted-foreground"
                                  }`}
                                >
                                  by {timetable.creator.name}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Timetable Info */}
                {selectedTimetable && (
                  <>
                    <div className="border-t pt-3 space-y-3">
                      {/* Timetable Name and Badges */}
                      <div>
                        <h3 className="text-sm font-bold mb-2">Selected Timetable</h3>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-foreground break-words">
                            {selectedTimetable.name}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {defaultTimetableId === selectedTimetable.id && (
                              <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-2 py-0.5 text-xs font-semibold text-white">
                                <Sparkles className="h-3 w-3" />
                                Default
                              </div>
                            )}
                            {!isOwner && (
                              <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                <Eye className="h-3 w-3" />
                                {canEdit ? "Contributor" : "Viewer"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        {canEdit && (
                          <Button
                            onClick={() => setShowCreateEvent(true)}
                            size="sm"
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                          >
                            <Plus className="mr-1.5 h-4 w-4" />
                            Add Class
                          </Button>
                        )}
                        <Button
                          onClick={() => setShowCollaboratorsModal(true)}
                          size="sm"
                          variant="outline"
                          className="w-full"
                        >
                          <Users className="mr-1.5 h-4 w-4" />
                          Collaborators
                        </Button>
                        {isOwner && (
                          <Button
                            onClick={() => setShowShareModal(true)}
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            <Share2 className="mr-1.5 h-4 w-4" />
                            Share
                          </Button>
                        )}
                        <Button
                          onClick={() => setShowSettingsModal(true)}
                          size="sm"
                          variant="outline"
                          className="w-full"
                        >
                          <Settings className="mr-1.5 h-4 w-4" />
                          Settings
                        </Button>
                      </div>

                      {/* Conflict Warning - Compact */}
                      {hasConflicts && (
                        <div className="rounded-lg border-2 border-amber-500 bg-amber-50 p-3 dark:bg-amber-950/20">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-amber-900 dark:text-amber-100">
                                {conflicts.length} Conflict{conflicts.length > 1 ? "s" : ""}
                              </p>
                              <p className="text-xs text-amber-700 dark:text-amber-300">
                                Classes are overlapping
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Read-Only Access Info - Compact */}
                      {!canEdit && (
                        <div className="rounded-lg border-2 border-primary bg-primary/10 p-3">
                          <div className="flex items-start gap-2">
                            <Eye className="h-4 w-4 flex-shrink-0 text-primary" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground">
                                View-Only Access
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Contact owner for edit access
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Course Colors Legend - Compact */}
                      {selectedTimetable.events.length > 0 && (
                        <div>
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Course Colors
                          </h4>
                          <div className="space-y-1.5">
                            {Array.from(
                              new Set(selectedTimetable.events.map((e) => e.course.id)),
                            ).map((courseId) => {
                              const event = selectedTimetable.events.find(
                                (e) => e.course.id === courseId,
                              );
                              if (!event) return null;
                              return (
                                <div
                                  key={courseId}
                                  className="flex items-center gap-2"
                                >
                                  <div
                                    className="h-3 w-3 flex-shrink-0 rounded shadow-sm"
                                    style={{ backgroundColor: event.course.color }}
                                  />
                                  <span className="text-xs font-medium text-foreground truncate">
                                    {event.course.title}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </aside>

            {/* Main Calendar Area */}
            <main className="lg:col-span-3">
              {selectedTimetable && (
                <div className="border-border bg-card relative overflow-hidden rounded-xl border shadow-lg">
                  <DraggableCalendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "calc(100vh - 120px)", minHeight: 600 }}
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
                        borderRadius: "8px",
                        border: "none",
                        padding: "4px 6px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
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
                </div>
              )}
            </main>
          </div>
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

          <ManageCollaboratorsModal
            open={showCollaboratorsModal}
            onClose={() => setShowCollaboratorsModal(false)}
            timetableId={selectedTimetable.id}
            timetableName={selectedTimetable.name}
            isOwner={isOwner}
          />

          <TimetableSettingsModal
            open={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
            timetableId={selectedTimetable.id}
            timetableName={selectedTimetable.name}
            timetableDescription={selectedTimetable.description}
            isOwner={isOwner}
            isDefault={defaultTimetableId === selectedTimetable.id}
            onSuccess={() => {
              void refetch();
            }}
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
    </div>
  );
}
