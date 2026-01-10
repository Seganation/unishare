# Timetable Backend API Requirements

This document outlines the backend API endpoints and database changes required to complete the timetable feature redesign.

## 🗄️ Database Schema Changes

### Update User Model

Add a new field to track the user's default timetable:

```prisma
model User {
  // ... existing fields ...

  defaultTimetableId String?
  defaultTimetable   Timetable? @relation("DefaultTimetable", fields: [defaultTimetableId], references: [id], onDelete: SetNull)

  // ... existing relations ...
}
```

### Update Timetable Model

Add a relation for users who have set this as default:

```prisma
model Timetable {
  // ... existing fields ...

  defaultForUsers User[] @relation("DefaultTimetable")

  // ... existing relations ...
}
```

## 📡 Required tRPC Mutations & Queries

Add the following endpoints to `src/server/api/routers/timetable.ts`:

### 1. Set Default Timetable

**Mutation**: `setDefaultTimetable`

**Purpose**: Allow users to set any timetable (owned or shared) as their default. The default timetable is shown first when visiting the page and is used for class reminder notifications.

**Input**:
```typescript
z.object({
  timetableId: z.string(),
})
```

**Implementation**:
```typescript
setDefaultTimetable: protectedProcedure
  .input(
    z.object({
      timetableId: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    // Verify user has access to this timetable
    const timetable = await ctx.db.timetable.findUnique({
      where: { id: input.timetableId },
      include: {
        collaborators: {
          where: { userId: userId, status: "ACCEPTED" },
        },
      },
    });

    if (!timetable) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Timetable not found",
      });
    }

    const hasAccess =
      timetable.createdBy === userId ||
      timetable.collaborators.length > 0;

    if (!hasAccess) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have access to this timetable",
      });
    }

    // Update user's default timetable
    await ctx.db.user.update({
      where: { id: userId },
      data: { defaultTimetableId: input.timetableId },
    });

    return { success: true };
  }),
```

---

### 2. Get Default Timetable ID

**Query**: `getDefaultTimetableId`

**Purpose**: Retrieve the user's current default timetable ID.

**Implementation**:
```typescript
getDefaultTimetableId: protectedProcedure.query(async ({ ctx }) => {
  const user = await ctx.db.user.findUnique({
    where: { id: ctx.session.user.id },
    select: { defaultTimetableId: true },
  });

  return user?.defaultTimetableId ?? null;
}),
```

**Alternative**: Include `defaultTimetableId` directly in the session object or in the `getUserTimetables` query response.

---

### 3. Remove Collaborator

**Mutation**: `removeCollaborator`

**Purpose**: Allow timetable owners to remove collaborators (including pending invitations).

**Input**:
```typescript
z.object({
  collaboratorId: z.string(), // The TimetableCollaborator ID
})
```

**Implementation**:
```typescript
removeCollaborator: protectedProcedure
  .input(z.object({ collaboratorId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    // Get collaborator with timetable ownership check
    const collaborator = await ctx.db.timetableCollaborator.findUnique({
      where: { id: input.collaboratorId },
      include: {
        timetable: true,
      },
    });

    if (!collaborator) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Collaborator not found",
      });
    }

    // Only owner can remove collaborators
    if (collaborator.timetable.createdBy !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only the owner can remove collaborators",
      });
    }

    // Delete the collaborator
    await ctx.db.timetableCollaborator.delete({
      where: { id: input.collaboratorId },
    });

    return { success: true };
  }),
```

---

### 4. Update Collaborator Role

**Mutation**: `updateCollaboratorRole`

**Purpose**: Allow timetable owners to change a collaborator's role between VIEWER and CONTRIBUTOR.

**Input**:
```typescript
z.object({
  collaboratorId: z.string(),
  role: z.enum(["VIEWER", "CONTRIBUTOR"]),
})
```

