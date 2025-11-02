import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

/**
 * Timetable tRPC Router
 * Handles timetable CRUD, sharing, and event management
 */
export const timetableRouter = createTRPCRouter({
  /**
   * Create a new timetable
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(100),
        description: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const timetable = await ctx.db.timetable.create({
        data: {
          name: input.name,
          description: input.description,
          createdBy: ctx.session.user.id,
        },
      });

      return timetable;
    }),

  /**
   * Get all timetables for current user (owned + shared)
   */
  getUserTimetables: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get owned timetables
    const ownedTimetables = await ctx.db.timetable.findMany({
      where: { createdBy: userId },
      include: {
        events: {
          include: {
            course: true,
          },
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get shared timetables (where user is collaborator with ACCEPTED status)
    const sharedTimetables = await ctx.db.timetable.findMany({
      where: {
        collaborators: {
          some: {
            userId: userId,
            status: "ACCEPTED",
          },
        },
      },
      include: {
        events: {
          include: {
            course: true,
          },
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      owned: ownedTimetables,
      shared: sharedTimetables,
    };
  }),

  /**
   * Get timetable by ID with permission check
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const timetable = await ctx.db.timetable.findUnique({
        where: { id: input.id },
        include: {
          events: {
            include: {
              course: true,
            },
            orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
          },
          collaborators: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true,
                },
              },
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
        },
      });

      if (!timetable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Timetable not found",
        });
      }

      // Check if user has access (owner or accepted collaborator)
      const isOwner = timetable.createdBy === userId;
      const collaboration = timetable.collaborators.find(
        (c) => c.userId === userId && c.status === "ACCEPTED",
      );

      if (!isOwner && !collaboration) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this timetable",
        });
      }

      return {
        ...timetable,
        userRole: isOwner ? "OWNER" : collaboration?.role,
      };
    }),

  /**
   * Update timetable (owner only)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check ownership
      const timetable = await ctx.db.timetable.findUnique({
        where: { id: input.id },
      });

      if (!timetable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Timetable not found",
        });
      }

      if (timetable.createdBy !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the owner can update this timetable",
        });
      }

      const updated = await ctx.db.timetable.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
        },
      });

      return updated;
    }),

  /**
   * Delete timetable (owner only)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check ownership
      const timetable = await ctx.db.timetable.findUnique({
        where: { id: input.id },
      });

      if (!timetable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Timetable not found",
        });
      }

      if (timetable.createdBy !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the owner can delete this timetable",
        });
      }

      await ctx.db.timetable.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Invite user to collaborate on timetable (owner only)
   */
  inviteCollaborator: protectedProcedure
    .input(
      z.object({
        timetableId: z.string(),
        userId: z.string(),
        role: z.enum(["VIEWER", "CONTRIBUTOR"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;

      // Check ownership
      const timetable = await ctx.db.timetable.findUnique({
        where: { id: input.timetableId },
      });

      if (!timetable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Timetable not found",
        });
      }

      if (timetable.createdBy !== currentUserId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the owner can invite collaborators",
        });
      }

      // Can't invite yourself
      if (input.userId === currentUserId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't invite yourself",
        });
      }

      // Check if already invited
      const existing = await ctx.db.timetableCollaborator.findUnique({
        where: {
          timetableId_userId: {
            timetableId: input.timetableId,
            userId: input.userId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already invited",
        });
      }

      // Create invitation
      const collaboration = await ctx.db.timetableCollaborator.create({
        data: {
          timetableId: input.timetableId,
          userId: input.userId,
          role: input.role,
          status: "PENDING",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
          timetable: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return collaboration;
    }),

  /**
   * Accept timetable invitation
   */
  acceptInvitation: protectedProcedure
    .input(z.object({ timetableId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const collaboration = await ctx.db.timetableCollaborator.update({
        where: {
          timetableId_userId: {
            timetableId: input.timetableId,
            userId: userId,
          },
          status: "PENDING",
        },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
        },
      });

      return collaboration;
    }),

  /**
   * Reject timetable invitation
   */
  rejectInvitation: protectedProcedure
    .input(z.object({ timetableId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await ctx.db.timetableCollaborator.update({
        where: {
          timetableId_userId: {
            timetableId: input.timetableId,
            userId: userId,
          },
          status: "PENDING",
        },
        data: {
          status: "REJECTED",
        },
      });

      return { success: true };
    }),

  /**
   * Get pending invitations for current user
   */
  getPendingInvitations: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const invitations = await ctx.db.timetableCollaborator.findMany({
      where: {
        userId: userId,
        status: "PENDING",
      },
      include: {
        timetable: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
            _count: {
              select: {
                events: true,
              },
            },
          },
        },
      },
      orderBy: { invitedAt: "desc" },
    });

    return invitations;
  }),

  /**
   * Search users for invitation (min 3 characters)
   */
  searchUsers: protectedProcedure
    .input(
      z.object({
        query: z.string().min(3, "Search query must be at least 3 characters"),
        timetableId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;

      // Get existing collaborators for this timetable
      const existingCollaborators = await ctx.db.timetableCollaborator.findMany({
        where: { timetableId: input.timetableId },
        select: { userId: true },
      });

      const existingUserIds = existingCollaborators.map((c) => c.userId);

      // Get timetable owner
      const timetable = await ctx.db.timetable.findUnique({
        where: { id: input.timetableId },
        select: { createdBy: true },
      });

      // Exclude owner and existing collaborators
      const excludeIds = [...existingUserIds, timetable?.createdBy ?? "", currentUserId];

      const users = await ctx.db.user.findMany({
        where: {
          AND: [
            {
              OR: [
                { email: { contains: input.query, mode: "insensitive" } },
                { name: { contains: input.query, mode: "insensitive" } },
              ],
            },
            { id: { notIn: excludeIds } },
            { role: "APPROVED" }, // Only search approved users
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
        take: 10,
      });

      return users;
    }),

  /**
   * Create event in timetable (owner/contributor only, course must be favorited)
   */
  createEvent: protectedProcedure
    .input(
      z.object({
        timetableId: z.string(),
        courseId: z.string(),
        title: z.string().min(1).max(100),
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
        endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
        location: z.string().max(100).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if timetable exists and user has access
      const timetable = await ctx.db.timetable.findUnique({
        where: { id: input.timetableId },
        include: {
          collaborators: {
            where: { userId: userId },
          },
        },
      });

      if (!timetable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Timetable not found",
        });
      }

      const isOwner = timetable.createdBy === userId;
      const collaboration = timetable.collaborators[0];
      const isContributor =
        collaboration?.role === "CONTRIBUTOR" && collaboration.status === "ACCEPTED";

      if (!isOwner && !isContributor) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to add events to this timetable",
        });
      }

      // Check if course is favorited by the user
      const favorite = await ctx.db.favorite.findUnique({
        where: {
          userId_courseId: {
            userId: userId,
            courseId: input.courseId,
          },
        },
      });

      if (!favorite) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can only add favorited courses to your timetable",
        });
      }

      // Create event
      const event = await ctx.db.event.create({
        data: {
          timetableId: input.timetableId,
          courseId: input.courseId,
          title: input.title,
          dayOfWeek: input.dayOfWeek,
          startTime: input.startTime,
          endTime: input.endTime,
          location: input.location,
          recurring: true,
          createdBy: userId,
        },
        include: {
          course: true,
        },
      });

      return event;
    }),

  /**
   * Update event (owner/contributor only)
   */
  updateEvent: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        title: z.string().min(1).max(100).optional(),
        dayOfWeek: z.number().min(0).max(6).optional(),
        startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        location: z.string().max(100).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get event with timetable
      const event = await ctx.db.event.findUnique({
        where: { id: input.eventId },
        include: {
          timetable: {
            include: {
              collaborators: {
                where: { userId: userId },
              },
            },
          },
        },
      });

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      const isOwner = event.timetable.createdBy === userId;
      const collaboration = event.timetable.collaborators[0];
      const isContributor =
        collaboration?.role === "CONTRIBUTOR" && collaboration.status === "ACCEPTED";

      if (!isOwner && !isContributor) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this event",
        });
      }

      const updated = await ctx.db.event.update({
        where: { id: input.eventId },
        data: {
          title: input.title,
          dayOfWeek: input.dayOfWeek,
          startTime: input.startTime,
          endTime: input.endTime,
          location: input.location,
        },
        include: {
          course: true,
        },
      });

      return updated;
    }),

  /**
   * Delete event (owner/contributor only)
   */
  deleteEvent: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get event with timetable
      const event = await ctx.db.event.findUnique({
        where: { id: input.eventId },
        include: {
          timetable: {
            include: {
              collaborators: {
                where: { userId: userId },
              },
            },
          },
        },
      });

      if (!event) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }

      const isOwner = event.timetable.createdBy === userId;
      const collaboration = event.timetable.collaborators[0];
      const isContributor =
        collaboration?.role === "CONTRIBUTOR" && collaboration.status === "ACCEPTED";

      if (!isOwner && !isContributor) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this event",
        });
      }

      await ctx.db.event.delete({
        where: { id: input.eventId },
      });

      return { success: true };
    }),
});
