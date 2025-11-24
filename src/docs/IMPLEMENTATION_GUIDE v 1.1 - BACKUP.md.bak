# UNIShare - Claude Code Implementation Guide

## 🎯 Project Overview

**System:** Student-driven academic organization platform  
**Tech Stack:** Next.js 15, TypeScript, Prisma, NeonDB, UploadThing, Liveblocks, BlockNote, NextAuth, Nodemailer  
**Timeline:** 10-11 weeks  
**Approach:** Agile sprints with iterative development

---

## 📋 Pre-Implementation Checklist

Before starting development, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Git installed and configured
- [ ] VSCode or preferred IDE
- [ ] Gmail account for Nodemailer
- [ ] GitHub account for version control

---

## 🔑 Required Service Accounts & API Keys

### 1. Database: NeonDB
**Purpose:** PostgreSQL database hosting  
**Setup:**
1. Go to https://neon.tech
2. Sign up with GitHub/Google
3. Create new project: "unishare-db"
4. Copy the connection string
5. **Variable needed:** `DATABASE_URL`

### 2. File Storage: UploadThing
**Purpose:** Student ID uploads and course resource files  
**Setup:**
1. Go to https://uploadthing.com
2. Sign in with GitHub
3. Create new app: "UniShare"
4. Go to API Keys section
5. **Variables needed:** 
   - `UPLOADTHING_SECRET`
   - `UPLOADTHING_APP_ID`

### 3. Real-time Collaboration: Liveblocks
**Purpose:** Collaborative note-taking synchronization  
**Setup:**
1. Go to https://liveblocks.io
2. Sign up
3. Create new project: "UniShare"
4. Go to API Keys → Create secret key
5. **Variables needed:**
   - `LIVEBLOCKS_SECRET_KEY`
   - `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY`

### 4. Authentication: NextAuth
**Purpose:** User authentication and sessions  
**Setup:**
1. Generate secret: Run in terminal:
   ```bash
   openssl rand -base64 32
   ```
2. **Variable needed:** `NEXTAUTH_SECRET`

### 5. Email: Nodemailer (Gmail)
**Purpose:** Send approval/rejection emails  
**Setup:**
1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Go to App Passwords
4. Create app password for "Mail"
5. Copy the 16-character password
6. **Variables needed:**
   - `EMAIL_USER` (your Gmail address)
   - `EMAIL_APP_PASSWORD` (the 16-char password)

### 6. Deployment: Vercel
**Purpose:** Production hosting  
**Setup:**
1. Go to https://vercel.com
2. Sign up with GitHub
3. (Will connect later during deployment)

---

## 📁 Project Structure