**Implementation**:
```typescript
updateCollaboratorRole: protectedProcedure
  .input(
    z.object({
      collaboratorId: z.string(),
      role: z.enum(["VIEWER", "CONTRIBUTOR"]),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    // Get collaborator with timetable ownership check
    const collaborator = await ctx.db.timetableCollaborator.findUnique({
      where: { id: input.collaboratorId },
      include: {
        timetable: true,
      },
    });

    if (!collaborator) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Collaborator not found",
      });
    }

    // Only owner can change roles
    if (collaborator.timetable.createdBy !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only the owner can change collaborator roles",
      });
    }

    // Only accepted collaborators can have their role changed
    if (collaborator.status !== "ACCEPTED") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot change role of pending or rejected collaborator",
      });
    }

    // Update the role
    const updated = await ctx.db.timetableCollaborator.update({
      where: { id: input.collaboratorId },
      data: { role: input.role },
    });

    return updated;
  }),
```

---

### 5. Leave Timetable

**Mutation**: `leaveTimetable`

**Purpose**: Allow collaborators to leave a shared timetable.

**Input**:
```typescript
z.object({
  timetableId: z.string(),
})
```

**Implementation**:
```typescript
leaveTimetable: protectedProcedure
  .input(z.object({ timetableId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    // Find the collaboration
    const collaboration = await ctx.db.timetableCollaborator.findUnique({
      where: {
        timetableId_userId: {
          timetableId: input.timetableId,
          userId: userId,
        },
      },
      include: {
        timetable: true,
      },
    });

    if (!collaboration) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "You are not a collaborator on this timetable",
      });
    }

    // Owners cannot leave their own timetable
    if (collaboration.timetable.createdBy === userId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Owners cannot leave their own timetable. Delete it instead.",
      });
    }

    // Remove collaboration
    await ctx.db.timetableCollaborator.delete({
      where: { id: collaboration.id },
    });

    // If this was the user's default timetable, unset it
    await ctx.db.user.updateMany({
      where: {
        id: userId,
        defaultTimetableId: input.timetableId,
      },
      data: {
        defaultTimetableId: null,
      },
    });

    return { success: true };
  }),
```

---

## 🔔 Notification Integration

The default timetable feature should integrate with the existing notification system for class reminders.

**Logic**:
- Only send class reminder notifications for events in the user's default timetable
- Check `user.defaultTimetableId` when scheduling/sending notifications
- If no default timetable is set, don't send any class reminders

**Implementation Location**: `src/lib/notifications.ts` or wherever class reminders are scheduled

---

## 🎨 Frontend Updates Required

The frontend components are already built and ready. Once the backend endpoints are implemented:

1. **Update `src/app/(student)/timetable/page.tsx`**:
   - Replace `const defaultTimetableId = null;` on line 162 with a real query:
     ```typescript
     const { data: defaultTimetableId } = api.timetable.getDefaultTimetableId.useQuery();
     ```

2. **Components Ready to Use** (already created):
   - `InvitationsBanner` - Shows pending timetable invitations
   - `ManageCollaboratorsModal` - View, change role, remove collaborators
   - `TimetableSettingsModal` - Rename, delete, leave, set as default
   - Timetable page - Complete redesign with all features integrated

---

## ✅ Implementation Checklist

- [ ] Update User model with `defaultTimetableId` field
- [ ] Run database migration (`npm run db:generate` and `npm run db:migrate`)
- [ ] Implement `setDefaultTimetable` mutation
- [ ] Implement `getDefaultTimetableId` query
- [ ] Implement `removeCollaborator` mutation
- [ ] Implement `updateCollaboratorRole` mutation
- [ ] Implement `leaveTimetable` mutation
- [ ] Update frontend to use `getDefaultTimetableId` query
- [ ] Test all new endpoints
- [ ] Update notification system to use default timetable
- [ ] Test full timetable workflow end-to-end

---

## 📝 Notes

- All mutations include proper permission checks
- Owners have full control over their timetables
- Collaborators can only leave, not delete
- Default timetable can be any timetable the user has access to (owned or shared)
- Removing a collaborator or leaving a timetable automatically unsets it as default if applicable
