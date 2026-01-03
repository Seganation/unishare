# UniShare - Complete Feature Audit & Documentation
**Generated**: January 3, 2026
**Codebase Version**: Git commit `6e48299` - feat: Add Gemini AI models documentation and configuration
**Total TypeScript Files**: 188 files

---

## Executive Summary

This audit reveals that **UniShare has implemented significantly more features than documented in the academic reports for Iterations 1 & 2**. Most notably, the application includes a **comprehensive AI integration system powered by Google Gemini** that was NOT mentioned in the original project proposal or planning documents.

**Critical Findings:**

1. **🚨 UNDOCUMENTED AI SYSTEM**: The codebase contains a complete AI-powered feature set including:
   - Conversational AI chatbot with conversation history
   - AI-powered quiz generation with multiple question types
   - AI-generated study plans with weekly breakdowns
   - AI note generation and improvement capabilities
   - Migration from local Ollama to Google Gemini 2.5 Flash/Pro models

2. **Advanced Real-Time Collaboration**: Full implementation of Liveblocks with BlockNote editor for collaborative notes, including nested pages and live cursors.

3. **Comprehensive Notification System**: Complete in-app and email notification infrastructure with user preferences and cron job scheduling.

4. **Production-Ready Infrastructure**: FullCalendar integration, UploadThing file uploads, scheduled cron jobs, and sophisticated tRPC API architecture.

**Sprint Status Analysis:**
- **Sprint 1 (M1)**: ✅ 100% Complete + Extra features
- **Sprint 2 (M2)**: ✅ 100% Complete + Notification system
- **Sprint 3 (M3)**: ✅ ~90% Complete (ahead of schedule - target: Jan 10, 2026)
- **Sprint 4 (M4)**: ✅ ~75% Complete (target: Feb 5, 2026)
- **🎯 AI Features**: ✅ 100% Complete (NOT in original scope!)

The project is **significantly ahead of schedule** with features from Sprint 4 and 5 already implemented, plus an entire AI system that wasn't in the original academic proposal.

---

## Technology Stack

### Core Framework
- **Framework**: Next.js 15.2.3 (App Router, React Server Components, Server Actions)
- **Language**: TypeScript 5.8.2 (strict mode enabled)
- **Runtime**: Node.js (with Bun for development: `bun run --bun next dev --turbo`)
- **Package Manager**: npm 11.6.2
- **Build Tool**: Turbopack (via `--turbo` flag for faster dev builds)

### Database & ORM
- **Database**: PostgreSQL via NeonDB (serverless, connection pooling)
- **ORM**: Prisma 6.5.0 with Prisma Client 6.18.0
- **Migration Strategy**: `prisma migrate dev` for development, `prisma migrate deploy` for production
- **Last Migration**: Multiple migrations including AI tables, notifications, nested notes

### Authentication & Security
- **Auth Library**: NextAuth.js v5.0.0-beta.25 (latest beta)
- **Providers**: Credentials provider (email/password) - NO Discord or third-party OAuth
- **Password Hashing**: bcryptjs with 12 salt rounds
- **Session Management**: JWT-based sessions with database adapter
- **Session Extension**: Custom module augmentation to include `user.id` and `user.role`
- **RBAC**: Three roles - ADMIN, APPROVED, PENDING
- **Protected Routes**: Middleware-based route protection in `src/middleware.ts`

### File Storage & Media
- **Service**: UploadThing 7.7.4 (Serverless file uploads)
- **Configuration**:
  - `studentIdUploader`: Max 4MB, accepts images (png, jpg, jpeg, webp)
  - `resourceUploader`: Max 16MB, accepts PDFs, images, documents, archives
- **Token**: Configured via `UPLOADTHING_TOKEN`, `UPLOADTHING_SECRET`, `UPLOADTHING_APP_ID`
- **Storage**: Files stored in UploadThing cloud (S3-backed)

### UI & Styling
- **CSS Framework**: Tailwind CSS 4.0.15 (latest stable v4)
- **Component Library**: Shadcn UI (Radix UI primitives + Tailwind)
  - 40+ Radix UI components installed (@radix-ui/react-*)
- **Icons**: Lucide React 0.548.0 (800+ icons)
- **Animations**:
  - Framer Motion 11.18.2 (complex animations)
  - Motion 12.23.26 (lightweight alternative)
  - TW Animate CSS 1.4.0 (Tailwind animation utilities)
- **Theme**: next-themes 0.4.6 (dark mode support)
- **Additional UI**:
  - embla-carousel-react 8.6.0 (carousels)
  - vaul 1.1.2 (drawer component)
  - cmdk 1.1.1 (command palette)
  - sonner 2.0.7 (toast notifications)

### Real-Time Features ⚠️ CRITICAL
- **Collaboration Platform**: Liveblocks 3.9.2
  - @liveblocks/client - Client SDK
  - @liveblocks/node - Server SDK for auth
  - @liveblocks/react - React hooks
  - @liveblocks/react-blocknote - BlockNote integration
  - @liveblocks/react-ui - Pre-built UI components (avatars, cursors)
  - @liveblocks/yjs - Yjs CRDT integration
- **CRDT**: Yjs 13.6.27 (Conflict-free Replicated Data Types for real-time sync)
- **Editor**: BlockNote 0.41.1
  - @blocknote/core - Core editor engine
  - @blocknote/react - React components
  - @blocknote/shadcn - Shadcn UI integration
- **Live Features**:
  - Real-time collaborative editing
  - Live cursors with user presence
  - Automatic conflict resolution
  - Version history (via Liveblocks cloud)

### Email & Notifications
- **Service**: Nodemailer 6.10.1 (self-hosted SMTP)
- **Provider**: Gmail SMTP with app-specific password
- **Configuration**: `EMAIL_USER`, `EMAIL_APP_PASSWORD`
- **Templates**: HTML email templates for:
  - Registration confirmation
  - Approval notifications
  - Rejection notifications
  - Collaboration invitations
  - Class reminders
- **Notification System**:
  - In-app notifications (database-stored)
  - Email notifications (via Nodemailer)
  - User preferences for notification types
  - Cron job for scheduled notifications

### AI/ML Integration ⚠️ CRITICAL - UNDOCUMENTED FEATURE
- **Primary Provider**: Google Generative AI (Gemini)
  - Package: `@ai-sdk/google` v2.0.49
- **AI Framework**: Vercel AI SDK 5.0.113
  - `ai` - Core SDK for streaming, text generation
  - `@ai-sdk/react` v2.0.115 - React hooks (`useChat`, `useCompletion`)
  - `@ai-sdk/openai-compatible` v1.0.29 - OpenAI-compatible providers
- **Models Used**:
  - **gemini-2.5-flash** - Fast model for chat, title generation (main model)
  - **gemini-2.5-pro** - High-quality model for quiz/study plan generation
- **Legacy/Backup AI**:
  - `ollama` 0.6.3 - Local AI runtime (DEPRECATED, kept for reference)
  - `ollama-ai-provider` 1.2.0 - Ollama provider (DEPRECATED)
- **Migration History**: Initially built with Ollama (local models like qwen2.5:1.5b, phi3:3.8b), migrated to Gemini on Dec 18, 2025
- **API Key**: `GOOGLE_GENERATIVE_AI_API_KEY` (required)
- **Cost**: Free tier - 15 req/min, 1M tokens/day (sufficient for development & demo)

### Calendar & Scheduling
- **Library**: FullCalendar 6.1.19
  - @fullcalendar/core - Core engine
  - @fullcalendar/react - React wrapper
  - @fullcalendar/daygrid - Month view
  - @fullcalendar/timegrid - Week/day views
  - @fullcalendar/interaction - Drag & drop
- **Alternative**: react-big-calendar 1.19.4 (also installed, may be used for timetables)
- **Date Utilities**:
  - date-fns 4.1.0 (date manipulation, formatting)
  - @date-fns/tz (timezone support)
  - react-day-picker 9.11.1 (date picker component)

### Additional Services & Libraries

#### Form Handling
- **react-hook-form** 7.65.0 - Form state management
- **@hookform/resolvers** 5.2.2 - Validation resolver
- **zod** 3.25.76 - Schema validation (used throughout tRPC and forms)
- **input-otp** 1.4.2 - OTP input component

#### Data Visualization
- **recharts** 2.15.4 - Chart library
- **@xyflow/react** 12.10.0 - Flow diagrams, node graphs

#### Markdown & Content
- **react-markdown** 10.1.0 - Markdown rendering
- **remark-gfm** 4.0.1 - GitHub Flavored Markdown
- **shiki** 3.20.0 - Syntax highlighting
- **streamdown** 1.6.10 - Streaming markdown

#### Utilities
- **nanoid** 5.1.6 - Unique ID generation
- **slugify** 1.6.6 - URL slug generation
- **clsx** 2.1.1 + **tailwind-merge** 3.3.1 - Conditional class names
- **class-variance-authority** 0.7.1 - Component variants
- **remeda** 2.32.0 - Functional utilities
- **tokenlens** 1.3.1 - Token counting for AI

#### Drag & Drop
- **react-dropzone** 14.3.8 - File upload drag & drop

#### Panels & Layout
- **react-resizable-panels** 3.0.6 - Resizable panel layouts

---

## Database Schema - Actual Implementation

### Complete Prisma Schema

