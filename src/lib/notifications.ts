import { db } from "~/server/db";
import { sendEmailNotification } from "./email";
import type { NotificationType } from "@prisma/client";

/**
 * Creates an in-app notification AND sends an email notification if user preferences allow.
 * This is the main function to use throughout the application when creating notifications.
 *
 * @param params - Notification parameters
 * @returns Promise<void>
 */
export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    // Get user with preferences
    const user = await db.user.findUnique({
      where: { id: params.userId },
      include: { notificationPreferences: true },
    });

    if (!user) {
      console.error(`User not found: ${params.userId}`);
      return;
    }

    // Create preferences if they don't exist (for new users)
    let preferences = user.notificationPreferences;
    if (!preferences) {
      preferences = await db.userNotificationPreferences.create({
        data: { userId: params.userId },
      });
    }

    // Determine if in-app notification should be created based on type and preferences
    const shouldCreateInApp = checkInAppPreference(params.type, preferences);

    // Create in-app notification if enabled
    if (shouldCreateInApp) {
      await db.notification.create({
        data: {
          userId: params.userId,
          type: params.type,
          title: params.title,
          message: params.message,
          metadata: params.metadata,
        },
      });
    }

    // Determine if email notification should be sent based on type and preferences
    const shouldSendEmail = checkEmailPreference(params.type, preferences);

    // Send email notification if enabled
    if (shouldSendEmail) {
      await sendEmailNotification({
        email: user.email,
        name: user.name ?? "User",
        type: params.type,
        title: params.title,
        message: params.message,
        metadata: params.metadata,
      });
    }
  } catch (error) {
    console.error("Error creating notification:", error);
    // Don't throw - notification failures shouldn't break the main operation
  }
}

/**
 * Check if in-app notification should be created based on user preferences
 */
function checkInAppPreference(
  type: NotificationType,
  preferences: any,
): boolean {
  switch (type) {
    case "CLASS_REMINDER":
      return preferences.inAppClassReminders;
    case "COURSE_INVITATION":
    case "TIMETABLE_INVITATION":
    case "INVITATION_ACCEPTED":
    case "INVITATION_REJECTED":
      return preferences.inAppCollaborationInvites;
    case "AUDIT_LOG_ALERT":
      return preferences.inAppAuditLogAlerts;
    case "SYSTEM_NOTIFICATION":
      return preferences.inAppSystemNotifications;
    case "GENERAL":
      return true; // Always create general notifications
    default:
      return true;
  }
}

/**
 * Check if email notification should be sent based on user preferences
 */
function checkEmailPreference(
  type: NotificationType,
  preferences: any,
): boolean {
  switch (type) {
    case "CLASS_REMINDER":
      return preferences.emailClassReminders;
    case "COURSE_INVITATION":
    case "TIMETABLE_INVITATION":
    case "INVITATION_ACCEPTED":
    case "INVITATION_REJECTED":
      return preferences.emailCollaborationInvites;
    case "AUDIT_LOG_ALERT":
      return preferences.emailAuditLogAlerts;
    case "SYSTEM_NOTIFICATION":
      return preferences.emailSystemNotifications;
    case "GENERAL":
      return false; // Don't send emails for general notifications
    default:
      return false;
  }
}

/**
 * Get user's class reminder timing preference (in minutes)
 */
export async function getUserReminderMinutes(userId: string): Promise<number> {
  const preferences = await db.userNotificationPreferences.findUnique({
    where: { userId },
  });

  return preferences?.classReminderMinutes ?? 10; // Default 10 minutes
}
