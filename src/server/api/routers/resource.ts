import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

/**
 * Resource tRPC Router
 * Handles resource card CRUD operations and file management
 */
export const resourceRouter = createTRPCRouter({
  /**
   * Create a custom resource card
   * Only course owner and contributors can create resources
   */
  create: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
        title: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        type: z.enum(["CUSTOM"]),
        allowFiles: z.boolean(),
        deadline: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get course and verify access
      const course = await ctx.db.course.findUnique({
        where: { id: input.courseId },
        include: {
          collaborators: {
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

      // Check permission: Owner or Contributor
      const isOwner = course.createdBy === userId;
      const collaboration = course.collaborators[0];
      const isContributor =
        collaboration?.role === "CONTRIBUTOR" &&
        collaboration?.status === "ACCEPTED";

      if (!isOwner && !isContributor) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only course owner and contributors can create resources",
        });
      }

      // Create resource
      const resource = await ctx.db.resource.create({
        data: {
          courseId: input.courseId,
          title: input.title,
          description: input.description,
          type: input.type,
          allowFiles: input.allowFiles,
          deadline: input.deadline,
        },
      });

      return resource;
    }),

  /**
   * Update a resource card
   * Only course owner and contributors can update resources
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
        deadline: z.date().optional().nullable(),
        fileUrls: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get resource with course info
      const resource = await ctx.db.resource.findUnique({
        where: { id: input.id },
        include: {
          course: {
            include: {
              collaborators: {
                where: { userId },
              },
            },
          },
        },
      });

      if (!resource) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resource not found",
        });
      }

      // Check permission: Owner or Contributor
      const isOwner = resource.course.createdBy === userId;
      const collaboration = resource.course.collaborators[0];
      const isContributor =
        collaboration?.role === "CONTRIBUTOR" &&
        collaboration?.status === "ACCEPTED";

      if (!isOwner && !isContributor) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only course owner and contributors can update resources",
        });
      }

      // Update resource
      const { id, ...updateData } = input;
      const updatedResource = await ctx.db.resource.update({
        where: { id },
        data: updateData,
      });

      return updatedResource;
    }),

  /**
   * Delete a resource card
   * Only course owner can delete resources (not contributors)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get resource with course info
      const resource = await ctx.db.resource.findUnique({
        where: { id: input.id },
        include: {
          course: {
            select: {
              createdBy: true,
            },
          },
        },
      });

      if (!resource) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resource not found",
        });
      }

      // Only course owner can delete
      if (resource.course.createdBy !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the course owner can delete resources",
        });
      }

      // Delete resource
      await ctx.db.resource.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Add a file URL to a resource
   * Files are uploaded via UploadThing, then URL is stored here
   */
  addFile: protectedProcedure
    .input(
      z.object({
        resourceId: z.string(),
        fileUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get resource with course info
      const resource = await ctx.db.resource.findUnique({
        where: { id: input.resourceId },
        include: {
          course: {
            include: {
              collaborators: {
                where: { userId },
              },
            },
          },
        },
      });

      if (!resource) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resource not found",
        });
      }

      // Check if resource allows files
      if (!resource.allowFiles) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This resource does not allow file uploads",
        });
      }

      // Check permission: Owner or Contributor
      const isOwner = resource.course.createdBy === userId;
      const collaboration = resource.course.collaborators[0];
      const isContributor =
        collaboration?.role === "CONTRIBUTOR" &&
        collaboration?.status === "ACCEPTED";

      if (!isOwner && !isContributor) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to add files to this resource",
        });
      }

      // Add file URL to array
      const updatedResource = await ctx.db.resource.update({
        where: { id: input.resourceId },
        data: {
          fileUrls: {
            push: input.fileUrl,
          },
        },
      });

      return updatedResource;
    }),

  /**
   * Remove a file URL from a resource
   */
  removeFile: protectedProcedure
    .input(
      z.object({
        resourceId: z.string(),
        fileUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Get resource with course info
      const resource = await ctx.db.resource.findUnique({
        where: { id: input.resourceId },
        include: {
          course: {
            include: {
              collaborators: {
                where: { userId },
              },
            },
          },
        },
      });

      if (!resource) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resource not found",
        });
      }

      // Check permission: Owner or Contributor
      const isOwner = resource.course.createdBy === userId;
      const collaboration = resource.course.collaborators[0];
      const isContributor =
        collaboration?.role === "CONTRIBUTOR" &&
        collaboration?.status === "ACCEPTED";

      if (!isOwner && !isContributor) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You don't have permission to remove files from this resource",
        });
      }

      // Remove file URL from array
      const updatedFileUrls = resource.fileUrls.filter(
        (url) => url !== input.fileUrl,
      );

      const updatedResource = await ctx.db.resource.update({
        where: { id: input.resourceId },
        data: {
          fileUrls: updatedFileUrls,
        },
      });

      return updatedResource;
    }),
});