```prisma
// ==================== USER MANAGEMENT ====================

model User {
  id           String    @id @default(cuid())
  name         String
  email        String    @unique
  password     String
  profileImage String?
  avatarIndex  Int       @default(0)
  role         Role      @default(PENDING)
  universityId String
  university   University @relation(fields: [universityId], references: [id])
  facultyId    String
  faculty      Faculty    @relation(fields: [facultyId], references: [id])
  studentIdUrl String
  approvedAt   DateTime?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  // NextAuth relations
  accounts Account[]
  sessions Session[]

  // UNIShare relations
  courses              Course[]
  courseCollaborations CourseCollaborator[]
  timetables           Timetable[]
  timetableCollaborations TimetableCollaborator[]
  events               Event[]
  articles             Article[]
  favorites            Favorite[]

  // AI relations ⚠️ UNDOCUMENTED
  aiConversations      AiConversation[]
  aiGeneratedNotes     AiGeneratedNote[]
  aiQuizzes            AiQuiz[]
  aiQuizAttempts       AiQuizAttempt[]
  aiStudyPlans         AiStudyPlan[]

  // Notification relations ⚠️ UNDOCUMENTED
  notifications               Notification[]
  notificationPreferences     UserNotificationPreferences?

  @@index([email])
  @@index([role])
  @@index([facultyId])
}

enum Role {
  ADMIN
  APPROVED
  PENDING
}

model University {
  id        String    @id @default(cuid())
  name      String    @unique
  faculties Faculty[]
  users     User[]
  createdAt DateTime  @default(now())
}

model Faculty {
  id           String     @id @default(cuid())
  name         String
  universityId String
  university   University @relation(fields: [universityId], references: [id])
  users        User[]
  createdAt    DateTime   @default(now())

  @@index([universityId])
}

// ==================== NEXTAUTH MODELS ====================

model Account {
  id                       String  @id @default(cuid())
  userId                   String
  type                     String
  provider                 String
  providerAccountId        String
  refresh_token            String?
  access_token             String?
  expires_at               Int?
  token_type               String?
  scope                    String?
  id_token                 String?
  session_state            String?
  user                     User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  refresh_token_expires_in Int?

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ==================== COURSE MANAGEMENT ====================

model Course {
  id          String   @id @default(cuid())
  title       String
  description String?
  color       String   @default("#3B82F6")
  createdBy   String
  creator     User     @relation(fields: [createdBy], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  resources     Resource[]
  collaborators CourseCollaborator[]
  notes         Note[]
  events        Event[]
  favorites     Favorite[]

  // AI relations ⚠️ UNDOCUMENTED
  aiConversations AiConversation[]
  aiQuizzes       AiQuiz[]
  aiStudyPlans    AiStudyPlan[]

  @@index([createdBy])
}

model CourseCollaborator {
  id        String              @id @default(cuid())
  courseId  String
  course    Course              @relation(fields: [courseId], references: [id], onDelete: Cascade)
  userId    String
  user      User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      CollaboratorRole    @default(VIEWER)
  status    CollaboratorStatus  @default(PENDING)
  invitedAt DateTime            @default(now())
  joinedAt  DateTime?

  @@unique([courseId, userId])
  @@index([userId])
  @@index([courseId])
}

enum CollaboratorRole {
  VIEWER      // Can view and download
  CONTRIBUTOR // Can add but not delete
}

enum CollaboratorStatus {
  PENDING  // Invited but not accepted
  ACCEPTED // Accepted invitation
  REJECTED // Rejected invitation
}

model Favorite {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, courseId])
  @@index([userId])
}

// ==================== RESOURCE CARDS ====================

model Resource {
  id          String       @id @default(cuid())
  title       String
  type        ResourceType
  description String?
  deadline    DateTime?
  fileUrls    String[]
  allowFiles  Boolean      @default(true)
  courseId    String
  course      Course       @relation(fields: [courseId], references: [id], onDelete: Cascade)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([courseId])
  @@index([type])
}

enum ResourceType {
  ASSIGNMENT
  TASK
  CONTENT
  NOTES
  CUSTOM
}

// ==================== COLLABORATIVE NOTES ====================

model Note {
  id            String   @id @default(cuid())
  title         String   @default("Untitled")
  icon          String?  // Emoji icon (optional, like Notion)
  courseId      String
  course        Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  // DEPRECATED: Content is stored in Liveblocks Yjs, NOT in this database field
  content       Json?

  liveblockRoom String   @unique // Liveblocks room ID where actual content is stored
  order         Int      @default(0) // For custom ordering of pages

  // Nested pages support ⚠️ UNDOCUMENTED
  parentId      String?
  parent        Note?    @relation("NestedPages", fields: [parentId], references: [id], onDelete: Cascade)
  children      Note[]   @relation("NestedPages")

  // AI relations ⚠️ UNDOCUMENTED
  aiConversations  AiConversation[]
  aiGeneratedNotes AiGeneratedNote[]
  aiQuizzes        AiQuiz[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([courseId])
  @@index([courseId, order])
  @@index([parentId])
}

// ==================== TIMETABLE ====================

model Timetable {
  id          String                  @id @default(cuid())
  name        String
  description String?
  createdBy   String
  creator     User                    @relation(fields: [createdBy], references: [id], onDelete: Cascade)
  events      Event[]
  collaborators TimetableCollaborator[]
  createdAt   DateTime                @default(now())
  updatedAt   DateTime                @updatedAt

  @@index([createdBy])
}

model TimetableCollaborator {
  id          String              @id @default(cuid())
  timetableId String
  timetable   Timetable           @relation(fields: [timetableId], references: [id], onDelete: Cascade)
  userId      String
  user        User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  role        CollaboratorRole    @default(VIEWER)
  status      CollaboratorStatus  @default(PENDING)
  invitedAt   DateTime            @default(now())
  acceptedAt  DateTime?

  @@unique([timetableId, userId])
  @@index([userId])
  @@index([timetableId])
  @@index([status])
}

model Event {
  id          String    @id @default(cuid())
  title       String
  timetableId String
  timetable   Timetable @relation(fields: [timetableId], references: [id], onDelete: Cascade)
  courseId    String
  course      Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)
  dayOfWeek   Int       // 0=Sunday, 6=Saturday
  startTime   String    // "09:00"
  endTime     String    // "10:30"
  location    String?
  recurring   Boolean   @default(true)
  createdBy   String
  creator     User      @relation(fields: [createdBy], references: [id])
  deletedAt   DateTime? // Soft delete support
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([timetableId])
  @@index([createdBy])
  @@index([courseId])
}

// ==================== PUBLIC ARTICLES ====================

model Article {
  id          String        @id @default(cuid())
  title       String
  slug        String        @unique
  excerpt     String?
  coverImage  String?
  content     Json          @default("[]")
  status      ArticleStatus @default(DRAFT)
  featured    Boolean       @default(false)
  views       Int           @default(0)
  readTime    Int?
  authorId    String
  author      User          @relation(fields: [authorId], references: [id])
  tags        Tag[]         @relation("ArticleTags")
  publishedAt DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([status, publishedAt])
  @@index([authorId])
  @@index([slug])
}

enum ArticleStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model Tag {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  articles  Article[] @relation("ArticleTags")
  createdAt DateTime  @default(now())
}

// ==================== AI INTEGRATION (GOOGLE GEMINI) ⚠️ UNDOCUMENTED ====================

model AiConversation {
  id          String      @id @default(cuid())
  title       String      @default("New Conversation")
  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Optional: Link to a course or note for context
  courseId    String?
  course      Course?     @relation(fields: [courseId], references: [id], onDelete: Cascade)
  noteId      String?
  note        Note?       @relation(fields: [noteId], references: [id], onDelete: Cascade)

  // Model configuration
  temperature Float       @default(0.7)

  messages    AiMessage[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([userId])
  @@index([courseId])
  @@index([noteId])
}

model AiMessage {
  id             String         @id @default(cuid())
  conversationId String
  conversation   AiConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  // Store complete UIMessage format as recommended by AI SDK docs
  role           AiMessageRole
  data           Json           // Stores complete UIMessage: { id, role, parts[], createdAt?, metadata? }
  tokensUsed     Int?           // Track token usage for analytics

  createdAt      DateTime       @default(now())

  @@index([conversationId])
  @@index([createdAt])
}

enum AiMessageRole {
  USER
  ASSISTANT
  SYSTEM
}

model AiGeneratedNote {
  id          String   @id @default(cuid())

  // Link to the note that was generated/improved
  noteId      String
  note        Note     @relation(fields: [noteId], references: [id], onDelete: Cascade)

  // User who requested the generation
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Generation details
  prompt      String   // The prompt used to generate
  tokensUsed  Int?     // Track token usage

  // Before/after snapshots for history
  contentBefore Json?
  contentAfter  Json

  // Generation type
  type        AiGenerationType

  createdAt   DateTime @default(now())

  @@index([noteId])
  @@index([userId])
  @@index([type])
}

enum AiGenerationType {
  GENERATE    // Generated from scratch
  IMPROVE     // Improved existing content
  SUMMARIZE   // Summarized existing content
  EXPAND      // Expanded existing content
}

// ==================== AI QUIZ GENERATION ⚠️ UNDOCUMENTED ====================

model AiQuiz {
  id          String   @id @default(cuid())
  title       String
  description String?

  // Link to course or note
  courseId    String?
  course      Course?  @relation(fields: [courseId], references: [id], onDelete: Cascade)
  noteId      String?
  note        Note?    @relation(fields: [noteId], references: [id], onDelete: Cascade)

  // Creator
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Generation details
  prompt      String   // What user asked to generate quiz about
  tokensUsed  Int?

  // Quiz content
  questions   AiQuizQuestion[]
  attempts    AiQuizAttempt[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([courseId])
  @@index([noteId])
}

model AiQuizQuestion {
  id            String              @id @default(cuid())
  quizId        String
  quiz          AiQuiz              @relation(fields: [quizId], references: [id], onDelete: Cascade)

  question      String
  type          QuizQuestionType
  options       Json?               // For multiple choice: ["A", "B", "C", "D"]
  correctAnswer String              // For MC: "A", for True/False: "true"/"false", for short: expected answer
  explanation   String?             // AI-generated explanation

  order         Int                 @default(0)
  answers       AiQuizAnswer[]

  @@index([quizId])
}

enum QuizQuestionType {
  MULTIPLE_CHOICE
  TRUE_FALSE
  SHORT_ANSWER
}

model AiQuizAttempt {
  id          String         @id @default(cuid())
  quizId      String
  quiz        AiQuiz         @relation(fields: [quizId], references: [id], onDelete: Cascade)
  userId      String
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  score       Float          // Percentage (0-100)
  answers     AiQuizAnswer[]

  startedAt   DateTime       @default(now())
  completedAt DateTime?

  @@index([quizId])
  @@index([userId])
}

model AiQuizAnswer {
  id          String         @id @default(cuid())
  attemptId   String
  attempt     AiQuizAttempt  @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  questionId  String
  question    AiQuizQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)

  userAnswer  String
  isCorrect   Boolean

  @@index([attemptId])
  @@index([questionId])
}

// ==================== AI STUDY PLANS ⚠️ UNDOCUMENTED ====================

model AiStudyPlan {
  id          String   @id @default(cuid())
  title       String
  description String?

  // Link to course
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  // Creator
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Generation details
  prompt      String   // e.g., "Create 4-week study plan for final exam"
  tokensUsed  Int?

  // Study plan content
  weeks       AiStudyPlanWeek[]

  // Metadata
  startDate   DateTime?
  endDate     DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([courseId])
}

model AiStudyPlanWeek {
  id          String        @id @default(cuid())
  studyPlanId String
  studyPlan   AiStudyPlan   @relation(fields: [studyPlanId], references: [id], onDelete: Cascade)

  weekNumber  Int           // 1, 2, 3, 4...
  title       String        // "Week 1: Introduction to Databases"
  description String?
  goals       String[]      // Array of learning goals

  tasks       AiStudyPlanTask[]

  @@index([studyPlanId])
}

model AiStudyPlanTask {
  id          String          @id @default(cuid())
  weekId      String
  week        AiStudyPlanWeek @relation(fields: [weekId], references: [id], onDelete: Cascade)

  title       String          // "Review Chapter 3"
  description String?
  estimatedMinutes Int?       // Time to complete
  isCompleted Boolean         @default(false)
  completedAt DateTime?

  order       Int             @default(0)

  @@index([weekId])
}

// ==================== NOTIFICATION SYSTEM ⚠️ UNDOCUMENTED ====================

model Notification {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      NotificationType
  title     String
  message   String
  metadata  Json?
  read      Boolean          @default(false)
  createdAt DateTime         @default(now())

  @@index([userId, read, createdAt])
  @@index([userId, createdAt])
}

enum NotificationType {
  COURSE_INVITATION
  TIMETABLE_INVITATION
  INVITATION_ACCEPTED
  INVITATION_REJECTED
  CLASS_REMINDER
  AUDIT_LOG_ALERT
  SYSTEM_NOTIFICATION
  GENERAL
}

model UserNotificationPreferences {
  id                          String   @id @default(cuid())
  userId                      String   @unique
  user                        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // In-app notification toggles
  inAppClassReminders         Boolean  @default(true)
  inAppCollaborationInvites   Boolean  @default(true)
  inAppAuditLogAlerts         Boolean  @default(true)
  inAppSystemNotifications    Boolean  @default(true)

  // Email notification toggles
  emailClassReminders         Boolean  @default(true)
  emailCollaborationInvites   Boolean  @default(true)
  emailAuditLogAlerts         Boolean  @default(true)
  emailSystemNotifications    Boolean  @default(true)

  // Class reminder timing (minutes before class)
  classReminderMinutes        Int      @default(10)

  createdAt                   DateTime @default(now())
  updatedAt                   DateTime @updatedAt
}
```

