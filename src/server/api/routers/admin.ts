import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { sendApprovalEmail, sendRejectionEmail } from "~/lib/email";
import { env } from "~/env";

/**
 * Admin-only middleware
 * Ensures only users with ADMIN role can access these procedures
 */
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only administrators can perform this action",
    });
  }
  return next();
});

export const adminRouter = createTRPCRouter({
  /**
   * Get all pending users awaiting approval
   * Admin only
   */
  getPendingUsers: adminProcedure.query(async ({ ctx }) => {
    const pendingUsers = await ctx.db.user.findMany({
      where: { role: "PENDING" },
      include: {
        university: true,
        faculty: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Remove passwords from response
    return pendingUsers.map(({ password: _, ...user }) => user);
  }),

  /**
   * Get all users with their details
   * Admin only
   */
  getAllUsers: adminProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany({
      include: {
        university: true,
        faculty: true,
        _count: {
          select: {
            courses: true,
            articles: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Remove passwords from response
    return users.map(({ password: _, ...user }) => user);
  }),

  /**
   * Approve a pending user
   * Admin only
   */
  approveUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get user details
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (user.role !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is not pending approval",
        });
      }

      // Update user role to APPROVED
      const updatedUser = await ctx.db.user.update({
        where: { id: input.userId },
        data: {
          role: "APPROVED",
          approvedAt: new Date(),
        },
      });

      // Send approval email
      try {
        const dashboardUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard`;
        await sendApprovalEmail(user.email, user.name, dashboardUrl);
      } catch (error) {
        console.error("Failed to send approval email:", error);
        // Don't throw error - user is already approved
      }

      return {
        success: true,
        message: `${user.name} has been approved successfully`,
      };
    }),

  /**
   * Reject a pending user
   * Admin only
   */
  rejectUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get user details
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (user.role !== "PENDING") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User is not pending approval",
        });
      }

      // Send rejection email before deleting
      try {
        await sendRejectionEmail(user.email, user.name, input.reason);
      } catch (error) {
        console.error("Failed to send rejection email:", error);
        // Continue with deletion even if email fails
      }

      // Delete the user
      await ctx.db.user.delete({
        where: { id: input.userId },
      });

      return {
        success: true,
        message: `Registration for ${user.name} has been rejected`,
      };
    }),

  /**
   * Get dashboard statistics
   * Admin only
   */
  getDashboardStats: adminProcedure.query(async ({ ctx }) => {
    const [
      totalUsers,
      pendingUsers,
      approvedUsers,
      adminUsers,
      totalCourses,
      totalArticles,
    ] = await Promise.all([
      ctx.db.user.count(),
      ctx.db.user.count({ where: { role: "PENDING" } }),
      ctx.db.user.count({ where: { role: "APPROVED" } }),
      ctx.db.user.count({ where: { role: "ADMIN" } }),
      ctx.db.course.count(),
      ctx.db.article.count(),
    ]);

    return {
      totalUsers,
      pendingUsers,
      approvedUsers,
      adminUsers,
      totalCourses,
      totalArticles,
    };
  }),
});
