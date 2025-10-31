# UNIShare - Implementation Guide & Handoff

**Tech Stack:** Next.js 15, TypeScript, Prisma, PostgreSQL (NeonDB), NextAuth, Liveblocks, BlockNote, UploadThing
**Last Updated:** October 31, 2025
**Status:** Core features complete, ready for feature expansion

---

## 🎯 Project Mission

**UNIShare** is a student-driven academic organization platform for Malaysian universities. Students create courses, share resources, collaborate on notes in real-time, and manage timetables.

**Think:** Notion + Google Drive + Canvas, simplified for students

**Target Users:** Malaysian university students (UTM, UM, USM, UPM)
**Core Value:** Real-time collaborative note-taking with role-based permissions

---

## ⚡ Quick Start (5 Minutes)

### 1. Start Development Server
```bash
cd /Users/rawa/dev/unishare
npm run dev  # localhost:3000
```

### 2. Test Accounts (From seed file - Password: `admin123` for all)

| Email | Password | Role | Details |
|-------|----------|------|---------|
| `admin@unishare.com` | `admin123` | ADMIN | Full system access |
| `sarah@student.utm.my` | `admin123` | APPROVED | Owns: Data Structures & Web Dev |
| `john@student.utm.my` | `admin123` | APPROVED | Owns: Machine Learning & Database |
| `alice@student.utm.my` | `admin123` | PENDING | Awaiting approval |

### 3. Test Real-Time Collaboration
1. **Browser 1:** Login as Sarah → Data Structures course → "Study Notes" resource
2. **Browser 2 (Incognito):** Login as John → Same course → Same notes page
3. **Type in one browser** → Should appear instantly in the other
4. **If not working:** Check `/api/liveblocks-auth` for errors in terminal

### 4. Key Routes
- `/courses` - Course dashboard (default after login)
- `/courses/[id]` - Course detail page
- `/courses/[id]/notes/[pageId]` - Real-time collaborative notes
- `/admin/approvals` - Admin approval dashboard
- `/timetable` - Weekly timetable view

---

## 🏗️ Architecture Overview

### Tech Stack Details
- **Framework:** Next.js 15 (App Router) + TypeScript
- **Database:** PostgreSQL (NeonDB) via Prisma ORM
- **Auth:** NextAuth v5 (credentials provider)
- **Real-time:** Liveblocks + Yjs
- **Rich Text:** BlockNote (Notion-style editor)
- **File Upload:** UploadThing (Student ID verification only)
- **Email:** Nodemailer (Gmail SMTP)
- **Styling:** Tailwind CSS + shadcn/ui

### Real-Time Collaboration Flow (CRITICAL)
```
User opens notes page
  ↓
Connects to Liveblocks room (unique per page)
  ↓
Client calls /api/liveblocks-auth
  ↓
Server verifies course access → returns signed token
  ↓
User joins room with Yjs provider
  ↓
BlockNote editor binds to Yjs fragment "document-store"
  ↓
Real-time sync via Liveblocks edge network (Cloudflare DurableObjects)
  ↓
Database backup every 30 seconds (Note.content field as JSON)
```

**Key Insight:** Liveblocks is PRIMARY storage. PostgreSQL is backup only.

---

## ✅ Implemented Features

### 1. Authentication & User Management
**Status:** ✅ Complete

**Features:**
- NextAuth v5 with credentials (email/password)
- Role-based access: ADMIN, APPROVED, PENDING
- Student registration with university/faculty selection
- Student ID upload via UploadThing
- Admin approval dashboard at `/admin/approvals`
- Email notifications on approval (Nodemailer + Gmail)
- Middleware route protection

**Key Files:**
- `/src/server/auth.ts` - Auth configuration
- `/src/app/(auth)/login/page.tsx` - Login page
- `/src/app/(auth)/signup/page.tsx` - Registration
- `/middleware.ts` - Route protection