### Schema Differences from Documented Plans

#### ⚠️ **UNDOCUMENTED TABLES (NOT in Iteration 1 & 2 docs):**

1. **AI System Tables** (8 tables):
   - `AiConversation` - Chat conversations with AI
   - `AiMessage` - Individual messages in conversations
   - `AiGeneratedNote` - AI-generated or improved notes
   - `AiQuiz` - AI-generated quizzes
   - `AiQuizQuestion` - Quiz questions
   - `AiQuizAttempt` - User quiz attempts
   - `AiQuizAnswer` - Individual answers
   - `AiStudyPlan`, `AiStudyPlanWeek`, `AiStudyPlanTask` - Study plan generation

2. **Notification System** (2 tables):
   - `Notification` - In-app notifications
   - `UserNotificationPreferences` - User notification settings

3. **Enhanced Features**:
   - `Favorite` - Course favorites system
   - `Tag` - Article tagging system
   - Nested pages support in `Note` (parent-child relationship)

#### **Modified Fields from Original Docs:**

- **User model**:
  - Added: `profileImage`, `avatarIndex` (user avatars)
  - Added: `approvedAt` (track approval timestamp)
  - Added: AI, notification, and article relations

- **Note model**:
  - Added: `icon` (emoji icons like Notion)
  - Added: `order` (custom page ordering)
  - Added: `parentId`, `parent`, `children` (nested pages)
  - Added: `liveblockRoom` (Liveblocks integration)
  - Deprecated: `content` field (moved to Liveblocks Yjs)

- **Course model**:
  - Changed: `notes` relation from `Note?` (one) to `Note[]` (many) - supports multiple pages

- **Event model**:
  - Added: `deletedAt` (soft delete support)

#### **New Enums:**
- `AiMessageRole` (USER, ASSISTANT, SYSTEM)
- `AiGenerationType` (GENERATE, IMPROVE, SUMMARIZE, EXPAND)
- `QuizQuestionType` (MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER)
- `NotificationType` (8 types including CLASS_REMINDER, COURSE_INVITATION, etc.)

#### **Performance Optimizations (Indexes):**
- 25+ database indexes added for query performance
- Compound indexes on frequently queried fields
- Examples:
  - `@@index([userId, read, createdAt])` on Notification
  - `@@index([courseId, order])` on Note
  - `@@index([status, publishedAt])` on Article

---

## Feature Implementation Status

### Sprint 1 (M1) - Core Setup ✅ 100% COMPLETE

| Feature | Status | Implementation Notes | File Locations |
|---------|--------|---------------------|----------------|
| Next.js 15 with App Router | ✅ | Using App Router, RSC, Server Actions | `src/app/` |
| TypeScript Setup | ✅ | Strict mode, 188 .ts/.tsx files | `tsconfig.json` |
| PostgreSQL (NeonDB) | ✅ | Connection pooling, serverless | `.env` DATABASE_URL |
| Prisma ORM | ✅ | Client 6.18.0, schema with 25+ models | `prisma/schema.prisma` |
| NextAuth Configuration | ✅ | v5 beta, Credentials provider | `src/server/auth/config.ts` |
| User/University/Faculty Models | ✅ | With indexes and relations | Lines 15-124 in schema |
| UploadThing Setup | ✅ | 2 uploaders configured | `src/app/api/uploadthing/route.ts` |
| Environment Validation | ✅ | @t3-oss/env-nextjs with Zod | `src/env.js` |
| Database Seeding | ✅ | Universities & faculties | `prisma/seed.ts` |
| Role Enum (ADMIN, APPROVED, PENDING) | ✅ | Full RBAC implementation | `prisma/schema.prisma:101-105` |

**Extra Features Added:**
- Bun runtime support for faster development
- Turbopack integration (`--turbo` flag)
- Comprehensive ESLint + Prettier configuration
- Dark mode support (next-themes)

---

### Sprint 2 (M2) - Authentication & Admin Approval ✅ 100% COMPLETE

| Feature | Status | Implementation Notes | File Locations |
|---------|--------|---------------------|----------------|
| Student Registration Form | ✅ | Multi-step with validation | `src/app/(auth)/signup/page.tsx` |
| University/Faculty Selection | ✅ | Dropdowns with live data | Component in signup flow |
| Student ID Upload | ✅ | UploadThing integration, 4MB limit | `src/server/uploadthing.ts` |
| Password Hashing (bcrypt 12 rounds) | ✅ | Secure hash generation | `src/server/auth/config.ts` |
| User Creation with PENDING Role | ✅ | Default role on registration | `src/server/api/routers/user.ts` |
| Admin Dashboard | ✅ | Accessible only to ADMIN role | `src/app/(admin)/admin/page.tsx` |
| Pending Students List | ✅ | Displays all PENDING users | `src/app/(admin)/admin/approvals/page.tsx` |
| Approve/Reject Functionality | ✅ | Updates role to APPROVED | `src/server/api/routers/admin.ts` |
| Role-Based Redirects | ✅ | Middleware-based routing | `src/middleware.ts` |
| Email Notifications (Nodemailer) | ✅ | Gmail SMTP, HTML templates | `src/lib/email.ts` |
| Login Page | ✅ | NextAuth credentials sign-in | `src/app/(auth)/login/page.tsx` |
| Session Management | ✅ | JWT with DB adapter | `src/server/auth/` |
| Logout Functionality | ✅ | Session destruction | NextAuth signOut() |
| Waiting Approval Page | ✅ | For PENDING users | `src/app/(auth)/waiting-approval/page.tsx` |

**Extra Features Added:**
- ⚠️ **Notification System** (NOT in docs)
  - In-app notification storage
  - User notification preferences
  - Email + in-app notification dual delivery
- Avatar system (`avatarIndex` field)
- Profile image support
- Approval timestamp tracking

---

### Sprint 3 (M3) - Course & Resource Management ✅ ~90% COMPLETE (Target: Jan 10, 2026)

| Feature | Status | Implementation Notes | File Locations |
|---------|--------|---------------------|----------------|
| Empty Initial State | ✅ | Shows welcome screen when no courses | `src/app/(student)/courses/page.tsx` |
| Create Course (Title, Description, Color) | ✅ | Full CRUD with tRPC | `src/server/api/routers/course.ts` |
| Private Courses by Default | ✅ | Owner-only access initially | Enforced in queries |
| Resource Cards System | ✅ | ASSIGNMENT, TASK, CONTENT, NOTES, CUSTOM | `src/server/api/routers/resource.ts` |
| Auto-Created Resource Cards | ✅ | 4 default cards on course creation | `createCourse` mutation |
| Custom Resource Cards | ✅ | User-defined resource types | CUSTOM type support |
| File Upload Integration | ✅ | UploadThing, 16MB limit | `resourceUploader` |
| Course Detail Pages | ✅ | Dynamic route `[id]/page.tsx` | `src/app/(student)/courses/[id]/page.tsx` |
| Course Collaborators | ✅ | Invite, manage permissions | `src/app/(student)/courses/[id]/collaborators/page.tsx` |
| Course Notes | ✅ | Multiple pages per course | `src/app/(student)/courses/[id]/notes/[[...pageId]]/page.tsx` |
| Course Settings | ✅ | Edit title, description, color | `src/app/(student)/courses/[id]/settings/page.tsx` |

**Extra Features Added:**
- Course favorites system (Sprint 5 feature implemented early!)
- Course color customization
- Nested pages in notes (like Notion)
- Emoji icons for notes
- Resource deadlines
- File URL arrays (multiple files per resource)

---

### Sprint 4 (M4) - Sharing, Notes & Articles ✅ ~75% COMPLETE (Target: Feb 5, 2026)

| Feature | Status | Implementation Notes | File Locations |
|---------|--------|---------------------|----------------|
| **Course Sharing** ||||
| Faculty-Restricted Invitations | ✅ | User search limited to same faculty | `src/server/api/routers/course.ts` |
| VIEWER Permission | ✅ | Read-only, download access | `CollaboratorRole.VIEWER` |
| CONTRIBUTOR Permission | ✅ | Add resources, no delete | `CollaboratorRole.CONTRIBUTOR` |
| Owner Controls | ✅ | Full management, delete access | Enforced in mutations |
| Contributor Avatars Display | ✅ | Shows all collaborators | Course detail page |
| Invitation Status (PENDING/ACCEPTED/REJECTED) | ✅ | Full workflow | `CollaboratorStatus` enum |
| **Real-Time Collaborative Notes** ||||
| BlockNote Editor | ✅ | Rich text with slash commands | `@blocknote/react` integration |
| Liveblocks Synchronization | ✅ | Real-time CRDT sync | `@liveblocks/yjs` |
| CRDT Conflict Resolution | ✅ | Automatic via Yjs | Yjs 13.6.27 |
| Live Cursors & Presence | ✅ | See collaborators in real-time | `@liveblocks/react-ui` |
| Faculty-Restricted Sharing | ✅ | Same faculty only | Enforced in invitations |
| Multiple Pages per Course | ✅ | Notion-like structure | `Note[]` relation |
| Nested Pages | ✅ | Parent-child hierarchy | `parentId` field |
| **Public Articles System** ||||
| Article Creation (BlockNote) | ✅ | Solo mode, no collaboration | `src/app/(student)/my-articles/new/page.tsx` |
| Draft/Publish Workflow | ✅ | DRAFT → PUBLISHED → ARCHIVED | `ArticleStatus` enum |
| Public Browsing (No Login) | ✅ | `/articles` route accessible | `src/app/articles/page.tsx` |
| Search & Filtering by Tags | ✅ | Tag system implemented | `Tag` model with many-to-many |
| View Counter | ✅ | Increments on article view | `views` field |
| Read Time Calculation | ⚠️ | Field exists, calculation logic TBD | `readTime` field |
| Slug Generation | ✅ | URL-friendly slugs | `slugify` library |
| Featured Articles | ✅ | `featured` boolean flag | Article model |
| Cover Images | ✅ | Optional cover image URL | `coverImage` field |

**Extra Features Added:**
- Article excerpts
- Article archiving
- Author information display
- Published timestamp
- Multiple tag support
- Emoji icons for notes

---

### Sprint 5 (M5) - Calendar & Final Release ⚠️ ~60% COMPLETE (Target: Feb 28, 2026)

| Feature | Status | Implementation Notes | File Locations |
|---------|--------|---------------------|----------------|
| Favorites System | ✅ | Favorite/unfavorite courses | `Favorite` model + tRPC mutations |
| Calendar Integration | ✅ | FullCalendar 6.1.19 | `src/app/(student)/timetable/page.tsx` |
| Timetable Management | ✅ | Create, edit timetables | `src/server/api/routers/timetable.ts` |
| Only Favorited Courses in Dropdown | ✅ | Filters by favorites | Enforced in UI |
| Recurring Class Events | ✅ | Weekly recurrence support | `recurring` boolean |
| Color-Coded Events | ✅ | Inherits from course color | Event uses course color |
| Conflict Detection | ⚠️ | Logic TBD | Field exists, logic not found |
| Event Locations | ✅ | Optional location field | `location` field |
| Day of Week Scheduling | ✅ | 0-6 (Sunday-Saturday) | `dayOfWeek` int |
| Time Ranges | ✅ | Start/end times as strings | `startTime`, `endTime` |
| Timetable Sharing | ✅ | VIEWER/CONTRIBUTOR roles | `TimetableCollaborator` model |
| Multiple Timetables | ✅ | Users can have multiple | `Timetable[]` relation |

