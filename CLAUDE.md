# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Documentation Files

**ALWAYS check these files for guidance:**
- **`IMPLEMENTATION_GUIDE.md`**: The master blueprint for the entire project. Contains the complete roadmap, phase-by-phase implementation plan, database schema, and architecture decisions. Refer to this before implementing any new features.
- **`docs/`**: Contains technical guides and integration documentation:
  - `docs/liveblocks+blacknote.md`: Liveblocks and BlockNote integration API reference

When starting a new feature or debugging issues, check these files first to understand the intended architecture and implementation approach.

## Project Overview

UNIShare is a student-driven academic organization platform built with T3 Stack and Next.js 15, featuring:
- **tRPC** for end-to-end type-safe APIs
- **NextAuth.js** (v5 beta) for authentication with credentials provider (not Discord)
- **Prisma** with **NeonDB** (PostgreSQL) for database
- **TailwindCSS** for styling
- **React Query** for data fetching and caching
- **UploadThing** for file uploads (student IDs, course resources)
- **Liveblocks** for real-time collaborative editing
- **BlockNote** for rich text editing
- **Nodemailer** for email notifications (approval/rejection emails)

## Development Commands

```bash
# Development
npm run dev              # Start development server with Turbo mode
npm run build            # Build for production
npm run start            # Start production server
npm run preview          # Build and start production server

# Code Quality
npm run check            # Run linter and type checking
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues automatically
npm run typecheck        # Run TypeScript type checking
npm run format:check     # Check formatting with Prettier
npm run format:write     # Fix formatting with Prettier

# Database
npm run db:generate      # Generate Prisma client and run migrations (dev)
npm run db:migrate       # Deploy migrations (production)
npm run db:push          # Push schema changes without migrations
npm run db:studio        # Open Prisma Studio for database inspection
```

## Architecture

### tRPC Setup (Type-Safe API Layer)

The application uses a dual-mode tRPC setup supporting both Client Components and React Server Components:

**Server-side (RSC):**
- `src/trpc/server.ts`: Exports `api` for RSC usage and `HydrateClient` for hydration
- Uses server-side caller pattern with `createCaller`
- Example: `const data = await api.post.getLatest()`

**Client-side:**
- `src/trpc/react.tsx`: Exports `api` hook for Client Components and `TRPCReactProvider`
- Example: `const { data } = api.post.getLatest.useQuery()`
- Must wrap app with `TRPCReactProvider` in layout

**Core tRPC files:**
- `src/server/api/trpc.ts`: Context creation, middleware, and procedure definitions
  - `publicProcedure`: For unauthenticated endpoints
  - `protectedProcedure`: Requires authentication, guarantees `ctx.session.user` is non-null
  - Uses SuperJSON transformer for serialization
  - Includes timing middleware with artificial delay in development (100-500ms)
- `src/server/api/root.ts`: Main router combining all sub-routers
  - **IMPORTANT**: When adding new routers, manually import and add them to `appRouter`
- `src/server/api/routers/`: Individual feature routers (e.g., `post.ts`)

### Authentication (NextAuth.js v5)

- `src/server/auth/config.ts`: NextAuth configuration with Discord provider
- `src/server/auth/index.ts`: Cached auth helper exported for use throughout the app
- `src/app/api/auth/[...nextauth]/route.ts`: NextAuth API route handler
- Database adapter uses Prisma with models: `User`, `Account`, `Session`, `VerificationToken`
- Session is extended via module augmentation to include `user.id`

To add a new auth provider, update `src/server/auth/config.ts` and add required env vars to `src/env.js`.

### Database (Prisma + PostgreSQL)

- Schema: `prisma/schema.prisma`
- Client: `src/server/db.ts` exports singleton Prisma client
- Migrations: Use `db:generate` in development, `db:migrate` in production
- Example model relationships: `User` → `Post` (one-to-many)

### Environment Variables

Environment variables are validated at build time using `@t3-oss/env-nextjs`:
- Schema defined in `src/env.js`
- **When adding new env vars:** Update both `src/env.js` schema and `.env.example`
- Required vars: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_DISCORD_ID`, `AUTH_DISCORD_SECRET`
- Use `env.VARIABLE_NAME` instead of `process.env.VARIABLE_NAME` for validated access

### App Structure (Next.js 15 App Router)

- `src/app/`: Next.js app directory with route handlers and pages
  - `layout.tsx`: Root layout with `TRPCReactProvider`
  - `page.tsx`: Home page
  - `_components/`: Server components for the app
  - `api/`: API route handlers (NextAuth, tRPC)

## Adding New Features

### Adding a New tRPC Router

1. Create router file in `src/server/api/routers/[feature].ts`
2. Define procedures using `publicProcedure` or `protectedProcedure`
3. Use Zod for input validation
4. Import and add to `appRouter` in `src/server/api/root.ts`

Example:
```typescript
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const myRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.myModel.findUnique({ where: { id: input.id } });
    }),
});
```

### Adding a New Database Model

1. Add model to `prisma/schema.prisma`
2. Run `npm run db:generate` to create migration and update client
3. Access via `ctx.db` in tRPC procedures or import `db` from `~/server/db`

### Authentication Requirements

- Use `protectedProcedure` for authenticated-only endpoints
- Access user info via `ctx.session.user` (guaranteed non-null in protected procedures)
- For conditional auth, use `publicProcedure` and check `ctx.session?.user`

### Timetable System (Shareable Schedules)

The timetable feature allows students to create, share, and collaborate on class schedules.

**Architecture:**
```
Timetable (container for a semester's schedule)
  ├─ name: "Fall 2024 Schedule"
  ├─ createdBy: userId (owner)
  └─ events: Event[] (individual classes)

TimetableCollaborator (sharing system)
  ├─ role: CollaboratorRole (reuses course enum: VIEWER | CONTRIBUTOR)
  ├─ status: CollaboratorStatus (reuses: PENDING | ACCEPTED | REJECTED)

Event (scheduled class)
  ├─ timetableId: links to Timetable
  ├─ courseId: links to Course (must be favorited)
  ├─ dayOfWeek: 0-6 (Sunday-Saturday)
  ├─ startTime: "09:00"
  ├─ endTime: "11:00"
```

**Key Features:**
1. **Favorite Course Filtering**: Students can only add courses they've favorited to their timetable
2. **Sharing with Roles**:
   - VIEWER: Can see the schedule but not edit
   - CONTRIBUTOR: Can add/edit/delete events
3. **Invitation System**: Search for users by email/name, invite them, they accept/reject
4. **Weekly Recurring**: Events repeat every week (typical university schedule)

**UI Library**: Uses `react-big-calendar` with `date-fns` localizer for calendar display

**Important Models:**
- `Timetable`: The schedule container
- `TimetableCollaborator`: Tracks who has access and their role
- `Event`: Individual class time slots linked to both Timetable and Course
