import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Calculate estimated reading time based on word count
 * Average reading speed: 200 words per minute
 */
function calculateReadTime(content: unknown): number {
  const contentStr = JSON.stringify(content);
  const words = contentStr.split(/\s+/).length;
  return Math.ceil(words / 200);
}

/**
 * Article tRPC Router
 * Handles article CRUD operations with draft/publish/archive workflow
 */
export const articleRouter = createTRPCRouter({
  /**
   * Create a new article (starts as DRAFT)
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required").max(200),
        excerpt: z.string().max(500).optional(),
        coverImage: z.string().url().optional(),
        content: z.any().default({}),
        tags: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Generate unique slug
      const baseSlug = generateSlug(input.title);
      let slug = baseSlug;
      let counter = 1;

      // Ensure slug uniqueness
      while (
        await ctx.db.article.findUnique({
          where: { slug },
        })
      ) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Create or find tags
      const tagConnections = input.tags
        ? await Promise.all(
            input.tags.map(async (tagName) => {
              const tagSlug = generateSlug(tagName);
              // Find or create tag
              const tag = await ctx.db.tag.upsert({
                where: { slug: tagSlug },
                create: {
                  name: tagName,
                  slug: tagSlug,
                },
                update: {},
              });
              return { id: tag.id };
            })
          )
        : undefined;

      // Create article
      const article = await ctx.db.article.create({
        data: {
          title: input.title,
          slug,
          excerpt: input.excerpt,
          coverImage: input.coverImage,
          content: input.content,
          status: "DRAFT",
          readTime: calculateReadTime(input.content),
          authorId: ctx.session.user.id,
          tags: tagConnections
            ? {
                connect: tagConnections,
              }
            : undefined,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
          tags: true,
        },
      });

      return article;
    }),

  /**
   * Update an existing article
   * Only author can update their own articles
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        excerpt: z.string().max(500).optional(),
        coverImage: z.string().url().optional(),
        content: z.any().optional(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify ownership
      const article = await ctx.db.article.findUnique({
        where: { id: input.id },
        select: { authorId: true, slug: true },
      });

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      if (article.authorId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own articles",
        });
      }

      // Update slug if title changed
      let slug = article.slug;
      if (input.title) {
        const baseSlug = generateSlug(input.title);
        slug = baseSlug;
        let counter = 1;

        // Ensure slug uniqueness (excluding current article)
        while (
          await ctx.db.article.findFirst({
            where: {
              slug,
              id: { not: input.id },
            },
          })
        ) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
      }

      // Create or find tags if provided
      const tagConnections = input.tags
        ? await Promise.all(
            input.tags.map(async (tagName) => {
              const tagSlug = generateSlug(tagName);
              const tag = await ctx.db.tag.upsert({
                where: { slug: tagSlug },
                create: {
                  name: tagName,
                  slug: tagSlug,
                },
                update: {},
              });
              return { id: tag.id };
            })
          )
        : undefined;

      // Update article
      const { id, tags: _, ...updateData } = input;
      const updatedArticle = await ctx.db.article.update({
        where: { id },
        data: {
          ...updateData,
          slug: input.title ? slug : undefined,
          readTime: input.content
            ? calculateReadTime(input.content)
            : undefined,
          tags: tagConnections
            ? {
                set: [], // Clear existing tags
                connect: tagConnections,
              }
            : undefined,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
          tags: true,
        },
      });

      return updatedArticle;
    }),

  /**
   * Publish an article (DRAFT -> PUBLISHED)
   */
  publish: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify ownership
      const article = await ctx.db.article.findUnique({
        where: { id: input.id },
        select: { authorId: true, status: true },
      });

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      if (article.authorId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only publish your own articles",
        });
      }

      if (article.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft articles can be published",
        });
      }

      // Publish article
      const publishedArticle = await ctx.db.article.update({
        where: { id: input.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
          tags: true,
        },
      });

      return publishedArticle;
    }),

  /**
   * Archive an article
   */
  archive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify ownership
      const article = await ctx.db.article.findUnique({
        where: { id: input.id },
        select: { authorId: true },
      });

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      if (article.authorId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only archive your own articles",
        });
      }

      // Archive article
      const archivedArticle = await ctx.db.article.update({
        where: { id: input.id },
        data: {
          status: "ARCHIVED",
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
          tags: true,
        },
      });

      return archivedArticle;
    }),

  /**
   * Delete an article
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify ownership
      const article = await ctx.db.article.findUnique({
        where: { id: input.id },
        select: { authorId: true },
      });

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      if (article.authorId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own articles",
        });
      }

      // Delete article
      await ctx.db.article.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Get all published articles (public, paginated, filterable)
   */
  getAllPublished: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(12),
        tagSlug: z.string().optional(),
        search: z.string().optional(),
        featured: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      // Build where clause
      const where: {
        status: "PUBLISHED";
        featured?: boolean;
        tags?: { some: { slug: string } };
        OR?: Array<{
          title?: { contains: string; mode: "insensitive" };
          excerpt?: { contains: string; mode: "insensitive" };
        }>;
      } = {
        status: "PUBLISHED",
      };

      if (input.featured !== undefined) {
        where.featured = input.featured;
      }

      if (input.tagSlug) {
        where.tags = {
          some: {
            slug: input.tagSlug,
          },
        };
      }

      if (input.search) {
        where.OR = [
          {
            title: {
              contains: input.search,
              mode: "insensitive",
            },
          },
          {
            excerpt: {
              contains: input.search,
              mode: "insensitive",
            },
          },
        ];
      }

      // Get total count
      const total = await ctx.db.article.count({ where });

      // Get articles
      const articles = await ctx.db.article.findMany({
        where,
        skip,
        take: input.limit,
        orderBy: { publishedAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
          tags: true,
          _count: {
            select: {
              tags: true,
            },
          },
        },
      });

      return {
        articles,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.ceil(total / input.limit),
        },
      };
    }),

  /**
   * Get user's own articles (all statuses)
   */
  getMyArticles: protectedProcedure
    .input(
      z.object({
        status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const where: {
        authorId: string;
        status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
      } = {
        authorId: userId,
      };

      if (input.status) {
        where.status = input.status;
      }

      const articles = await ctx.db.article.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        include: {
          tags: true,
          _count: {
            select: {
              tags: true,
            },
          },
        },
      });

      return articles;
    }),

  /**
   * Get single article by slug
   * Public for PUBLISHED, owner-only for DRAFT/ARCHIVED
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const article = await ctx.db.article.findUnique({
        where: { slug: input.slug },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
          tags: true,
        },
      });

      if (!article) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Article not found",
        });
      }

      // Check access permissions
      const userId = ctx.session?.user?.id;
      const isAuthor = userId === article.authorId;

      if (article.status !== "PUBLISHED" && !isAuthor) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This article is not published",
        });
      }

      return {
        ...article,
        isAuthor,
      };
    }),

  /**
   * Increment article view count
   */
  incrementViews: publicProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const article = await ctx.db.article.findUnique({
        where: { slug: input.slug },
        select: { id: true, status: true },
      });

      if (!article || article.status !== "PUBLISHED") {
        return { success: false };
      }

      await ctx.db.article.update({
        where: { id: article.id },
        data: {
          views: {
            increment: 1,
          },
        },
      });

      return { success: true };
    }),

  /**
   * Get all tags with article counts
   */
  getAllTags: publicProcedure.query(async ({ ctx }) => {
    const tags = await ctx.db.tag.findMany({
      include: {
        _count: {
          select: {
            articles: {
              where: {
                status: "PUBLISHED",
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return tags.filter((tag) => tag._count.articles > 0);
  }),
});