**Redirect Flow:**
- Login → `/courses` (students & admins)
- PENDING users → `/waiting-approval`
- Admin approval email → `/courses`

---

### 2. Course Management
**Status:** ✅ Complete

**Features:**
- CRUD operations for courses
- Resource cards: ASSIGNMENT, TASK, CONTENT, NOTES, CUSTOM
- Collaboration system: OWNER, CONTRIBUTOR, VIEWER
- Invite system with status: PENDING, ACCEPTED, REJECTED
- Favorites system (star courses)
- Color-coded course cards

**Permissions:**
| Role | Can Edit | Can Delete | Can Invite | Can View |
|------|----------|------------|------------|----------|
| OWNER | ✅ | ✅ | ✅ | ✅ |
| CONTRIBUTOR | ✅ | ❌ | ❌ | ✅ |
| VIEWER | ❌ | ❌ | ❌ | ✅ |

**Key Files:**
- `/src/server/api/routers/course.ts` - Course CRUD
- `/src/app/(student)/courses/page.tsx` - Course listing
- `/src/app/(student)/courses/[id]/page.tsx` - Course detail
- `/src/components/resources/resource-card.tsx` - Resource display

---

### 3. Real-Time Collaborative Notes ⭐
**Status:** ✅ Complete (Most Complex Feature)

**Features:**
- Real-time text synchronization (Liveblocks + Yjs + BlockNote)
- Multi-page support per course
- **Nested pages** (parent-child hierarchy) ← JUST IMPLEMENTED
- **Inline title editing** with auto-save ← JUST IMPLEMENTED
- Live presence (see active collaborators with avatars)
- Role-based editing (OWNER/CONTRIBUTOR edit, VIEWER read-only)
- 30-second database backup
- Expand/collapse nested pages with chevron icons

**How Nested Pages Work:**
```
Database:
  Note.parentId → Note.id (self-referential)

UI:
  Recursive PageItem component
  Visual indentation = 12px + (depth × 16px)

Actions:
  Dropdown menu → "Add sub-page" passes parentId to API
  Create API accepts optional parentId parameter
```

**Critical Files:**
| File | Purpose |
|------|---------|
| `/src/components/notes/collaborative-editor.tsx` | Main editor component |
| `/src/components/notes/notes-sidebar.tsx` | Page navigation with nested support |
| `/src/components/notes/collaborative-notes-room.tsx` | Liveblocks RoomProvider |
| `/src/app/(student)/courses/[id]/notes/[[...pageId]]/page.tsx` | Page wrapper |
| `/src/app/api/liveblocks-auth/route.ts` | Authentication endpoint |
| `/src/app/api/notes/create/route.ts` | Page creation (accepts parentId) |
| `/src/app/api/notes/[id]/route.ts` | Page CRUD (update, delete) |
| `/liveblocks.config.ts` | Client configuration |

**Common Issues & Solutions:**

| Issue | Root Cause | Solution |
|-------|------------|----------|
| Text not syncing | Using `useCreateBlockNoteWithLiveblocks` | Use manual Yjs provider: `getYjsProviderForRoom` |
| Auth 404 errors | Room ID has `:thread:` suffix | Parse room ID: `room.split(":")[0]` |
| Page not found | Resource card using wrong ID | Use `courseId` for navigation, not resource `id` |

**Implementation Details:**
```typescript
// CORRECT WAY (current implementation)
const room = useRoom();
const provider = getYjsProviderForRoom(room);
const doc = provider.getYDoc();

const editor = useCreateBlockNote({
  collaboration: {
    provider,
    fragment: doc.getXmlFragment("document-store"),
    user: {
      name: userInfo?.name ?? "Anonymous",
      color: userInfo?.color ?? "#000000",
    },
  },
});

// WRONG WAY (deprecated, don't use)
const editor = useCreateBlockNoteWithLiveblocks({ ... });
```

---

### 4. Timetable
**Status:** ✅ Complete

