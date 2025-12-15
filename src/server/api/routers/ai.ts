/**
 * AI Router - tRPC endpoints for AI operations
 *
 * Provides type-safe API endpoints for:
 * - Health checks
 * - Conversation management
 * - Note generation/improvement
 * - AI-generated content tracking
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  healthCheck,
  generateText,
  OllamaError,
  chat,
  generateQuiz,
  gradeQuizAttempt,
  generateStudyPlan,
} from "~/server/ai";
import { TRPCError } from "@trpc/server";

export const aiRouter = createTRPCRouter({
  /**
   * Health Check - Check if Ollama is running and model is available
   */
  healthCheck: protectedProcedure.query(async () => {
    const health = await healthCheck();
    return health;
  }),

  /**
   * Create a new AI conversation
   */
  createConversation: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        courseId: z.string().optional(),
        noteId: z.string().optional(),
        model: z.string().optional(),
        temperature: z.number().min(0).max(2).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const conversation = await ctx.db.aiConversation.create({
        data: {
          title: input.title ?? "New Conversation",
          userId: ctx.session.user.id,
          courseId: input.courseId,
          noteId: input.noteId,
          model: input.model ?? "qwen2.5:1.5b",
          temperature: input.temperature ?? 0.7,
        },
        include: {
          messages: true,
          course: {
            select: {
              id: true,
              title: true,
            },
          },
          note: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      return conversation;
    }),

  /**
   * Get all conversations for the current user
   */
  getConversations: protectedProcedure
    .input(
      z.object({
        courseId: z.string().optional(),
        noteId: z.string().optional(),
        limit: z.number().min(1).max(100).optional().default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = {
        userId: ctx.session.user.id,
        courseId: input.courseId,
        noteId: input.noteId,
      };

      const [conversations, total] = await Promise.all([
        ctx.db.aiConversation.findMany({
          where,
          select: {
            id: true,
            title: true,
            createdAt: true,
            updatedAt: true,
            model: true,
            temperature: true,
            userId: true,
            courseId: true,
            noteId: true,
            // Don't load messages - they're not needed for the sidebar
            // We already have updatedAt for sorting
            course: {
              select: {
                id: true,
                title: true,
              },
            },
            note: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: input.limit,
        }),
        ctx.db.aiConversation.count({ where }),
      ]);

      return {
        conversations,
        total,
        hasMore: conversations.length < total,
      };
    }),

  /**
   * Get a specific conversation with all messages
   */
  getConversation: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conversation = await ctx.db.aiConversation.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id, // Ensure user owns this conversation
        },
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
          course: {
            select: {
              id: true,
              title: true,
            },
          },
          note: {
            select: {
              id: true,
              title: true,
              content: true,
            },
          },
        },
      });

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      return conversation;
    }),

  /**
   * Delete a conversation
   */
  deleteConversation: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const conversation = await ctx.db.aiConversation.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      await ctx.db.aiConversation.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true };
    }),

  /**
   * Send a message in a conversation (non-streaming)
   * Note: For streaming, use the Next.js API route
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        content: z.string().min(1).max(10000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const conversation = await ctx.db.aiConversation.findFirst({
        where: {
          id: input.conversationId,
          userId: ctx.session.user.id,
        },
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
          note: {
            select: {
              title: true,
              content: true,
            },
          },
        },
      });

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      try {
        // Save user message
        const userMessage = await ctx.db.aiMessage.create({
          data: {
            conversationId: input.conversationId,
            role: "USER",
            content: input.content,
          },
        });

        // Build context from previous messages
        const messages = [
          ...conversation.messages.map((msg) => ({
            role: msg.role.toLowerCase() as "user" | "assistant" | "system",
            content: msg.content,
          })),
          {
            role: "user" as const,
            content: input.content,
          },
        ];

        // Add note context if available
        if (conversation.note) {
          messages.unshift({
            role: "system",
            content: `You are helping with a note titled "${conversation.note.title}". The current note content is available as context.`,
          });
        }

        // Generate AI response
        const response = await chat({
          messages,
          model: conversation.model,
          temperature: conversation.temperature,
        });

        // Save AI response
        const assistantMessage = await ctx.db.aiMessage.create({
          data: {
            conversationId: input.conversationId,
            role: "ASSISTANT",
            content: response.text,
            tokensUsed: response.tokensUsed,
          },
        });

        // Update conversation timestamp
        await ctx.db.aiConversation.update({
          where: {
            id: input.conversationId,
          },
          data: {
            updatedAt: new Date(),
          },
        });

        return {
          userMessage,
          assistantMessage,
        };
      } catch (error) {
        if (error instanceof OllamaError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
            cause: error,
          });
        }
        throw error;
      }
    }),

  /**
   * Generate note content using AI
   */
  generateNote: protectedProcedure
    .input(
      z.object({
        noteId: z.string(),
        prompt: z.string().min(1).max(5000),
        type: z.enum(["GENERATE", "IMPROVE", "SUMMARIZE", "EXPAND"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user has access to the note
      const note = await ctx.db.note.findFirst({
        where: {
          id: input.noteId,
        },
        include: {
          course: {
            include: {
              creator: {
                select: {
                  id: true,
                },
              },
              collaborators: {
                where: {
                  userId: ctx.session.user.id,
                  status: "ACCEPTED",
                },
              },
            },
          },
        },
      });

      if (!note) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Note not found",
        });
      }

      // Check if user has access (creator or contributor)
      const isCreator = note.course.createdBy === ctx.session.user.id;
      const isContributor = note.course.collaborators.some(
        (c) => c.userId === ctx.session.user.id && c.role === "CONTRIBUTOR",
      );

      if (!isCreator && !isContributor) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to edit this note",
        });
      }

      try {
        // Build system prompt based on type
        let systemPrompt =
          "You are a helpful teaching assistant that helps students with their course notes.";
        let fullPrompt = input.prompt;

        if (
          input.type === "IMPROVE" ||
          input.type === "SUMMARIZE" ||
          input.type === "EXPAND"
        ) {
          const currentContent = JSON.stringify(note.content);
          systemPrompt += ` The student has existing notes.`;
        }

        if (input.type === "IMPROVE") {
          fullPrompt = `Improve the following notes: ${input.prompt}. Make them clearer, more organized, and easier to understand.`;
        } else if (input.type === "SUMMARIZE") {
          fullPrompt = `Summarize the following notes concisely: ${input.prompt}`;
        } else if (input.type === "EXPAND") {
          fullPrompt = `Expand on the following topic with more details and examples: ${input.prompt}`;
        }

        // Generate content
        const result = await generateText({
          prompt: fullPrompt,
          systemPrompt,
        });

        // Save the generated content to database
        const aiGeneratedNote = await ctx.db.aiGeneratedNote.create({
          data: {
            noteId: input.noteId,
            userId: ctx.session.user.id,
            prompt: input.prompt,
            model: "qwen2.5:1.5b",
            tokensUsed: result.tokensUsed,
            contentBefore: note.content as never,
            contentAfter: { text: result.text }, // You'll need to convert this to BlockNote format
            type: input.type,
          },
        });

        return {
          generatedText: result.text,
          tokensUsed: result.tokensUsed,
          generationId: aiGeneratedNote.id,
        };
      } catch (error) {
        if (error instanceof OllamaError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
            cause: error,
          });
        }
        throw error;
      }
    }),

  /**
   * Get AI generation history for a note
   */
  getNoteGenerations: protectedProcedure
    .input(
      z.object({
        noteId: z.string(),
        limit: z.number().min(1).max(50).optional().default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const generations = await ctx.db.aiGeneratedNote.findMany({
        where: {
          noteId: input.noteId,
          userId: ctx.session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: input.limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
      });

      return generations;
    }),

  /**
   * Generate a quiz from course content
   */
  generateQuiz: protectedProcedure
    .input(
      z.object({
        courseId: z.string().optional(),
        noteId: z.string().optional(),
        topic: z.string().min(1),
        questionCount: z.number().min(1).max(50).optional().default(10),
        difficulty: z
          .enum(["easy", "medium", "hard"])
          .optional()
          .default("medium"),
        questionTypes: z
          .array(z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]))
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // If courseId or noteId provided, verify access
      let courseContext: string | undefined;
      let noteContent: string | undefined;

      if (input.courseId) {
        const course = await ctx.db.course.findFirst({
          where: {
            id: input.courseId,
          },
          include: {
            creator: {
              select: {
                id: true,
              },
            },
            collaborators: {
              where: {
                userId: ctx.session.user.id,
                status: "ACCEPTED",
              },
            },
          },
        });

        if (!course) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Course not found",
          });
        }

        const hasAccess =
          course.createdBy === ctx.session.user.id ||
          course.collaborators.length > 0;

        if (!hasAccess) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this course",
          });
        }

        courseContext = `${course.title}${course.description ? `: ${course.description}` : ""}`;
      }

      if (input.noteId) {
        const note = await ctx.db.note.findFirst({
          where: {
            id: input.noteId,
          },
          include: {
            course: {
              include: {
                creator: true,
                collaborators: {
                  where: {
                    userId: ctx.session.user.id,
                    status: "ACCEPTED",
                  },
                },
              },
            },
          },
        });

        if (!note) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Note not found",
          });
        }

        const hasAccess =
          note.course.createdBy === ctx.session.user.id ||
          note.course.collaborators.length > 0;

        if (!hasAccess) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this note",
          });
        }

        noteContent = JSON.stringify(note.content);
      }

      try {
        // Generate quiz using AI
        const result = await generateQuiz({
          topic: input.topic,
          courseContext,
          noteContent,
          questionCount: input.questionCount,
          difficulty: input.difficulty,
          questionTypes: input.questionTypes,
        });

        // Save quiz to database
        const quiz = await ctx.db.aiQuiz.create({
          data: {
            title: result.quiz.title,
            description: result.quiz.description,
            courseId: input.courseId,
            noteId: input.noteId,
            userId: ctx.session.user.id,
            prompt: input.topic,
            tokensUsed: result.tokensUsed,
            questions: {
              create: result.quiz.questions.map((q, index) => ({
                question: q.question,
                type: q.type,
                options: q.options ?? undefined,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                order: index,
              })),
            },
          },
          include: {
            questions: {
              orderBy: {
                order: "asc",
              },
            },
          },
        });

        return quiz;
      } catch (error) {
        if (error instanceof OllamaError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
            cause: error,
          });
        }
        throw error;
      }
    }),

  /**
   * Get user's quizzes
   */
  getQuizzes: protectedProcedure
    .input(
      z.object({
        courseId: z.string().optional(),
        noteId: z.string().optional(),
        limit: z.number().min(1).max(50).optional().default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const quizzes = await ctx.db.aiQuiz.findMany({
        where: {
          userId: ctx.session.user.id,
          courseId: input.courseId,
          noteId: input.noteId,
        },
        include: {
          questions: {
            orderBy: {
              order: "asc",
            },
          },
          attempts: {
            where: {
              userId: ctx.session.user.id,
            },
            orderBy: {
              startedAt: "desc",
            },
            take: 1,
          },
          course: {
            select: {
              id: true,
              title: true,
            },
          },
          note: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: input.limit,
      });

      return quizzes;
    }),

  /**
   * Get a specific quiz
   */
  getQuiz: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const quiz = await ctx.db.aiQuiz.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          questions: {
            orderBy: {
              order: "asc",
            },
          },
          attempts: {
            where: {
              userId: ctx.session.user.id,
            },
            include: {
              answers: true,
            },
            orderBy: {
              startedAt: "desc",
            },
          },
        },
      });

      if (!quiz) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quiz not found",
        });
      }

      return quiz;
    }),

  /**
   * Submit quiz attempt
   */
  submitQuizAttempt: protectedProcedure
    .input(
      z.object({
        quizId: z.string(),
        answers: z.array(
          z.object({
            questionId: z.string(),
            userAnswer: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify quiz ownership
      const quiz = await ctx.db.aiQuiz.findFirst({
        where: {
          id: input.quizId,
          userId: ctx.session.user.id,
        },
        include: {
          questions: true,
        },
      });

      if (!quiz) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quiz not found",
        });
      }

      // Grade the attempt
      const { score, results } = gradeQuizAttempt(
        quiz.questions.map((q) => ({
          type: q.type,
          correctAnswer: q.correctAnswer,
        })),
        input.answers,
      );

      // Save attempt
      const attempt = await ctx.db.aiQuizAttempt.create({
        data: {
          quizId: input.quizId,
          userId: ctx.session.user.id,
          score,
          completedAt: new Date(),
          answers: {
            create: results.map((result) => ({
              questionId: result.questionId,
              userAnswer:
                input.answers.find((a) => a.questionId === result.questionId)
                  ?.userAnswer ?? "",
              isCorrect: result.isCorrect,
            })),
          },
        },
        include: {
          answers: {
            include: {
              question: true,
            },
          },
        },
      });

      return attempt;
    }),

  /**
   * Delete a quiz
   */
  deleteQuiz: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const quiz = await ctx.db.aiQuiz.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!quiz) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quiz not found",
        });
      }

      await ctx.db.aiQuiz.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true };
    }),

  /**
   * Generate a study plan for a course
   */
  generateStudyPlan: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
        weekCount: z.number().min(1).max(16).optional().default(4),
        hoursPerWeek: z.number().min(1).max(40).optional().default(5),
        goal: z.string().optional(),
        deadline: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify course access
      const course = await ctx.db.course.findFirst({
        where: {
          id: input.courseId,
        },
        include: {
          creator: true,
          collaborators: {
            where: {
              userId: ctx.session.user.id,
              status: "ACCEPTED",
            },
          },
          notes: {
            select: {
              title: true,
            },
          },
        },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      const hasAccess =
        course.createdBy === ctx.session.user.id ||
        course.collaborators.length > 0;

      if (!hasAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this course",
        });
      }

      try {
        // Generate study plan using AI
        const result = await generateStudyPlan({
          courseName: course.title,
          courseDescription: course.description ?? undefined,
          topics: course.notes.map((n) => n.title),
          weekCount: input.weekCount,
          hoursPerWeek: input.hoursPerWeek,
          goal: input.goal,
          deadline: input.deadline,
        });

        // Save study plan to database
        const studyPlan = await ctx.db.aiStudyPlan.create({
          data: {
            title: result.studyPlan.title,
            description: result.studyPlan.description,
            courseId: input.courseId,
            userId: ctx.session.user.id,
            prompt: input.goal ?? "Study plan for course",
            tokensUsed: result.tokensUsed,
            startDate: input.deadline
              ? new Date(
                  input.deadline.getTime() -
                    input.weekCount * 7 * 24 * 60 * 60 * 1000,
                )
              : undefined,
            endDate: input.deadline,
            weeks: {
              create: result.studyPlan.weeks.map((week) => ({
                weekNumber: week.weekNumber,
                title: week.title,
                description: week.description,
                goals: week.goals,
                tasks: {
                  create: week.tasks.map((task, index) => ({
                    title: task.title,
                    description: task.description,
                    estimatedMinutes: task.estimatedMinutes,
                    order: index,
                  })),
                },
              })),
            },
          },
          include: {
            weeks: {
              include: {
                tasks: {
                  orderBy: {
                    order: "asc",
                  },
                },
              },
              orderBy: {
                weekNumber: "asc",
              },
            },
          },
        });

        return studyPlan;
      } catch (error) {
        if (error instanceof OllamaError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
            cause: error,
          });
        }
        throw error;
      }
    }),

  /**
   * Get study plans for a course
   */
  getStudyPlans: protectedProcedure
    .input(
      z.object({
        courseId: z.string().optional(),
        limit: z.number().min(1).max(50).optional().default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const studyPlans = await ctx.db.aiStudyPlan.findMany({
        where: {
          userId: ctx.session.user.id,
          courseId: input.courseId,
        },
        include: {
          weeks: {
            include: {
              tasks: {
                orderBy: {
                  order: "asc",
                },
              },
            },
            orderBy: {
              weekNumber: "asc",
            },
          },
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: input.limit,
      });

      return studyPlans;
    }),

  /**
   * Update study plan task completion
   */
  updateStudyPlanTask: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        isCompleted: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership through the study plan
      const task = await ctx.db.aiStudyPlanTask.findFirst({
        where: {
          id: input.taskId,
        },
        include: {
          week: {
            include: {
              studyPlan: true,
            },
          },
        },
      });

      if (!task || task.week.studyPlan.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      }

      const updatedTask = await ctx.db.aiStudyPlanTask.update({
        where: {
          id: input.taskId,
        },
        data: {
          isCompleted: input.isCompleted,
          completedAt: input.isCompleted ? new Date() : null,
        },
      });

      return updatedTask;
    }),

  /**
   * Delete a study plan
   */
  deleteStudyPlan: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const studyPlan = await ctx.db.aiStudyPlan.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (!studyPlan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Study plan not found",
        });
      }

      await ctx.db.aiStudyPlan.delete({
        where: {
          id: input.id,
        },
      });

      return { success: true };
    }),
});