**Note:** This project uses T3 Stack, which includes tRPC for type-safe API calls. The structure below reflects T3's conventions with `src/` folder organization.
```
unishare/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── waiting-approval/
│   │   │       └── page.tsx
│   │   ├── (student)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx              # Course list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx          # Create course
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx          # Course detail + resources
│   │   │   │       ├── settings/
│   │   │   │       │   └── page.tsx      # Manage collaborators
│   │   │   │       └── notes/
│   │   │   │           └── page.tsx      # Collaborative editor
│   │   │   └── timetable/
│   │   │       └── page.tsx              # Weekly calendar
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       ├── page.tsx              # Admin dashboard
│   │   │       ├── approvals/
│   │   │       │   └── page.tsx          # Pending students
│   │   │       ├── users/
│   │   │       │   └── page.tsx          # All users
│   │   │       └── articles/
│   │   │           └── page.tsx          # Manage articles
│   │   ├── (public)/
│   │   │   └── articles/
│   │   │       ├── page.tsx              # Article list
│   │   │       ├── new/
│   │   │       │   └── page.tsx          # Write article
│   │   │       └── [slug]/
│   │   │           ├── page.tsx          # Read article
│   │   │           └── edit/
│   │   │               └── page.tsx      # Edit article
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── uploadthing/
│   │   │   │   └── route.ts              # UploadThing endpoints
│   │   │   └── trpc/
│   │   │       └── [trpc]/
│   │   │           └── route.ts          # tRPC API handler
│   │   ├── layout.tsx                    # Root layout
│   │   └── page.tsx                      # Landing page
│   │
│   ├── components/
│   │   ├── ui/                           # Shadcn components
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   └── signup-form.tsx
│   │   ├── courses/
│   │   │   ├── course-card.tsx
│   │   │   ├── course-form.tsx
│   │   │   └── collaborator-avatars.tsx
│   │   ├── resources/
│   │   │   ├── resource-card.tsx
│   │   │   └── resource-form.tsx
│   │   ├── notes/
│   │   │   ├── collaborative-editor.tsx
│   │   │   ├── notes-sidebar.tsx
│   │   │   └── liveblocks-provider.tsx
│   │   ├── timetable/
│   │   │   ├── calendar-view.tsx
│   │   │   └── event-form.tsx
│   │   ├── articles/
│   │   │   ├── article-card.tsx
│   │   │   ├── article-editor.tsx
│   │   │   └── article-header.tsx
│   │   └── admin/
│   │       ├── approval-card.tsx
│   │       └── user-table.tsx
│   │
│   ├── server/
│   │   ├── db.ts                         # Prisma client (T3 default)
│   │   ├── auth/
│   │   │   ├── config.ts                 # NextAuth config (T3 default)
│   │   │   └── index.ts                  # Auth exports
│   │   └── api/
│   │       ├── root.ts                   # tRPC root router
│   │       ├── trpc.ts                   # tRPC setup
│   │       └── routers/
│   │           ├── course.ts             # Course tRPC routes
│   │           ├── resource.ts           # Resource tRPC routes
│   │           ├── note.ts               # Note tRPC routes
│   │           ├── event.ts              # Event tRPC routes
│   │           ├── article.ts            # Article tRPC routes
│   │           ├── admin.ts              # Admin tRPC routes
│   │           └── user.ts               # User tRPC routes
│   │
│   ├── lib/
│   │   ├── uploadthing.ts                # UploadThing config
│   │   ├── liveblocks.ts                 # Liveblocks config
│   │   ├── email.ts                      # Nodemailer config
│   │   ├── utils.ts                      # Utility functions
│   │   └── validators.ts                 # Zod schemas
│   │
│   ├── trpc/
│   │   ├── query-client.ts               # React Query client
│   │   ├── react.tsx                     # tRPC React hooks
│   │   └── server.ts                     # Server-side tRPC
│   │
│   ├── styles/
│   │   └── globals.css                   # Global styles
│   │
│   └── env.js                            # T3 env validation
│
├── prisma/
│   ├── schema.prisma                     # Complete database schema
│   └── seed.ts                           # Seed universities/faculties
│
├── public/
│   ├── favicon.ico
│   └── universities.json                 # University/Faculty data
│
├── .env                                  # Environment variables (gitignored)
├── .env.example                          # Example environment variables
├── .gitignore
├── liveblocks.config.ts                  # Liveblocks TypeScript config
├── next.config.js                        # Next.js configuration
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── prettier.config.js
├── eslint.config.js
└── README.md
```

---

### 🔑 Key Differences from Standard Next.js:

1. **`src/` Folder**: All source code lives in `src/` (T3 convention)
2. **tRPC Instead of API Routes**: Use `src/server/api/routers/` for backend logic
3. **Auth in `src/server/auth/`**: NextAuth configuration lives here
4. **Prisma Client in `src/server/db.ts`**: Centralized database access
5. **Type-safe API Calls**: Use tRPC hooks like `trpc.course.create.useMutation()`

---

### 📝 Important Notes:

- **Use tRPC routers** instead of creating separate `/api/courses/route.ts` files
- **Auth is already configured** in `src/server/auth/config.ts` - just extend it
- **Database client** is at `src/server/db.ts` - import from there
- All **React components** go in `src/components/`
- All **backend logic** goes in `src/server/api/routers/`
- **Environment variables** are validated by `src/env.js` (T3 feature)

---

---

## 🔄 **Sharing & Collaboration Workflow (CRITICAL)**

### **Core Architecture Principle**

**Single Invitation System with Automatic Access Inheritance**

One invitation to a course automatically grants appropriate access to:
- ✅ All resource cards (Assignments, Tasks, Content)
- ✅ Collaborative notes (with role-based permissions)
- ✅ Course settings visibility

**NO separate invitations needed for notes** - it's all controlled by the course collaboration role.

---

### **Complete User Journey**

#### **1. Owner Creates Course**
```
You (Student) login → Empty courses page → Click "Create Course"
     ↓
Enter: Title, Description, Color → Submit
     ↓
Course created with 4 empty predefined resource cards:
  - Assignments (empty)
  - Tasks (empty)
  - Content (empty)
  - Notes (empty)
     ↓
Status: Private (only you can see it)
```

---

#### **2. Owner Invites Classmates**
```
Go to Course → Settings → Manage Collaborators
     ↓
Click "Invite Student"
     ↓
Search bar (faculty-filtered - only same faculty students appear)
     ↓
Select student: "Sarah Ahmed"
     ↓
Choose role:
  ○ Viewer (can view/download, read-only notes)
  ● Contributor (can add resources, edit notes)
     ↓
Click "Send Invitation"
     ↓
Invitation sent (status: PENDING)
```

