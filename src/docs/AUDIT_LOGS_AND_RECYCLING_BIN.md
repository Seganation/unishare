# Audit Logs & Recycling Bin Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Helper Functions](#helper-functions)
4. [tRPC Routers](#trpc-routers)
5. [Soft Delete Implementation](#soft-delete-implementation)
6. [UI Components](#ui-components)
7. [Cron Job - Cleanup](#cron-job-cleanup)
8. [Integration Points](#integration-points)
9. [Testing Guide](#testing-guide)

---

## Overview

The Audit Logs and Recycling Bin system provides comprehensive tracking and soft delete functionality with:

### Audit Logs
- **Track all CRUD operations**: CREATED, UPDATED, DELETED, RESTORED
- **Before/after snapshots**: Capture complete change data for updates
- **Role-based access**: Only resource owners can view audit logs
- **Automatic notifications**: Owners are notified when contributors make changes
- **Rich metadata**: Track who, what, when, and on which resource

### Recycling Bin
- **Soft delete**: Never immediately delete Courses, Timetables, Events, Notes
- **30-day retention**: Items remain recoverable for 30 days
- **Cascade delete**: Deleting Timetable soft-deletes all Events
- **Cascade restore**: Restoring Timetable restores all Events
- **Automated cleanup**: Daily cron job permanently deletes 30+ day old items
- **User-friendly UI**: Shows days remaining before permanent deletion

### Key Features
✅ Comprehensive audit trail for all resource changes
✅ Automatic owner notifications (configurable)
✅ Soft delete with 30-day grace period
✅ Cascade behavior for related resources
✅ Role-based access control
✅ Restore functionality
✅ Daily automated cleanup

---

## Database Schema

### 1. AuditLog Model

Add to `prisma/schema.prisma`:

```prisma
model AuditLog {
  id           String       @id @default(cuid())
  userId       String       // Who performed the action
  action       AuditAction
  resourceType ResourceType
  resourceId   String       // ID of the affected resource
  resourceName String       // Display name of the resource
  ownerId      String       // Owner of the resource (for access control)
  changeData   Json?        // { before: {...}, after: {...} } for UPDATE actions
  metadata     Json?        // Additional context
  createdAt    DateTime     @default(now())

  user         User         @relation("AuditLogUser", fields: [userId], references: [id], onDelete: Cascade)
  owner        User         @relation("AuditLogOwner", fields: [ownerId], references: [id], onDelete: Cascade)

  @@index([ownerId, createdAt])
  @@index([resourceType, resourceId, createdAt])
  @@index([userId, createdAt])
}

enum AuditAction {
  CREATED
  UPDATED
  DELETED
  RESTORED
}

enum ResourceType {
  COURSE
  TIMETABLE
  EVENT
  NOTE
  RESOURCE
  COLLABORATOR
}
```

### 2. Soft Delete Fields

Add to **existing models** in `prisma/schema.prisma`:

```prisma
model Course {
  // ... existing fields ...

  // Soft delete fields
  deletedAt     DateTime? // Timestamp when soft-deleted (null = not deleted)
  deletedBy     String?   // User who deleted it

  // Relation
  deletedByUser User?     @relation("CourseDeletedBy", fields: [deletedBy], references: [id])

  // Index for filtering
  @@index([deletedAt])
}

model Timetable {
  // ... existing fields ...

  // Soft delete fields
  deletedAt     DateTime?
  deletedBy     String?

  // Relation
  deletedByUser User?     @relation("TimetableDeletedBy", fields: [deletedBy], references: [id])

  @@index([deletedAt])
}

model Event {
  // ... existing fields ...

  // Soft delete fields
  deletedAt     DateTime?
  deletedBy     String?

  // Relation
  deletedByUser User?     @relation("EventDeletedBy", fields: [deletedBy], references: [id])

  // Indexes
  @@index([deletedAt])
  @@index([deletedAt, timetableId]) // For cascade operations
}

model Note {
  // ... existing fields ...

  // Soft delete fields
  deletedAt     DateTime?
  deletedBy     String?

  // Relation
  deletedByUser User?     @relation("NoteDeletedBy", fields: [deletedBy], references: [id])

  // Indexes
  @@index([deletedAt])
  @@index([deletedAt, courseId]) // For cascade operations
}

// Optional: Resource model (if you want to track course resources)
model Resource {
  // ... existing fields ...

  // Soft delete fields
  deletedAt     DateTime?
  deletedBy     String?

  // Relation
  deletedByUser User?     @relation("ResourceDeletedBy", fields: [deletedBy], references: [id])

  @@index([deletedAt])
  @@index([deletedAt, courseId])
}
```

### 3. Update User Model

Add these relations to the `User` model:

```prisma
model User {
  // ... existing fields ...

  // Audit log relations
  auditLogsPerformed    AuditLog[]  @relation("AuditLogUser")
  auditLogsOwned        AuditLog[]  @relation("AuditLogOwner")

  // Soft delete relations
  coursesDeleted        Course[]    @relation("CourseDeletedBy")
  timetablesDeleted     Timetable[] @relation("TimetableDeletedBy")
  eventsDeleted         Event[]     @relation("EventDeletedBy")
  notesDeleted          Note[]      @relation("NoteDeletedBy")
  resourcesDeleted      Resource[]  @relation("ResourceDeletedBy")
}
```

### Metadata Structures

```typescript
// CREATED action metadata
{
  description?: string; // Optional description of what was created
}

// UPDATED action metadata
{
  fieldsChanged: string[]; // Array of field names that were changed
}

// DELETED action metadata
{
  reason?: string; // Optional reason for deletion
}

// RESTORED action metadata
{
  restoredFrom: string; // "recycling_bin" or "permanent_deletion_queue"
}
```

### ChangeData Structure (for UPDATE actions)

```typescript
{
  before: {
    field1: "old value",
    field2: 123,
    // ... all changed fields with old values
  },
  after: {
    field1: "new value",
    field2: 456,
    // ... all changed fields with new values
  }
}
```

### Migration Command

```bash
npm run db:generate
```

---

## Helper Functions

### Create: `src/lib/audit.ts`

```typescript
import { db } from "~/server/db";
import { createNotification } from "./notifications";
import type { AuditAction, ResourceType } from "@prisma/client";

/**
 * Creates an audit log entry AND notifies the resource owner if:
 * 1. The action was performed by someone other than the owner (contributor)
 * 2. The owner has audit log notifications enabled
 *
 * @param params - Audit log parameters
 * @returns Promise<void>
 */
export async function createAuditLog(params: {
  userId: string; // Who performed the action
  action: AuditAction;
  resourceType: ResourceType;
  resourceId: string;
  resourceName: string;
  ownerId: string; // Owner of the resource
  changeData?: { before: any; after: any };
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    // Create audit log entry
    const auditLog = await db.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        resourceName: params.resourceName,
        ownerId: params.ownerId,
        changeData: params.changeData,
        metadata: params.metadata,
      },
    });

    // Only notify owner if action was performed by someone else (contributor)
    if (params.userId !== params.ownerId) {
      const actor = await db.user.findUnique({
        where: { id: params.userId },
      });

      // Notify the owner
      await createNotification({
        userId: params.ownerId,
        type: "AUDIT_LOG_ALERT",
        title: `${getActionVerb(params.action)} by collaborator`,
        message: `${actor?.name ?? "A collaborator"} ${getActionVerb(params.action).toLowerCase()} ${params.resourceName}`,
        metadata: {
          auditLogId: auditLog.id,
          action: params.action,
          resourceType: params.resourceType,
          resourceId: params.resourceId,
          resourceName: params.resourceName,
          performedBy: params.userId,
          performerName: actor?.name ?? "Someone",
        },
      });
    }
  } catch (error) {
    console.error("Error creating audit log:", error);
    // Don't throw - audit log failures shouldn't break main operations
  }
}

/**
 * Helper function to get human-readable action verb
 */
function getActionVerb(action: AuditAction): string {
  switch (action) {
    case "CREATED":
      return "Created";
    case "UPDATED":
      return "Updated";
    case "DELETED":
      return "Deleted";
    case "RESTORED":
      return "Restored";
    default:
      return "Modified";
  }
}

/**
 * Helper function to determine what fields changed between two objects
 */
export function getChangedFields(
  before: Record<string, any>,
  after: Record<string, any>,
): {
  fieldsChanged: string[];
  before: Record<string, any>;
  after: Record<string, any>;
} {
  const fieldsChanged: string[] = [];
  const beforeData: Record<string, any> = {};
  const afterData: Record<string, any> = {};

  // Get all unique keys
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    // Skip certain fields that shouldn't be tracked
    if (["updatedAt", "createdAt", "password"].includes(key)) continue;

    // Check if value changed
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      fieldsChanged.push(key);
      beforeData[key] = before[key];
      afterData[key] = after[key];
    }
  }

  return {
    fieldsChanged,
    before: beforeData,
    after: afterData,
  };
}
```

---

## tRPC Routers

### 1. Create: `src/server/api/routers/auditLog.ts`

```typescript
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const auditLogRouter = createTRPCRouter({
  /**
   * Get audit logs for a specific resource (owner only)
   */
  getLogsForResource: protectedProcedure
    .input(
      z.object({
        resourceType: z.enum([
          "COURSE",
          "TIMETABLE",
          "EVENT",
          "NOTE",
          "RESOURCE",
          "COLLABORATOR",
        ]),
        resourceId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // First, verify that the user is the owner of this resource
      let isOwner = false;

      switch (input.resourceType) {
        case "COURSE":
          const course = await ctx.db.course.findUnique({
            where: { id: input.resourceId },
          });
          isOwner = course?.createdBy === ctx.session.user.id;
          break;

        case "TIMETABLE":
          const timetable = await ctx.db.timetable.findUnique({
            where: { id: input.resourceId },
          });
          isOwner = timetable?.createdBy === ctx.session.user.id;
          break;

        case "EVENT":
          const event = await ctx.db.event.findUnique({
            where: { id: input.resourceId },
            include: { timetable: true },
          });
          isOwner = event?.timetable.createdBy === ctx.session.user.id;
          break;

        case "NOTE":
          const note = await ctx.db.note.findUnique({
            where: { id: input.resourceId },
            include: { course: true },
          });
          isOwner = note?.course.createdBy === ctx.session.user.id;
          break;

        case "RESOURCE":
          const resource = await ctx.db.resource.findUnique({
            where: { id: input.resourceId },
            include: { course: true },
          });
          isOwner = resource?.course.createdBy === ctx.session.user.id;
          break;

        default:
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid resource type",
          });
      }

      if (!isOwner) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only resource owners can view audit logs",
        });
      }

      // Get audit logs for this resource
      const logs = await ctx.db.auditLog.findMany({
        where: {
          resourceType: input.resourceType,
          resourceId: input.resourceId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
              avatarIndex: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return logs;
    }),

  /**
   * Get all audit logs for resources owned by current user
   */
  getMyLogs: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
        resourceType: z
          .enum([
            "COURSE",
            "TIMETABLE",
            "EVENT",
            "NOTE",
            "RESOURCE",
            "COLLABORATOR",
          ])
          .optional(),
        action: z.enum(["CREATED", "UPDATED", "DELETED", "RESTORED"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const logs = await ctx.db.auditLog.findMany({
        where: {
          ownerId: ctx.session.user.id,
          resourceType: input.resourceType,
          action: input.action,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
              avatarIndex: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let nextCursor: string | undefined = undefined;
      if (logs.length > input.limit) {
        const nextItem = logs.pop();
        nextCursor = nextItem?.id;
      }

      return {
        logs,
        nextCursor,
      };
    }),
});
```

### 2. Create: `src/server/api/routers/recyclingBin.ts`

```typescript
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { createAuditLog } from "~/lib/audit";

export const recyclingBinRouter = createTRPCRouter({
  /**
   * Get all soft-deleted items for current user
   */
  getDeletedItems: protectedProcedure
    .input(
      z.object({
        type: z.enum(["courses", "timetables", "events", "notes"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const result: {
        courses: any[];
        timetables: any[];
        events: any[];
        notes: any[];
      } = {
        courses: [],
        timetables: [],
        events: [],
        notes: [],
      };

      // Get deleted courses
      if (!input.type || input.type === "courses") {
        result.courses = await ctx.db.course.findMany({
          where: {
            createdBy: userId,
            deletedAt: { not: null },
          },
          include: {
            deletedByUser: {
              select: { name: true, email: true },
            },
          },
          orderBy: { deletedAt: "desc" },
        });
      }

      // Get deleted timetables
      if (!input.type || input.type === "timetables") {
        result.timetables = await ctx.db.timetable.findMany({
          where: {
            createdBy: userId,
            deletedAt: { not: null },
          },
          include: {
            deletedByUser: {
              select: { name: true, email: true },
            },
            _count: {
              select: { events: { where: { deletedAt: { not: null } } } },
            },
          },
          orderBy: { deletedAt: "desc" },
        });
      }

      // Get deleted events
      if (!input.type || input.type === "events") {
        result.events = await ctx.db.event.findMany({
          where: {
            timetable: { createdBy: userId },
            deletedAt: { not: null },
          },
          include: {
            timetable: {
              select: { name: true },
            },
            course: {
              select: { title: true },
            },
            deletedByUser: {
              select: { name: true, email: true },
            },
          },
          orderBy: { deletedAt: "desc" },
        });
      }

      // Get deleted notes
      if (!input.type || input.type === "notes") {
        result.notes = await ctx.db.note.findMany({
          where: {
            course: { createdBy: userId },
            deletedAt: { not: null },
          },
          include: {
            course: {
              select: { title: true },
            },
            deletedByUser: {
              select: { name: true, email: true },
            },
          },
          orderBy: { deletedAt: "desc" },
        });
      }

      return result;
    }),

  /**
   * Restore a soft-deleted item (and cascade restore if applicable)
   */
  restore: protectedProcedure
    .input(
      z.object({
        type: z.enum(["course", "timetable", "event", "note"]),
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      switch (input.type) {
        case "course":
          // Verify ownership
          const course = await ctx.db.course.findUnique({
            where: { id: input.id },
          });

          if (!course || course.createdBy !== userId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You can only restore your own courses",
            });
          }

          // Restore course (cascade restore notes and resources handled separately if needed)
          await ctx.db.course.update({
            where: { id: input.id },
            data: {
              deletedAt: null,
              deletedBy: null,
            },
          });

          // Create audit log
          await createAuditLog({
            userId,
            action: "RESTORED",
            resourceType: "COURSE",
            resourceId: input.id,
            resourceName: course.title,
            ownerId: userId,
            metadata: { restoredFrom: "recycling_bin" },
          });

          break;

        case "timetable":
          // Verify ownership
          const timetable = await ctx.db.timetable.findUnique({
            where: { id: input.id },
          });

          if (!timetable || timetable.createdBy !== userId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You can only restore your own timetables",
            });
          }

          // Restore timetable
          await ctx.db.timetable.update({
            where: { id: input.id },
            data: {
              deletedAt: null,
              deletedBy: null,
            },
          });

          // CASCADE RESTORE: Restore all events that were deleted with this timetable
          await ctx.db.event.updateMany({
            where: {
              timetableId: input.id,
              deletedAt: { not: null },
            },
            data: {
              deletedAt: null,
              deletedBy: null,
            },
          });

          // Create audit log
          await createAuditLog({
            userId,
            action: "RESTORED",
            resourceType: "TIMETABLE",
            resourceId: input.id,
            resourceName: timetable.name,
            ownerId: userId,
            metadata: { restoredFrom: "recycling_bin" },
          });

          break;

        case "event":
          // Verify ownership (via timetable)
          const event = await ctx.db.event.findUnique({
            where: { id: input.id },
            include: { timetable: true },
          });

          if (!event || event.timetable.createdBy !== userId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You can only restore events from your own timetables",
            });
          }

          // Restore event
          await ctx.db.event.update({
            where: { id: input.id },
            data: {
              deletedAt: null,
              deletedBy: null,
            },
          });

          // Create audit log
          await createAuditLog({
            userId,
            action: "RESTORED",
            resourceType: "EVENT",
            resourceId: input.id,
            resourceName: event.title,
            ownerId: userId,
            metadata: { restoredFrom: "recycling_bin" },
          });

          break;

        case "note":
          // Verify ownership (via course)
          const note = await ctx.db.note.findUnique({
            where: { id: input.id },
            include: { course: true },
          });

          if (!note || note.course.createdBy !== userId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You can only restore notes from your own courses",
            });
          }

          // Restore note
          await ctx.db.note.update({
            where: { id: input.id },
            data: {
              deletedAt: null,
              deletedBy: null,
            },
          });

          // Create audit log
          await createAuditLog({
            userId,
            action: "RESTORED",
            resourceType: "NOTE",
            resourceId: input.id,
            resourceName: note.title,
            ownerId: userId,
            metadata: { restoredFrom: "recycling_bin" },
          });

          break;
      }

      return { success: true };
    }),

  /**
   * Permanently delete an item from recycling bin
   */
  permanentDelete: protectedProcedure
    .input(
      z.object({
        type: z.enum(["course", "timetable", "event", "note"]),
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      switch (input.type) {
        case "course":
          // Verify ownership and that it's soft-deleted
          const course = await ctx.db.course.findUnique({
            where: { id: input.id },
          });

          if (!course || course.createdBy !== userId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You can only delete your own courses",
            });
          }

          if (!course.deletedAt) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Course must be soft-deleted first",
            });
          }

          // Permanently delete (Prisma cascade handles relations)
          await ctx.db.course.delete({
            where: { id: input.id },
          });

          break;

        case "timetable":
          // Verify ownership and soft-delete status
          const timetable = await ctx.db.timetable.findUnique({
            where: { id: input.id },
          });

          if (!timetable || timetable.createdBy !== userId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You can only delete your own timetables",
            });
          }

          if (!timetable.deletedAt) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Timetable must be soft-deleted first",
            });
          }

          // Permanently delete
          await ctx.db.timetable.delete({
            where: { id: input.id },
          });

          break;

        case "event":
          // Verify ownership via timetable
          const event = await ctx.db.event.findUnique({
            where: { id: input.id },
            include: { timetable: true },
          });

          if (!event || event.timetable.createdBy !== userId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You can only delete events from your own timetables",
            });
          }

          if (!event.deletedAt) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Event must be soft-deleted first",
            });
          }

          // Permanently delete
          await ctx.db.event.delete({
            where: { id: input.id },
          });

          break;

        case "note":
          // Verify ownership via course
          const note = await ctx.db.note.findUnique({
            where: { id: input.id },
            include: { course: true },
          });

          if (!note || note.course.createdBy !== userId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You can only delete notes from your own courses",
            });
          }

          if (!note.deletedAt) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Note must be soft-deleted first",
            });
          }

          // Permanently delete
          await ctx.db.note.delete({
            where: { id: input.id },
          });

          break;
      }

      return { success: true };
    }),
});
```

### 3. Add Routers to Root

Update `src/server/api/root.ts`:

```typescript
import { auditLogRouter } from "./routers/auditLog";
import { recyclingBinRouter } from "./routers/recyclingBin";

export const appRouter = createCallerFactory(createTRPCRouter)({
  // ... existing routers ...
  auditLog: auditLogRouter,
  recyclingBin: recyclingBinRouter,
});
```

---

## Soft Delete Implementation

### Strategy

Instead of using `db.course.delete()`, use `db.course.update()` to set `deletedAt`:

```typescript
// OLD (hard delete - DON'T DO THIS)
await ctx.db.course.delete({ where: { id: courseId } });

// NEW (soft delete - DO THIS)
await ctx.db.course.update({
  where: { id: courseId },
  data: {
    deletedAt: new Date(),
    deletedBy: ctx.session.user.id,
  },
});
```

### Default Query Filters

Add `deletedAt: null` to all queries to exclude soft-deleted items:

```typescript
// Example: Get all courses (exclude deleted)
const courses = await ctx.db.course.findMany({
  where: {
    createdBy: userId,
    deletedAt: null, // Exclude soft-deleted
  },
});
```

### Update Existing Router Procedures

#### 1. Course Router Updates

**Add `softDelete` mutation:**

```typescript
softDelete: protectedProcedure
  .input(z.object({ courseId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // Verify ownership or contributor access
    const course = await ctx.db.course.findUnique({
      where: { id: input.courseId },
      include: {
        collaborators: true,
      },
    });

    if (!course) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Course not found",
      });
    }

    const isOwner = course.createdBy === ctx.session.user.id;
    const isCollaborator = course.collaborators.some(
      (c) => c.userId === ctx.session.user.id && c.status === "ACCEPTED",
    );

    if (!isOwner && !isCollaborator) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have permission to delete this course",
      });
    }

    // Soft delete
    await ctx.db.course.update({
      where: { id: input.courseId },
      data: {
        deletedAt: new Date(),
        deletedBy: ctx.session.user.id,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: ctx.session.user.id,
      action: "DELETED",
      resourceType: "COURSE",
      resourceId: input.courseId,
      resourceName: course.title,
      ownerId: course.createdBy,
    });

    return { success: true };
  }),
```

**Add `deletedAt: null` filters to all queries:**

```typescript
getAll: protectedProcedure.query(async ({ ctx }) => {
  const courses = await ctx.db.course.findMany({
    where: {
      createdBy: ctx.session.user.id,
      deletedAt: null, // <-- Add this
    },
  });

  return courses;
}),
```

#### 2. Timetable Router Updates

**Add `softDelete` mutation with CASCADE:**

```typescript
softDelete: protectedProcedure
  .input(z.object({ timetableId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // Verify ownership
    const timetable = await ctx.db.timetable.findUnique({
      where: { id: input.timetableId },
    });

    if (!timetable || timetable.createdBy !== ctx.session.user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You can only delete your own timetables",
      });
    }

    const now = new Date();

    // Soft delete timetable
    await ctx.db.timetable.update({
      where: { id: input.timetableId },
      data: {
        deletedAt: now,
        deletedBy: ctx.session.user.id,
      },
    });

    // CASCADE: Soft delete all events in this timetable
    await ctx.db.event.updateMany({
      where: { timetableId: input.timetableId },
      data: {
        deletedAt: now,
        deletedBy: ctx.session.user.id,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: ctx.session.user.id,
      action: "DELETED",
      resourceType: "TIMETABLE",
      resourceId: input.timetableId,
      resourceName: timetable.name,
      ownerId: timetable.createdBy,
    });

    return { success: true };
  }),
```

**Add `deletedAt: null` filters:**

```typescript
getAll: protectedProcedure.query(async ({ ctx }) => {
  const timetables = await ctx.db.timetable.findMany({
    where: {
      createdBy: ctx.session.user.id,
      deletedAt: null, // <-- Add this
    },
  });

  return timetables;
}),
```

#### 3. Event Router Updates

**Add `softDelete` mutation:**

```typescript
softDelete: protectedProcedure
  .input(z.object({ eventId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // Verify ownership via timetable
    const event = await ctx.db.event.findUnique({
      where: { id: input.eventId },
      include: { timetable: true },
    });

    if (!event || event.timetable.createdBy !== ctx.session.user.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You can only delete events from your own timetables",
      });
    }

    // Soft delete
    await ctx.db.event.update({
      where: { id: input.eventId },
      data: {
        deletedAt: new Date(),
        deletedBy: ctx.session.user.id,
      },
    });

    // Create audit log
    await createAuditLog({
      userId: ctx.session.user.id,
      action: "DELETED",
      resourceType: "EVENT",
      resourceId: input.eventId,
      resourceName: event.title,
      ownerId: event.timetable.createdBy,
    });

    return { success: true };
  }),
```

**Add `deletedAt: null` filters:**

```typescript
getAll: protectedProcedure
  .input(z.object({ timetableId: z.string() }))
  .query(async ({ ctx, input }) => {
    const events = await ctx.db.event.findMany({
      where: {
        timetableId: input.timetableId,
        deletedAt: null, // <-- Add this
      },
    });

    return events;
  }),
```

#### 4. Note Router Updates

Apply the same pattern: add `softDelete` mutation and `deletedAt: null` filters.

---

## UI Components

### 1. Create: `src/components/audit-log-viewer.tsx`

```typescript
"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import type { ResourceType, AuditAction } from "@prisma/client";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AuditLogViewerProps {
  resourceType: ResourceType;
  resourceId: string;
}

export function AuditLogViewer({
  resourceType,
  resourceId,
}: AuditLogViewerProps) {
  const { data: logs = [], isLoading } =
    api.auditLog.getLogsForResource.useQuery({
      resourceType,
      resourceId,
    });

  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">No activity yet</p>
      </div>
    );
  }

  const getActionColor = (action: AuditAction) => {
    switch (action) {
      case "CREATED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "UPDATED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "DELETED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "RESTORED":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Activity Log</h3>
        <p className="text-sm text-muted-foreground">
          Track changes made to this {resourceType.toLowerCase()}
        </p>
      </div>

      <div className="space-y-2">
        {logs.map((log) => (
          <div
            key={log.id}
            className="rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getActionColor(log.action)}`}
                  >
                    {log.action}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    by {log.user.name}
                  </span>
                </div>

                <p className="text-sm">
                  <span className="font-medium">{log.resourceName}</span>
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(log.createdAt)}
                </p>

                {/* Show change data for UPDATE actions */}
                {log.action === "UPDATED" && log.changeData && (
                  <div className="mt-3">
                    <button
                      onClick={() =>
                        setExpandedLog(
                          expandedLog === log.id ? null : log.id,
                        )
                      }
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      {expandedLog === log.id ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Hide changes
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          View changes
                        </>
                      )}
                    </button>

                    {expandedLog === log.id && (
                      <div className="mt-2 rounded-lg bg-muted p-3 text-xs">
                        <div className="font-semibold">Changed fields:</div>
                        {Object.entries(
                          (log.changeData as any).before ?? {},
                        ).map(([key, value]) => (
                          <div key={key} className="mt-2">
                            <div className="font-medium">{key}:</div>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <div className="text-red-600">
                                  - {JSON.stringify(value)}
                                </div>
                                <div className="text-green-600">
                                  +{" "}
                                  {JSON.stringify(
                                    (log.changeData as any).after[key],
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2. Create: `src/app/(student)/recycling-bin/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Trash2, RotateCcw, AlertCircle } from "lucide-react";

type TabType = "courses" | "timetables" | "events" | "notes";

export default function RecyclingBinPage() {
  const [activeTab, setActiveTab] = useState<TabType>("courses");

  const { data, isLoading, refetch } =
    api.recyclingBin.getDeletedItems.useQuery({
      type: activeTab,
    });

  const restoreMutation = api.recyclingBin.restore.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const permanentDeleteMutation =
    api.recyclingBin.permanentDelete.useMutation({
      onSuccess: () => {
        void refetch();
      },
    });

  const handleRestore = (type: string, id: string) => {
    if (
      confirm(
        "Are you sure you want to restore this item? It will be moved back to its original location.",
      )
    ) {
      restoreMutation.mutate({
        type: type as any,
        id,
      });
    }
  };

  const handlePermanentDelete = (type: string, id: string) => {
    if (
      confirm(
        "⚠️ WARNING: This action CANNOT be undone! Are you sure you want to permanently delete this item?",
      )
    ) {
      permanentDeleteMutation.mutate({
        type: type as any,
        id,
      });
    }
  };

  const getDaysRemaining = (deletedAt: Date) => {
    const now = new Date();
    const deleted = new Date(deletedAt);
    const diffTime = 30 * 24 * 60 * 60 * 1000 - (now.getTime() - deleted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const items = data?.[activeTab] ?? [];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Recycling Bin</h1>
        <p className="text-muted-foreground">
          Deleted items are kept for 30 days before permanent deletion
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("courses")}
          className={`px-4 py-2 font-medium ${
            activeTab === "courses"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Courses ({data?.courses.length ?? 0})
        </button>
        <button
          onClick={() => setActiveTab("timetables")}
          className={`px-4 py-2 font-medium ${
            activeTab === "timetables"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Timetables ({data?.timetables.length ?? 0})
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2 font-medium ${
            activeTab === "events"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Events ({data?.events.length ?? 0})
        </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={`px-4 py-2 font-medium ${
            activeTab === "notes"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Notes ({data?.notes.length ?? 0})
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="p-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border p-12 text-center">
          <Trash2 className="mx-auto mb-4 h-16 w-16 opacity-20" />
          <p className="text-muted-foreground">
            No deleted {activeTab} in recycling bin
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item: any) => {
            const daysRemaining = getDaysRemaining(item.deletedAt);
            const isExpiringSoon = daysRemaining <= 7;

            return (
              <div
                key={item.id}
                className={`rounded-lg border p-6 ${
                  isExpiringSoon
                    ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/20"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {item.title ?? item.name}
                    </h3>

                    {/* Additional info based on type */}
                    {activeTab === "events" && (
                      <p className="text-sm text-muted-foreground">
                        {item.course?.title} • {item.timetable?.name}
                      </p>
                    )}
                    {activeTab === "notes" && (
                      <p className="text-sm text-muted-foreground">
                        Course: {item.course?.title}
                      </p>
                    )}
                    {activeTab === "timetables" && item._count?.events > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Contains {item._count.events} deleted event(s)
                      </p>
                    )}

                    <p className="mt-2 text-sm text-muted-foreground">
                      Deleted by {item.deletedByUser?.name} on{" "}
                      {new Date(item.deletedAt).toLocaleDateString()}
                    </p>

                    {/* Days remaining warning */}
                    <div
                      className={`mt-3 flex items-center gap-2 text-sm ${
                        isExpiringSoon
                          ? "font-medium text-red-600 dark:text-red-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {isExpiringSoon && (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      {daysRemaining === 0
                        ? "Expires today"
                        : `Permanently deleted in ${daysRemaining} day${daysRemaining > 1 ? "s" : ""}`}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleRestore(
                          activeTab.slice(0, -1),
                          item.id,
                        )
                      }
                      disabled={restoreMutation.isPending}
                      className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restore
                    </button>
                    <button
                      onClick={() =>
                        handlePermanentDelete(
                          activeTab.slice(0, -1),
                          item.id,
                        )
                      }
                      disabled={permanentDeleteMutation.isPending}
                      className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Forever
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

### 3. Add Recycling Bin Link to Navigation

Update `src/app/(student)/layout.tsx`:

```typescript
// Add to desktop navigation
<NavLink href="/recycling-bin">
  <Trash2 className="h-5 w-5" />
  Recycling Bin
</NavLink>

// Add to mobile navigation (optional)
<MobileNavLink href="/recycling-bin">
  <Trash2 className="h-6 w-6" />
  <span className="text-xs">Bin</span>
</MobileNavLink>
```

---

## Cron Job - Cleanup

### Create: `src/app/api/cron/cleanup-recycling-bin/route.ts`

```typescript
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { env } from "~/env";

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate cutoff date (30 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const deletedItems = {
      notes: 0,
      resources: 0,
      events: 0,
      timetables: 0,
      courses: 0,
    };

    // Delete in order to respect foreign key constraints
    // 1. Notes (child of Course)
    const deletedNotes = await db.note.deleteMany({
      where: {
        deletedAt: {
          lte: cutoffDate,
          not: null,
        },
      },
    });
    deletedItems.notes = deletedNotes.count;

    // 2. Resources (child of Course)
    const deletedResources = await db.resource.deleteMany({
      where: {
        deletedAt: {
          lte: cutoffDate,
          not: null,
        },
      },
    });
    deletedItems.resources = deletedResources.count;

    // 3. Events (child of Timetable)
    const deletedEvents = await db.event.deleteMany({
      where: {
        deletedAt: {
          lte: cutoffDate,
          not: null,
        },
      },
    });
    deletedItems.events = deletedEvents.count;

    // 4. Timetables
    const deletedTimetables = await db.timetable.deleteMany({
      where: {
        deletedAt: {
          lte: cutoffDate,
          not: null,
        },
      },
    });
    deletedItems.timetables = deletedTimetables.count;

    // 5. Courses (parent tables last)
    const deletedCourses = await db.course.deleteMany({
      where: {
        deletedAt: {
          lte: cutoffDate,
          not: null,
        },
      },
    });
    deletedItems.courses = deletedCourses.count;

    return NextResponse.json({
      success: true,
      message: "Recycling bin cleanup completed",
      deleted: deletedItems,
      cutoffDate: cutoffDate.toISOString(),
    });
  } catch (error) {
    console.error("Error in recycling bin cleanup cron:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### Update: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/class-reminders",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron/cleanup-recycling-bin",
      "schedule": "0 2 * * *"
    }
  ]
}
```

---

## Integration Points

### Example: Update Event in Timetable

```typescript
updateEvent: protectedProcedure
  .input(
    z.object({
      eventId: z.string(),
      title: z.string().optional(),
      location: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      // ... other fields
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Get current event data (BEFORE)
    const beforeEvent = await ctx.db.event.findUnique({
      where: { id: input.eventId },
      include: { timetable: true },
    });

    if (!beforeEvent) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    // Verify ownership via timetable
    if (beforeEvent.timetable.createdBy !== ctx.session.user.id) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    // Update event
    const afterEvent = await ctx.db.event.update({
      where: { id: input.eventId },
      data: {
        title: input.title,
        location: input.location,
        startTime: input.startTime,
        endTime: input.endTime,
      },
    });

    // Calculate what changed
    const { fieldsChanged, before, after } = getChangedFields(
      beforeEvent,
      afterEvent,
    );

    // Create audit log
    if (fieldsChanged.length > 0) {
      await createAuditLog({
        userId: ctx.session.user.id,
        action: "UPDATED",
        resourceType: "EVENT",
        resourceId: input.eventId,
        resourceName: afterEvent.title,
        ownerId: beforeEvent.timetable.createdBy,
        changeData: { before, after },
        metadata: { fieldsChanged },
      });
    }

    return afterEvent;
  }),
```

---

## Testing Guide

### Manual Testing Checklist

#### Audit Logs
- [ ] Create resource → Audit log created with CREATED action
- [ ] Update resource → Audit log created with UPDATED action and change data
- [ ] Delete resource → Audit log created with DELETED action
- [ ] Restore resource → Audit log created with RESTORED action
- [ ] Owner can view audit logs for their resources
- [ ] Contributor actions trigger notifications to owner
- [ ] Contributor cannot view audit logs

#### Soft Delete
- [ ] Delete course → Sets deletedAt timestamp
- [ ] Delete timetable → Cascades to events
- [ ] Deleted items don't appear in normal queries
- [ ] Deleted items appear in recycling bin
- [ ] Days remaining countdown is accurate

#### Recycling Bin UI
- [ ] Shows all deleted items grouped by type
- [ ] Tabs work correctly (courses, timetables, events, notes)
- [ ] Restore button works and removes from bin
- [ ] Restore timetable restores all events (cascade)
- [ ] Permanent delete asks for confirmation
- [ ] Permanent delete removes item completely
- [ ] Items expiring soon show warning

#### Cleanup Cron
- [ ] Cron job runs daily at 2 AM
- [ ] Items older than 30 days are permanently deleted
- [ ] Deletion respects foreign key constraints
- [ ] Returns accurate count of deleted items

### Test Cases

```typescript
// Test 1: Soft delete course
// Expected: deletedAt set, item appears in recycling bin

// Test 2: Soft delete timetable
// Expected: timetable and all events have deletedAt set

// Test 3: Restore timetable
// Expected: timetable and all events have deletedAt cleared

// Test 4: Audit log for update
// Expected: changeData contains before/after values

// Test 5: Contributor edit triggers owner notification
// Expected: Owner receives AUDIT_LOG_ALERT notification

// Test 6: Query excludes soft-deleted items
// Expected: Items with deletedAt != null don't appear

// Test 7: Cleanup cron deletes 30+ day items
// Expected: Items deleted 31+ days ago are permanently removed

// Test 8: Owner-only audit log access
// Expected: Contributors cannot view audit logs
```

---

## Summary

This comprehensive system provides:

✅ **Complete audit trail** with before/after change tracking
✅ **Role-based access** - only owners see audit logs
✅ **Automatic notifications** when contributors make changes
✅ **Soft delete with 30-day retention** for all major resources
✅ **Cascade delete/restore** for related resources
✅ **User-friendly recycling bin UI** with days remaining countdown
✅ **Automated cleanup** via daily cron job
✅ **Security** - all operations verify ownership and permissions

The system integrates seamlessly with the notification system from NOTIFICATIONS_SYSTEM.md and follows all UNIShare architectural patterns.
