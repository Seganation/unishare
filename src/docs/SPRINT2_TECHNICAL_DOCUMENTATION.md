# UniShare Project Technical Documentation - Sprint 2

**Generated:** 2025-11-17
**Project:** UniShare - Student-Driven Academic Organization Platform
**Tech Stack:** T3 Stack (Next.js 15, tRPC, Prisma, NextAuth, TailwindCSS)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [API Endpoints (tRPC Routers)](#api-endpoints-trpc-routers)
4. [Pages and Routes](#pages-and-routes)
5. [Authentication & Authorization](#authentication--authorization)
6. [Features Implementation](#features-implementation)
7. [User Flows](#user-flows)
8. [Component Hierarchy](#component-hierarchy)
9. [Integration Points](#integration-points)
10. [Environment Variables](#environment-variables)

---

## Architecture Overview

### Tech Stack

**Core Framework:**
- **Next.js 15** - App Router with React Server Components
- **React 19** - UI library
- **TypeScript 5.8** - Type safety

**Backend & API:**
- **tRPC 11** - End-to-end type-safe APIs
- **Prisma 6** - ORM for database operations
- **NeonDB** - PostgreSQL database (serverless)
- **NextAuth.js 5 (beta)** - Authentication with JWT strategy

**Styling & UI:**
- **TailwindCSS 4** - Utility-first CSS
- **Radix UI** - Accessible UI primitives
- **Framer Motion** - Animations
- **Lucide React** - Icons

**Real-time & Collaboration:**
- **Liveblocks** - Real-time collaborative editing
- **BlockNote** - Rich text editor
- **Yjs** - CRDT for collaborative editing

**File Management:**
- **UploadThing** - File uploads (student IDs, course resources)

**Email:**
- **Nodemailer** - Email notifications (approval/rejection)

**Form & Validation:**
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Directory Structure

```
unishare/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (admin)/          # Admin-only routes (role: ADMIN)
│   │   │   └── admin/
│   │   │       ├── page.tsx             # Admin dashboard
│   │   │       └── approvals/page.tsx   # User approval management
│   │   ├── (auth)/           # Authentication routes (public)
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── waiting-approval/page.tsx
│   │   ├── (student)/        # Student routes (role: APPROVED/ADMIN)
│   │   │   ├── courses/      # Course management
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx            # Course detail
│   │   │   │       ├── settings/page.tsx
│   │   │   │       ├── collaborators/page.tsx
│   │   │   │       └── notes/[[...pageId]]/page.tsx
│   │   │   ├── timetable/    # Timetable management
│   │   │   │   └── page.tsx
│   │   │   └── my-articles/  # Article management
│   │   │       ├── page.tsx
│   │   │       ├── new/page.tsx
│   │   │       └── [id]/edit/page.tsx
│   │   ├── articles/         # Public article viewing
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # NextAuth handlers
│   │   │   ├── trpc/         # tRPC endpoint
│   │   │   ├── uploadthing/  # File upload handlers
│   │   │   ├── liveblocks-auth/ # Liveblocks auth
│   │   │   └── notes/        # Note-related APIs
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Landing page
│   ├── components/           # React components
│   │   ├── ui/              # Shadcn UI components
│   │   ├── articles/        # Article-specific components
│   │   ├── courses/         # Course-specific components
│   │   ├── notes/           # Collaborative notes components
│   │   ├── resources/       # Resource card components
│   │   └── timetable/       # Timetable components
│   ├── server/              # Server-side code
│   │   ├── api/
│   │   │   ├── routers/     # tRPC routers
│   │   │   │   ├── user.ts
│   │   │   │   ├── admin.ts
│   │   │   │   ├── course.ts
│   │   │   │   ├── resource.ts
│   │   │   │   ├── article.ts
│   │   │   │   └── timetable.ts
│   │   │   ├── root.ts      # Main tRPC router
│   │   │   └── trpc.ts      # tRPC configuration
│   │   ├── auth/            # NextAuth configuration
│   │   │   ├── config.ts
│   │   │   └── index.ts
│   │   └── db.ts            # Prisma client
│   ├── trpc/                # tRPC client setup
│   │   ├── react.tsx        # Client-side tRPC
│   │   └── server.ts        # Server-side tRPC
│   ├── lib/                 # Utility libraries
│   │   └── email.ts         # Email service (Nodemailer)
│   ├── hooks/               # Custom React hooks
│   ├── styles/              # Global styles
│   │   └── globals.css
│   └── env.js               # Environment variable validation
├── middleware.ts            # Route protection middleware
└── package.json
```

### tRPC Architecture

**Dual-Mode Setup:**

1. **Server-side (RSC):**
   - File: `src/trpc/server.ts`
   - Usage: `await api.course.getAll()`
   - Uses `createCaller` pattern

2. **Client-side:**
   - File: `src/trpc/react.tsx`
   - Usage: `api.course.getAll.useQuery()`
   - Wrapped with `TRPCReactProvider`

**Core Files:**
- `src/server/api/trpc.ts` - Context, middleware, procedure definitions
- `src/server/api/root.ts` - Main router combining all sub-routers
- `src/server/api/routers/*` - Feature-specific routers

**Procedures:**
- `publicProcedure` - No authentication required
- `protectedProcedure` - Requires authentication (ctx.session.user guaranteed)
- `adminProcedure` - Requires ADMIN role (custom middleware)

---

## Database Schema

### Overview
- **Database:** PostgreSQL (NeonDB)
- **ORM:** Prisma
- **Total Models:** 17 models
- **Key Features:** User roles, course collaboration, real-time notes, timetable sharing, article publishing

### User Management

#### User Table
```prisma
model User {
  id           String    # CUID primary key
  name         String
  email        String    @unique
  password     String    # Bcrypt hashed
  profileImage String?
  role         Role      @default(PENDING)
  universityId String
  facultyId    String
  studentIdUrl String    # UploadThing URL
  approvedAt   DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}
```

**Fields:**
- `id`: String (CUID) - Primary key
- `name`: String - User's full name
- `email`: String (unique) - Login identifier
- `password`: String - Bcrypt hashed password
- `profileImage`: String? - Avatar URL
- `role`: Role (PENDING/APPROVED/ADMIN) - User access level
- `universityId`: String - Foreign key to University
- `facultyId`: String - Foreign key to Faculty
- `studentIdUrl`: String - UploadThing URL for verification
- `approvedAt`: DateTime? - When admin approved
- `createdAt/updatedAt`: Timestamps

**Relationships:**
- `university` → University
- `faculty` → Faculty
- `accounts` → Account[] (NextAuth)
- `sessions` → Session[] (NextAuth)
- `courses` → Course[] (owned)
- `courseCollaborations` → CourseCollaborator[]
- `timetables` → Timetable[] (owned)
- `timetableCollaborations` → TimetableCollaborator[]
- `events` → Event[]
- `articles` → Article[]
- `favorites` → Favorite[]

**Indexes:**
- `email` (unique)
- `role`
- `facultyId`

#### Role Enum
```prisma
enum Role {
  ADMIN      # Full system access
  APPROVED   # Verified student
  PENDING    # Awaiting approval
}
```

#### University Table
```prisma
model University {
  id        String   @id @default(cuid())
  name      String   @unique
  faculties Faculty[]
  users     User[]
  createdAt DateTime @default(now())
}
```

#### Faculty Table
```prisma
model Faculty {
  id           String     @id @default(cuid())
  name         String
  universityId String
  university   University
  users        User[]
  createdAt    DateTime   @default(now())
}
```

### NextAuth Models

#### Account Table
```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String  # "credentials"
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User
}
```

#### Session Table
```prisma
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User
}
```

#### VerificationToken Table
```prisma
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
}
```

### Course Management

#### Course Table
```prisma
model Course {
  id          String   @id @default(cuid())
  title       String
  description String?
  color       String   @default("#3B82F6")  # Hex color
  createdBy   String
  creator     User
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Relationships:**
- `resources` → Resource[] (assignments, tasks, content, notes)
- `collaborators` → CourseCollaborator[]
- `notes` → Note[] (collaborative pages)
- `events` → Event[] (timetable entries)
- `favorites` → Favorite[]

**Auto-Created Resources:**
When a course is created, 4 predefined resource cards are automatically created:
1. Assignments (allows files)
2. Tasks (no files)
3. Content (allows files)
4. Notes (no files - links to collaborative editor)

#### CourseCollaborator Table
```prisma
model CourseCollaborator {
  id        String             @id @default(cuid())
  courseId  String
  userId    String
  role      CollaboratorRole   @default(VIEWER)
  status    CollaboratorStatus @default(PENDING)
  invitedAt DateTime           @default(now())
  joinedAt  DateTime?
}
```

**Unique Constraint:** `courseId + userId`

**Enums:**
```prisma
enum CollaboratorRole {
  VIEWER      # Can view and download
  CONTRIBUTOR # Can add but not delete
}

enum CollaboratorStatus {
  PENDING  # Invited but not accepted
  ACCEPTED # Accepted invitation
  REJECTED # Rejected invitation
}
```

#### Favorite Table
```prisma
model Favorite {
  id        String   @id @default(cuid())
  userId    String
  courseId  String
  createdAt DateTime @default(now())
}
```

**Unique Constraint:** `userId + courseId`

**Business Rule:** Only favorited courses can be added to timetables

### Resource Management

#### Resource Table
```prisma
model Resource {
  id          String       @id @default(cuid())
  title       String
  type        ResourceType
  description String?
  deadline    DateTime?
  fileUrls    String[]     # Array of UploadThing URLs
  allowFiles  Boolean      @default(true)
  courseId    String
  course      Course
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}
```

**Resource Types:**
```prisma
enum ResourceType {
  ASSIGNMENT  # Homework, projects
  TASK        # To-do items
  CONTENT     # Course materials
  NOTES       # Links to collaborative editor
  CUSTOM      # User-defined
}
```

**File Storage:**
- Files uploaded via UploadThing
- URLs stored in `fileUrls` array
- Multiple files per resource

### Collaborative Notes

#### Note Table
```prisma
model Note {
  id            String   @id @default(cuid())
  title         String   @default("Untitled")
  icon          String?  # Emoji (like Notion)
  courseId      String
  course        Course
  content       Json     @default("{}")
  liveblockRoom String   @unique  # Liveblocks room ID
  order         Int      @default(0)

  # Nested pages (Notion-style)
  parentId      String?
  parent        Note?
  children      Note[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**Features:**
- Multiple pages per course
- Nested pages (parent-child relationship)
- Real-time collaboration via Liveblocks
- Custom ordering
- Emoji icons
- BlockNote editor for rich text

**Indexes:**
- `courseId`
- `courseId + order` (for efficient ordering)
- `parentId` (for nested queries)

### Timetable System

#### Timetable Table
```prisma
model Timetable {
  id          String   @id @default(cuid())
  name        String   # "Fall 2024 Schedule"
  description String?
  createdBy   String
  creator     User
  events      Event[]
  collaborators TimetableCollaborator[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### TimetableCollaborator Table
```prisma
model TimetableCollaborator {
  id          String             @id @default(cuid())
  timetableId String
  userId      String
  role        CollaboratorRole   @default(VIEWER)
  status      CollaboratorStatus @default(PENDING)
  invitedAt   DateTime           @default(now())
  acceptedAt  DateTime?
}
```

**Unique Constraint:** `timetableId + userId`

**Sharing Roles:**
- VIEWER: Can see schedule but not edit
- CONTRIBUTOR: Can add/edit/delete events

#### Event Table
```prisma
model Event {
  id          String    @id @default(cuid())
  title       String
  timetableId String
  timetable   Timetable
  courseId    String    # Must be favorited
  course      Course
  dayOfWeek   Int       # 0=Sunday, 6=Saturday
  startTime   String    # "09:00" (HH:MM)
  endTime     String    # "11:00" (HH:MM)
  location    String?
  recurring   Boolean   @default(true)
  createdBy   String
  creator     User
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

**Business Rule:** Events can only be created for favorited courses

### Article/News System

#### Article Table
```prisma
model Article {
  id          String        @id @default(cuid())
  title       String
  slug        String        @unique  # URL-friendly
  excerpt     String?       # Short description
  coverImage  String?       # UploadThing URL
  content     Json          @default("{}")
  status      ArticleStatus @default(DRAFT)
  featured    Boolean       @default(false)
  views       Int           @default(0)
  readTime    Int?          # Calculated (words/200)
  authorId    String
  author      User
  tags        Tag[]
  publishedAt DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}
```

**Article Workflow:**
```
DRAFT → PUBLISHED → ARCHIVED
```

**Enums:**
```prisma
enum ArticleStatus {
  DRAFT      # Not visible publicly
  PUBLISHED  # Visible on public page
  ARCHIVED   # Hidden but not deleted
}
```

**Indexes:**
- `status + publishedAt` (for listing)
- `authorId`
- `slug` (unique)

#### Tag Table
```prisma
model Tag {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  articles  Article[]
  createdAt DateTime  @default(now())
}
```

**Features:**
- Auto-generated slugs
- Many-to-many with Articles
- Used for filtering

---

## API Endpoints (tRPC Routers)

### Router Structure

**Main Router:** `src/server/api/root.ts`
```typescript
export const appRouter = createTRPCRouter({
  user: userRouter,
  admin: adminRouter,
  course: courseRouter,
  resource: resourceRouter,
  article: articleRouter,
  timetable: timetableRouter,
});
```

### User Router (`user.ts`)

#### `user.register` (Public)
**Type:** Mutation
**Auth:** Public
**Input:**
```typescript
{
  name: string (min: 2),
  email: string (email),
  password: string (min: 8, must contain uppercase, lowercase, number),
  universityId: string,
  facultyId: string,
  studentIdUrl: string (url)
}
```
**Response:**
```typescript
{
  success: boolean,
  message: string,
  userId: string
}
```
**Logic:**
1. Check if user exists
2. Hash password (bcrypt, rounds: 12)
3. Create user with role: PENDING
4. Send welcome email
5. Return success message

**File:** `src/server/api/routers/user.ts:16-77`

#### `user.getUniversities` (Public)
**Type:** Query
**Auth:** Public
**Input:** None
**Response:**
```typescript
University[] {
  id: string,
  name: string,
  faculties: Faculty[] {
    id: string,
    name: string
  }
}
```
**Usage:** Registration form dropdown
**File:** `src/server/api/routers/user.ts:83-94`

#### `user.getProfile` (Protected)
**Type:** Query
**Auth:** Required
**Input:** None
**Response:**
```typescript
User {
  id: string,
  name: string,
  email: string,
  role: Role,
  university: University,
  faculty: Faculty,
  // password excluded
}
```
**File:** `src/server/api/routers/user.ts:100-117`

#### `user.updateProfile` (Protected)
**Type:** Mutation
**Auth:** Required
**Input:**
```typescript
{
  name?: string (min: 2),
  profileImage?: string (url)
}
```
**File:** `src/server/api/routers/user.ts:123-140`

### Admin Router (`admin.ts`)

**All procedures require ADMIN role via `adminProcedure` middleware**

#### `admin.getPendingUsers` (Admin Only)
**Type:** Query
**Auth:** Admin
**Input:** None
**Response:**
```typescript
User[] {
  id: string,
  name: string,
  email: string,
  role: "PENDING",
  university: University,
  faculty: Faculty,
  studentIdUrl: string,
  createdAt: DateTime
}
```
**File:** `src/server/api/routers/admin.ts:30-42`

#### `admin.getAllUsers` (Admin Only)
**Type:** Query
**Auth:** Admin
**Response:**
```typescript
User[] {
  ...,
  _count: {
    courses: number,
    articles: number
  }
}
```
**File:** `src/server/api/routers/admin.ts:48-65`

#### `admin.approveUser` (Admin Only)
**Type:** Mutation
**Auth:** Admin
**Input:**
```typescript
{
  userId: string
}
```
**Logic:**
1. Verify user exists and is PENDING
2. Update role to APPROVED
3. Set approvedAt timestamp
4. Send approval email
**File:** `src/server/api/routers/admin.ts:71-119`

#### `admin.rejectUser` (Admin Only)
**Type:** Mutation
**Auth:** Admin
**Input:**
```typescript
{
  userId: string,
  reason?: string
}
```
**Logic:**
1. Verify user exists and is PENDING
2. Send rejection email (with reason)
3. Delete user from database
**File:** `src/server/api/routers/admin.ts:125-169`

#### `admin.getDashboardStats` (Admin Only)
**Type:** Query
**Auth:** Admin
**Response:**
```typescript
{
  totalUsers: number,
  pendingUsers: number,
  approvedUsers: number,
  adminUsers: number,
  totalCourses: number,
  totalArticles: number
}
```
**File:** `src/server/api/routers/admin.ts:175-200`

### Course Router (`course.ts`)

#### `course.create` (Protected)
**Type:** Mutation
**Auth:** Required
**Input:**
```typescript
{
  title: string (min: 1, max: 100),
  description?: string (max: 500),
  color: string (hex: /^#[0-9A-F]{6}$/i)
}
```
**Logic:**
1. Create course
2. Auto-create 4 resource cards:
   - Assignments (allows files)
   - Tasks (no files)
   - Content (allows files)
   - Notes (no files)
**Response:** Course with resources
**File:** `src/server/api/routers/course.ts:18-68`

#### `course.getAll` (Protected)
**Type:** Query
**Auth:** Required
**Response:**
```typescript
{
  owned: Course[],      // Created by user
  shared: Course[]      // Shared with user (ACCEPTED)
}
```
**File:** `src/server/api/routers/course.ts:74-130`

#### `course.getById` (Protected)
**Type:** Query
**Auth:** Required
**Input:**
```typescript
{
  id: string
}
```
**Response:**
```typescript
Course {
  ...,
  resources: Resource[],
  creator: User,
  collaborators: CourseCollaborator[],
  userRole: "OWNER" | "CONTRIBUTOR" | "VIEWER",
  isFavorite: boolean
}
```
**Authorization:** Owner or accepted collaborator
**File:** `src/server/api/routers/course.ts:136-214`

#### `course.update` (Protected)
**Type:** Mutation
**Auth:** Required (Owner only)
**Input:**
```typescript
{
  id: string,
  title?: string (min: 1, max: 100),
  description?: string (max: 500),
  color?: string (hex)
}
```
**File:** `src/server/api/routers/course.ts:220-263`

#### `course.delete` (Protected)
**Type:** Mutation
**Auth:** Required (Owner only)
**Input:**
```typescript
{
  id: string
}
```
**Logic:** Cascade deletes resources and collaborators
**File:** `src/server/api/routers/course.ts:270-301`

#### `course.toggleFavorite` (Protected)
**Type:** Mutation
**Auth:** Required
**Input:**
```typescript
{
  courseId: string
}
```
**Response:**
```typescript
{
  favorited: boolean
}
```
**File:** `src/server/api/routers/course.ts:306-342`

#### `course.getFavorites` (Protected)
**Type:** Query
**Auth:** Required
**Response:** Course[]
**File:** `src/server/api/routers/course.ts:347-366`

#### `course.getUserCourses` (Protected)
**Type:** Query
**Auth:** Required
**Response:**
```typescript
Course[] {
  ...,
  role: "OWNER" | "CONTRIBUTOR" | "VIEWER",
  isFavorited: boolean
}
```
**Usage:** Dashboard stats
**File:** `src/server/api/routers/course.ts:372-445`

### Resource Router (`resource.ts`)

#### `resource.create` (Protected)
**Type:** Mutation
**Auth:** Required (Owner or Contributor)
**Input:**
```typescript
{
  courseId: string,
  title: string (min: 1, max: 100),
  description?: string (max: 500),
  type: "CUSTOM",
  allowFiles: boolean,
  deadline?: Date
}
```
**File:** `src/server/api/routers/resource.ts:14-72`

#### `resource.update` (Protected)
**Type:** Mutation
**Auth:** Required (Owner or Contributor)
**Input:**
```typescript
{
  id: string,
  title?: string,
  description?: string,
  deadline?: Date | null,
  fileUrls?: string[]
}
```
**File:** `src/server/api/routers/resource.ts:78-134`

#### `resource.delete` (Protected)
**Type:** Mutation
**Auth:** Required (Owner only - not contributors)
**Input:**
```typescript
{
  id: string
}
```
**File:** `src/server/api/routers/resource.ts:140-178`

#### `resource.addFile` (Protected)
**Type:** Mutation
**Auth:** Required (Owner or Contributor)
**Input:**
```typescript
{
  resourceId: string,
  fileUrl: string (url)
}
```
**Logic:**
1. Verify resource allows files
2. Check permissions
3. Push URL to fileUrls array
**File:** `src/server/api/routers/resource.ts:184-248`

#### `resource.removeFile` (Protected)
**Type:** Mutation
**Auth:** Required (Owner or Contributor)
**Input:**
```typescript
{
  resourceId: string,
  fileUrl: string (url)
}
```
**File:** `src/server/api/routers/resource.ts:253-312`

### Article Router (`article.ts`)

#### `article.create` (Protected)
**Type:** Mutation
**Auth:** Required
**Input:**
```typescript
{
  title: string (min: 1, max: 200),
  excerpt?: string (max: 500),
  coverImage?: string (url),
  content: any (JSON),
  tags?: string[]
}
```
**Logic:**
1. Generate unique slug from title
2. Create/find tags
3. Calculate read time (words/200)
4. Create article with status: DRAFT
**File:** `src/server/api/routers/article.ts:39-115`

#### `article.update` (Protected)
**Type:** Mutation
**Auth:** Required (Author only)
**Input:**
```typescript
{
  id: string,
  title?: string,
  excerpt?: string,
  coverImage?: string,
  content?: any,
  tags?: string[]
}
```
**File:** `src/server/api/routers/article.ts:121-225`

#### `article.publish` (Protected)
**Type:** Mutation
**Auth:** Required (Author only)
**Input:**
```typescript
{
  id: string
}
```
**Logic:** DRAFT → PUBLISHED, set publishedAt
**File:** `src/server/api/routers/article.ts:230-283`

#### `article.archive` (Protected)
**Type:** Mutation
**Auth:** Required (Author only)
**Input:**
```typescript
{
  id: string
}
```
**File:** `src/server/api/routers/article.ts:288-333`

#### `article.delete` (Protected)
**Type:** Mutation
**Auth:** Required (Author only)
**File:** `src/server/api/routers/article.ts:338-369`

#### `article.getAllPublished` (Public)
**Type:** Query
**Auth:** Public
**Input:**
```typescript
{
  page?: number (min: 1, default: 1),
  limit?: number (min: 1, max: 50, default: 12),
  tagSlug?: string,
  search?: string,
  featured?: boolean
}
```
**Response:**
```typescript
{
  articles: Article[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```
**File:** `src/server/api/routers/article.ts:374-465`

#### `article.getMyArticles` (Protected)
**Type:** Query
**Auth:** Required
**Input:**
```typescript
{
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED"
}
```
**Response:** Article[]
**File:** `src/server/api/routers/article.ts:470-504`

#### `article.getBySlug` (Public)
**Type:** Query
**Auth:** Public (but checks author for non-published)
**Input:**
```typescript
{
  slug: string
}
```
**Response:**
```typescript
Article {
  ...,
  isAuthor: boolean
}
```
**Authorization:** Public for PUBLISHED, author-only for DRAFT/ARCHIVED
**File:** `src/server/api/routers/article.ts:510-550`

#### `article.incrementViews` (Public)
**Type:** Mutation
**Auth:** Public
**Input:**
```typescript
{
  slug: string
}
```
**File:** `src/server/api/routers/article.ts:555-577`

#### `article.getAllTags` (Public)
**Type:** Query
**Auth:** Public
**Response:** Tag[] (only tags with published articles)
**File:** `src/server/api/routers/article.ts:582-601`

### Timetable Router (`timetable.ts`)

#### `timetable.create` (Protected)
**Type:** Mutation
**Auth:** Required
**Input:**
```typescript
{
  name: string (min: 1, max: 100),
  description?: string (max: 500)
}
```
**File:** `src/server/api/routers/timetable.ts:13-30`

#### `timetable.getUserTimetables` (Protected)
**Type:** Query
**Auth:** Required
**Response:**
```typescript
{
  owned: Timetable[],
  shared: Timetable[]
}
```
**File:** `src/server/api/routers/timetable.ts:35-117`

#### `timetable.getById` (Protected)
**Type:** Query
**Auth:** Required (Owner or accepted collaborator)
**Input:**
```typescript
{
  id: string
}
```
**Response:**
```typescript
Timetable {
  ...,
  userRole: "OWNER" | "VIEWER" | "CONTRIBUTOR"
}
```
**File:** `src/server/api/routers/timetable.ts:122-183`

#### `timetable.update` (Protected)
**Type:** Mutation
**Auth:** Required (Owner only)
**File:** `src/server/api/routers/timetable.ts:188-227`

#### `timetable.delete` (Protected)
**Type:** Mutation
**Auth:** Required (Owner only)
**File:** `src/server/api/routers/timetable.ts:232-261`

#### `timetable.inviteCollaborator` (Protected)
**Type:** Mutation
**Auth:** Required (Owner only)
**Input:**
```typescript
{
  timetableId: string,
  userId: string,
  role: "VIEWER" | "CONTRIBUTOR"
}
```
**Logic:**
1. Verify ownership
2. Can't invite yourself
3. Check if already invited
4. Create invitation with status: PENDING
**File:** `src/server/api/routers/timetable.ts:266-348`

#### `timetable.acceptInvitation` (Protected)
**Type:** Mutation
**Auth:** Required
**Input:**
```typescript
{
  timetableId: string
}
```
**File:** `src/server/api/routers/timetable.ts:353-373`

#### `timetable.rejectInvitation` (Protected)
**Type:** Mutation
**Auth:** Required
**File:** `src/server/api/routers/timetable.ts:378-397`

#### `timetable.getPendingInvitations` (Protected)
**Type:** Query
**Auth:** Required
**Response:** TimetableCollaborator[] (status: PENDING)
**File:** `src/server/api/routers/timetable.ts:402-433`

#### `timetable.searchUsers` (Protected)
**Type:** Query
**Auth:** Required
**Input:**
```typescript
{
  query: string (min: 3),
  timetableId: string
}
```
**Response:** User[] (approved, excluding owner/existing collaborators)
**File:** `src/server/api/routers/timetable.ts:438-488`

#### `timetable.createEvent` (Protected)
**Type:** Mutation
**Auth:** Required (Owner or Contributor)
**Input:**
```typescript
{
  timetableId: string,
  courseId: string,  // Must be favorited
  title: string (min: 1, max: 100),
  dayOfWeek: number (0-6),
  startTime: string (HH:MM),
  endTime: string (HH:MM),
  location?: string (max: 100)
}
```
**Logic:**
1. Check permissions (Owner/Contributor)
2. Verify course is favorited by user
3. Create event with recurring: true
**File:** `src/server/api/routers/timetable.ts:493-573`

#### `timetable.updateEvent` (Protected)
**Type:** Mutation
**Auth:** Required (Owner or Contributor)
**File:** `src/server/api/routers/timetable.ts:578-640`

#### `timetable.deleteEvent` (Protected)
**Type:** Mutation
**Auth:** Required (Owner or Contributor)
**File:** `src/server/api/routers/timetable.ts:645-688`

---

## Pages and Routes

### Route Groups

**Route groups in Next.js 15:**
- `(admin)` - Admin-only routes
- `(student)` - Student routes (APPROVED/ADMIN)
- `(auth)` - Authentication routes (public)

### Route Protection (Middleware)

**File:** `middleware.ts`

**Public Routes:**
- `/` - Landing page
- `/login` - Login page
- `/signup` - Registration page
- `/articles` - Public article listing
- `/articles/[slug]` - Public article view

**Protected Routes:**

1. **Admin Routes** (`/admin/*`)
   - **Access:** ADMIN role only
   - **Redirect:** Non-admin → `/courses`

2. **Student Routes** (`/courses/*`, `/timetable/*`, `/my-articles/*`)
   - **Access:** APPROVED or ADMIN
   - **Redirect:** PENDING → `/waiting-approval`, Unauthenticated → `/login`

3. **Auth Routes** (`/login`, `/signup`)
   - **Redirect:** Authenticated → `/courses` or `/waiting-approval` (if PENDING)

**Middleware Logic:**
```typescript
// middleware.ts:13-68
export default auth((req) => {
  const session = req.auth;
  const path = req.nextUrl.pathname;

  // Public routes
  const publicRoutes = ["/login", "/signup", "/", "/articles"];

  // Check authentication
  if (!session && !isPublicRoute) {
    return NextResponse.redirect("/login");
  }

  // Role-based redirects
  if (session?.user) {
    // Admin routes
    if (path.startsWith("/admin") && session.user.role !== "ADMIN") {
      return NextResponse.redirect("/courses");
    }

    // Student routes
    if (session.user.role === "PENDING") {
      return NextResponse.redirect("/waiting-approval");
    }
  }
});
```

### Page Inventory

#### Public Pages

1. **Landing Page**
   - Path: `/`
   - File: `src/app/page.tsx`
   - Access: Public
   - Description: Marketing/landing page

2. **Login Page**
   - Path: `/login`
   - File: `src/app/(auth)/login/page.tsx`
   - Access: Public
   - Features: Email/password login

3. **Signup Page**
   - Path: `/signup`
   - File: `src/app/(auth)/signup/page.tsx`
   - Access: Public
   - Features: User registration with student ID upload

4. **Waiting Approval**
   - Path: `/waiting-approval`
   - File: `src/app/(auth)/waiting-approval/page.tsx`
   - Access: PENDING users only
   - Description: Displayed after registration

5. **Public Articles**
   - Path: `/articles`
   - File: `src/app/articles/page.tsx`
   - Access: Public
   - Features: Paginated list, search, tag filtering

6. **Article View**
   - Path: `/articles/[slug]`
   - File: `src/app/articles/[slug]/page.tsx`
   - Access: Public (published only)
   - Features: View article, increment views

#### Admin Pages (ADMIN only)

7. **Admin Dashboard**
   - Path: `/admin`
   - File: `src/app/(admin)/admin/page.tsx`
   - Access: ADMIN only
   - Features: Stats overview

8. **User Approvals**
   - Path: `/admin/approvals`
   - File: `src/app/(admin)/admin/approvals/page.tsx`
   - Access: ADMIN only
   - Features: Approve/reject pending users, view student IDs

#### Student Pages (APPROVED/ADMIN)

9. **Courses Dashboard**
   - Path: `/courses`
   - File: `src/app/(student)/courses/page.tsx`
   - Access: APPROVED/ADMIN
   - Features: Course list, stats, create new course
   - Components: CourseList, TimetableInvitations

10. **Create Course**
    - Path: `/courses/new`
    - File: `src/app/(student)/courses/new/page.tsx`
    - Access: APPROVED/ADMIN
    - Features: Course creation form

11. **Course Detail**
    - Path: `/courses/[id]`
    - File: `src/app/(student)/courses/[id]/page.tsx`
    - Access: Owner or accepted collaborator
    - Features: View resources, manage course

12. **Course Settings**
    - Path: `/courses/[id]/settings`
    - File: `src/app/(student)/courses/[id]/settings/page.tsx`
    - Access: Owner only
    - Features: Edit course, delete course

13. **Course Collaborators**
    - Path: `/courses/[id]/collaborators`
    - File: `src/app/(student)/courses/[id]/collaborators/page.tsx`
    - Access: Owner only
    - Features: Invite users, manage roles

14. **Collaborative Notes**
    - Path: `/courses/[id]/notes/[[...pageId]]`
    - File: `src/app/(student)/courses/[id]/notes/[[...pageId]]/page.tsx`
    - Access: Owner or accepted collaborator
    - Features: Real-time collaborative editing with BlockNote + Liveblocks

15. **Timetable**
    - Path: `/timetable`
    - File: `src/app/(student)/timetable/page.tsx`
    - Access: APPROVED/ADMIN
    - Features: Calendar view (react-big-calendar), create events, share timetable

16. **My Articles**
    - Path: `/my-articles`
    - File: `src/app/(student)/my-articles/page.tsx`
    - Access: APPROVED/ADMIN
    - Features: List user's articles (all statuses)

17. **Create Article**
    - Path: `/my-articles/new`
    - File: `src/app/(student)/my-articles/new/page.tsx`
    - Access: APPROVED/ADMIN
    - Features: BlockNote editor, tags, cover image

18. **Edit Article**
    - Path: `/my-articles/[id]/edit`
    - File: `src/app/(student)/my-articles/[id]/edit/page.tsx`
    - Access: Author only
    - Features: Edit, publish, archive, delete

### Layouts

1. **Root Layout**
   - File: `src/app/layout.tsx`
   - Features: TRPCReactProvider, ThemeProvider, UploadThing SSR plugin

2. **Admin Layout**
   - File: `src/app/(admin)/layout.tsx`
   - Features: Admin-specific navigation

3. **Student Layout**
   - File: `src/app/(student)/layout.tsx`
   - Features: Student navigation, sidebar

---

## Authentication & Authorization

### NextAuth.js v5 Configuration

**Strategy:** JWT (not database sessions)
**Provider:** Credentials (email + password)
**File:** `src/server/auth/config.ts`

#### Session Extension

```typescript
// Module augmentation
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role;
      facultyId: string;
      universityId: string;
    } & DefaultSession["user"];
  }
}
```

#### Login Flow

1. **User submits credentials**
   - Email + password

2. **Authorize function** (`src/server/auth/config.ts:58-93`)
   - Find user by email
   - Verify password (bcryptjs compare)
   - Return user object

3. **JWT Callback** (`src/server/auth/config.ts:97-104`)
   - Store id, role, facultyId, universityId in token

4. **Session Callback** (`src/server/auth/config.ts:106-113`)
   - Add custom fields to session

5. **Redirect to dashboard**
   - PENDING → `/waiting-approval`
   - APPROVED/ADMIN → `/courses`

#### Registration Flow

1. **User submits registration** (`user.register` mutation)
   - Personal info + student ID
   - Password requirements:
     - Min 8 characters
     - 1 uppercase, 1 lowercase, 1 number

2. **Create user with role: PENDING**

3. **Send welcome email** (Nodemailer)
   - Subject: "Welcome to UNIShare - Registration Received"
   - Content: Approval pending message

4. **User can log in but has limited access**
   - Redirected to `/waiting-approval`

#### Admin Approval Flow

1. **Admin views pending users** (`/admin/approvals`)
   - List of PENDING users
   - View student ID images

2. **Admin approves user** (`admin.approveUser` mutation)
   - Update role: PENDING → APPROVED
   - Set approvedAt timestamp
   - Send approval email

3. **User receives email**
   - Subject: "🎉 Your UNIShare Account Has Been Approved!"
   - Link to dashboard

4. **User logs in**
   - Full access to student routes

#### Admin Rejection Flow

1. **Admin rejects user** (`admin.rejectUser` mutation)
   - Optional rejection reason

2. **Send rejection email**

3. **Delete user from database**
   - Cascade deletes accounts, sessions

### Authorization Patterns

#### 1. Public Procedures
```typescript
publicProcedure
  .input(z.object({ ... }))
  .query(async ({ ctx, input }) => {
    // No session required
    // ctx.session may be null
  });
```

#### 2. Protected Procedures
```typescript
protectedProcedure
  .input(z.object({ ... }))
  .mutation(async ({ ctx, input }) => {
    // ctx.session.user is guaranteed
    const userId = ctx.session.user.id;
  });
```

#### 3. Admin Procedures
```typescript
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next();
});
```

#### 4. Ownership Checks
```typescript
// Verify user owns resource
const course = await ctx.db.course.findUnique({
  where: { id: input.id }
});

if (course.createdBy !== ctx.session.user.id) {
  throw new TRPCError({ code: "FORBIDDEN" });
}
```

#### 5. Collaboration Checks
```typescript
// Check if user is owner or collaborator
const isOwner = course.createdBy === userId;
const isCollaborator = course.collaborators.some(
  c => c.userId === userId && c.status === "ACCEPTED"
);

if (!isOwner && !isCollaborator) {
  throw new TRPCError({ code: "FORBIDDEN" });
}
```

---

## Features Implementation

### 1. User Registration & Approval System

**Workflow:** Registration → Pending Approval → Admin Review → Email Notification

**Files:**
- `src/server/api/routers/user.ts` - Registration mutation
- `src/server/api/routers/admin.ts` - Approval/rejection mutations
- `src/lib/email.ts` - Email service
- `src/app/(auth)/signup/page.tsx` - Registration form
- `src/app/(admin)/admin/approvals/page.tsx` - Admin approval page

**User Flow:**
1. User visits `/signup`
2. Fills form (name, email, password, university, faculty)
3. Uploads student ID (UploadThing)
4. Submits registration
5. System creates user with role: PENDING
6. Sends welcome email
7. User redirected to `/waiting-approval`
8. Admin reviews in `/admin/approvals`
9. Admin approves/rejects
10. System sends approval/rejection email
11. If approved, user can access `/courses`

**Key Code:**
```typescript
// user.register mutation
const hashedPassword = await hash(input.password, 12);
const user = await ctx.db.user.create({
  data: {
    ...input,
    password: hashedPassword,
    role: "PENDING"
  }
});
await sendWelcomeEmail(user.email, user.name);
```

### 2. Course Management

**Features:**
- Create courses with custom colors
- Auto-create 4 resource cards
- Share with collaborators (VIEWER/CONTRIBUTOR)
- Favorite courses
- View owned + shared courses

**Files:**
- `src/server/api/routers/course.ts` - Course CRUD
- `src/components/courses/course-list.tsx` - Course listing
- `src/components/courses/course-card.tsx` - Course card UI
- `src/components/courses/course-form.tsx` - Create/edit form
- `src/app/(student)/courses/page.tsx` - Courses dashboard
- `src/app/(student)/courses/[id]/page.tsx` - Course detail

**Create Course Flow:**
1. User clicks "Create New Course" on `/courses`
2. Fills form (title, description, color)
3. Submits form
4. System creates course
5. Auto-creates 4 resource cards:
   - Assignments (type: ASSIGNMENT, allowFiles: true)
   - Tasks (type: TASK, allowFiles: false)
   - Content (type: CONTENT, allowFiles: true)
   - Notes (type: NOTES, allowFiles: false)
6. Redirects to course detail page

**Collaboration Flow:**
1. Owner goes to `/courses/[id]/collaborators`
2. Searches for user by email/name
3. Selects role (VIEWER/CONTRIBUTOR)
4. Sends invitation (status: PENDING)
5. Invitee sees invitation (notification UI)
6. Invitee accepts/rejects
7. If accepted, invitee can access course

**Permissions:**
- **Owner:** Full control (edit, delete, invite, manage resources)
- **Contributor:** Can add resources, add files, edit resources
- **Viewer:** Read-only access

### 3. Resource Cards

**Features:**
- Predefined types (Assignments, Tasks, Content, Notes)
- Custom resource cards
- File uploads (multiple files per resource)
- Deadlines

**Files:**
- `src/server/api/routers/resource.ts` - Resource CRUD
- `src/components/resources/resource-card.tsx` - Resource UI
- `src/components/resources/resource-form.tsx` - Create/edit form
- `src/components/resources/file-upload-modal.tsx` - File upload

**Resource Card Flow:**
1. User opens course detail page
2. Sees 4 predefined resource cards
3. Can create custom resource card
4. Can add files to resource (if allowFiles: true)
5. Files uploaded via UploadThing
6. URLs stored in fileUrls array

**File Upload Flow:**
1. User clicks "Upload File" on resource card
2. Modal opens with file dropzone
3. User selects file(s)
4. UploadThing uploads to cloud storage
5. Returns file URL(s)
6. System calls `resource.addFile` mutation
7. URL pushed to fileUrls array

### 4. Collaborative Notes (Notion-like)

**Features:**
- Multiple pages per course
- Nested pages (parent-child)
- Real-time collaboration (Liveblocks + Yjs)
- Rich text editing (BlockNote)
- Custom ordering
- Emoji icons

**Files:**
- `src/server/api/routers/note.ts` - Note CRUD (if exists)
- `src/components/notes/collaborative-editor-wrapper.tsx` - Editor wrapper
- `src/components/notes/collaborative-editor.tsx` - BlockNote editor
- `src/components/notes/liveblocks-provider.tsx` - Liveblocks provider
- `src/components/notes/notes-sidebar.tsx` - Page navigation
- `src/app/(student)/courses/[id]/notes/[[...pageId]]/page.tsx` - Notes page

**Collaborative Editing Flow:**
1. User navigates to `/courses/[id]/notes`
2. System creates/fetches Liveblocks room
3. User joins room (authenticated via `/api/liveblocks-auth`)
4. BlockNote editor loads with Yjs provider
5. Real-time sync with other users
6. Changes saved to Prisma on blur/timer

**Architecture:**
```
Liveblocks (real-time sync)
    ↓
Yjs (CRDT for conflict resolution)
    ↓
BlockNote (rich text editor)
    ↓
Prisma (persistent storage)
```

**Key Integration:**
```typescript
// Liveblocks auth endpoint
// src/app/api/liveblocks-auth/route.ts
export async function POST(request: Request) {
  const session = await auth();
  const { room } = await request.json();

  // Authorize user for room
  const liveblocksSession = liveblocks.prepareSession(
    session.user.id,
    { userInfo: { name: session.user.name } }
  );

  // Check room permissions (course access)
  const authorized = await checkCourseAccess(room, session.user.id);

  return authorized;
}
```

### 5. Timetable System

**Features:**
- Create multiple timetables
- Weekly recurring events
- Only favorited courses can be added
- Share timetable (VIEWER/CONTRIBUTOR)
- Calendar view (react-big-calendar)

**Files:**
- `src/server/api/routers/timetable.ts` - Timetable CRUD
- `src/components/timetable/create-timetable-modal.tsx` - Create timetable
- `src/components/timetable/create-event-modal.tsx` - Create event
- `src/components/timetable/share-timetable-modal.tsx` - Share modal
- `src/components/timetable/timetable-invitations.tsx` - Invitation UI
- `src/app/(student)/timetable/page.tsx` - Timetable page

**Create Timetable Flow:**
1. User goes to `/timetable`
2. Clicks "Create Timetable"
3. Enters name and description
4. System creates timetable

**Add Event Flow:**
1. User clicks time slot on calendar
2. Modal opens
3. User selects course (dropdown shows only favorited courses)
4. Fills details (title, day, start/end time, location)
5. System validates course is favorited
6. Creates event with recurring: true

**Share Timetable Flow:**
1. Owner clicks "Share" on timetable
2. Searches for user
3. Selects role (VIEWER/CONTRIBUTOR)
4. Sends invitation
5. Invitee sees invitation in `/courses` (TimetableInvitations component)
6. Invitee accepts/rejects

**Business Rules:**
- Events can ONLY be created for favorited courses
- VIEWER: Can see events but not add/edit/delete
- CONTRIBUTOR: Can add/edit/delete events
- Owner: Full control

### 6. Article Publishing System

**Features:**
- Draft → Published → Archived workflow
- BlockNote editor
- Cover images
- Tags (filterable)
- Featured articles
- View counter
- Read time calculation
- Public listing with pagination

**Files:**
- `src/server/api/routers/article.ts` - Article CRUD
- `src/components/articles/article-editor.tsx` - Editor
- `src/components/articles/article-viewer.tsx` - Viewer
- `src/app/(student)/my-articles/page.tsx` - User's articles
- `src/app/(student)/my-articles/new/page.tsx` - Create article
- `src/app/(student)/my-articles/[id]/edit/page.tsx` - Edit article
- `src/app/articles/page.tsx` - Public listing
- `src/app/articles/[slug]/page.tsx` - Public view

**Create Article Flow:**
1. User goes to `/my-articles/new`
2. Fills title, excerpt, cover image
3. Adds tags (comma-separated)
4. Writes content in BlockNote editor
5. Saves as DRAFT
6. System generates slug from title
7. System calculates read time (word count / 200)
8. Article stored with status: DRAFT

**Publish Article Flow:**
1. User edits article
2. Clicks "Publish"
3. System updates status: DRAFT → PUBLISHED
4. Sets publishedAt timestamp
5. Article visible on `/articles`

**Public View Flow:**
1. Visitor goes to `/articles`
2. Sees paginated list of PUBLISHED articles
3. Can filter by tag
4. Can search by title/excerpt
5. Clicks article
6. System increments view count
7. Article displayed with author info, tags

**Tag System:**
- Tags auto-created on first use
- Slugified for URLs
- Many-to-many relationship
- Used for filtering

### 7. File Upload System (UploadThing)

**Used For:**
- Student ID verification
- Course resources
- Article cover images

**Files:**
- `src/app/api/uploadthing/core.ts` - UploadThing routes
- `src/components/resources/file-upload-modal.tsx` - Upload UI

**Upload Flow:**
1. User selects file
2. UploadThing validates file (type, size)
3. Uploads to cloud storage
4. Returns file URL
5. URL stored in database

**Security:**
- Authenticated uploads only
- File type restrictions
- Size limits
- Permission checks

---

## User Flows

### New User Registration & Approval

```
User                          System                        Admin
  │                             │                             │
  ├──► Visit /signup            │                             │
  ├──► Fill form                │                             │
  ├──► Upload student ID        │                             │
  ├──► Submit ──────────────────►                             │
  │                             ├──► Hash password            │
  │                             ├──► Create user (PENDING)    │
  │                             ├──► Send welcome email       │
  │◄─────────────────────────── │                             │
  ├──► Redirected to            │                             │
  │    /waiting-approval        │                             │
  │                             │                             │
  │                             │◄──── Admin views ───────────┤
  │                             │      /admin/approvals       │
  │                             │                             │
  │                             │      Admin reviews          │
  │                             │      student ID             │
  │                             │                             │
  │                             │◄──── Approve/Reject ────────┤
  │                             │                             │
  │                             ├──► Update role: APPROVED    │
  │                             ├──► Send approval email      │
  │◄──────── Email ──────────── │                             │
  │                             │                             │
  ├──► Login                    │                             │
  ├──► Access /courses ─────────►                             │
  │◄─────────────────────────── │                             │
```

### Course Creation & Collaboration

```
Owner                         System                    Collaborator
  │                             │                             │
  ├──► Create course            │                             │
  ├──► /courses/new ────────────►                             │
  │                             ├──► Create course            │
  │                             ├──► Auto-create 4 resources  │
  │◄─────────────────────────── │                             │
  │                             │                             │
  ├──► Invite collaborator      │                             │
  ├──► /courses/[id]/collaborators                            │
  ├──► Search user ─────────────►                             │
  │◄──── User list ──────────── │                             │
  ├──► Select user & role ──────►                             │
  │                             ├──► Create invitation        │
  │                             │     (status: PENDING)       │
  │                             │                             │
  │                             ├──────── Notification ───────►│
  │                             │                             │
  │                             │◄──── Accept ────────────────┤
  │                             │                             │
  │                             ├──► Update status: ACCEPTED  │
  │                             │                             │
  │                             │      Collaborator can now   │
  │                             │      access course ─────────►│
```

### Collaborative Note Editing

```
User A                        Liveblocks              User B
  │                             │                       │
  ├──► Open note page           │                       │
  ├──► /courses/[id]/notes      │                       │
  ├──► Auth ─────────────────────►                       │
  │◄──── Join room ─────────────┤                       │
  │                             │                       │
  ├──► Type "Hello" ────────────►                       │
  │                             ├──── Broadcast ────────►│
  │                             │                       │
  │                             │◄──── Type "World" ────┤
  │◄──── Receive update ────────┤                       │
  │                             │                       │
  ├──► See "Hello World"        │   See "Hello World" ──┤
  │                             │                       │
  │     (Changes synced in real-time via Yjs CRDT)      │
  │                             │                       │
  │                             ├──► Save to Prisma     │
  │                             │     (on blur/timer)   │
```

### Timetable Event Creation

```
User                          System
  │                             │
  ├──► View /timetable          │
  ├──► Click time slot ─────────►
  │◄──── Modal opens ───────────┤
  │                             │
  ├──► Select course ───────────►
  │                             ├──► Fetch favorited courses
  │◄──── Course dropdown ───────┤
  │                             │
  ├──► Fill event details ──────►
  │                             │
  ├──► Submit ──────────────────►
  │                             ├──► Validate course is favorited
  │                             ├──► Create event
  │◄──── Event created ─────────┤
  │                             │
  ├──► See event on calendar    │
```

### Article Publishing

```
Author                        System                    Public Visitor
  │                             │                             │
  ├──► Create article           │                             │
  ├──► /my-articles/new ────────►                             │
  │                             ├──► Create (status: DRAFT)   │
  │◄─────────────────────────── │                             │
  │                             │                             │
  ├──► Edit article             │                             │
  ├──► Add tags, cover ─────────►                             │
  │                             ├──► Save changes             │
  │                             │                             │
  ├──► Click "Publish" ─────────►                             │
  │                             ├──► Update status: PUBLISHED │
  │                             ├──► Set publishedAt          │
  │◄─────────────────────────── │                             │
  │                             │                             │
  │                             │◄──── Visit /articles ───────┤
  │                             │                             │
  │                             ├──── Article visible ────────►│
  │                             │                             │
  │                             │◄──── Click article ─────────┤
  │                             │                             │
  │                             ├──► Increment views          │
  │                             ├──── Show article ───────────►│
```

---

## Component Hierarchy

### UI Components (`src/components/ui/`)

**Base Components (Shadcn/Radix):**
- Accordion, Alert, Avatar, Badge, Button, Card, Checkbox
- Dialog, Dropdown, Form, Input, Label, Select, Table, Tabs
- Tooltip, Popover, Sheet, Drawer, etc.

**Usage:** Imported and composed in feature components

### Feature Components

#### Course Components (`src/components/courses/`)

```
CourseList (Server Component)
├── CourseCard (Client Component)
│   ├── Card (UI)
│   ├── Badge (UI)
│   ├── Button (UI)
│   └── Dropdown (UI)
└── EmptyCourses (fallback)
    └── Button (UI)

CourseForm (Client Component)
├── Form (react-hook-form)
├── Input (UI)
├── Textarea (UI)
├── Button (UI)
└── ColorPicker (custom)
```

#### Resource Components (`src/components/resources/`)

```
ResourceCard (Client Component)
├── Card (UI)
├── Badge (UI)
├── Button (UI)
├── FileUploadModal
│   ├── Dialog (UI)
│   ├── UploadDropzone (UploadThing)
│   └── Button (UI)
└── ResourceForm
    ├── Form (react-hook-form)
    ├── Input (UI)
    ├── Textarea (UI)
    ├── Switch (UI)
    └── DatePicker (UI)
```

#### Notes Components (`src/components/notes/`)

```
CollaborativeNotesRoom (Server Component)
└── LiveblocksProvider (Client Component)
    └── CollaborativeEditorWrapper (Client Component)
        └── CollaborativeEditor (Client Component)
            ├── BlockNote (editor)
            ├── useYjs (Liveblocks)
            └── Toolbar (BlockNote)

NotesSidebar (Client Component)
├── Accordion (UI)
├── Button (UI)
└── CreateNoteDialog
    ├── Dialog (UI)
    ├── Input (UI)
    └── EmojiPicker (custom)
```

#### Article Components (`src/components/articles/`)

```
ArticleEditor (Client Component)
├── BlockNote (editor)
├── Form (react-hook-form)
├── Input (UI)
├── Textarea (UI)
├── TagInput (custom)
└── ImageUpload (UploadThing)

ArticleViewer (Client Component)
├── BlockNote (readonly)
├── Avatar (UI)
├── Badge (UI - tags)
└── ShareButtons (custom)
```

#### Timetable Components (`src/components/timetable/`)

```
TimetableCalendar (Client Component)
├── Calendar (react-big-calendar)
├── CreateEventModal
│   ├── Dialog (UI)
│   ├── Form (react-hook-form)
│   ├── Select (UI - courses)
│   └── TimePicker (custom)
├── ShareTimetableModal
│   ├── Dialog (UI)
│   ├── UserSearch (custom)
│   └── RoleSelect (UI)
└── EventDetail
    ├── Sheet (UI)
    ├── Badge (UI)
    └── Button (UI)

TimetableInvitations (Server Component)
└── InvitationCard (Client Component)
    ├── Card (UI)
    ├── Avatar (UI)
    └── ButtonGroup (UI)
```

### State Management

**Approach:** No global state library (Redux/Zustand)

**State Patterns:**

1. **Server State (tRPC + React Query):**
   ```typescript
   const { data, isLoading } = api.course.getAll.useQuery();
   const mutation = api.course.create.useMutation();
   ```

2. **Form State (React Hook Form):**
   ```typescript
   const form = useForm<CourseForm>({
     resolver: zodResolver(courseSchema)
   });
   ```

3. **UI State (React useState):**
   ```typescript
   const [open, setOpen] = useState(false);
   const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
   ```

4. **Real-time State (Liveblocks):**
   ```typescript
   const { others, updateMyPresence } = useOthers();
   const [content, setContent] = useLiveBlocksYjs();
   ```

---

## Integration Points

### 1. Liveblocks (Real-time Collaboration)

**Purpose:** Real-time collaborative editing for notes

**Setup:**
- Public key: Client-side
- Secret key: Server-side (auth endpoint)

**Files:**
- `src/app/api/liveblocks-auth/route.ts` - Authentication
- `src/components/notes/liveblocks-provider.tsx` - Provider
- `src/components/notes/collaborative-editor.tsx` - Editor integration

**Authentication Flow:**
```typescript
// Server-side auth
const liveblocks = new Liveblocks({
  secret: env.LIVEBLOCKS_SECRET_KEY
});

const session = liveblocks.prepareSession(userId, {
  userInfo: {
    name: user.name,
    avatar: user.profileImage
  }
});

// Authorize room access (check course permissions)
session.allow(room, session.FULL_ACCESS);
```

**Key Features:**
- Presence (see who's online)
- Cursor positions
- Real-time text sync (via Yjs)
- Commenting (future)

**Documentation:** `docs/liveblocks+blacknote.md`

### 2. UploadThing (File Uploads)

**Purpose:** File uploads for student IDs, course resources, article images

**Setup:**
- Token: Server-side
- App ID: Server-side

**Files:**
- `src/app/api/uploadthing/core.ts` - Upload routes
- `src/app/api/uploadthing/route.ts` - API handler

**Upload Routes:**
```typescript
export const ourFileRouter = {
  // Student ID verification
  studentIdUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      // Public upload (for registration)
      return { userId: null };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),

  // Course resource files
  courseResourceUploader: f({
    image: { maxFileSize: "8MB" },
    pdf: { maxFileSize: "16MB" },
    video: { maxFileSize: "64MB" }
  })
    .middleware(async ({ req }) => {
      const session = await auth();
      if (!session) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Log upload
      return { url: file.url };
    }),
};
```

**Client Usage:**
```typescript
import { UploadDropzone } from "@uploadthing/react";

<UploadDropzone
  endpoint="courseResourceUploader"
  onClientUploadComplete={(res) => {
    const url = res[0].url;
    // Save to database
  }}
/>
```

### 3. Nodemailer (Email Service)

**Purpose:** Send emails for user approval/rejection

**Setup:**
- Gmail SMTP
- App password (not regular password)

**Files:**
- `src/lib/email.ts` - Email templates and sending logic

**Email Templates:**

1. **Welcome Email** (after registration)
   - Subject: "Welcome to UNIShare - Registration Received"
   - Content: Approval pending message
   - Function: `sendWelcomeEmail(email, name)`

2. **Approval Email**
   - Subject: "🎉 Your UNIShare Account Has Been Approved!"
   - Content: Account activated, link to dashboard
   - Function: `sendApprovalEmail(email, name, dashboardUrl)`

3. **Rejection Email**
   - Subject: "UNIShare Registration Update"
   - Content: Rejection reason, reapplication info
   - Function: `sendRejectionEmail(email, name, reason?)`

**Configuration:**
```typescript
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL_USER,      // your-email@gmail.com
    pass: env.EMAIL_APP_PASSWORD  // App password (not regular password)
  }
});
```

**Error Handling:**
- Emails sent asynchronously
- Failures logged but don't block operations
- Example: If welcome email fails, user is still created

### 4. BlockNote (Rich Text Editor)

**Purpose:** Rich text editing for articles and collaborative notes

**Setup:**
- Shadcn integration: `@blocknote/shadcn`
- React wrapper: `@blocknote/react`

**Features:**
- Markdown support
- Slash commands
- Drag & drop blocks
- Code blocks
- Images, videos
- Tables

**Integration with Liveblocks:**
```typescript
import { useYjs } from "@liveblocks/react";
import { BlockNoteView } from "@blocknote/react";

const { yDoc, yText } = useYjs();

const editor = useBlockNote({
  collaboration: {
    provider: yDoc,
    fragment: yText,
    user: {
      name: session.user.name,
      color: "#3B82F6"
    }
  }
});

return <BlockNoteView editor={editor} />;
```

### 5. React Big Calendar (Timetable)

**Purpose:** Weekly calendar view for timetables

**Setup:**
- Localizer: `date-fns`

**Features:**
- Week view
- Drag & drop (future)
- Recurring events
- Custom event rendering

**Usage:**
```typescript
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS }
});

<Calendar
  localizer={localizer}
  events={events}
  defaultView="week"
  onSelectSlot={handleSelectSlot}
/>
```

---

## Environment Variables

**Validation:** `src/env.js` (t3-oss/env-nextjs)

### Server-side Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db

# Authentication
AUTH_SECRET=your-secret-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Discord OAuth (T3 default - not used)
AUTH_DISCORD_ID=optional
AUTH_DISCORD_SECRET=optional

# File Storage (UploadThing)
UPLOADTHING_TOKEN=your-uploadthing-token
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-app-id

# Real-time Collaboration (Liveblocks)
LIVEBLOCKS_SECRET_KEY=sk_prod_xxx

# Email (Nodemailer with Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-gmail-app-password

# Environment
NODE_ENV=development|production
```

### Client-side Variables (NEXT_PUBLIC_)

```bash
# Liveblocks Public Key
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_prod_xxx

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Required for Development

**Minimum .env file:**
```bash
DATABASE_URL="postgresql://..."
AUTH_SECRET="openssl rand -base64 32"
NEXTAUTH_SECRET="openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

UPLOADTHING_TOKEN="..."
UPLOADTHING_SECRET="..."
UPLOADTHING_APP_ID="..."

LIVEBLOCKS_SECRET_KEY="sk_dev_..."
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY="pk_dev_..."

EMAIL_USER="your-email@gmail.com"
EMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Obtaining API Keys

1. **NeonDB (Database):**
   - Sign up at neon.tech
   - Create project
   - Copy connection string

2. **UploadThing:**
   - Sign up at uploadthing.com
   - Create app
   - Copy token, secret, app ID

3. **Liveblocks:**
   - Sign up at liveblocks.io
   - Create project
   - Copy secret key (server) and public key (client)

4. **Gmail App Password:**
   - Enable 2FA on Google account
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate app password for "Mail"

---

## Development Commands

```bash
# Development
npm run dev              # Start dev server (Turbo mode)
npm run build            # Build for production
npm run start            # Start production server
npm run preview          # Build and start production

# Code Quality
npm run check            # Lint + typecheck
npm run lint             # ESLint
npm run lint:fix         # ESLint auto-fix
npm run typecheck        # TypeScript check
npm run format:check     # Prettier check
npm run format:write     # Prettier auto-format

# Database
npm run db:generate      # Generate Prisma client + migrations (dev)
npm run db:migrate       # Deploy migrations (production)
npm run db:push          # Push schema changes (no migration)
npm run db:studio        # Open Prisma Studio
```

### Common Development Tasks

**1. Adding a new tRPC router:**
```bash
# 1. Create router file
touch src/server/api/routers/my-router.ts

# 2. Define procedures
# (see existing routers for examples)

# 3. Add to main router
# Edit: src/server/api/root.ts
import { myRouter } from "~/server/api/routers/my-router";

export const appRouter = createTRPCRouter({
  // ...existing routers
  myRouter: myRouter,
});
```

**2. Adding a new database model:**
```bash
# 1. Edit Prisma schema
# Edit: prisma/schema.prisma

# 2. Create migration
npm run db:generate

# 3. (Optional) Create seed data
# Edit: prisma/seed.ts

# 4. Seed database
npm run db:push
```

**3. Updating environment variables:**
```bash
# 1. Add to schema
# Edit: src/env.js

# 2. Add to .env
# Edit: .env

# 3. Update .env.example
# Edit: .env.example

# 4. Restart dev server
npm run dev
```

---

## Key Business Logic

### 1. Password Hashing
- **Library:** bcryptjs
- **Rounds:** 12
- **Location:** `src/server/api/routers/user.ts:44`

### 2. Slug Generation
- **Method:** Lowercase, trim, remove special chars, replace spaces with hyphens
- **Uniqueness:** Auto-increment counter if collision
- **Location:** `src/server/api/routers/article.ts:12-19`

### 3. Read Time Calculation
- **Formula:** Word count / 200 (average reading speed)
- **Location:** `src/server/api/routers/article.ts:25-29`

### 4. Favorite Course Enforcement
- **Rule:** Events can only be created for favorited courses
- **Check:** `timetable.createEvent` mutation
- **Location:** `src/server/api/routers/timetable.ts:538-552`

### 5. Auto-Resource Creation
- **Trigger:** Course creation
- **Resources:** Assignments, Tasks, Content, Notes
- **Location:** `src/server/api/routers/course.ts:34-58`

### 6. Collaboration Permissions
- **Owner:** Full access
- **Contributor:** Add resources, add files, edit resources (no delete)
- **Viewer:** Read-only
- **Checks:** Throughout resource and course routers

### 7. Article Visibility
- **DRAFT:** Author only
- **PUBLISHED:** Public
- **ARCHIVED:** Author only
- **Check:** `article.getBySlug` query
- **Location:** `src/server/api/routers/article.ts:536-544`

---

## Summary

**UniShare** is a full-stack, type-safe application built with the T3 Stack, designed to help students organize their academic life. It features:

- **User Management:** Registration with admin approval, role-based access (ADMIN, APPROVED, PENDING)
- **Course Management:** Create, share, and collaborate on courses with customizable resource cards
- **Real-time Collaboration:** Notion-like collaborative notes powered by Liveblocks and BlockNote
- **Timetable System:** Shareable weekly schedules with favorite course integration
- **Article Publishing:** Draft/publish workflow for student-authored content
- **File Management:** Secure file uploads via UploadThing
- **Email Notifications:** Automated emails for approval/rejection

**Tech Highlights:**
- End-to-end type safety with tRPC and Zod
- Server Components and Client Components with Next.js 15
- Real-time sync with Liveblocks + Yjs CRDTs
- PostgreSQL database with Prisma ORM
- JWT-based authentication with NextAuth.js v5

**Codebase Stats:**
- **Models:** 17 database tables
- **API Endpoints:** 60+ tRPC procedures
- **Pages:** 18 routes
- **Components:** 70+ React components

---

*End of Technical Documentation*