**Implementation Notes:**
- Both FullCalendar AND react-big-calendar installed (may be using different libs for different views)
- Soft delete support for events (`deletedAt` field)
- Timetable collaborator system mirrors course sharing

---

### ⚠️ AI Features - UNDOCUMENTED IN ACADEMIC REPORTS ✅ 100% COMPLETE

**THIS ENTIRE FEATURE SET IS NOT MENTIONED IN THE ORIGINAL PROJECT PROPOSAL OR PLANNING DOCUMENTS!**

| Feature | Status | Implementation Notes | File Locations |
|---------|--------|---------------------|----------------|
| **AI Chat Interface** ||||
| Conversational AI Chatbot | ✅ | Streaming responses with Vercel AI SDK | `src/app/(student)/ai/[[...id]]/page.tsx` |
| Conversation History | ✅ | Database-stored with UIMessage format | `AiConversation`, `AiMessage` models |
| Context-Aware Prompts | ✅ | Knows course/note context | `src/server/ai/prompts.ts` |
| Chat Sidebar | ✅ | Browse previous conversations | `src/components/ai/conversation-history-sidebar.tsx` |
| New Chat Button | ✅ | Start fresh conversations | Implemented |
| Conversation Titles | ✅ | AI-generated titles from first message | Auto-generated with Gemini |
| Temperature Control | ✅ | Adjustable creativity (0-2) | `temperature` field |
| Token Usage Tracking | ✅ | Tracks tokens per message | `tokensUsed` field |
| **AI Note Generation** ||||
| Generate Notes from Scratch | ✅ | GENERATE type | `src/app/api/ai/generate-note/route.ts` |
| Improve Existing Notes | ✅ | IMPROVE type | tRPC `ai.generateNote` |
| Summarize Notes | ✅ | SUMMARIZE type | 4 generation types |
| Expand Notes | ✅ | EXPAND type | AI SDK text generation |
| Before/After Snapshots | ✅ | History tracking | `contentBefore`, `contentAfter` |
| Generation History | ✅ | View past generations | `ai.getNoteGenerations` query |
| Permission Checks | ✅ | Only creator/contributor can generate | Enforced in API |
| **AI Quiz Generation** ||||
| Multiple Question Types | ✅ | Multiple Choice, True/False, Short Answer | `QuizQuestionType` enum |
| Difficulty Levels | ✅ | Easy, Medium, Hard | Input parameter |
| Question Count Control | ✅ | 1-50 questions | Configurable |
| AI-Generated Explanations | ✅ | Explains correct answers | `explanation` field |
| Quiz Attempts | ✅ | Take quizzes multiple times | `AiQuizAttempt` model |
| Automatic Grading | ✅ | Scores calculated automatically | `gradeQuizAttempt` function |
| Answer History | ✅ | View previous attempts | `AiQuizAnswer` model |
| Course/Note Context | ✅ | Quiz generated from specific content | Optional `courseId`, `noteId` |
| **AI Study Plan Generation** ||||
| Personalized Study Plans | ✅ | Based on course content | `src/server/ai/study-plan-generator.ts` |
| Weekly Breakdown | ✅ | Multi-week plans (1-16 weeks) | `AiStudyPlanWeek` model |
| Task Management | ✅ | Individual tasks with estimates | `AiStudyPlanTask` model |
| Task Completion Tracking | ✅ | Mark tasks as done | `isCompleted`, `completedAt` |
| Time Estimates | ✅ | Minutes per task | `estimatedMinutes` field |
| Learning Goals | ✅ | Goals per week | `goals` string array |
| Progressive Learning | ✅ | Basics → Advanced structure | Built into prompts |
| Course Integration | ✅ | Links to specific course | Required `courseId` |
| **AI Configuration** ||||
| Google Gemini Integration | ✅ | Gemini 2.5 Flash & Pro | `src/server/ai/config.ts` |
| Model Selection | ✅ | Fast (Flash) for chat, Pro for generation | Centralized config |
| UNIShare-Optimized Prompts | ✅ | Platform context in all prompts | `src/server/ai/prompts.ts` |
| Token Usage Tracking | ✅ | Analytics per request | Saved in all AI tables |
| Error Handling | ✅ | OllamaError class (legacy), graceful failures | Try-catch in all endpoints |
| Health Checks | ✅ | AI availability monitoring | `ai.healthCheck` procedure |

**AI Technology Stack:**
- **Primary Model**: Google Gemini 2.5 Flash (chat), Gemini 2.5 Pro (generation)
- **Framework**: Vercel AI SDK 5.0.113
- **Streaming**: Server-Sent Events (SSE) for real-time responses
- **Token Counting**: tokenlens library
- **Migration**: Originally Ollama (qwen2.5:1.5b, phi3:3.8b) → Gemini (Dec 18, 2025)

**API Endpoints:**
- `POST /api/chat` - Streaming chat (uses AI SDK streaming)
- `POST /api/ai/generate-note` - Non-streaming note generation
- tRPC `ai.*` - Type-safe AI operations (18 procedures total)

**Key Implementation Files:**
- `src/server/ai/config.ts` - Model configuration
- `src/server/ai/prompts.ts` - Optimized prompt templates
- `src/server/ai/gemini.ts` - Gemini compatibility layer
- `src/server/ai/quiz-generator.ts` - Quiz generation logic
- `src/server/ai/study-plan-generator.ts` - Study plan logic
- `src/server/api/routers/ai.ts` - 18 tRPC procedures (1,118 lines!)
- `src/components/ai/` - AI UI components

**Cost Analysis:**
- Free tier: 15 req/min, 1M tokens/day
- Estimated cost for university demo: $0-5 total
- Production cost (after free tier): ~$0.075 per 1M tokens (Flash), ~$1.25 per 1M tokens (Pro)

---

## API Routes & Endpoints

### Next.js API Routes (Non-tRPC)

```
Authentication:
  GET/POST /api/auth/[...nextauth]     - NextAuth handlers (login, logout, callback)

AI (Streaming):
  POST /api/chat                       - Streaming AI chat (Vercel AI SDK)
  POST /api/ai/generate-note           - Non-streaming note generation

Real-Time Collaboration:
  POST /api/liveblocks-auth            - Liveblocks room authentication

File Upload:
  POST /api/uploadthing                - UploadThing file upload handler

Scheduled Tasks:
  GET /api/cron/class-reminders        - Cron job for class reminder notifications
                                         (requires CRON_SECRET header)

Notes (Legacy):
  GET /api/notes/[id]                  - Get note (may be deprecated in favor of tRPC)
  POST /api/notes/create               - Create note (may be deprecated)

tRPC:
  ALL /api/trpc/[trpc]                 - tRPC router (handles all tRPC procedures)
```

### tRPC API (Type-Safe)

The application uses tRPC for type-safe API calls. All endpoints are automatically generated from the router definitions.

#### **User Router** (`src/server/api/routers/user.ts`)
```typescript
user.register               - Create new user account
user.getMe                  - Get current user info
user.update                 - Update user profile
user.updateNotificationPreferences - Update notification settings
user.searchByEmail          - Search users by email (faculty-restricted)
user.getNotifications       - Get user notifications
user.markNotificationRead   - Mark notification as read
user.markAllNotificationsRead - Mark all as read
```

#### **Admin Router** (`src/server/api/routers/admin.ts`)
```typescript
admin.getPendingUsers       - Get all PENDING users
admin.approveUser           - Approve user (PENDING → APPROVED)
admin.rejectUser            - Reject user
admin.getAllUsers           - Get all users with filters
admin.deleteUser            - Delete user account
admin.getStats              - Get admin dashboard statistics
```

#### **Course Router** (`src/server/api/routers/course.ts`)
```typescript
course.create               - Create new course
course.getAll               - Get user's courses (owned + collaborated)
course.getById              - Get course by ID with permissions check
course.update               - Update course details
course.delete               - Delete course (owner only)
course.inviteCollaborator   - Invite user to course
course.removeCollaborator   - Remove collaborator
course.updateCollaboratorRole - Change VIEWER ↔ CONTRIBUTOR
course.respondToInvitation  - Accept/reject invitation (ACCEPTED/REJECTED)
course.getCollaborators     - Get all course collaborators
course.getPendingInvitations - Get user's pending invitations
course.favorite             - Add course to favorites
course.unfavorite           - Remove from favorites
course.getFavorites         - Get user's favorite courses
```

#### **Resource Router** (`src/server/api/routers/resource.ts`)
```typescript
resource.create             - Create resource card
resource.getAll             - Get all resources for a course
resource.getById            - Get resource by ID
resource.update             - Update resource (owner/contributor)
resource.delete             - Delete resource (owner only)
resource.uploadFile         - Add file to resource
resource.deleteFile         - Remove file from resource
```

#### **Article Router** (`src/server/api/routers/article.ts`)
```typescript
article.create              - Create article (DRAFT)
article.getAll              - Get public articles (PUBLISHED only)
article.getMyArticles       - Get user's articles (all statuses)
article.getBySlug           - Get article by slug (public)
article.getById             - Get article by ID (owner only)
article.update              - Update article
article.delete              - Delete article
article.publish             - Publish article (DRAFT → PUBLISHED)
article.unpublish           - Unpublish (PUBLISHED → DRAFT)
article.archive             - Archive article
article.incrementViews      - Increment view counter
article.getTags             - Get all tags
article.createTag           - Create new tag
```

#### **Timetable Router** (`src/server/api/routers/timetable.ts`)
```typescript
timetable.create            - Create timetable
timetable.getAll            - Get user's timetables
timetable.getById           - Get timetable with events
timetable.update            - Update timetable details
timetable.delete            - Delete timetable
timetable.addEvent          - Add event to timetable
timetable.updateEvent       - Update event
timetable.deleteEvent       - Delete event (soft delete)
timetable.getEvents         - Get all events for timetable
timetable.inviteCollaborator - Invite user to timetable
timetable.removeCollaborator - Remove collaborator
timetable.respondToInvitation - Accept/reject timetable invitation
timetable.getCollaborators  - Get timetable collaborators
```

#### **AI Router** (`src/server/api/routers/ai.ts`) ⚠️ **UNDOCUMENTED - 18 Procedures!**
```typescript
// Health & Configuration
ai.healthCheck              - Check AI availability

// Chat & Conversations
ai.createConversation       - Create new AI conversation
ai.getConversations         - Get user's conversations (with pagination)
ai.getConversation          - Get conversation with all messages
ai.deleteConversation       - Delete conversation
ai.sendMessage              - Send message (non-streaming, for tRPC)

// Note Generation
ai.generateNote             - Generate/improve/summarize/expand notes
ai.getNoteGenerations       - Get generation history for a note

// Quiz Generation
ai.generateQuiz             - Generate quiz from course/note content
ai.getQuizzes               - Get user's quizzes
ai.getQuiz                  - Get quiz with questions and attempts
ai.submitQuizAttempt        - Submit quiz answers, get grade
ai.deleteQuiz               - Delete quiz

// Study Plan Generation
ai.generateStudyPlan        - Generate personalized study plan
ai.getStudyPlans            - Get user's study plans
ai.updateStudyPlanTask      - Mark task as complete/incomplete
ai.deleteStudyPlan          - Delete study plan
```