**Features:**
- Weekly recurring events
- Day/time scheduling (0=Sunday, 6=Saturday)
- Location tracking
- Course-linked events

**Key Files:**
- `/src/app/(student)/timetable/page.tsx`
- `/src/server/api/routers/event.ts`

---

### 5. Database Schema
**Status:** ✅ Complete

**Models:**
- `User` - Authentication + profile
- `University`, `Faculty` - Multi-university support
- `Course` - Course management
- `CourseCollaborator` - Collaboration invites/roles
- `Resource` - Course resources
- `Note` - Collaborative pages with nested structure
- `Event` - Timetable events
- `Favorite` - Starred courses
- `Article`, `Tag` - Public articles (partial)

**Nested Pages Schema:**
```prisma
model Note {
  id            String   @id @default(cuid())
  title         String   @default("Untitled")
  courseId      String
  liveblockRoom String   @unique
  content       Json     @default("{}")
  order         Int      @default(0)

  // Nested pages support
  parentId      String?
  parent        Note?    @relation("NestedPages", fields: [parentId], references: [id], onDelete: Cascade)
  children      Note[]   @relation("NestedPages")

  @@index([parentId])
}
```

---

## 📊 Seeded Test Data (From `prisma/seed.ts`)

Run `npx prisma db seed` to populate:

### Universities (4)
- **Universiti Teknologi Malaysia (UTM)** - 5 faculties
- **Universiti Malaya (UM)** - 5 faculties
- **Universiti Sains Malaysia (USM)** - 4 schools
- **Universiti Putra Malaysia (UPM)** - 3 faculties

### Users (4)
| Name | Email | Password | Role | Details |
|------|-------|----------|------|---------|
| Admin User | admin@unishare.com | admin123 | ADMIN | Full access |
| Sarah Ahmed | sarah@student.utm.my | admin123 | APPROVED | Faculty of Computing, UTM |
| John Doe | john@student.utm.my | admin123 | APPROVED | Faculty of Computing, UTM |
| Alice Wong | alice@student.utm.my | admin123 | PENDING | Awaiting approval |

