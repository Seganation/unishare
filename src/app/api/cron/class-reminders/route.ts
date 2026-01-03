import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { createNotification } from "~/lib/notifications";
import { env } from "~/env";

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current time
    const now = new Date();
    const currentDay = now.getDay(); // 0-6 (Sunday-Saturday)
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Find all events happening soon (within the next 5-30 minutes depending on user preferences)
    // We check for events in the next 30 minutes and filter based on user preferences
    const targetMinutesAhead = 30;
    const targetTime = new Date(now.getTime() + targetMinutesAhead * 60000);
    const targetHour = targetTime.getHours();
    const targetMinute = targetTime.getMinutes();

    // Find events starting in the target window
    const events = await db.event.findMany({
      where: {
        dayOfWeek: currentDay,
        deletedAt: null, // Exclude soft-deleted events
        recurring: true,
      },
      include: {
        timetable: {
          include: {
            creator: true,
            collaborators: {
              where: { status: "ACCEPTED" },
              include: { user: true },
            },
          },
        },
        course: true,
      },
    });

    // Filter events by time and send notifications
    const sentNotifications: string[] = [];

    for (const event of events) {
      // Parse event start time
      const [eventHour, eventMinute] = event.startTime.split(":").map(Number);

      // Calculate time until event starts (in minutes)
      const eventTimeInMinutes = (eventHour ?? 0) * 60 + (eventMinute ?? 0);
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      const minutesUntilEvent = eventTimeInMinutes - currentTimeInMinutes;

      // Skip if event is not within the next 30 minutes
      if (minutesUntilEvent < 0 || minutesUntilEvent > 30) continue;

      // Get all users who should be notified (owner + collaborators)
      const usersToNotify = [
        event.timetable.creator,
        ...event.timetable.collaborators.map((c) => c.user),
      ];

      for (const user of usersToNotify) {
        // Get user's reminder preference
        const preferences = await db.userNotificationPreferences.findUnique({
          where: { userId: user.id },
        });

        const reminderMinutes = preferences?.classReminderMinutes ?? 10;

        // Check if it's time to send the reminder for this user
        if (Math.abs(minutesUntilEvent - reminderMinutes) <= 1) {
          // Within 1 minute of target time
          // Check if we already sent this reminder today
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const existingReminder = await db.notification.findFirst({
            where: {
              userId: user.id,
              type: "CLASS_REMINDER",
              createdAt: { gte: today },
              metadata: {
                path: ["eventId"],
                equals: event.id,
              },
            },
          });

          // Skip if already sent today
          if (existingReminder) continue;

          // Send notification
          await createNotification({
            userId: user.id,
            type: "CLASS_REMINDER",
            title: `Class starting in ${reminderMinutes} minutes`,
            message: `${event.course?.title ?? "Your class"} at ${event.startTime}`,
            metadata: {
              eventId: event.id,
              timetableId: event.timetableId,
              courseId: event.courseId,
              courseName: event.course?.title ?? "Class",
              location: event.location ?? "No location",
              startTime: event.startTime,
              endTime: event.endTime,
              dayOfWeek: event.dayOfWeek,
            },
          });

          sentNotifications.push(
            `${user.name} - ${event.course?.title} at ${event.startTime}`,
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sentNotifications.length} reminder(s)`,
      reminders: sentNotifications,
    });
  } catch (error) {
    console.error("Error in class reminders cron:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