---

#### **3. Recipient Sees Invitation**
```
Sarah logs in → Dashboard
     ↓
Sees notification badge: "📬 Pending Invitations (1)"
     ↓
Clicks to view:
  ┌────────────────────────────────────┐
  │ 👤 John Doe invited you to:       │
  │ 📚 Data Structures CS201          │
  │ Role: Contributor                 │
  │ [Accept] [Decline]                │
  └────────────────────────────────────┘
     ↓
Clicks "Accept"
     ↓
Status changes to: ACCEPTED
```

---

#### **4. Course Appears in "Shared With Me"**
```
Sarah's Courses Page:

┌─────────────────────────────────────┐
│ My Courses (2)                      │
├─────────────────────────────────────┤
│ 📚 Web Development                  │
│ 📚 Machine Learning                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Shared With Me (1)                  │
├─────────────────────────────────────┤
│ 📚 Data Structures CS201            │
│     Shared by John • Contributor    │
│     👤👤 3 contributors              │
└─────────────────────────────────────┘
```

---

#### **5. Accessing Resources (Contributor)**
```
Sarah clicks on "Data Structures CS201"
     ↓
Course Detail Page shows:
  ┌────────────────────────────────────────┐
  │ ℹ️ You're a Contributor                │
  │ You can: Add resources, Edit notes     │
  │ You cannot: Delete resources           │
  └────────────────────────────────────────┘

  Resource Cards:
  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
  │Assign- │ │ Tasks  │ │Content │ │ Notes  │
  │ments   │ │        │ │        │ │        │
  │➕ Add  │ │➕ Add  │ │➕ Add  │ │✏️ Edit │
  └────────┘ └────────┘ └────────┘ └────────┘
  
Sarah can:
  ✅ Upload files to Assignments
  ✅ Add tasks
  ✅ Upload content files
  ✅ Edit notes collaboratively
  
Sarah cannot:
  ❌ Delete any resources
  ❌ Delete the course
  ❌ Remove collaborators
```

---

#### **6. Collaborative Notes Session**
```
3 people open notes simultaneously:
  - John (Owner)
  - Sarah (Contributor)
  - Mike (Viewer)

┌──────────────────────────────────────────┐
│ Notes - Data Structures CS201            │
│ 👤 John, Sarah online • Mike viewing     │
├──────────────────────────────────────────┤
│                                          │
│ # Lecture 1: Arrays                     │
│                                          │
│ Arrays are... [John typing here] 🟦     │
│                                          │
│ ## Examples:                             │
│ - [Sarah typing here] 🟩                │
│                                          │
│ Mike sees everything but cannot type    │
│ (read-only mode for Viewers)            │
└──────────────────────────────────────────┘

Real-time features:
  ✅ John and Sarah see each other's cursors
  ✅ Changes sync instantly (no conflicts)
  ✅ Mike sees edits happening live
  ❌ Mike cannot type or edit
```

---

### **Permission Matrix**

| Action | Owner | Contributor | Viewer | Not Invited |
|--------|-------|-------------|--------|-------------|
| **View course** | ✅ | ✅ | ✅ | ❌ |
| **View resources** | ✅ | ✅ | ✅ | ❌ |
| **Download files** | ✅ | ✅ | ✅ | ❌ |
| **Add resources** | ✅ | ✅ | ❌ | ❌ |
| **Delete resources** | ✅ | ❌ | ❌ | ❌ |
| **Edit course details** | ✅ | ❌ | ❌ | ❌ |
| **Delete course** | ✅ | ❌ | ❌ | ❌ |
| **View notes** | ✅ | ✅ | ✅ (read-only) | ❌ |
| **Edit notes** | ✅ | ✅ | ❌ | ❌ |
| **See live cursors** | ✅ | ✅ | ✅ (spectator) | ❌ |
| **Invite others** | ✅ | ❌ | ❌ | ❌ |
| **Remove collaborators** | ✅ | ❌ | ❌ | ❌ |

---

### **Technical Implementation Notes**

**1. Single Source of Truth:**
```prisma
model CourseCollaborator {
  courseId  String
  userId    String
  role      CollaboratorRole  // VIEWER or CONTRIBUTOR
  status    CollaboratorStatus // PENDING or ACCEPTED
  
  // This ONE record controls access to:
  // - Course viewing
  // - Resource access
  // - Notes access (automatic)
}
```

**2. Notes Access Logic:**
```typescript
// No separate notes invitations!
// Access is determined by course collaboration

const notesAccess = {
  canView: isOwner || collaboration?.status === 'ACCEPTED',
  canEdit: isOwner || collaboration?.role === 'CONTRIBUTOR',
  isReadOnly: collaboration?.role === 'VIEWER'
}

// Pass to BlockNote editor
<BlockNoteView editor={editor} editable={notesAccess.canEdit} />
```

