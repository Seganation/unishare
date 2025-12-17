-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('COURSE_INVITATION', 'TIMETABLE_INVITATION', 'INVITATION_ACCEPTED', 'INVITATION_REJECTED', 'CLASS_REMINDER', 'AUDIT_LOG_ALERT', 'SYSTEM_NOTIFICATION', 'GENERAL');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNotificationPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "inAppClassReminders" BOOLEAN NOT NULL DEFAULT true,
    "inAppCollaborationInvites" BOOLEAN NOT NULL DEFAULT true,
    "inAppAuditLogAlerts" BOOLEAN NOT NULL DEFAULT true,
    "inAppSystemNotifications" BOOLEAN NOT NULL DEFAULT true,
    "emailClassReminders" BOOLEAN NOT NULL DEFAULT true,
    "emailCollaborationInvites" BOOLEAN NOT NULL DEFAULT true,
    "emailAuditLogAlerts" BOOLEAN NOT NULL DEFAULT true,
    "emailSystemNotifications" BOOLEAN NOT NULL DEFAULT true,
    "classReminderMinutes" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNotificationPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_read_createdAt_idx" ON "Notification"("userId", "read", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserNotificationPreferences_userId_key" ON "UserNotificationPreferences"("userId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotificationPreferences" ADD CONSTRAINT "UserNotificationPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
