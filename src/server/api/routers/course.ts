import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { createNotification } from "~/lib/notifications";

/**
 * Course tRPC Router
 * Handles course CRUD operations with automatic resource card creation
 */
export const courseRouter = createTRPCRouter({
  /**
   * Create a new course
   * Automatically creates 4 predefined resource cards:
   * - Assignments (allows files)
   * - Tasks (no files)
   * - Content (allows files)
   * - Notes (no files - links to collaborative editor)
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required").max(100),
        description: z.string().max(500).optional(),
        color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Create course
      const course = await ctx.db.course.create({
        data: {
          title: input.title,
          description: input.description,
          color: input.color,
          createdBy: ctx.session.user.id,
          // Auto-create predefined resource cards
          resources: {
            create: [
              {
                title: "Assignments",
                type: "ASSIGNMENT",
                allowFiles: true,
              },
              {
                title: "Tasks",
                type: "TASK",
                allowFiles: false,
              },
              {
                title: "Content",
                type: "CONTENT",
                allowFiles: true,
              },
              {
                title: "Notes",
                type: "NOTES",
                allowFiles: false,
              },
            ],
          },
        },
        include: {
          resources: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      return course;
    }),

  /**
   * Get all courses for the current user
   * Includes both owned courses and courses shared with the user
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get owned courses
    const ownedCourses = await ctx.db.course.findMany({
      where: { createdBy: userId },
      include: {
        _count: {
          select: {
            resources: true,
            collaborators: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get shared courses (where user is a collaborator)
    const sharedCourses = await ctx.db.course.findMany({
      where: {
        collaborators: {
          some: {
            userId: userId,
            status: "ACCEPTED",
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        collaborators: {
          where: { userId: userId },
          select: {
            role: true,
          },
        },
        _count: {
          select: {
            resources: true,
            collaborators: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      owned: ownedCourses,
      shared: sharedCourses,
    };
  }),

  /**
   * Get a single course by ID
   * Only accessible to course owner or collaborators
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const course = await ctx.db.course.findUnique({
        where: { id: input.id },
        include: {
          resources: {
            orderBy: { createdAt: "asc" },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
          collaborators: {
            where: { status: "ACCEPTED" },
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
          _count: {
            select: {
              collaborators: true,
              resources: true,
            },
          },
          favorites: {
            where: { userId },
          },
        },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      // Check if user has access (owner or accepted collaborator)
      const isOwner = course.createdBy === userId;
      const isCollaborator = course.collaborators.some(
        (c) => c.userId === userId && c.status === "ACCEPTED",
      );

      if (!isOwner && !isCollaborator) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this course",
        });
      }

      // Get user's role
      let userRole: "OWNER" | "CONTRIBUTOR" | "VIEWER" = "OWNER";
      if (!isOwner) {
        const collaboration = course.collaborators.find(
          (c) => c.userId === userId,
        );
        userRole = collaboration?.role ?? "VIEWER";
      }

      return {
        ...course,
        userRole,
        isFavorite: course.favorites.length > 0,
      };
    }),

  /**
   * Update course details
   * Only accessible to course owner
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
        color: z
          .string()
          .regex(/^#[0-9A-F]{6}$/i)
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify ownership
      const course = await ctx.db.course.findUnique({
        where: { id: input.id },
        select: { createdBy: true },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      if (course.createdBy !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the course owner can update course details",
        });
      }

      // Update course
      const { id, ...updateData } = input;
      const updatedCourse = await ctx.db.course.update({
        where: { id },
        data: updateData,
      });

      return updatedCourse;
    }),

  /**
   * Delete a course
   * Only accessible to course owner
   * Cascades to delete all resources and collaborators
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify ownership
      const course = await ctx.db.course.findUnique({
        where: { id: input.id },
        select: { createdBy: true },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      if (course.createdBy !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the course owner can delete the course",
        });
      }

      // Delete course (cascade will handle resources and collaborators)
      await ctx.db.course.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Toggle favorite status for a course
   */
  toggleFavorite: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if already favorited
      const existing = await ctx.db.favorite.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: input.courseId,
          },
        },
      });

      if (existing) {
        // Remove favorite
        await ctx.db.favorite.delete({
          where: {
            userId_courseId: {
              userId,
              courseId: input.courseId,
            },
          },
        });
        return { favorited: false };
      } else {
        // Add favorite
        await ctx.db.favorite.create({
          data: {
            userId,
            courseId: input.courseId,
          },
        });
        return { favorited: true };
      }
    }),

  /**
   * Get all favorited courses
   */
  getFavorites: protectedProcedure.query(async ({ ctx }) => {
    const favorites = await ctx.db.favorite.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        course: {
          include: {
            _count: {
              select: {
                resources: true,
                collaborators: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return favorites.map((f) => f.course);
  }),

  /**
   * Get all user courses (owned + shared) as flat array with role
   * Used for dashboard stats and course listings
   */
  getUserCourses: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get owned courses
    const ownedCourses = await ctx.db.course.findMany({
      where: { createdBy: userId },
      include: {
        favorites: {
          where: { userId: userId },
        },
        _count: {
          select: {
            resources: true,
            collaborators: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get shared courses (where user is a collaborator)
    const sharedCourses = await ctx.db.course.findMany({
      where: {
        collaborators: {
          some: {
            userId: userId,
            status: "ACCEPTED",
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        collaborators: {
          where: { userId: userId },
          select: {
            role: true,
          },
        },
        favorites: {
          where: { userId: userId },
        },
        _count: {
          select: {
            resources: true,
            collaborators: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Combine and add role information + isFavorited flag
    const allCourses = [
      ...ownedCourses.map((course) => ({
        ...course,
        role: "OWNER" as const,
        isFavorited: course.favorites.length > 0,
      })),
      ...sharedCourses.map((course) => ({
        ...course,
        role: course.collaborators[0]?.role ?? ("VIEWER" as const),
        isFavorited: course.favorites.length > 0,
      })),
    ];

    return allCourses;
  }),

  /**
   * Invite user to collaborate on course (owner only)
   */
  inviteCollaborator: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
        userId: z.string(),
        role: z.enum(["VIEWER", "CONTRIBUTOR"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;

      // Check ownership
      const course = await ctx.db.course.findUnique({
        where: { id: input.courseId },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      if (course.createdBy !== currentUserId) {
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
      const existing = await ctx.db.courseCollaborator.findUnique({
        where: {
          courseId_userId: {
            courseId: input.courseId,
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
      const collaboration = await ctx.db.courseCollaborator.create({
        data: {
          courseId: input.courseId,
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
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      // Send notification to invited user
      await createNotification({
        userId: input.userId,
        type: "COURSE_INVITATION",
        title: "New course invitation",
        message: `${ctx.session.user.name} invited you to collaborate on ${collaboration.course.title}`,
        metadata: {
          courseId: collaboration.course.id,
          courseName: collaboration.course.title,
          invitedBy: ctx.session.user.id,
          inviterName: ctx.session.user.name ?? "Someone",
          role: input.role,
        },
      });

      return collaboration;
    }),

  /**
   * Accept course invitation
   */
  acceptInvitation: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const collaboration = await ctx.db.courseCollaborator.update({
        where: {
          courseId_userId: {
            courseId: input.courseId,
            userId: userId,
          },
          status: "PENDING",
        },
        data: {
          status: "ACCEPTED",
          joinedAt: new Date(),
        },
        include: {
          course: {
            include: {
              creator: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Notify course owner that invitation was accepted
      await createNotification({
        userId: collaboration.course.createdBy,
        type: "INVITATION_ACCEPTED",
        title: "Invitation accepted",
        message: `${ctx.session.user.name} accepted your invitation to ${collaboration.course.title}`,
        metadata: {
          resourceType: "course",
          resourceId: collaboration.course.id,
          resourceName: collaboration.course.title,
          acceptedBy: userId,
          acceptorName: ctx.session.user.name ?? "Someone",
        },
      });

      return collaboration;
    }),

  /**
   * Reject course invitation
   */
  rejectInvitation: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const collaboration = await ctx.db.courseCollaborator.update({
        where: {
          courseId_userId: {
            courseId: input.courseId,
            userId: userId,
          },
          status: "PENDING",
        },
        data: {
          status: "REJECTED",
        },
        include: {
          course: {
            include: {
              creator: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Notify course owner that invitation was rejected
      await createNotification({
        userId: collaboration.course.createdBy,
        type: "INVITATION_REJECTED",
        title: "Invitation declined",
        message: `${ctx.session.user.name} declined your invitation to ${collaboration.course.title}`,
        metadata: {
          resourceType: "course",
          resourceId: collaboration.course.id,
          resourceName: collaboration.course.title,
          rejectedBy: userId,
          rejectorName: ctx.session.user.name ?? "Someone",
        },
      });

      return { success: true };
    }),

  /**
   * Get pending invitations for current user
   */
  getPendingInvitations: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const invitations = await ctx.db.courseCollaborator.findMany({
      where: {
        userId: userId,
        status: "PENDING",
      },
      include: {
        course: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
      },
      orderBy: { invitedAt: "desc" },
    });

    return invitations;
  }),
});