**3. UI Components Required:**
- `SharedCoursesSection.tsx` - Separate from "My Courses"
- `InvitationCard.tsx` - Accept/Decline
- `PermissionBanner.tsx` - Shows role
- `CollaboratorAvatars.tsx` - GitHub-style
- `ReadOnlyBanner.tsx` - For viewer notes access

---

## 🚀 Phase-by-Phase Implementation

### **PHASE 1: Foundation & Setup (Week 1-2)**

#### Sprint 1.1: Project Initialization (Days 1-3)

**Tasks:**
1. Initialize Next.js 15 project with TypeScript
2. Install core dependencies
3. Setup Tailwind CSS and Shadcn UI
4. Configure ESLint and Prettier
5. Initialize Git repository
6. Create basic folder structure

**Commands to run:**
```bash
# Create Next.js app
npx create-next-app@latest unishare --typescript --tailwind --app --src-dir=false

# Navigate to project
cd unishare

# Install dependencies
npm install @prisma/client prisma zod bcryptjs
npm install next-auth@beta
npm install uploadthing @uploadthing/react
npm install @liveblocks/client @liveblocks/react @liveblocks/yjs
npm install @blocknote/core @blocknote/react @blocknote/mantine
npm install yjs
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
npm install nodemailer
npm install framer-motion
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
npm install slugify

# Install dev dependencies
npm install -D @types/node @types/react @types/bcryptjs @types/nodemailer

# Initialize Shadcn UI
npx shadcn-ui@latest init

# Initialize Prisma
npx prisma init
```

**Verification:**
- [ ] Dev server starts: `npm run dev`
- [ ] No TypeScript errors
- [ ] Tailwind styles working
- [ ] Git initialized

---

#### Sprint 1.2: Database Schema & Prisma Setup (Days 4-7)

**Tasks:**
1. Design complete Prisma schema
2. Configure NeonDB connection
3. Create migrations
4. Seed universities and faculties data

**Prisma Schema:**

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== USER MANAGEMENT ====================

