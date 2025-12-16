import { hash } from "bcryptjs";
import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { sendWelcomeEmail } from "~/lib/email";

export const userRouter = createTRPCRouter({
  /**
   * Register a new user
   * Public procedure - no authentication required
   */
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z
          .string()
          .min(8, "Password must be at least 8 characters")
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must contain at least one uppercase letter, one lowercase letter, and one number",
          ),
        universityId: z.string().min(1, "University is required"),
        facultyId: z.string().min(1, "Faculty is required"),
        studentIdUrl: z.string().url("Invalid student ID URL"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already exists
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Hash password
      const hashedPassword = await hash(input.password, 12);

      // Create user with PENDING role by default
      const user = await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          universityId: input.universityId,
          facultyId: input.facultyId,
          studentIdUrl: input.studentIdUrl,
          role: "PENDING", // Default role
        },
        include: {
          university: true,
          faculty: true,
        },
      });

      // Send welcome email
      try {
        await sendWelcomeEmail(user.email, user.name);
      } catch (error) {
        console.error("Failed to send welcome email:", error);
        // Don't throw error - user is already created
      }

      return {
        success: true,
        message:
          "Registration successful! Please wait for admin approval. You'll receive an email once approved.",
        userId: user.id,
      };
    }),

  /**
   * Get all universities with their faculties
   * Public procedure - needed for registration form
   */
  getUniversities: publicProcedure.query(async ({ ctx }) => {
    const universities = await ctx.db.university.findMany({
      include: {
        faculties: {
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return universities;
  }),

  /**
   * Get current user profile
   * Protected procedure - requires authentication
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      include: {
        university: true,
        faculty: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Don't return password
    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }),

  /**
   * Update user profile
   * Protected procedure - requires authentication
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).optional(),
        avatarIndex: z.number().min(0).max(7).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name: input.name,
          avatarIndex: input.avatarIndex,
        },
      });

      return { success: true, user };
    }),

  /**
   * Get current session
   * Public procedure - returns null if not authenticated
   */
  getCurrentSession: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session) {
      return null;
    }

    return {
      user: ctx.session.user,
    };
  }),
});