### Courses (4)
| Title | Owner | Color | Resources |
|-------|-------|-------|-----------|
| Data Structures & Algorithms | Sarah | Blue (#3B82F6) | 4 resources |
| Web Development | Sarah | Green (#10B981) | 4 resources |
| Machine Learning | John | Purple (#8B5CF6) | 4 resources |
| Database Systems | John | Orange (#F59E0B) | 0 resources |

### Collaborations (2)
- John is CONTRIBUTOR on Sarah's "Data Structures & Algorithms"
- Sarah is VIEWER on John's "Machine Learning"

### Resources Per Course
Each course with resources has:
- 1 ASSIGNMENT (with deadline)
- 1 TASK
- 1 CONTENT
- 1 NOTES (links to collaborative notes)

### Articles (4)
- 3 PUBLISHED (visible to public)
- 1 DRAFT (visible to author only)

### Timetable Events (5)
- DSA Lecture (Monday 09:00-11:00, Room A101)
- DSA Tutorial (Wednesday 14:00-16:00, Lab C201)
- Web Dev Lab (Tuesday 10:00-13:00, Lab B105)
- ML Lecture (Thursday 09:00-11:00, Room D203)
- Database Lecture (Friday 14:00-16:00, Room E105)

---

## 🚧 Partially Implemented

### Public Articles System
**Status:** 🟡 Database ready, UI pending

**Done:**
- Database schema (`Article`, `Tag` models)
- Seed data with 4 sample articles
- Tags system

**Missing:**
- [ ] Public listing page `/articles`
- [ ] Article detail view `/articles/[slug]`
- [ ] Rich text editor for creation
- [ ] Tag filtering UI

---

## ❌ Not Yet Implemented (Priority Queue)

### Priority 1: File Upload for Resources ⭐
**Why:** Database has `fileUrls` field but no UI to upload/download

**Implementation:**
- Use existing UploadThing setup (already used for Student ID)
- Add file upload to resource creation modal
- Display file previews/downloads on resource cards
- Reference `/src/app/(auth)/signup/page.tsx:118-143` for upload pattern

**Example Pattern:**
```typescript
import { UploadButton } from "~/lib/uploadthing";

<UploadButton
  endpoint="resourceFileUploader"  // Need to create this endpoint
  onClientUploadComplete={(res) => {
    setFileUrls(res.map(r => r.url));
  }}
/>
```

---

### Priority 2: Mobile Responsiveness
**Why:** Desktop-first design needs mobile optimization

**Focus Areas:**
- [ ] Mobile navigation drawer
- [ ] Touch-optimized notes editor
- [ ] Responsive timetable grid
- [ ] Mobile course cards layout

---

### Priority 3: Search & Filtering
**Why:** Discoverability becomes critical as courses grow

**Features:**
- [ ] Global search across courses/notes
- [ ] Filter courses by collaborators
- [ ] Search within collaborative notes content
- [ ] Filter by resource type

---

### Priority 4: Notifications System
**Why:** Users miss collaboration invites

**Features:**
- [ ] In-app notification center
- [ ] Collaboration invite notifications
- [ ] Course activity alerts
- [ ] Email + in-app combined

---

### Priority 5: Complete Articles Feature
**Why:** Database ready, just needs UI

**Tasks:**
- [ ] Create `/src/app/articles/page.tsx` - List published articles
- [ ] Create `/src/app/articles/[slug]/page.tsx` - Article detail view
- [ ] Add BlockNote editor for article creation/editing
- [ ] Implement tag filtering
- [ ] Add view count tracking

---

## 🔑 Environment Variables Required

```env
# Database (NeonDB PostgreSQL)
DATABASE_URL="postgresql://user:pass@host/db"

# NextAuth
NEXTAUTH_SECRET="generate with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Email (Nodemailer + Gmail SMTP)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-gmail-app-password"  # NOT your regular password!
EMAIL_FROM="UNIShare <noreply@unishare.com>"

# UploadThing (File uploads)
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="..."

# Liveblocks (Real-time collaboration - CRITICAL)
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY="pk_..."
LIVEBLOCKS_SECRET_KEY="sk_..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Gmail App Password Setup:**
1. Enable 2FA on Gmail
2. Go to Google Account → Security → 2-Step Verification
3. Scroll to "App passwords" → Generate new
4. Copy 16-character password → Use as `EMAIL_PASSWORD`

---

## 🛠️ Recent Fixes (October 31, 2025)

### 1. Dashboard Redirect Issue (FIXED)
**Problem:** Login redirected to `/dashboard` which doesn't exist → 404

**Solution:**
- Updated login to redirect to `/courses`
- Fixed middleware redirects
- Updated admin approval email link

**Files Changed:**
- `/src/app/(auth)/login/page.tsx:45`
- `/middleware.ts:32,62`
- `/src/server/api/routers/admin.ts:108`

---

### 2. Real-Time Sync Not Working (FIXED)
**Problem:** Text typed in one browser didn't appear in another

**Root Cause:** Using deprecated `useCreateBlockNoteWithLiveblocks` hook

**Solution:** Manual Yjs provider setup with `getYjsProviderForRoom`

**File Changed:** `/src/components/notes/collaborative-editor.tsx`

---

### 3. Liveblocks Auth 404 Errors (FIXED)
**Problem:** `/api/liveblocks-auth` returning 404 for some room IDs

**Root Cause:** Room IDs sometimes have suffixes like `pageId:thread:123`

**Solution:** Parse base room ID before database lookup

**Code:**
```typescript
// /src/app/api/liveblocks-auth/route.ts:62
const baseRoomId = room.split(":")[0];
const page = await db.note.findUnique({ where: { id: baseRoomId } });
```

---

### 4. Nested Pages Feature (IMPLEMENTED)
**What:** Parent-child page hierarchy (like Notion sub-pages)

**Changes:**
- Added `parentId`, `parent`, `children` to `Note` model
- Updated `/api/notes/create` to accept optional `parentId`
- Rebuilt sidebar with recursive `PageItem` component
- Added expand/collapse chevron buttons

---

### 5. Inline Title Editing (IMPLEMENTED)
**What:** Editable page title above editor with auto-save

**Where:** `/src/components/notes/collaborative-editor.tsx:244-266`

**Features:**
- Large title input (4xl font)
- Auto-saves on blur or Enter key
- Shows "Saving title..." indicator
- Disabled for read-only users

---

## 🎓 Project Goals & Context

### Why This Project Exists
Malaysian university students needed a centralized platform to:
- Share course materials collaboratively
- Take notes together in real-time
- Organize timetables
- Access resources without complex LMS systems

### Success Criteria
- [ ] 100+ active student users
- [x] Real-time collaboration working smoothly
- [ ] Mobile app (future phase)
- [ ] Multi-university deployment

### Technical Decisions

**Why Liveblocks over Socket.io?**
- Managed infrastructure, no server maintenance
- Better CRDT support via Yjs
- Cloudflare edge network for global performance

**Why BlockNote over TipTap?**
- More Notion-like out of the box
- Better default features (slash commands, drag-drop)
- Active development and community

**Why NextAuth v5?**
- Latest version with App Router support
- Better TypeScript types
- Simplified configuration

**Why NeonDB over Supabase?**
- Serverless PostgreSQL scaling
- Better Prisma compatibility
- Simpler pricing model

---

## 💡 Development Tips

### When Debugging Real-Time Sync
1. Check `/api/liveblocks-auth` endpoint first
2. Verify room ID matches pageId in database
3. Use DevTools → Network → WS tab to see WebSocket connections
4. Check Liveblocks dashboard for connected users
5. Verify environment variables are set

### When Adding New Features
1. Update Prisma schema if DB changes needed
2. Run `npx prisma db push` (we use push, not migrations)
3. Add API routes in `/src/server/api/routers/`
4. Create UI components in `/src/components/`
5. Test with seeded data

### Testing Real-Time Collaboration
- Use **two different browsers** (not tabs in same browser)
- Login as different users (sarah@student.utm.my, john@student.utm.my)
- Open same notes page in both browsers
- Should see each other in "Active Collaborators"
- Typing should sync **instantly** (< 100ms latency)

### File Upload Pattern (For Resources Feature)
See `/src/app/(auth)/signup/page.tsx:118-143`:
```typescript
import { UploadButton } from "~/lib/uploadthing";

<UploadButton
  endpoint="studentIdUploader"
  onClientUploadComplete={(res) => {
    const urls = res.map(file => file.url);
    // Store urls in state or send to API
  }}
  onUploadError={(error: Error) => {
    console.error("Upload failed:", error);
  }}
/>
```

---

## 🚨 Critical Warnings

### DO NOT CHANGE These Things

#### 1. Liveblocks Room IDs
**Don't:** Modify the `liveblockRoom` field format
**Why:** Existing users connected, will break sync
**Safe:** Only create NEW pages with new room IDs

#### 2. Yjs Fragment Name
**Don't:** Change `"document-store"` in editor config
**Why:** Breaks compatibility with existing rooms
**Safe:** Create new fragment for new features

#### 3. User Role Names
**Don't:** Modify role names (ADMIN, APPROVED, PENDING)
**Why:** Hardcoded in middleware and auth logic
**Safe:** Add new roles, keep existing ones

#### 4. Prisma Schema Fields
**Don't:** Delete fields without checking dependencies
**Why:** Will break API routes and UI components
**Safe:** Add new fields, mark old ones optional

---

## 🐛 Known Issues (Not Critical)

### 1. SVG Avatar Warnings
**Issue:** Dicebear avatars cause `dangerouslyAllowSVG` warnings
**Impact:** Minor console noise only
**Solution:** Add to `next.config.js` or switch to different avatar service
**Priority:** Low

### 2. Old Dashboard Requests (404s in logs)
**Issue:** See `GET /dashboard 404` in terminal
**Impact:** None, from browser cache/old tabs
**Solution:** All redirect logic already fixed, these will disappear
**Priority:** Ignore

---

## 📁 Critical File Locations

### Authentication
- `/src/server/auth.ts` - NextAuth v5 configuration
- `/middleware.ts` - Route protection + role checks
- `/src/app/(auth)/login/page.tsx` - Login UI
- `/src/app/(auth)/signup/page.tsx` - Registration flow

### Course Management
- `/src/server/api/routers/course.ts` - CRUD operations
- `/src/app/(student)/courses/page.tsx` - Course grid
- `/src/app/(student)/courses/[id]/page.tsx` - Course detail
- `/src/components/resources/resource-card.tsx` - Resource display

### Collaborative Notes (Most Complex)
- `/src/components/notes/collaborative-editor.tsx` - Editor component
- `/src/components/notes/notes-sidebar.tsx` - Page navigation
- `/src/components/notes/collaborative-notes-room.tsx` - RoomProvider
- `/src/app/(student)/courses/[id]/notes/[[...pageId]]/page.tsx` - Route
- `/src/app/api/liveblocks-auth/route.ts` - Authentication
- `/src/app/api/notes/create/route.ts` - Create pages
- `/src/app/api/notes/[id]/route.ts` - Update/delete pages
- `/liveblocks.config.ts` - Client config

### Admin
- `/src/app/(admin)/admin/approvals/page.tsx` - Approval dashboard
- `/src/server/api/routers/admin.ts` - Admin operations
- `/src/lib/email.ts` - Email notifications

### Database
- `/prisma/schema.prisma` - Database schema
- `/prisma/seed.ts` - Seed data (test accounts/courses)

---

## 🎯 Recommended Next Steps

### Immediate (First Hour)
1. **Test everything:**
   - Login as all test users
   - Create/edit courses
   - Test nested pages
   - Verify real-time sync
   - Test title editing

2. **Check for issues:**
   - Review server logs
   - Test all CRUD operations
   - Verify permissions work

### Short-term (Next Session)
1. **Implement File Upload for Resources**
   - Create UploadThing endpoint for resources
   - Add upload UI to resource modal
   - Display files on resource cards
   - Test upload/download flow

2. **Complete Articles Feature**
   - Create listing page
   - Create detail page
   - Add BlockNote editor integration
   - Implement filtering

### Mid-term
1. **Mobile Responsiveness**
   - Mobile nav drawer
   - Touch-optimized editor
   - Responsive tables

2. **Search Functionality**
   - Global course search
   - Filter by collaborators
   - Search notes content

---

## 📚 External Documentation

- **Liveblocks:** https://liveblocks.io/docs
- **BlockNote:** https://www.blocknotejs.org/docs
- **NextAuth v5:** https://authjs.dev
- **Prisma:** https://www.prisma.io/docs
- **UploadThing:** https://docs.uploadthing.com
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## 🎬 Final Notes

**Current State:** Project is production-ready for core features. Real-time sync works perfectly, nested pages implemented, all authentication flows working.

**What's Next:** File upload for resources, then mobile optimization, then search.

**Tech Debt:** Minimal - only minor SVG warnings.

**Blockers:** None.

**Your Mission:** Pick up where we left off. Test everything works, then implement file upload for resources. All context is here. Good luck! 🚀

---

**Last Updated:** October 31, 2025
**Files Changed Today:** 6 (login redirect, nested pages, title editing, admin email, resource navigation)
**Tests Passing:** Real-time sync ✅, Nested pages ✅, Title auto-save ✅
**Production Ready:** Core features yes, full deployment needs file upload + mobile optimization