#### **Notification Router** (`src/server/api/routers/notification.ts`) ⚠️ **UNDOCUMENTED**
```typescript
notification.getAll         - Get user notifications (paginated)
notification.getUnreadCount - Get count of unread notifications
notification.markAsRead     - Mark notification as read
notification.markAllAsRead  - Mark all as read
notification.delete         - Delete notification
notification.getPreferences - Get user notification preferences
notification.updatePreferences - Update notification settings
```

**Total tRPC Procedures**: ~80+ type-safe endpoints!

---

## File Structure Analysis

```
unishare/
├── prisma/
│   ├── schema.prisma              # Database schema (25+ models, 637 lines)
│   ├── seed.ts                    # Database seeding (universities, faculties)
│   └── migrations/                # Database migration history
│
├── src/
│   ├── app/                       # Next.js 15 App Router
│   │   ├── (admin)/               # Admin-only routes
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx       # Admin dashboard
│   │   │   │   └── approvals/page.tsx # User approval page
│   │   │   └── layout.tsx         # Admin layout (RBAC wrapper)
│   │   │
│   │   ├── (auth)/                # Authentication routes (public)
│   │   │   ├── login/page.tsx     # Login page
│   │   │   ├── signup/page.tsx    # Registration page
│   │   │   └── waiting-approval/page.tsx # PENDING user page
│   │   │
│   │   ├── (student)/             # Student dashboard (APPROVED only)
│   │   │   ├── ai/
│   │   │   │   └── [[...id]]/page.tsx ⚠️ AI chat interface (UNDOCUMENTED)
│   │   │   │
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx       # Courses list
│   │   │   │   ├── new/page.tsx   # Create course
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx   # Course detail
│   │   │   │       ├── collaborators/page.tsx # Manage sharing
│   │   │   │       ├── settings/page.tsx      # Course settings
│   │   │   │       └── notes/
│   │   │   │           └── [[...pageId]]/page.tsx # Collaborative notes
│   │   │   │
│   │   │   ├── my-articles/
│   │   │   │   ├── page.tsx       # My articles list
│   │   │   │   ├── new/page.tsx   # Create article
│   │   │   │   └── [id]/edit/page.tsx # Edit article
│   │   │   │
│   │   │   ├── timetable/
│   │   │   │   └── page.tsx       # Calendar/timetable view
│   │   │   │
│   │   │   ├── settings/page.tsx  # User settings
│   │   │   └── layout.tsx         # Student layout
│   │   │
│   │   ├── articles/              # Public articles (no auth required)
│   │   │   ├── page.tsx           # Browse published articles
│   │   │   └── [slug]/page.tsx    # Read article
│   │   │
│   │   ├── api/                   # API Routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/route.ts # NextAuth handlers
│   │   │   │
│   │   │   ├── ai/ ⚠️ UNDOCUMENTED AI ENDPOINTS
│   │   │   │   └── generate-note/route.ts  # AI note generation
│   │   │   │
│   │   │   ├── chat/
│   │   │   │   └── route.ts ⚠️    # AI streaming chat (UNDOCUMENTED)
│   │   │   │
│   │   │   ├── cron/ ⚠️ UNDOCUMENTED CRON JOBS
│   │   │   │   └── class-reminders/route.ts # Scheduled notifications
│   │   │   │
│   │   │   ├── liveblocks-auth/route.ts # Liveblocks auth endpoint
│   │   │   ├── notes/             # Note API routes
│   │   │   ├── trpc/[trpc]/route.ts # tRPC handler
│   │   │   └── uploadthing/route.ts # File upload
│   │   │
│   │   ├── layout.tsx             # Root layout (providers, font)
│   │   ├── page.tsx               # Landing page
│   │   └── globals.css            # Global styles (Tailwind)
│   │
│   ├── components/                # React components
│   │   ├── ai/ ⚠️ UNDOCUMENTED   # AI-related components
│   │   │   ├── ai-chat-interface.tsx
│   │   │   ├── conversation-history-sidebar.tsx
│   │   │   ├── message-bubble.tsx
│   │   │   └── ...
│   │   │
│   │   ├── ui/                    # Shadcn UI components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   └── ... (40+ components)
│   │   │
│   │   ├── course/                # Course components
│   │   ├── article/               # Article components
│   │   ├── timetable/             # Timetable/calendar components
│   │   └── shared/                # Shared components
│   │
│   ├── server/                    # Server-side code
│   │   ├── ai/ ⚠️ UNDOCUMENTED   # AI integration layer
│   │   │   ├── config.ts          # Gemini model configuration
│   │   │   ├── prompts.ts         # Optimized AI prompts
│   │   │   ├── gemini.ts          # Gemini compatibility layer
│   │   │   ├── quiz-generator.ts  # Quiz generation logic
│   │   │   ├── study-plan-generator.ts # Study plan logic
│   │   │   ├── index.ts           # AI exports
│   │   │   └── ollama.ts          # DEPRECATED (legacy)
│   │   │
│   │   ├── api/                   # tRPC API
│   │   │   ├── root.ts            # Main router (combines all routers)
│   │   │   ├── trpc.ts            # tRPC config, context, procedures
│   │   │   └── routers/           # Feature routers
│   │   │       ├── user.ts
│   │   │       ├── admin.ts
│   │   │       ├── course.ts
│   │   │       ├── resource.ts
│   │   │       ├── article.ts
│   │   │       ├── timetable.ts
│   │   │       ├── ai.ts ⚠️       # 1,118 lines!
│   │   │       └── notification.ts ⚠️
│   │   │
│   │   ├── auth/                  # NextAuth configuration
│   │   │   ├── config.ts          # NextAuth config
│   │   │   └── index.ts           # Cached auth() helper
│   │   │
│   │   ├── db.ts                  # Prisma client singleton
│   │   └── uploadthing.ts         # UploadThing configuration
│   │
│   ├── lib/                       # Utility libraries
│   │   ├── utils.ts               # General utilities (cn, etc.)
│   │   ├── email.ts               # Email sending utilities
│   │   └── liveblocks.ts          # Liveblocks client config
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── use-toast.ts
│   │   └── ...
│   │
│   ├── types/                     # TypeScript type definitions
│   │
│   ├── styles/                    # CSS files
│   │
│   ├── env.js                     # Environment variable validation
│   └── middleware.ts              # Next.js middleware (auth, redirects)
│
├── public/                        # Static assets
│   ├── images/
│   └── ...
│
├── .env.example                   # Environment variable template
├── .env                           # Environment variables (gitignored)
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── next.config.js                 # Next.js configuration
├── package.json                   # Dependencies (141 packages)
├── CLAUDE.md                      # Claude Code instructions
├── AI_MIGRATION_SUMMARY.md ⚠️    # AI migration docs (UNDOCUMENTED)
├── gemini3.md ⚠️                  # Gemini integration guide
├── geminiModels.md ⚠️             # Gemini models documentation
└── README.md                      # Project readme
```

### Notable Patterns

1. **Route Groups**: Uses `(admin)`, `(auth)`, `(student)` for layout organization without affecting URLs
2. **Dynamic Routes**: `[id]`, `[slug]`, `[[...id]]` for flexible routing
3. **Catch-All Routes**: `[[...pageId]]` for optional catch-all (nested notes)
4. **Colocation**: Components organized by feature (course/, article/, ai/)
5. **Server-Side Code**: Clear separation in `src/server/`
6. **Type Safety**: Shared types between client/server via tRPC

---

## AI Integration Deep Dive ⚠️ CRITICAL SECTION

**THIS IS THE MOST SIGNIFICANT UNDOCUMENTED FEATURE IN THE CODEBASE**

### Overview

UniShare has a **comprehensive AI system** powered by Google Gemini that provides intelligent assistance throughout the platform. This system includes conversational chat, quiz generation, study plan creation, and note generation/improvement capabilities.

### AI Service Configuration

**File**: `src/server/ai/config.ts`

```typescript
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { env } from "~/env";

// Create Google provider with API key
const google = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Model configuration
export const models = {
  // Fast model for chat, quick responses
  fast: google("gemini-2.5-flash"),    // 1M context, very fast

  // Pro model for complex tasks (quiz/study plan generation)
  pro: google("gemini-2.5-pro"),       // 2M context, highest quality

  // Default (same as fast)
  default: google("gemini-2.5-flash"),
} as const;

// Dynamic model selection
export function getModelByName(name: keyof typeof models) {
  return models[name];
}
```

**Key Configuration Details:**
- **API Provider**: Google Generative AI (Gemini)
- **Models Available**:
  - `gemini-2.5-flash` - Fast, stable (15 req/min, 1M tokens/day free)
  - `gemini-2.5-pro` - High quality (15 req/min, 1M tokens/day free)
- **Environment Variable**: `GOOGLE_GENERATIVE_AI_API_KEY` (required)
- **Optional Override**: `AI_MODEL` env var to change default model

### Optimized Prompt System

**File**: `src/server/ai/prompts.ts`

UniShare uses a centralized prompt system with UNIShare-specific context to improve AI responses:

**Base Context (All Features):**
```typescript
const BASE_CONTEXT = `You are an AI assistant for UNIShare, a university student
platform for academic collaboration.

Key features:
- Students share course materials, notes, resources
- Collaborative study tools (timetables, quizzes, study plans)
- Real-time collaborative note editing
- Course organization and resource sharing

Your role: Help students learn effectively through educational content
generation and assistance.`;
```

**Chat Prompt Builder:**
```typescript
export function getChatSystemPrompt(context?: {
  noteTitle?: string;
  courseTitle?: string;
}) {
  let prompt = BASE_CONTEXT;

  if (context?.noteTitle || context?.courseTitle) {
    prompt += "\n\nContext:";
    if (context.courseTitle) {
      prompt += `\n- Course: ${context.courseTitle}`;
    }
    if (context.noteTitle) {
      prompt += `\n- Note: ${context.noteTitle}`;
    }
    prompt += "\n\nProvide helpful, educational responses related to this context.";
  }

  return prompt;
}
```

**Token Optimization:**
- Course context truncated to 200 chars max
- Note content truncated to 300 chars max
- Concise prompt generation
- Only includes relevant context

### AI-Powered Features

#### Feature 1: Conversational AI Chat

**Purpose**: Provide students with an AI assistant for academic questions, homework help, and study guidance.

**Trigger**: User navigates to `/ai` or `/ai/[conversationId]`

**Implementation**:
- **Frontend**: `src/app/(student)/ai/[[...id]]/page.tsx`
- **API**: `src/app/api/chat/route.ts` (streaming endpoint)
- **tRPC**: `src/server/api/routers/ai.ts` (conversation management)
- **Components**: `src/components/ai/ai-chat-interface.tsx`

**Model**: Gemini 2.5 Flash (fast responses for real-time chat)

**Key Features**:
- Real-time streaming responses (Server-Sent Events)
- Conversation history (database-stored)
- Context awareness (linked to courses/notes)
- Auto-generated conversation titles
- Markdown rendering in responses
- Code syntax highlighting (Shiki)
- Message persistence (UIMessage format recommended by AI SDK)

**Example API Call**:
```typescript
// Streaming chat request
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: {
      id: generateId(),
      role: 'user',
      parts: [{ type: 'text', text: 'Explain database normalization' }],
    },
    conversationId: 'conv_xyz123',
    temperature: 0.7,
  }),
});

// Stream response
for await (const chunk of response.body) {
  // Render streaming text
}
```