model User {
  id           String    @id @default(cuid())
  name         String
  email        String    @unique
  password     String
  profileImage String?
  role         Role      @default(PENDING)
  universityId String
  university   University @relation(fields: [universityId], references: [id])
  facultyId    String
  faculty      Faculty    @relation(fields: [facultyId], references: [id])
  studentIdUrl String
  approvedAt   DateTime?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  courses              Course[]
  courseCollaborations CourseCollaborator[]
  events               Event[]
  articles             Article[]
  favorites            Favorite[]

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
  notes         Note?
  events        Event[]
  favorites     Favorite[]

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
  courseId      String   @unique
  course        Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  content       Json     @default("{}")
  liveblockRoom String   @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// ==================== TIMETABLE ====================

model Event {
  id        String   @id @default(cuid())
  title     String
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  dayOfWeek Int      // 0=Sunday, 6=Saturday
  startTime String   // "09:00"
  endTime   String   // "10:30"
  location  String?
  recurring Boolean  @default(true)
  createdBy String
  creator   User     @relation(fields: [createdBy], references: [id])
  createdAt DateTime @default(now())

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
  content     Json          @default("{}")
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
```

**Seed Data (prisma/seed.ts):**

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create universities with faculties
  const utm = await prisma.university.create({
    data: {
      name: 'Universiti Teknologi Malaysia',
      faculties: {
        create: [
          { name: 'Faculty of Computing' },
          { name: 'Faculty of Engineering' },
          { name: 'Faculty of Science' },
          { name: 'Faculty of Management' },
          { name: 'Faculty of Education' },
        ],
      },
    },
  })

  const uom = await prisma.university.create({
    data: {
      name: 'University of Malaya',
      faculties: {
        create: [
          { name: 'Faculty of Computer Science' },
          { name: 'Faculty of Engineering' },
          { name: 'Faculty of Arts and Social Sciences' },
          { name: 'Faculty of Business and Economics' },
        ],
      },
    },
  })

  console.log('✅ Seeded universities and faculties')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.disconnect()
  })
```

**Commands:**
```bash
# Push schema to database
npx prisma db push

# Seed database
npx prisma db seed

# Generate Prisma Client
npx prisma generate
```

**Verification:**
- [ ] Database tables created in NeonDB dashboard
- [ ] Seed data visible in database
- [ ] Prisma Client generated

---

### **PHASE 2: Authentication & Admin System (Week 2-3)**

#### Sprint 2.1: NextAuth Setup (Days 8-10)

**Tasks:**
1. Configure NextAuth with credentials provider
2. Create auth API routes
3. Implement middleware for route protection
4. Create login/signup pages
5. Setup session management

**Implementation Files:**

**1. lib/auth.ts:**
```typescript
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { university: true, faculty: true },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          facultyId: user.facultyId,
          universityId: user.universityId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          facultyId: user.facultyId,
          universityId: user.universityId,
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
          facultyId: token.facultyId,
          universityId: token.universityId,
        },
      }
    },
  },
}
```

**2. middleware.ts:**
```typescript
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin routes
    if (path.startsWith('/admin')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Student routes
    if (path.startsWith('/dashboard') || path.startsWith('/courses') || path.startsWith('/timetable')) {
      if (token?.role === 'PENDING') {
        return NextResponse.redirect(new URL('/waiting-approval', req.url))
      }
      if (token?.role !== 'APPROVED' && token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/courses/:path*', '/timetable/:path*', '/admin/:path*'],
}
```

**Verification:**
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Session persists across page refreshes
- [ ] Middleware redirects work correctly

---

#### Sprint 2.2: Student Registration & Admin Approval (Days 11-14)

**Tasks:**
1. Create signup form with university/faculty selection
2. Implement UploadThing for student ID upload
3. Create admin approval dashboard
4. Implement Nodemailer for email notifications
5. Create waiting approval page

**Key Components:**

**1. app/(auth)/signup/page.tsx** - Student registration form
**2. app/(admin)/admin/approvals/page.tsx** - Admin approval dashboard
**3. lib/email.ts** - Email notification system
**4. app/api/admin/approve/route.ts** - Approval API endpoint

**Verification:**
- [ ] Students can register with ID upload
- [ ] Registration sends confirmation email
- [ ] Admin can see pending approvals
- [ ] Approval sends notification email
- [ ] Approved students can access dashboard

---

### **PHASE 3: Course Management (Week 3-5)**

#### Sprint 3.1: Course Creation & Resource Cards (Days 15-21)

**Tasks:**
1. Create course creation form
2. Implement auto-creation of 4 predefined resource cards
3. Create custom resource card functionality
4. Implement file upload for resources
5. Build course detail page with resource cards grid

**Key Features:**
- Empty course list on first login
- Course creation with title, description, color
- Auto-create: Assignments, Tasks, Content, Notes cards (all empty)
- Custom resource cards with file upload toggle
- File management through UploadThing

**Verification:**
- [ ] New users see empty course list
- [ ] Can create course with color picker
- [ ] 4 predefined cards auto-created (empty)
- [ ] Can create custom resource cards
- [ ] File uploads work for Assignments/Content
- [ ] Tasks don't allow file uploads

---

### **PHASE 4: Sharing & Permissions (Week 5-6)**

#### 🔑 **CRITICAL: Sharing & Collaboration Architecture**

**Core Principle: Single Invitation, Automatic Access Inheritance**

```
Course Access Level    →    Notes Access    →    Resources Access
─────────────────────────────────────────────────────────────────
OWNER                 →    Full Edit       →    Full Control (add/delete)
CONTRIBUTOR           →    Full Edit       →    Can Add, Cannot Delete
VIEWER                →    Read-Only       →    Can View/Download Only
```

**Important Design Decisions:**
1. ✅ **One invitation controls EVERYTHING** - No separate notes invitations
2. ✅ **Automatic notes access** - Based on course collaboration role
3. ✅ **Real-time for all** - Even viewers see live edits (read-only mode)
4. ✅ **Clear UI separation** - "My Courses" vs "Shared With Me" sections
5. ✅ **Contributor avatars** - Like GitHub, show all contributors on course cards

---

#### Sprint 4.1: Course Sharing System (Days 22-28)

**Tasks:**
1. Create invitation system with faculty restriction check
2. Implement "Shared With Me" section on courses page
3. Build permission enforcement (Viewer/Contributor)
4. Add contributor avatars display on course cards
5. Create course settings page for managing collaborators
6. Add notification system for invitations

**Key Features to Implement:**

**1. Invitation Flow:**
```
Owner → Course Settings → Invite Student → Select Role (Viewer/Contributor)
     ↓
Student Dashboard shows "Pending Invitations" badge
     ↓
Student clicks Accept → Course appears in "Shared With Me"
     ↓
Course access + Notes access automatically granted based on role
```

**2. UI Components Needed:**
- `InviteCollaboratorModal.tsx` - Faculty-filtered search + role selector
- `PendingInvitationsCard.tsx` - Shows in dashboard
- `SharedCoursesSection.tsx` - Separate from "My Courses"
- `CollaboratorAvatars.tsx` - GitHub-style avatar stack
- `PermissionBanner.tsx` - Shows role on course detail page

**3. Permission Enforcement:**
```typescript
// Check on every resource/notes action
const collaboration = await prisma.courseCollaborator.findUnique({
  where: { courseId_userId: { courseId, userId } }
})

const isOwner = course.createdBy === userId
const canEdit = isOwner || collaboration?.role === 'CONTRIBUTOR'
const canDelete = isOwner // Only owner can delete

// For notes specifically
const notesAccess = {
  canRead: isOwner || collaboration?.status === 'ACCEPTED',
  canEdit: isOwner || collaboration?.role === 'CONTRIBUTOR',
  isReadOnly: collaboration?.role === 'VIEWER'
}
```

**4. Database Queries Needed:**
```typescript
// Get all courses (owned + shared)
const ownedCourses = await prisma.course.findMany({
  where: { createdBy: userId }
})

const sharedCourses = await prisma.course.findMany({
  where: {
    collaborators: {
      some: {
        userId,
        status: 'ACCEPTED'
      }
    }
  },
  include: {
    collaborators: {
      include: { user: true }
    }
  }
})
```

**5. Notes Access Control:**
```typescript
// In notes page - automatic access based on course role
async function NotesPage({ params }: { params: { id: string } }) {
  const collaboration = await getCollaborationRole(courseId, userId)
  
  const accessLevel = {
    owner: course.createdBy === userId,
    contributor: collaboration?.role === 'CONTRIBUTOR',
    viewer: collaboration?.role === 'VIEWER'
  }
  
  return (
    <LiveblocksProvider>
      <RoomProvider id={course.liveblockRoom}>
        <CollaborativeEditor 
          readOnly={accessLevel.viewer}  // ← Viewers get read-only
          canEdit={accessLevel.owner || accessLevel.contributor}
        />
      </RoomProvider>
    </LiveblocksProvider>
  )
}
```

**Verification:**
- [ ] Can only invite same-faculty students
- [ ] Invitations appear in recipient's dashboard
- [ ] Invitations require acceptance (can accept/decline)
- [ ] Accepted courses appear in "Shared With Me" section (separate from "My Courses")
- [ ] Viewer permissions enforced (read-only for resources AND notes)
- [ ] Contributor can add resources but not delete
- [ ] Contributor can edit notes in real-time with owner
- [ ] Viewer can see notes in real-time but cannot edit
- [ ] Avatars display on shared courses (GitHub-style)
- [ ] Owner can remove collaborators anytime
- [ ] Permission banner shows current user's role on course detail page

---

### **PHASE 5: Collaborative Notes (Week 6-7)**

#### Sprint 5.1: Real-Time Note Editor (Days 29-35)

**IMPORTANT: Notes access is automatic based on course collaboration role (see Phase 4). No separate invitations needed.**

**Access Matrix:**
```
Course Role        →    Notes Behavior
────────────────────────────────────────────
OWNER             →    Full edit, can see all cursors
CONTRIBUTOR       →    Full edit, can see all cursors, real-time sync
VIEWER            →    Read-only, can see live edits happening, cannot type
NOT INVITED       →    Cannot access notes at all
```

**Tasks:**
1. Integrate BlockNote editor
2. Configure Liveblocks for real-time sync
3. Implement role-based read-only mode for Viewers
4. Implement notes sidebar navigation
5. Add live cursors and presence indicators
6. Create auto-save functionality
7. Add permission indicators in UI (edit mode vs read-only)

**Key Implementation Details:**

**1. Liveblocks Room Setup:**
```typescript
// lib/liveblocks.ts
export const liveblocks = new Liveblocks({
  secret: env.LIVEBLOCKS_SECRET_KEY,
})

// Each course has ONE Liveblocks room for notes
// Room ID: course.id (or course.liveblockRoom field)
```

**2. Notes Page with Access Control:**
```typescript
// app/(student)/courses/[id]/notes/page.tsx
export default async function NotesPage({ params }: { params: { id: string } }) {
  const session = await getServerSession()
  const course = await getCourseWithAccess(params.id, session.user.id)
  
  // Determine access level
  const isOwner = course.createdBy === session.user.id
  const collaboration = await prisma.courseCollaborator.findUnique({
    where: { courseId_userId: { courseId: params.id, userId: session.user.id } }
  })
  
  const canEdit = isOwner || collaboration?.role === 'CONTRIBUTOR'
  const isReadOnly = collaboration?.role === 'VIEWER'
  
  // Get all users who can access this course (for presence)
  const collaborators = await prisma.courseCollaborator.findMany({
    where: { courseId: params.id, status: 'ACCEPTED' },
    include: { user: true }
  })
  
  return (
    <NotesProvider
      roomId={params.id}
      canEdit={canEdit}
      isReadOnly={isReadOnly}
      collaborators={collaborators}
    >
      <CollaborativeEditor />
    </NotesProvider>
  )
}
```

**3. Collaborative Editor Component:**
```typescript
// components/notes/collaborative-editor.tsx
'use client'

import { useCreateBlockNoteWithLiveblocks } from '@liveblocks/react-blocknote'
import { BlockNoteView } from '@blocknote/mantine'

export function CollaborativeEditor({ 
  canEdit, 
  isReadOnly 
}: { 
  canEdit: boolean
  isReadOnly: boolean 
}) {
  const editor = useCreateBlockNoteWithLiveblocks({
    editable: canEdit,  // ← Viewers get editable: false
  })
  
  return (
    <div className="relative">
      {isReadOnly && (
        <div className="mb-4 rounded-lg bg-amber-50 p-3 border border-amber-200">
          <p className="text-sm text-amber-800">
            👁️ You're viewing in read-only mode. You can see live edits but cannot make changes.
          </p>
        </div>
      )}
      
      <BlockNoteView 
        editor={editor} 
        className={isReadOnly ? 'cursor-not-allowed opacity-90' : ''}
      />
      
      <LiveCollaborators />
    </div>
  )
}
```

**4. Live Presence Component:**
```typescript
// components/notes/live-collaborators.tsx
'use client'

import { useOthers, useSelf } from '@liveblocks/react/suspense'

export function LiveCollaborators() {
  const others = useOthers()
  const self = useSelf()
  
  const activeUsers = others.map(user => user.info)
  
  return (
    <div className="fixed top-4 right-4 flex items-center gap-2">
      <span className="text-sm text-gray-600">
        {activeUsers.length + 1} editing
      </span>
      <div className="flex -space-x-2">
        {activeUsers.map(user => (
          <Avatar key={user.id} user={user} />
        ))}
        <Avatar user={self.info} isYou />
      </div>
    </div>
  )
}
```

**Tech Stack:**
- BlockNote for editing
- Liveblocks for CRDT synchronization
- Yjs for conflict-free merging (handled by Liveblocks)
- Mantine styles for BlockNote

**Verification:**
- [ ] Editor loads without errors
- [ ] Real-time sync works across tabs (open 2+ tabs as different users)
- [ ] **Contributors can edit simultaneously with live cursors**
- [ ] **Viewers see live edits but cannot type (read-only mode)**
- [ ] Live cursors visible with user names and colors
- [ ] Presence indicators show who's online
- [ ] Auto-save every 2 seconds
- [ ] Content persists after refresh
- [ ] Read-only banner appears for Viewers
- [ ] Editor is grayed out/disabled for Viewers
- [ ] No conflicts when multiple people type at once

---

### **PHASE 6: Favorites & Calendar (Week 7-8)**

#### Sprint 6.1: Timetable System (Days 36-42)

**Tasks:**
1. Implement favorites system
2. Create FullCalendar integration
3. Filter calendar dropdown to favorited courses only
4. Add conflict detection
5. Build weekly/day/list views

**Verification:**
- [ ] Can favorite courses
- [ ] Calendar dropdown shows only favorites
- [ ] Can create recurring events
- [ ] Conflict warnings appear
- [ ] Color-coded by course

---

### **PHASE 7: Public Articles (Week 8-9)**

#### Sprint 7.1: Article System (Days 43-49)

**Tasks:**
1. Create article editor (BlockNote solo mode)
2. Implement draft/publish workflow
3. Build public article browsing
4. Add search and tag filtering
5. Create author dashboard

**Verification:**
- [ ] Can write articles in draft
- [ ] Publishing makes article public
- [ ] Anyone can read without login
- [ ] Search and tags work
- [ ] View counter increments

---

### **PHASE 8: Polish & Deploy (Week 9-10)**

#### Sprint 8.1: Final Polish (Days 50-56)

**Tasks:**
1. Mobile responsiveness
2. Loading states and skeletons
3. Error boundaries
4. Toast notifications
5. Accessibility improvements

#### Sprint 8.2: Deployment (Days 57-60)

**Tasks:**
1. Setup Vercel project
2. Configure environment variables
3. Test production build
4. Deploy to production
5. User acceptance testing

---

## 🧪 Testing Checklist

### Authentication
- [ ] Registration with all fields
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Session persistence
- [ ] Role-based redirects

### Course Management
- [ ] Create course
- [ ] Edit course
- [ ] Delete course
- [ ] Auto-created resource cards
- [ ] File uploads
- [ ] Custom resource cards

### Sharing & Permissions
- [ ] Invite same-faculty student (faculty restriction enforced)
- [ ] Cannot invite different-faculty student (blocked)
- [ ] Invitation appears in recipient's dashboard
- [ ] Can accept invitation
- [ ] Can decline invitation
- [ ] Accepted course appears in "Shared With Me" section (separate from "My Courses")
- [ ] Viewer cannot add resources
- [ ] Viewer cannot edit resources
- [ ] Viewer cannot delete resources
- [ ] Contributor can add resources
- [ ] Contributor cannot delete resources (only owner can)
- [ ] Owner can remove collaborators
- [ ] Contributor avatars display on course cards (GitHub-style)
- [ ] Permission banner shows on course detail page

### Collaborative Notes
- [ ] Open notes as Owner - full edit access
- [ ] Open notes as Contributor - full edit access
- [ ] Open notes as Viewer - read-only mode (cannot type)
- [ ] Open two tabs as different Contributors - see live cursors
- [ ] Type simultaneously - no text duplication
- [ ] See live cursors with names and colors
- [ ] Viewer sees live edits happening (read-only spectator mode)
- [ ] Read-only banner appears for Viewers
- [ ] No text duplication
- [ ] Auto-save works
- [ ] Content persists after refresh
- [ ] Presence indicators show who's online
- [ ] Cannot access notes if not invited to course
- [ ] Cannot invite different faculty
- [ ] Viewer cannot add resources
- [ ] Contributor can add resources
- [ ] Contributor cannot delete
- [ ] Owner can remove collaborators

### Collaborative Notes
- [ ] Open two tabs, type simultaneously
- [ ] See live cursors
- [ ] No text duplication
- [ ] Auto-save works
- [ ] Content persists

### Calendar
- [ ] Only favorited courses in dropdown
- [ ] Create recurring event
- [ ] Conflict detection
- [ ] Color-coded events

### Articles
- [ ] Create draft
- [ ] Publish article
- [ ] Public viewing without login
- [ ] Search works
- [ ] View counter increments

---

## 🚨 Common Issues & Solutions

### Issue: Prisma Client not generated
**Solution:**
```bash
npx prisma generate
```

### Issue: NextAuth session undefined
**Solution:**
- Check NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches current URL
- Clear browser cookies and retry

### Issue: UploadThing uploads failing
**Solution:**
- Verify API keys are correct
- Check file size limits
- Ensure CORS is configured

### Issue: Liveblocks connection failed
**Solution:**
- Verify secret keys
- Check WebSocket connections aren't blocked
- Test in incognito mode

### Issue: Database connection timeout
**Solution:**
- Verify DATABASE_URL is correct
- Check NeonDB project is active
- Test connection in Prisma Studio

---

## 📊 Development Workflow

### Daily Workflow:
1. Pull latest changes: `git pull`
2. Start dev server: `npm run dev`
3. Make changes
4. Test locally
5. Commit with descriptive message
6. Push to GitHub

### Before Each Sprint:
1. Review sprint goals
2. Create feature branch
3. Plan component structure
4. Identify dependencies

### After Each Sprint:
1. Test all features
2. Fix bugs
3. Update documentation
4. Merge to main branch
5. Deploy to staging

---

## 🎯 Success Criteria

### MVP Ready (Week 4):
- [ ] Authentication working
- [ ] Course creation functional
- [ ] Resource cards system complete
- [ ] Basic file uploads working

### Feature Complete (Week 8):
- [ ] All 4 core modules done
- [ ] Sharing permissions enforced
- [ ] Real-time collaboration stable
- [ ] Calendar functional

### Production Ready (Week 10):
- [ ] All bugs fixed
- [ ] Mobile responsive
- [ ] Performance optimized
- [ ] Deployed to Vercel
- [ ] User documentation complete

---

## 📝 Notes for Claude Code

- Always create files in proper directory structure
- Follow TypeScript best practices
- Use Shadcn UI components consistently
- Implement proper error handling
- Add loading states for all async operations
- Write descriptive commit messages
- Test each feature before moving to next
- Ask for clarification if requirements unclear

---

## 🔗 Useful Resources

- Next.js 15 Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- NextAuth Docs: https://next-auth.js.org
- UploadThing Docs: https://docs.uploadthing.com
- Liveblocks Docs: https://liveblocks.io/docs
- BlockNote Docs: https://www.blocknotejs.org/docs
- FullCalendar Docs: https://fullcalendar.io/docs
- Shadcn UI: https://ui.shadcn.com

---

**This implementation guide should be used as the master reference for the entire development process. Follow each phase sequentially and verify completion criteria before moving to the next phase.**
