import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const notificationRouter = createTRPCRouter({
  /**
   * Get recent notifications for the current user (last 20)
   */
  getRecent: protectedProcedure.query(async ({ ctx }) => {
    const notifications = await ctx.db.notification.findMany({
      where: { userId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return notifications;
  }),

  /**
   * Get all notifications for the current user (paginated)
   */
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const notifications = await ctx.db.notification.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let nextCursor: string | undefined = undefined;
      if (notifications.length > input.limit) {
        const nextItem = notifications.pop();
        nextCursor = nextItem?.id;
      }

      return {
        notifications,
        nextCursor,
      };
    }),

  /**
   * Get unread notification count (for badge)
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.notification.count({
      where: {
        userId: ctx.session.user.id,
        read: false,
      },
    });

    return count;
  }),

  /**
   * Mark a single notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership before updating
      const notification = await ctx.db.notification.findFirst({
        where: {
          id: input.notificationId,
          userId: ctx.session.user.id,
        },
      });

      if (!notification) {
        throw new Error("Notification not found");
      }

      await ctx.db.notification.update({
        where: { id: input.notificationId },
        data: { read: true },
      });

      return { success: true };
    }),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.notification.updateMany({
      where: {
        userId: ctx.session.user.id,
        read: false,
      },
      data: { read: true },
    });

    return { success: true };
  }),

  /**
   * Get user's notification preferences
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    let preferences = await ctx.db.userNotificationPreferences.findUnique({
      where: { userId: ctx.session.user.id },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await ctx.db.userNotificationPreferences.create({
        data: { userId: ctx.session.user.id },
      });
    }

    return preferences;
  }),

  /**
   * Update user's notification preferences
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        inAppClassReminders: z.boolean().optional(),
        inAppCollaborationInvites: z.boolean().optional(),
        inAppAuditLogAlerts: z.boolean().optional(),
        inAppSystemNotifications: z.boolean().optional(),
        emailClassReminders: z.boolean().optional(),
        emailCollaborationInvites: z.boolean().optional(),
        emailAuditLogAlerts: z.boolean().optional(),
        emailSystemNotifications: z.boolean().optional(),
        classReminderMinutes: z.number().min(5).max(30).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const preferences = await ctx.db.userNotificationPreferences.upsert({
        where: { userId: ctx.session.user.id },
        create: {
          userId: ctx.session.user.id,
          ...input,
        },
        update: input,
      });

      return preferences;
    }),
});