**Prompt Template**:
```
System: You are an AI assistant for UNIShare, a university student platform...
[Optional: Context about course/note]

User: Explain database normalization
Assistant: Generates helpful response in markdown

**User-Facing**: Yes - accessible from sidebar navigation

**Database Storage**:
- Conversations: `AiConversation` table
- Messages: `AiMessage` table (stores full UIMessage format)
- Token tracking: `tokensUsed` field per message

---

#### Feature 2: AI Note Generation & Improvement

**Purpose**: Help students create comprehensive notes or improve existing ones using AI.

**Trigger**: Button in note editor ("Generate", "Improve", "Summarize", "Expand")

**Implementation**:
- **API**: `src/app/api/ai/generate-note/route.ts` (non-streaming)
- **tRPC**: `ai.generateNote` procedure
- **File**: `src/server/ai/gemini.ts` (generateText function)

**Model**: Gemini 2.5 Flash (fast generation)

**Prompt Template Examples**:
```typescript
// GENERATE
"Generate comprehensive notes about: [topic]. Use markdown formatting with headings, bullet points, and clear structure."

// IMPROVE
"Improve the following notes: [content]. Make them clearer, more organized, and easier to understand. Use markdown formatting."

// SUMMARIZE
"Summarize the following notes concisely using markdown formatting: [content]"

// EXPAND
"Expand on the following topic with more details and examples. Use markdown formatting with headings and bullet points: [topic]"
```

**Generation Types**:
1. **GENERATE** - Create notes from scratch based on topic
2. **IMPROVE** - Make existing notes clearer and better organized
3. **SUMMARIZE** - Condense notes to key points
4. **EXPAND** - Add more details and examples

**History Tracking**:
- Before/after snapshots stored in `AiGeneratedNote` table
- View generation history via `ai.getNoteGenerations` query
- Includes prompt, token usage, timestamp

**User-Facing**: Yes - integrated into note editor UI

---

#### Feature 3: AI Quiz Generation

**Purpose**: Generate educational quizzes from course content to help students test their knowledge.

**Trigger**: User clicks "Generate Quiz" in course or note view

**Implementation**:
- **File**: `src/server/ai/quiz-generator.ts`
- **tRPC**: `ai.generateQuiz` procedure
- **Grading**: `src/server/ai/quiz-generator.ts` - `gradeQuizAttempt` function

**Model**: Gemini 2.5 Pro (better accuracy for educational content)

**Prompt Template**:
```typescript
`You are an educational quiz generator for UNIShare, a university student platform.

Generate a quiz with these requirements:
- Topic: ${topic}
- Number of questions: ${questionCount}
- Difficulty: ${difficulty}
- Question types: ${questionTypes.join(', ')}
${courseContext ? `- Course context: ${courseContext}` : ''}
${noteContent ? `- Note content: ${noteContent.substring(0, 300)}...` : ''}

Return ONLY a JSON object (no markdown wrappers) in this exact format:
{
  "title": "Quiz title",
  "description": "Brief description",
  "questions": [
    {
      "question": "Question text",
      "type": "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER",
      "options": ["A", "B", "C", "D"] // only for MULTIPLE_CHOICE
      "correctAnswer": "A" // or "true"/"false" for TRUE_FALSE
      "explanation": "Why this is correct"
    }
  ]
}

Educational guidelines:
- Test understanding, not memorization
- Include explanations for learning
- Clear, unambiguous questions
- Appropriate difficulty level`
```

**Question Types**:
- **MULTIPLE_CHOICE**: 4 options (A, B, C, D)
- **TRUE_FALSE**: True or False questions
- **SHORT_ANSWER**: Free-text answers

**Features**:
- Difficulty levels: Easy, Medium, Hard
- 1-50 questions per quiz
- AI-generated explanations for each answer
- Automatic grading (percentage score)
- Multiple attempts tracking
- Answer history

**Grading Logic**:
```typescript
// Multiple Choice & True/False: Exact match
isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase()

// Short Answer: Case-insensitive contains check (simple)
isCorrect = correctAnswer.toLowerCase().includes(userAnswer.toLowerCase())
```

**User-Facing**: Yes - quiz generation and taking interface

---

#### Feature 4: AI Study Plan Generation

**Purpose**: Create personalized, week-by-week study plans for courses based on content and deadlines.

**Trigger**: User clicks "Generate Study Plan" in course view

**Implementation**:
- **File**: `src/server/ai/study-plan-generator.ts`
- **tRPC**: `ai.generateStudyPlan` procedure

**Model**: Gemini 2.5 Pro (better planning and time estimation)

**Prompt Template**:
```typescript
`You are a study plan generator for UNIShare, a university student platform.

Create a realistic study plan for university students:
- Course: ${courseName}
${courseDescription ? `- Description: ${courseDescription}` : ''}
- Duration: ${weekCount} weeks
- Study time: ${hoursPerWeek} hours/week
${goal ? `- Goal: ${goal}` : ''}
${deadline ? `- Deadline: ${deadline}` : ''}
${topics.length > 0 ? `- Topics to cover: ${topics.join(', ')}` : ''}

Return ONLY a JSON object in this format:
{
  "title": "Study plan title",
  "description": "Brief overview",
  "weeks": [
    {
      "weekNumber": 1,
      "title": "Week 1: Introduction",
      "description": "What to focus on",
      "goals": ["Goal 1", "Goal 2"],
      "tasks": [
        {
          "title": "Task title",
          "description": "What to do",
          "estimatedMinutes": 60
        }
      ]
    }
  ]
}

Guidelines:
- Progressive learning (basics → advanced)
- Realistic time estimates for university students
- Mix of activities: reading, practice, review, testing
- Clear, actionable tasks
- Achievable daily/weekly goals`
```

**Features**:
- 1-16 week plans
- Customizable hours per week (1-40)
- Optional deadline-based planning
- Weekly breakdown with:
  - Week title and description
  - Learning goals (string array)
  - Individual tasks with time estimates
- Task completion tracking (checkbox + timestamp)
- Progress visualization

**Task Structure**:
- Title (e.g., "Review Chapter 3")
- Description (optional details)
- Estimated minutes (time to complete)
- Completion status (`isCompleted`, `completedAt`)
- Order (for sequencing tasks)

**User-Facing**: Yes - study plan generation and task tracking interface

---

### AI API Usage Patterns

**Streaming Chat Example** (`/api/chat`):
```typescript
import { streamText } from "ai";
import { models } from "~/server/ai/config";

const result = streamText({
  model: models.fast,
  messages: convertToModelMessages(allMessages),
  system: getChatSystemPrompt({ courseTitle, noteTitle }),
  temperature: 0.7,
  async onFinish({ usage }) {
    // Save token usage: usage.totalTokens
  },
});

return result.toUIMessageStreamResponse({
  originalMessages: allMessages,
  generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
  async onFinish({ messages }) {
    // Save all new messages to database
  },
});
```

**Non-Streaming Text Generation Example** (Note generation):
```typescript
import { generateText } from "ai";
import { models } from "~/server/ai/config";

const result = await generateText({
  model: models.fast,
  system: systemPrompt,
  prompt: fullPrompt,
  temperature: 0.7,
});

// result.text - Generated text
// result.usage?.totalTokens - Token count
```

**Structured Output Example** (Quiz/Study Plan):
```typescript
import { generateText } from "ai";
import { models } from "~/server/ai/config";

const result = await generateText({
  model: models.pro,
  prompt: jsonPrompt, // Explicitly request JSON format
  temperature: 0.3,    // Lower temperature for structured output
});

// Parse JSON response
const parsedData = JSON.parse(result.text);
```

---

### Migration History

**December 18, 2025**: **Ollama → Google Gemini Migration**

**Previous Setup** (DEPRECATED):
- **Local AI**: Ollama running locally
- **Models**: qwen2.5:1.5b (1.5B parameters), phi3:3.8b (3.8B parameters)
- **Issues**:
  - Requires local Ollama server running
  - Lower quality responses vs. cloud models
  - No production deployment support
  - Manual model management

**Current Setup**:
- **Cloud AI**: Google Gemini via API
- **Models**: gemini-2.5-flash, gemini-2.5-pro
- **Benefits**:
  - Production-ready (no local server needed)
  - Significantly better quality
  - Free tier (1M tokens/day)
  - Easy to swap providers (just change config)

**Files Changed**:
- Created: `src/server/ai/config.ts` (centralized config)
- Created: `src/server/ai/prompts.ts` (optimized prompts)
- Created: `src/server/ai/gemini.ts` (Gemini layer)
- Updated: All AI routers to use new config
- Updated: `src/env.js` (new env vars)
- Deprecated: `src/server/ai/ollama.ts` (kept for reference)
- Removed: `model` field from database schema

**Documentation**:
- `AI_MIGRATION_SUMMARY.md` - Complete migration guide
- `gemini3.md`, `geminiModels.md` - Gemini setup docs

---

## Environment Variables Required

```env
# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# ============================================
# AUTHENTICATION (NextAuth v5)
# ============================================
# Generate with: npx auth secret
AUTH_SECRET="your-secret-here"
NEXTAUTH_SECRET="your-secret-here"  # NextAuth v5 uses this
NEXTAUTH_URL="http://localhost:3000"

# ============================================
# FILE UPLOAD (UploadThing)
# ============================================
UPLOADTHING_TOKEN="your-uploadthing-token"
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="your-app-id"

# ============================================
# REAL-TIME COLLABORATION (Liveblocks)
# ============================================
LIVEBLOCKS_SECRET_KEY="sk_dev_..."
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY="pk_dev_..."

# ============================================
# EMAIL (Nodemailer with Gmail)
# ============================================
EMAIL_USER="your-email@gmail.com"
EMAIL_APP_PASSWORD="your-gmail-app-password"  # NOT regular password!

# ============================================
# ⚠️ AI INTEGRATION (Google Gemini) - UNDOCUMENTED
# ============================================
# Get from: https://aistudio.google.com/app/apikey
# Free tier: 15 req/min, 1M tokens/day
GOOGLE_GENERATIVE_AI_API_KEY="your-google-api-key-here"

# Optional: Override default model (gemini-2.5-flash or gemini-2.5-pro)
# AI_MODEL="gemini-2.5-flash"

# ============================================
# CRON JOB SECURITY - UNDOCUMENTED
# ============================================
# Random 32+ character string for cron endpoint authentication
CRON_SECRET="your-random-32-character-string-here"

# ============================================
# APPLICATION URL
# ============================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Critical Notes**:
1. **EMAIL_APP_PASSWORD**: NOT your Gmail password! Generate an app-specific password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
2. **GOOGLE_GENERATIVE_AI_API_KEY**: Required for all AI features (chat, quiz, study plans, note generation)
3. **LIVEBLOCKS keys**: Required for collaborative note editing
4. **CRON_SECRET**: Protects `/api/cron/*` endpoints from unauthorized access

---

## Security Analysis

### Authentication Security

**Password Handling**:
- ✅ **bcrypt** hashing with 12 salt rounds (industry standard)
- ✅ Passwords never stored in plain text
- ✅ No password in API responses (excluded in Prisma queries)

**Session Security**:
- ✅ JWT-based sessions with secret key
- ✅ Database session adapter (Account, Session models)
- ✅ Session expiration handling
- ✅ Secure httpOnly cookies (NextAuth default)

**CSRF Protection**:
- ✅ NextAuth built-in CSRF tokens
- ✅ SameSite cookie attribute

**API Security**:
- ✅ All mutations require authentication (`protectedProcedure`)
- ✅ tRPC context includes `session.user` for protected routes
- ✅ Session validation on every protected API call

### Authorization Patterns

**Role-Based Access Control (RBAC)**:
```typescript
// Three-tier role system
enum Role {
  ADMIN    // Full system access, user approval
  APPROVED // Normal user access
  PENDING  // Limited access, waiting approval
}
```

**Permission Checks in API Routes**:
```typescript
// Example: Course deletion (owner only)
const course = await ctx.db.course.findFirst({
  where: {
    id: input.id,
    createdBy: ctx.session.user.id, // Ownership check
  },
});
if (!course) throw new TRPCError({ code: "FORBIDDEN" });
```

**Collaboration Permission System**:
```typescript
enum CollaboratorRole {
  VIEWER      // Read-only, download
  CONTRIBUTOR // Add resources, no delete
}

enum CollaboratorStatus {
  PENDING  // Invited, not accepted
  ACCEPTED // Active collaborator
  REJECTED // Declined invitation
}
```

**Faculty Restrictions**:
- User search limited to same faculty
- Course/timetable sharing restricted to faculty members
- Enforced at API level, not just UI

### Data Validation

**Input Validation** (Zod schemas):
```typescript
// Example: Course creation
const createCourseSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
});
```

**File Upload Restrictions**:
```typescript
// Student ID uploader
.file(["image/png", "image/jpeg", "image/jpg", "image/webp"])
.maxFileSize("4MB")

// Resource uploader
.file([
  "image/*",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.*",
  "application/zip",
])
.maxFileSize("16MB")
```

**API Route Validation**:
- ✅ All tRPC procedures use Zod input validation
- ✅ Type safety enforced at compile time
- ✅ Runtime validation via Zod

**Database Constraints**:
- ✅ Unique constraints (`@@unique`)
- ✅ Foreign key constraints (`@relation`)
- ✅ Cascade deletes (`onDelete: Cascade`)
- ✅ Default values
- ✅ Enum validation

### Potential Security Concerns

⚠️ **Areas to Review**:

1. **Rate Limiting**: No obvious rate limiting on AI endpoints
   - AI quiz/study plan generation could be expensive
   - Consider implementing user-level rate limits

2. **AI Prompt Injection**: No apparent sanitization of user prompts
   - Users could potentially inject malicious prompts
   - Consider prompt sanitization/filtering

3. **Cron Job Authentication**: Uses secret header
   - ✅ `CRON_SECRET` required for `/api/cron/*`
   - ⚠️ Ensure this is a strong, random string in production

4. **XSS Protection**:
   - ✅ React auto-escapes by default
   - ✅ Markdown rendering likely uses safe library (react-markdown)
   - ⚠️ Verify all user-generated content is sanitized

5. **File Upload Security**:
   - ✅ File type restrictions
   - ✅ File size limits
   - ⚠️ Verify UploadThing handles malware scanning

---

## Performance Considerations

### Database Optimization

**Indexes Implemented** (25+ indexes):
```prisma
// User indexes
@@index([email])
@@index([role])
@@index([facultyId])

// Note indexes (for efficient queries)
@@index([courseId])
@@index([courseId, order]) // Compound index for sorted pages
@@index([parentId])        // For nested pages

// Notification indexes (read performance)
@@index([userId, read, createdAt]) // Compound for filtering + sorting
@@index([userId, createdAt])

// Article indexes (public browsing)
@@index([status, publishedAt]) // Published articles sorted
@@index([authorId])
@@index([slug]) // Fast slug lookups
```

**Query Patterns**:
- ✅ Uses `select` to limit fields returned
- ✅ Uses `include` for eager loading relations (avoids N+1)
- ✅ Pagination support (`take`, `skip`)
- ⚠️ Some queries could benefit from cursor-based pagination

**N+1 Query Prevention**:
```typescript
// Good: Single query with includes
const courses = await ctx.db.course.findMany({
  include: {
    collaborators: {
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    },
  },
});

// Avoids N+1: Doesn't loop through courses to fetch collaborators
```

### Caching Strategy

**Current State**:
- ⚠️ No obvious caching layer identified
- ⚠️ tRPC queries re-fetch on every request

**Recommendations**:
- Consider React Query caching (already available via @tanstack/react-query)
- Add Redis for API response caching
- Cache AI quiz/study plan generations (expensive operations)
- Cache public articles (rarely change)

### File Upload Optimization

**Size Limits**:
- Student IDs: 4MB max
- Resources: 16MB max

**UploadThing Features** (likely):
- ✅ CDN delivery (S3-backed)
- ✅ Automatic image optimization
- ✅ Fast global delivery

**Missing Optimizations**:
- ⚠️ No obvious image compression before upload
- ⚠️ No lazy loading mentioned for file lists

### Real-Time Performance

**Liveblocks Optimization**:
- ✅ CRDT (Yjs) for efficient conflict resolution
- ✅ Binary protocol (WebSocket)
- ✅ Cloud-hosted (no self-hosted infrastructure)

**Potential Bottlenecks**:
- Large note documents (100+ pages)
- Many simultaneous collaborators

### AI Performance

**Token Usage Optimization**:
- ✅ Context truncation (course: 200 chars, notes: 300 chars)
- ✅ Concise prompt templates
- ✅ Token counting (`tokenlens` library)

**Model Selection**:
- ✅ Fast model (Flash) for chat/titles
- ✅ Pro model for complex generation (quiz/study plans)

**Potential Issues**:
- ⚠️ No request queuing (could hit rate limits with many users)
- ⚠️ No caching of AI responses (regenerates every time)

---

## Testing Coverage

**Current State**: ⚠️ **No test files found in codebase**

**Missing Tests**:
- Unit tests for AI generation functions
- Integration tests for tRPC routers
- End-to-end tests for critical flows
- API endpoint tests

**Recommended Test Structure**:
```
tests/
├── unit/
│   ├── ai/
│   │   ├── quiz-generator.test.ts
│   │   ├── study-plan-generator.test.ts
│   │   └── prompts.test.ts
│   └── lib/
│       └── utils.test.ts
├── integration/
│   ├── api/
│   │   ├── course.test.ts
│   │   ├── ai.test.ts
│   │   └── article.test.ts
│   └── auth.test.ts
└── e2e/
    ├── signup-flow.test.ts
    ├── course-creation.test.ts
    └── ai-chat.test.ts
```

**Testing Tools to Add**:
- Vitest or Jest (unit testing)
- Playwright or Cypress (E2E)
- @testing-library/react (component testing)

---

## Deployment Configuration

### Build Configuration

**Next.js Config** (`next.config.js`):
```javascript
{
  typescript: {
    ignoreBuildErrors: false, // Strict type checking
  },
  eslint: {
    ignoreDuringBuilds: false, // Linting required
  },
  experimental: {
    serverActions: true,       // Enable Server Actions
  },
}
```

**Build Commands**:
```bash
npm run build     # Production build
npm run preview   # Build + start (test production build)
npm run typecheck # Type checking without build
```

### Hosting Requirements

**Recommended Platforms**:
1. **Vercel** (Optimal choice for Next.js 15)
   - Native Next.js support
   - Automatic deployment
   - Edge functions support
   - Environment variable management

2. **Railway** / **Render**
   - PostgreSQL included
   - Easy deployment
   - Affordable pricing

3. **DigitalOcean App Platform**
   - Docker support
   - Managed databases

**Resource Requirements**:
- **Memory**: 512MB minimum, 1GB recommended
- **CPU**: 0.5 vCPU minimum
- **Database**: PostgreSQL 14+ (NeonDB recommended)
- **Storage**: 10GB for file uploads (via UploadThing CDN)

**Environment Variables to Set**:
- All variables from `.env.example`
- Production database URL
- Production auth secrets (regenerate!)
- Production API keys (Gemini, UploadThing, Liveblocks)

### Database Deployment

**NeonDB** (Current choice):
- ✅ Serverless PostgreSQL
- ✅ Connection pooling (handles Next.js edge functions)
- ✅ Free tier available
- ✅ Automatic backups

**Migration Strategy**:
```bash
# Development
npm run db:generate  # Create migration + regenerate client

# Production
npm run db:migrate   # Apply migrations (no prompts)
```

**Pre-Deployment Checklist**:
- [ ] Run migrations on production database
- [ ] Seed universities and faculties
- [ ] Test database connection
- [ ] Verify connection pooling works

---

## Gaps & Issues Identified

### Critical Issues

1. **⚠️ AI Features Not Documented in Academic Reports**
   - **Impact**: Major scope creep, potential grading issues
   - **Recommendation**: Update Iteration 3 & 4 reports to include AI features
   - **Academic Compliance**: Explain when/why AI was added

2. **⚠️ No Testing Infrastructure**
   - **Impact**: High risk of bugs, no CI/CD
   - **Recommendation**: Add Vitest + Playwright before Sprint 3 deadline
   - **Priority**: HIGH - required for production readiness

3. **⚠️ No Rate Limiting**
   - **Impact**: Users could spam expensive AI operations
   - **Recommendation**: Add rate limiting middleware (e.g., `@upstash/ratelimit`)
   - **Priority**: MEDIUM - important for production

4. **⚠️ Missing Environment Variables Validation in Production**
   - **Impact**: Silent failures if env vars missing
   - **Current**: `@t3-oss/env-nextjs` validates, but errors could be clearer
   - **Recommendation**: Add startup checks with helpful error messages

### Feature Gaps vs Documentation

**Implemented but NOT in Docs**:
1. ✅ AI Chat System (entire feature)
2. ✅ AI Quiz Generation (entire feature)
3. ✅ AI Study Plan Generation (entire feature)
4. ✅ AI Note Generation (entire feature)
5. ✅ Notification System (in-app + email)
6. ✅ User Notification Preferences
7. ✅ Nested Pages for Notes
8. ✅ Emoji Icons for Notes
9. ✅ Favorites System (Sprint 5 feature done early)
10. ✅ Cron Job for Class Reminders
11. ✅ Timetable Collaborators (Sprint 5 feature done early)

**Documented but NOT Fully Implemented**:
1. ⚠️ Read Time Calculation for Articles (field exists, logic missing)
2. ⚠️ Conflict Detection for Timetable Events (field exists, logic not found)

**Partially Implemented**:
- Article search/filtering (Tag system exists, search UI may be incomplete)

### Technical Debt

1. **Dual Calendar Libraries**
   - Both FullCalendar AND react-big-calendar installed
   - **Issue**: Bundle size increase, confusion
   - **Recommendation**: Choose one, remove the other

2. **Deprecated Ollama Code**
   - `src/server/ai/ollama.ts` still in codebase
   - **Recommendation**: Remove or move to `docs/legacy/`

3. **Missing Error Boundaries**
   - No React Error Boundaries found
   - **Impact**: Poor error UX, full app crashes
   - **Recommendation**: Add error boundaries to route segments

4. **No API Documentation**
   - 80+ tRPC procedures with no generated docs
   - **Recommendation**: Add tRPC panel or auto-generate API docs

5. **Inconsistent Error Handling**
   - Mix of thrown errors and error returns
   - **Recommendation**: Standardize error handling patterns

---

## Recommendations for Iteration 3 & 4

### Priority 1 - MUST HAVE (Before Jan 10, 2026)

**For Iteration 3 Report**:
1. ✅ **Document AI Features Properly**
   - Add "AI Integration" section to report
   - Explain Google Gemini choice
   - Document all 4 AI features
   - Include cost analysis ($0 for demo, free tier)
   - Justify why this wasn't in original scope (educational enhancement)

2. ✅ **Complete Sprint 3 Remaining Work**
   - Verify all resource card types work correctly
   - Test file upload/download flows
   - Ensure course detail pages are polished

3. 🔴 **Add Testing Infrastructure**
   - Set up Vitest for unit tests
   - Add at least 20 critical tests (auth, course CRUD, AI generation)
   - Document test coverage in report

4. 🔴 **Security Audit**
   - Review all AI prompt injection points
   - Add rate limiting to AI endpoints
   - Verify file upload security

**For Iteration 4 Report**:
1. ✅ **Document Features Already Implemented**
   - Notes: ✅ Complete (BlockNote, Liveblocks, nested pages)
   - Articles: ✅ ~90% Complete (add read time calculation)
   - Course Sharing: ✅ Complete
   - Timetable: ✅ ~80% Complete (add conflict detection)

2. 🔴 **Polish Existing Features**
   - Add read time calculation for articles
   - Implement timetable conflict detection
   - Improve article search/filtering UI

### Priority 2 - SHOULD HAVE

1. **Performance Optimization**
   - Add React Query caching strategy
   - Implement lazy loading for file lists
   - Optimize AI prompts further (reduce token usage)

2. **User Experience**
   - Add loading states throughout app
   - Improve error messages (user-friendly)
   - Add success toasts for all mutations

3. **Documentation**
   - Create API documentation (tRPC panel)
   - Write deployment guide
   - Document environment setup

### Priority 3 - NICE TO HAVE

1. **AI Enhancements**
   - Cache common quiz topics
   - Add model selection UI (Flash vs Pro)
   - Implement streaming study plans (better UX)

2. **Analytics**
   - Track AI token usage per user
   - Monitor quiz completion rates
   - Track most popular courses/articles

3. **Advanced Features**
   - Export study plans to PDF
   - Share quizzes between users
   - AI-powered article recommendations

---

## Sprint 3 (Iteration 3) Preparation

### Already Completed from Sprint 3 Scope ✅

| Feature | Status | Notes |
|---------|--------|-------|
| Course Creation | ✅ 100% | Full CRUD with color customization |
| Resource Cards | ✅ 100% | All 5 types (ASSIGNMENT, TASK, CONTENT, NOTES, CUSTOM) |
| File Upload | ✅ 100% | UploadThing integration, 16MB limit |
| Course Detail Pages | ✅ 100% | Dynamic routing, permission checks |
| Private Courses | ✅ 100% | Owner-only by default |
| Course Collaborators | ✅ 100% | Invite/manage (Sprint 4 feature!) |
| Course Notes | ✅ 100% | Multiple pages (Sprint 4 feature!) |

### Remaining Sprint 3 Work ⚠️

1. **Testing** (0% → need 80%)
   - Write tests for course CRUD
   - Test resource card creation
   - Test file upload flows

2. **Documentation** (30% → need 100%)
   - Update Iteration 3 report with AI features
   - Document actual implementation vs plan
   - Add screenshots of implemented features

3. **Bug Fixes**
   - Test edge cases (e.g., deleting course with resources)
   - Verify permission checks work correctly
   - Test with multiple users

### Suggested Sprint 3 Focus (Remaining 7 Days)

**Week 1 (Jan 3-10)**:
- ✅ Day 1-2: Write comprehensive tests (target: 50+ tests)
- ✅ Day 3-4: Security audit + add rate limiting
- ✅ Day 5-6: Update Iteration 3 report (include AI!)
- ✅ Day 7: Final testing + demo preparation

**Deliverables for Jan 10**:
- ✅ Sprint 3 features (already done!)
- 🔴 Test suite (NEW - must add)
- 🔴 Updated report with AI documentation
- 🔴 Demo video or presentation

---

## Sprint 4 (Iteration 4) Preparation

### Prerequisites from Sprint 3

Sprint 4 features are largely **already implemented**! Focus on:
1. Polishing existing features
2. Fixing minor gaps (read time, conflict detection)
3. Comprehensive testing

### Recommended Approach for Sprint 4

**Since most Sprint 4 features are done, focus on**:

1. **Quality Over Quantity**
   - Polish existing UI/UX
   - Improve performance
   - Add comprehensive error handling

2. **Academic Documentation**
   - Write detailed Iteration 4 report explaining:
     - How Liveblocks works (CRDT, Yjs)
     - Why BlockNote was chosen
     - Article system architecture
     - Timetable sharing design

3. **User Testing**
   - Get feedback from classmates
   - Identify usability issues
   - Fix based on feedback

**Timeline** (Feb 5, 2026 deadline):
- Week 1-2: Polish existing features, fix bugs
- Week 3: User testing + feedback integration
- Week 4: Documentation + demo preparation

---

## Appendix

### A: Complete File Inventory (Key Files Only)

**AI System** (⚠️ UNDOCUMENTED):
```
src/server/ai/config.ts              # Gemini model configuration
src/server/ai/prompts.ts             # Optimized AI prompts
src/server/ai/gemini.ts              # Gemini compatibility layer
src/server/ai/quiz-generator.ts      # Quiz generation logic
src/server/ai/study-plan-generator.ts # Study plan logic
src/server/ai/index.ts               # AI exports
src/server/api/routers/ai.ts         # AI tRPC router (1,118 lines!)
src/app/api/chat/route.ts            # Streaming chat endpoint
src/app/api/ai/generate-note/route.ts # Note generation endpoint
src/app/(student)/ai/[[...id]]/page.tsx # AI chat UI
src/components/ai/                   # AI components
```

**Core Backend**:
```
src/server/api/root.ts               # Main tRPC router
src/server/api/trpc.ts               # tRPC config
src/server/api/routers/              # Feature routers (8 routers)
src/server/auth/config.ts            # NextAuth config
src/server/db.ts                     # Prisma client
src/env.js                           # Environment validation
```

**Frontend Pages**:
```
src/app/(student)/courses/page.tsx   # Courses list
src/app/(student)/courses/[id]/notes/[[...pageId]]/page.tsx # Collaborative notes
src/app/(student)/my-articles/new/page.tsx # Article editor
src/app/(student)/timetable/page.tsx # Calendar view
src/app/(admin)/admin/approvals/page.tsx # User approval
```

**Configuration**:
```
prisma/schema.prisma                 # Database schema (637 lines)
tailwind.config.ts                   # Tailwind config
tsconfig.json                        # TypeScript config
next.config.js                       # Next.js config
.env.example                         # Environment template
```

### B: Third-Party Dependencies (Key Packages)

**Core Framework** (5 packages):
```json
{
  "next": "^15.2.3",
  "react": "^19.2.3",
  "react-dom": "^19.2.3",
  "typescript": "^5.8.2",
  "@prisma/client": "^6.18.0"
}
```

**AI & ML** (5 packages) ⚠️:
```json
{
  "ai": "^5.0.113",
  "@ai-sdk/google": "^2.0.49",
  "@ai-sdk/react": "^2.0.115",
  "ollama": "^0.6.3",               // DEPRECATED
  "ollama-ai-provider": "^1.2.0"   // DEPRECATED
}
```

**Real-Time Collaboration** (6 packages):
```json
{
  "@liveblocks/client": "^3.9.2",
  "@liveblocks/react": "^3.9.2",
  "@liveblocks/react-blocknote": "^3.9.2",
  "@blocknote/core": "^0.41.1",
  "@blocknote/react": "^0.41.1",
  "yjs": "^13.6.27"
}
```

**Total Dependencies**: 141 packages (119 dependencies + 22 devDependencies)

### C: Database Migrations History

**Key Migrations** (chronological order):
1. Initial schema (User, University, Faculty, NextAuth models)
2. Course & Resource models
3. Collaborative notes (Note model with Liveblocks)
4. Timetable & Event models
5. Article & Tag models
6. **AI Integration** (8 new tables) ⚠️
7. **Notification System** (2 new tables) ⚠️
8. Nested pages (parentId field to Note)
9. Favorites system
10. Remove model field from AI tables (Gemini migration)

**Total Migrations**: ~15-20 migrations

### D: AI Feature Usage Examples

**1. Start AI Chat:**
```typescript
// Frontend
import { useChat } from "@ai-sdk/react";

const { messages, input, handleInputChange, handleSubmit } = useChat({
  api: "/api/chat",
  body: {
    conversationId: "conv_xyz123",
    courseId: "course_abc",
  },
});

// Stream messages automatically
```

**2. Generate Quiz:**
```typescript
// tRPC mutation
const generateQuiz = api.ai.generateQuiz.useMutation();

await generateQuiz.mutateAsync({
  courseId: "course_abc",
  topic: "Database Normalization",
  questionCount: 10,
  difficulty: "medium",
  questionTypes: ["MULTIPLE_CHOICE", "TRUE_FALSE"],
});

// Returns: AiQuiz with questions
```

**3. Generate Study Plan:**
```typescript
const generateStudyPlan = api.ai.generateStudyPlan.useMutation();

await generateStudyPlan.mutateAsync({
  courseId: "course_abc",
  weekCount: 4,
  hoursPerWeek: 5,
  goal: "Prepare for final exam",
  deadline: new Date("2026-02-15"),
});

// Returns: AiStudyPlan with weeks and tasks
```

**4. Improve Notes:**
```typescript
const response = await fetch("/api/ai/generate-note", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    noteId: "note_xyz",
    prompt: "Make these notes more concise and organized",
    type: "IMPROVE",
  }),
});

const { generatedText, tokensUsed } = await response.json();
```

---

## Final Summary

**UniShare is significantly more advanced than documented in academic reports.**

### What Was Planned (Iterations 1-5):
- ✅ Basic course management
- ✅ Resource cards
- ✅ User authentication & approval
- ✅ Collaborative notes (Liveblocks + BlockNote)
- ✅ Articles system
- ✅ Timetable with calendar

### What Was ACTUALLY Built:
- ✅ Everything planned (mostly complete)
- ⚠️ **+ Full AI System (NOT in scope!):**
  - AI Chat (conversational assistant)
  - AI Quiz Generation
  - AI Study Plan Generation
  - AI Note Generation/Improvement
- ⚠️ **+ Notification System (NOT in scope!)**
- ⚠️ **+ Advanced Features:**
  - Nested pages
  - Emoji icons
  - Favorites system (early)
  - Cron jobs
  - Timetable sharing (early)

### Project Status:
- **Sprint 1**: ✅ 100% Complete
- **Sprint 2**: ✅ 100% Complete
- **Sprint 3**: ✅ 90% Complete (TARGET: Jan 10, 2026)
- **Sprint 4**: ✅ 75% Complete (TARGET: Feb 5, 2026)
- **Sprint 5**: ⚠️ 60% Complete (TARGET: Feb 28, 2026)

**The project is AHEAD OF SCHEDULE with features from Sprint 4 & 5 already implemented, PLUS an entire AI system that adds massive value but was never planned.**

### Recommendations:

1. **Update Academic Reports** to include AI features with justification
2. **Add Testing** (currently 0% coverage - HIGH PRIORITY)
3. **Security Audit** (rate limiting, prompt injection protection)
4. **Polish Existing Features** instead of adding more
5. **Focus on Documentation** for remaining sprints

**Estimated Project Completion**: ~85% (with AI features included)

**Estimated WITHOUT AI**: ~70% (still ahead of schedule!)

---

**Generated by**: Claude Code Audit
**Date**: January 3, 2026
**Total Word Count**: ~8,500 words
**AI Features Documented**: 4 major systems (Chat, Quiz, Study Plan, Notes)
**Undocumented Features Found**: 11 major features
**Database Tables Undocumented**: 10 tables
**API Endpoints Undocumented**: 18 tRPC procedures

**Status**: ✅ AUDIT COMPLETE
