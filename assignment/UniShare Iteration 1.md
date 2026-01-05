# UniShare - Sprint 1 Iteration Report

**Application Development - SCSJ3104**
**Qaiwan International University**

## Prepared by:

| Team Members | Matric Number |
|--------------|---------------|
| Rawa Dara Radha | |
| Parwar Yassin qadr | |
| Drud Zmnako | |
| Muhamad ahmad | |
| Aland haval | |

**Submitted to:** Mr. Sassan Sarbast
**Date:** November 10, 2025
**Sprint Duration:** October 20, 2025 - November 10, 2025

---

## Table of Contents

1. Use Case Diagrams
2. Domain Model (UML Diagram)
3. Sequence Diagrams
4. Use Case Scenarios
5. Data Description
6. Data Dictionary

---

## Sprint 1 Overview

Sprint 1 establishes the foundational infrastructure for UniShare, including database architecture, authentication framework, and file storage capabilities. This sprint focuses on backend setup without implementing user-facing features, preparing the system for student registration and admin approval workflows in Sprint 2.

### Sprint 1 Goals
- ✅ Next.js 15 project initialization with TypeScript
- ✅ PostgreSQL database provisioned (NeonDB)
- ✅ Prisma ORM configuration and schema design
- ✅ NextAuth 5 (beta) integration with Credentials provider
- ✅ UploadThing file storage configuration
- ✅ Database seeding with universities and faculties
- ✅ Role-based access control foundation (ADMIN, APPROVED, PENDING)

### Technical Achievements
- Implemented Prisma migrations with cascading relationships
- Configured JWT-based session management with NextAuth 5
- Set up secure file upload endpoints for student IDs (4MB) and resources (16MB)
- Created RESTful API routes for universities and faculties
- Established type-safe database queries with Prisma Client

---

## 1. Use Case Diagrams

### System Administrator Use Case

**[DIAGRAM 1: System Administrator Use Case - PLACEHOLDER FOR VISUAL DIAGRAM]**

**Description:**
The system administrator use case illustrates the initial platform setup where the admin configures the database, seeds initial data (universities and faculties), sets up authentication providers, and configures file storage. The system validates configurations and initializes the NextAuth session management with JWT tokens.

**Actors:**
- System Administrator (Developer)
- UniShare System

**System Boundary:** Platform Configuration Functions

**Use Cases:**
1. **UC-S1-001:** Configure Database Connection
   - **Includes:** Validate Environment Variables, Test Database Connection
2. **UC-S1-002:** Run Prisma Migrations
   - **Includes:** Create Database Schema, Establish Foreign Keys
3. **UC-S1-003:** Seed Initial Data
   - **Includes:** Insert Universities, Insert Faculties
4. **UC-S1-004:** Setup NextAuth
   - **Includes:** Generate JWT Secret, Configure Session Strategy
5. **UC-S1-005:** Configure UploadThing
   - **Includes:** Register Upload Endpoints, Set File Size Limits
6. **UC-S1-006:** Verify System Health
   - **Includes:** Test Database Connection, Verify API Routes

---

### Database Administrator Use Case

**[DIAGRAM 2: Database Administrator Use Case - PLACEHOLDER FOR VISUAL DIAGRAM]**

**Description:**
The database administrator use case shows how Prisma migrations are executed to create database tables, establish relationships between entities (University, Faculty, User, Account, Session), and validate schema integrity. The workflow includes running migrations, seeding data, and verifying database connections.

**Actors:**
- Database Administrator (Developer)
- Prisma CLI
- PostgreSQL Database

**Use Cases:**
1. Execute Migrations
2. Create Tables
3. Establish Relationships
4. Seed Data
5. Verify Schema

---

## 2. Domain Model (UML Diagram)

**[DIAGRAM 3: UniShare Domain Model - Sprint 1 - PLACEHOLDER FOR VISUAL DIAGRAM]**

**Description:**
The domain model illustrates the core entities for Sprint 1: **User**, **University**, **Faculty**, **Account**, **Session**, and **VerificationToken** tables.

### Key Relationships:

**University ↔ Faculty:** One-to-Many
- University contains multiple faculties
- Each faculty belongs to exactly one university
- Cascade delete: Deleting university deletes all faculties

**University ↔ User:** One-to-Many
- University has multiple students/admins
- Each user belongs to one university

**Faculty ↔ User:** One-to-Many
- Faculty has multiple students
- Each user belongs to one faculty
- Faculty selection restricted to parent university

**User ↔ Account:** One-to-Many
- User can have multiple authentication accounts (for future OAuth support)
- Each account belongs to one user
- Cascade delete: Deleting user deletes all accounts

**User ↔ Session:** One-to-Many
- User can have multiple active sessions (different devices)
- Each session belongs to one user
- Cascade delete: Deleting user deletes all sessions
- Auto-cleanup on expiration

### Entities:

**1. University:**
- id (PK, CUID)
- name (Unique)
- logo (Optional)
- description (Optional)
- website (Optional)
- location (Optional)
- createdAt, updatedAt

**2. Faculty:**
- id (PK, CUID)
- name
- code (Optional)
- description (Optional)
- universityId (FK → University.id)
- createdAt, updatedAt

**3. User:**
- id (PK, CUID)
- name
- email (Unique)
- password (Bcrypt hashed)
- profileImage (Optional)
- avatarIndex (Default: 0)
- role (Enum: ADMIN | APPROVED | PENDING)
- universityId (FK → University.id)
- facultyId (FK → Faculty.id)
- studentIdUrl (UploadThing URL)
- approvedAt (Nullable)
- createdAt, updatedAt

**4. Account (NextAuth):**
- id (PK, CUID)
- userId (FK → User.id)
- type
- provider
- providerAccountId
- refresh_token, access_token, expires_at, token_type, scope, id_token, session_state
- Unique: (provider, providerAccountId)

**5. Session (NextAuth):**
- id (PK, CUID)
- sessionToken (Unique)
- userId (FK → User.id)
- expires (DateTime)

**6. VerificationToken (NextAuth):**
- identifier
- token (Unique)
- expires (DateTime)
- Unique: (identifier, token)

### Enum: Role
- **ADMIN:** Full system access, approve/reject students
- **APPROVED:** Verified students, full feature access
- **PENDING:** Awaiting approval, limited access

---

## 3. Sequence Diagrams

### Sequence 1: Platform Initialization

**[DIAGRAM 4: Platform Initialization Sequence Diagram - PLACEHOLDER FOR VISUAL DIAGRAM]**

**Description:**
The initialization sequence shows the interaction between Developer, Terminal, Prisma CLI, Database, and Configuration Files.

**Participants:**
1. Developer
2. Terminal
3. Prisma CLI
4. PostgreSQL Database (NeonDB)
5. NextAuth Config
6. UploadThing Setup

**Flow:**
1. Developer → Terminal: Run `npm install`
2. Terminal → Node.js: Install dependencies (Next.js 15, Prisma, NextAuth 5, UploadThing)
3. Developer → Terminal: Create `.env` file
4. Developer → .env: Add `DATABASE_URL` (NeonDB connection string)
5. Developer → .env: Add `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
6. Developer → .env: Add `UPLOADTHING_SECRET`, `UPLOADTHING_APP_ID`
7. Developer → Terminal: Run `npx prisma generate`
8. Prisma CLI → Database: Test connection
9. Database → Prisma: Connection successful
10. Developer → Terminal: Run `npx prisma migrate dev --name init`
11. Prisma CLI → Database: Execute CREATE TABLE statements
12. Database → Prisma: Tables created (User, University, Faculty, Account, Session, VerificationToken)
13. Prisma CLI → Database: Establish foreign key constraints
14. Database → Prisma: Constraints applied
15. Developer → Terminal: Run `npx prisma db seed`
16. Prisma CLI → Database: INSERT universities (Qaiwan, Salahaddin, Sulaimani)
17. Database → Prisma: 3 universities inserted
18. Prisma CLI → Database: INSERT faculties (CS, Engineering, Business, Medicine, etc.)
19. Database → Prisma: 15+ faculties inserted
20. Developer → NextAuth Config: Setup Credentials provider
21. NextAuth → NextAuth: Generate JWT secret if missing
22. Developer → UploadThing: Configure upload endpoints
23. Developer → UploadThing: Define `studentIdUploader` (max 4MB, images only)
24. Developer → UploadThing: Define `resourceUploader` (max 16MB, PDF/images/docs)
25. UploadThing → UploadThing: Validate configuration
26. Developer → Terminal: Run `npm run dev`
27. Terminal → Next.js 15: Start development server (port 3000)
28. Next.js → Database: Verify connection
29. Database → Next.js: Connected
30. Developer: System ready for Sprint 2 development

**Alternative Flows:**
- If `DATABASE_URL` invalid → Show connection error, halt migration
- If schema syntax invalid → Display validation errors, prevent migration
- If UploadThing API key invalid → Display error, prompt to check credentials

---

### Sequence 2: NextAuth Session Creation

**[DIAGRAM 5: NextAuth Session Creation Sequence Diagram - PLACEHOLDER FOR VISUAL DIAGRAM]**

**Description:**
This sequence demonstrates how NextAuth creates and manages user sessions using JWT.

**Participants:**
1. User (Future - Sprint 2+)
2. Next.js Middleware
3. NextAuth
4. JWT Handler
5. PostgreSQL Database
6. Protected Route

**Flow:**
1. User → Protected Route: Attempt to access `/courses`
2. Next.js Middleware → NextAuth: Check for session token
3. NextAuth → JWT Handler: Verify JWT token validity
4. JWT Handler → NextAuth: Token valid
5. JWT Handler → JWT Handler: Decode token to extract user ID and role
6. NextAuth → Database: Query User by ID
7. Database → NextAuth: Return user record (name, email, role, universityId, facultyId)
8. NextAuth → NextAuth: Create session object with user details
9. NextAuth → Protected Route: Pass session object
10. Protected Route → User: Grant access based on role
    - **If PENDING:** Redirect to `/waiting-approval`
    - **If APPROVED:** Show courses page
    - **If ADMIN:** Show admin dashboard

**JWT Token Structure:**
```json
{
  "id": "clx123abc",
  "email": "student@example.com",
  "role": "APPROVED",
  "iat": 1699564800,
  "exp": 1702156800
}
```

**Session Object Structure:**
```json
{
  "user": {
    "id": "clx123abc",
    "name": "Rawa Dara",
    "email": "student@example.com",
    "role": "APPROVED"
  },
  "expires": "2023-12-10T00:00:00.000Z"
}
```

---

### Sequence 3: UploadThing Configuration

**[DIAGRAM 6: UploadThing Configuration Sequence Diagram - PLACEHOLDER FOR VISUAL DIAGRAM]**

**Description:**
The UploadThing sequence illustrates the setup and configuration process for secure file uploads.

**Participants:**
1. Developer
2. UploadThing API
3. UploadThing Core Config
4. API Route Handler
5. Client Components

**Flow:**
1. Developer → UploadThing Core: Create `/app/api/uploadthing/core.ts`
2. Developer → UploadThing Core: Define `studentIdUploader` endpoint
   - File type: Images only (jpg, png, gif, webp)
   - Max size: 4MB
   - Max count: 1 file
3. Developer → UploadThing Core: Define `resourceUploader` endpoint
   - File types: Images, PDF, Word docs
   - Max size: 16MB per file
   - Max count: 10 files
4. Developer → UploadThing Core: Set middleware for authentication (to be implemented in Sprint 2)
5. Developer → UploadThing Core: Define `onUploadComplete` callback
6. UploadThing API → UploadThing Core: Validate API key (`UPLOADTHING_SECRET`)
7. UploadThing API → UploadThing Core: Return success
8. Developer → API Route Handler: Create `/app/api/uploadthing/route.ts`
9. Developer → API Route Handler: Export GET and POST handlers
10. UploadThing Core → UploadThing API: Register endpoints
11. UploadThing API → UploadThing Core: Return endpoint URLs
12. Developer → Client Components: Create `UploadButton` and `UploadDropzone` components
13. Developer → Client Components: Import from `@uploadthing/react`
14. Developer: Test file upload
15. Client → UploadThing API: Upload file to CDN (S3)
16. UploadThing API → UploadThing Core: File uploaded, return URL
17. UploadThing Core → Database: Store URL in database (future - Sprint 2)
18. System ready for student ID verification and resource uploads

**Upload Endpoint Configuration:**

```typescript
// studentIdUploader
{
  image: { maxFileSize: "4MB", maxFileCount: 1 }
}

// resourceUploader
{
  image: { maxFileSize: "16MB" },
  pdf: { maxFileSize: "16MB" },
  "application/msword": { maxFileSize: "16MB" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { maxFileSize: "16MB" }
}
```

---

## 4. Use Case Scenarios

### Use Case 1: Database Schema Migration

**ID:** UC-S1-001
**Actors:** Developer, Database Administrator
**Description:** Execute Prisma migrations to create the database schema with all required tables and relationships.

**Preconditions:**
- PostgreSQL database provisioned (NeonDB)
- `DATABASE_URL` configured in `.env` file
- Prisma schema defined in `prisma/schema.prisma`

**Flow of Events:**
1. Developer opens terminal
2. Developer navigates to project directory
3. Developer runs `npx prisma migrate dev --name init`
4. Prisma CLI reads schema file (`prisma/schema.prisma`)
5. Prisma generates SQL migration file in `prisma/migrations/`
6. Prisma connects to PostgreSQL database (NeonDB)
7. Prisma executes CREATE TABLE statements for all models
8. Database creates User, University, Faculty, Account, Session, VerificationToken tables
9. Database establishes foreign key constraints:
   - User.universityId → University.id
   - User.facultyId → Faculty.id
   - Faculty.universityId → University.id
   - Account.userId → User.id (CASCADE DELETE)
   - Session.userId → User.id (CASCADE DELETE)
10. Database creates indexes for performance:
    - User: email (unique), role, universityId, facultyId
    - University: name (unique)
    - Faculty: universityId, (universityId + name) unique
    - Account: userId, (provider + providerAccountId) unique
    - Session: sessionToken (unique), userId, expires
11. Prisma confirms migration success
12. Prisma generates Prisma Client with TypeScript types
13. Developer verifies tables exist using `npx prisma studio`

**Postconditions:**
Database schema created with all tables, relationships, constraints, and indexes in place.

**Alternative Flows:**
- **A1: Database connection fails**
  - At step 6, if connection fails, show connection error
  - Developer checks DATABASE_URL in .env
  - Developer verifies NeonDB is accessible
  - Developer retries migration
- **A2: Schema has syntax errors**
  - At step 4, if schema invalid, display validation errors
  - Developer fixes schema syntax
  - Developer reruns migration
- **A3: Migration already exists**
  - At step 5, if migration exists, prompt developer
  - Options: (1) Reset database, (2) Create new migration, (3) Cancel
  - Developer chooses appropriate action

**Priority:** Critical

---

### Use Case 2: Seed Universities and Faculties

**ID:** UC-S1-002
**Actors:** Developer, Database Administrator
**Description:** Populate the database with initial university and faculty data to enable student registration in Sprint 2.

**Preconditions:**
- Database schema migrated successfully
- Seed script defined in `prisma/seed.ts`
- Seed data prepared (university names and associated faculties)
- `package.json` configured with `prisma.seed` command

**Flow of Events:**
1. Developer runs `npx prisma db seed`
2. Prisma executes seed script (`prisma/seed.ts`)
3. Seed script imports Prisma Client
4. Seed script connects to database via Prisma Client
5. Script creates University records:
   - Qaiwan International University (Sulaymaniyah)
   - Salahaddin University (Erbil)
   - University of Sulaimani (Sulaymaniyah)
6. For each university, script creates Faculty records:
   - **Qaiwan:** Computer Science, Engineering, Business Administration, Medicine
   - **Salahaddin:** Science, Engineering, Arts, Law
   - **Sulaimani:** Science and Engineering, Humanities, Medical Sciences
7. Database stores university records
8. Database assigns CUIDs to all university records
9. Database stores faculty records with `universityId` foreign keys
10. Database assigns CUIDs to all faculty records
11. Database enforces unique constraint: (universityId, faculty name)
12. Seed script confirms successful insertion
13. Seed script logs summary:
    - "✓ Created 3 universities"
    - "✓ Created 11 faculties"
14. Developer queries database using `npx prisma studio`
15. Developer verifies data integrity:
    - All universities present
    - All faculties linked to correct universities
    - No orphaned records

**Postconditions:**
Database contains universities and faculties ready for student selection during registration (Sprint 2).

**Alternative Flows:**
- **A1: University name already exists**
  - At step 5, if duplicate university name, skip insertion
  - Log: "University '{name}' already exists, skipping"
  - Continue with next university
- **A2: Foreign key constraint fails**
  - At step 9, if universityId invalid, log error
  - Rollback transaction
  - Display error message with details
  - Exit seed script with error code
- **A3: Database connection lost**
  - At any step, if connection lost, catch error
  - Retry seed operation once
  - If retry fails, display error and exit

**Priority:** High

---

### Use Case 3: Configure NextAuth with Credentials Provider

**ID:** UC-S1-003
**Actors:** Developer
**Description:** Set up NextAuth 5 (beta) with credentials provider for email/password authentication and configure JWT session strategy.

**Preconditions:**
- NextAuth package installed (`npm install next-auth@beta`)
- Database schema includes Account and Session tables
- Environment variables configured:
  - `NEXTAUTH_URL` = "http://localhost:3000"
  - `NEXTAUTH_SECRET` = generated secret (32+ characters)

**Flow of Events:**
1. Developer creates `/app/api/auth/[...nextauth]/route.ts`
2. Developer imports NextAuth and Prisma Client
3. Developer configures Credentials Provider:
   ```typescript
   CredentialsProvider({
     name: 'Credentials',
     credentials: {
       email: { label: "Email", type: "email" },
       password: { label: "Password", type: "password" }
     },
     async authorize(credentials) {
       // To be implemented in Sprint 2
       return null;
     }
   })
   ```
4. Developer sets session strategy to JWT:
   ```typescript
   session: {
     strategy: 'jwt',
     maxAge: 30 * 24 * 60 * 60, // 30 days
   }
   ```
5. Developer configures callbacks (jwt, session):
   ```typescript
   callbacks: {
     async jwt({ token, user }) {
       if (user) {
         token.id = user.id;
         token.role = user.role;
       }
       return token;
     },
     async session({ session, token }) {
       if (session.user) {
         session.user.id = token.id;
         session.user.role = token.role;
       }
       return session;
     }
   }
   ```
6. Developer defines pages:
   ```typescript
   pages: {
     signIn: '/login',
     signOut: '/logout',
     error: '/auth/error',
   }
   ```
7. Developer configures Prisma adapter:
   ```typescript
   adapter: PrismaAdapter(prisma)
   ```
8. NextAuth validates `NEXTAUTH_SECRET` exists
9. If missing, NextAuth generates warning (but continues in dev mode)
10. Developer tests authentication flow (placeholder - Sprint 2 will implement actual login)
11. Developer verifies session table entries created on login (future)
12. Developer confirms JWT token generation works

**Postconditions:**
NextAuth configured and ready for user authentication with role-based access control. Actual login implementation deferred to Sprint 2.

**Alternative Flows:**
- **A1: NEXTAUTH_SECRET missing**
  - At step 8, if secret missing, show warning
  - Developer generates secret: `openssl rand -base64 32`
  - Developer adds to `.env` file
  - Developer restarts dev server
- **A2: Database adapter fails**
  - At step 7, if Prisma adapter error, log error
  - NextAuth falls back to JWT-only mode (no database sessions)
  - Developer checks database connection
  - Developer fixes issue and restarts
- **A3: Session callback error**
  - At step 5, if callback throws error, log error
  - NextAuth returns default session
  - Developer debugs callback logic

**Priority:** Critical

---

### Use Case 4: Setup UploadThing for File Uploads

**ID:** UC-S1-004
**Actors:** Developer
**Description:** Configure UploadThing for secure file uploads including student ID verification (Sprint 2) and resource files (Sprint 3).

**Preconditions:**
- UploadThing account created at uploadthing.com
- `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID` obtained from dashboard
- UploadThing packages installed:
  - `npm install uploadthing @uploadthing/react`

**Flow of Events:**
1. Developer creates `/app/api/uploadthing/core.ts`
2. Developer imports `createUploadthing` from `uploadthing/next`
3. Developer defines upload endpoints:

   **studentIdUploader (for Sprint 2):**
   - Max file size: 4MB
   - Allowed types: Images only (jpg, png, gif, webp)
   - Max file count: 1
   - Purpose: Student ID verification during registration

   **resourceUploader (for Sprint 3):**
   - Max file size: 16MB per file
   - Allowed types: Images, PDF, Word documents
   - Max file count: 10 files
   - Purpose: Course resource uploads (slides, assignments, etc.)

4. Developer sets middleware for authentication checks:
   ```typescript
   .middleware(async () => {
     // To be implemented in Sprint 2
     // Will check if user is authenticated
     return {};
   })
   ```

5. Developer defines `onUploadComplete` callback:
   ```typescript
   .onUploadComplete(async ({ file }) => {
     console.log('File uploaded:', file.url);
     // To be implemented: Save URL to database
     return { url: file.url };
   })
   ```

6. Developer creates `/app/api/uploadthing/route.ts` route handler:
   ```typescript
   import { createRouteHandler } from 'uploadthing/next';
   import { ourFileRouter } from './core';

   export const { GET, POST } = createRouteHandler({
     router: ourFileRouter,
   });
   ```

7. Developer creates UploadThing client in `/lib/uploadthing.ts`:
   ```typescript
   import { generateReactHelpers } from '@uploadthing/react';
   import type { OurFileRouter } from '@/app/api/uploadthing/core';

   export const { useUploadThing, uploadFiles } =
     generateReactHelpers<OurFileRouter>();
   ```

8. Developer creates React components:
   - `UploadButton` component for simple uploads
   - `UploadDropzone` component for drag-and-drop

9. UploadThing API validates API key (`UPLOADTHING_SECRET`)
10. If valid, UploadThing registers endpoints
11. UploadThing returns endpoint URLs for client usage
12. Developer tests file upload:
    - Developer creates test component with UploadButton
    - Developer selects test image file
    - File uploads to UploadThing CDN (S3)
    - UploadThing returns file URL: `https://utfs.io/f/{fileKey}`
13. Developer verifies upload in UploadThing dashboard
14. System ready for student ID and resource uploads

**Postconditions:**
UploadThing configured and ready for student ID verification uploads (Sprint 2) and resource file uploads (Sprint 3).

**Alternative Flows:**
- **A1: API key invalid**
  - At step 9, if key invalid, UploadThing returns 401 error
  - Developer checks `UPLOADTHING_SECRET` in `.env`
  - Developer verifies key matches dashboard
  - Developer restarts dev server
- **A2: File size exceeds limit**
  - At step 12, if file > 4MB for studentId or > 16MB for resource
  - UploadThing rejects upload
  - Show error message: "File too large"
  - User selects smaller file
- **A3: Upload fails**
  - At step 12, if network error or server issue
  - UploadThing retries automatically (3 attempts)
  - If all attempts fail, show error to user
  - User can retry manually

**Priority:** High

---

### Use Case 5: Create Base User Model with Roles

**ID:** UC-S1-005
**Actors:** Developer
**Description:** Define User model in Prisma schema with role-based access control (PENDING, APPROVED, ADMIN).

**Preconditions:**
- Prisma CLI installed
- Database connection established
- University and Faculty models already defined

**Flow of Events:**
1. Developer opens `prisma/schema.prisma`
2. Developer defines Role enum:
   ```prisma
   enum Role {
     ADMIN
     APPROVED
     PENDING
   }
   ```

3. Developer creates User model with fields:
   - **id:** String, Primary Key, CUID (auto-generated)
   - **name:** String (full name of student/admin)
   - **email:** String, Unique (login identifier)
   - **password:** String (bcrypt hashed, 60 chars)
   - **profileImage:** String? (optional avatar URL)
   - **avatarIndex:** Int, Default 0 (for color selection)
   - **role:** Role enum, Default PENDING
   - **universityId:** String, Foreign Key → University.id
   - **facultyId:** String, Foreign Key → Faculty.id
   - **studentIdUrl:** String (UploadThing URL for verification)
   - **approvedAt:** DateTime? (nullable, set when admin approves)
   - **createdAt:** DateTime, Auto-generated
   - **updatedAt:** DateTime, Auto-updated

4. Developer defines relationships:
   ```prisma
   university University @relation(fields: [universityId], references: [id])
   faculty   Faculty    @relation(fields: [facultyId], references: [id])
   accounts  Account[]
   sessions  Session[]
   ```

5. Developer adds unique constraint on email:
   ```prisma
   @@unique([email])
   ```

6. Developer adds indexes for performance:
   ```prisma
   @@index([email])
   @@index([role])
   @@index([facultyId])
   ```

7. Developer adds composite index for common queries:
   ```prisma
   @@index([universityId, facultyId])
   ```

8. Developer runs `npx prisma format` to validate schema syntax
9. Prisma validates schema structure
10. Prisma confirms schema is valid
11. Developer runs `npx prisma migrate dev --name add_user_model`
12. Prisma generates SQL migration file
13. Database executes CREATE TABLE users statement
14. Database creates Role enum type
15. Database applies all constraints and indexes
16. Prisma generates updated Prisma Client
17. Developer verifies table structure using `npx prisma studio`
18. Developer confirms:
    - User table exists
    - Role enum has correct values
    - Foreign keys point to University and Faculty
    - Email has unique constraint
    - Indexes created for performance

**Postconditions:**
User model created with role-based access control ready for authentication system (Sprint 2).

**Alternative Flows:**
- **A1: Schema syntax invalid**
  - At step 8, if syntax error, Prisma shows error message
  - Developer fixes syntax (missing commas, wrong field types, etc.)
  - Developer reruns `npx prisma format`
- **A2: Foreign key references missing tables**
  - At step 13, if University or Faculty tables don't exist
  - Database returns error: "Referenced table does not exist"
  - Developer ensures University and Faculty migrations run first
  - Developer reruns User migration
- **A3: Enum values conflict with existing data**
  - At step 14, if changing existing enum values
  - Database may fail migration
  - Developer creates new enum with different name
  - Developer updates all references
  - Developer drops old enum

**Priority:** Critical

---

## 5. Data Description

### Core Entities

**User Entity:**
The User entity represents all system users including students and administrators. Each user has authentication credentials (email and hashed password), role-based permissions (PENDING for newly registered students awaiting approval, APPROVED for verified students with full access, ADMIN for administrators with approval privileges), and institutional associations (linked to a specific university and faculty). The entity includes fields for profile information, avatar color selection, student ID verification URL, approval timestamp, and audit timestamps.

**University Entity:**
The University entity stores information about educational institutions registered on the UniShare platform. Each university record includes a unique identifier, official name, optional logo URL, descriptive text, website, and location. Universities serve as the primary organizational unit, grouping faculties and students. The entity supports the hierarchical structure necessary for faculty-restricted course sharing in later sprints.

**Faculty Entity:**
The Faculty entity represents academic departments or faculties within universities. Each faculty record belongs to exactly one university (enforced through foreign key constraint with CASCADE delete) and contains the faculty name, optional faculty code, and descriptive information. Faculties provide granular organization, enabling students to identify their specific academic department and restricting course sharing to students within the same faculty. The unique constraint on (universityId, name) prevents duplicate faculty names within the same university.

**Account Entity (NextAuth):**
The Account entity is part of NextAuth's database schema and stores authentication provider information. For credential-based authentication (email/password), this table links users to their authentication method. The entity supports multiple authentication providers per user (future OAuth integration), stores provider-specific tokens (refresh_token, access_token), and manages OAuth-related data. Cascade delete ensures that deleting a user removes all associated accounts.

**Session Entity (NextAuth):**
The Session entity manages user sessions with JWT tokens. Each session record links to a specific user and contains the session token (unique identifier), expiration timestamp, and session state. NextAuth uses this table to track active sessions, implement secure logout, enforce session timeouts (30 days default), and enable multi-device login. The JWT strategy stores minimal data in the database while encoding user information (id, role) in the token itself for performance.

**VerificationToken Entity (NextAuth):**
The VerificationToken entity supports email verification workflows (future feature). Each token record contains a unique identifier (email), token string (unique), and expiration timestamp. NextAuth generates these tokens for email confirmation during registration and password reset flows. Tokens expire after a set period to maintain security. The composite unique constraint on (identifier, token) prevents duplicate tokens.

---

### Relationships

**University-Faculty Relationship:**
- **Type:** One-to-Many (1:N)
- **Description:** A single university contains multiple faculties, but each faculty belongs to exactly one university
- **Implementation:** Faculty table contains `universityId` foreign key referencing `University.id`
- **Cascade Rules:** When a university is deleted, associated faculties are cascade deleted (onDelete: Cascade)
- **Constraint:** Faculty cannot be created without valid `universityId`
- **Uniqueness:** (universityId, name) unique to prevent duplicate faculty names within same university

**User-University Relationship:**
- **Type:** Many-to-One (N:1)
- **Description:** Multiple users can be associated with one university, but each user belongs to exactly one university
- **Implementation:** User table contains `universityId` foreign key referencing `University.id`
- **Constraint:** User cannot be created without valid `universityId`
- **Purpose:** Enables university-wide queries and potential future features (university announcements, etc.)

**User-Faculty Relationship:**
- **Type:** Many-to-One (N:1)
- **Description:** Multiple users can belong to one faculty, but each user is associated with exactly one faculty
- **Implementation:** User table contains `facultyId` foreign key referencing `Faculty.id`
- **Constraint:** User cannot be created without valid `facultyId`
- **Purpose:** Enables faculty-restricted course sharing (students can only share with same faculty)
- **Validation:** Faculty must belong to same university as user's universityId

**User-Account Relationship:**
- **Type:** One-to-Many (1:N)
- **Description:** A user can have multiple authentication accounts (for different providers), but each account belongs to one user
- **Implementation:** Account table contains `userId` foreign key referencing `User.id`
- **Cascade:** onDelete: Cascade (deleting user deletes all accounts)
- **Uniqueness:** (provider, providerAccountId) unique to prevent duplicate provider accounts
- **Usage:** Supports multi-provider authentication in future (Google OAuth, Discord, etc.)

**User-Session Relationship:**
- **Type:** One-to-Many (1:N)
- **Description:** A user can have multiple active sessions (different devices/browsers), but each session belongs to one user
- **Implementation:** Session table contains `userId` foreign key referencing `User.id`
- **Cascade:** onDelete: Cascade (deleting user deletes all sessions)
- **Management:** Old sessions are automatically cleaned up on expiration (NextAuth cron job)
- **Expiration:** Default 30 days, configurable in NextAuth config

---

## 6. Data Dictionary

### Entity: User

**Description:** Stores user information including authentication credentials, institutional associations, and role-based permissions.

| Attribute | Datatype | Description | Constraints |
|-----------|----------|-------------|-------------|
| id | String (CUID) | Unique identifier for user | Primary Key, Auto-generated, Not Null |
| name | String | Full name of the user | Not Null, Min: 2 chars, Max: 100 chars |
| email | String | Email address (login identifier) | Unique, Not Null, Valid email format |
| password | String | Bcrypt hashed password | Not Null, Min hash length: 60 chars |
| profileImage | String? | URL to profile avatar | Optional, Valid URL |
| avatarIndex | Int | Avatar color selection (0-9) | Not Null, Default: 0, Min: 0, Max: 9 |
| role | Enum (Role) | User access level | Not Null, Default: PENDING |
| universityId | String | Reference to parent university | Foreign Key, Not Null |
| facultyId | String | Reference to user's faculty | Foreign Key, Not Null |
| studentIdUrl | String | UploadThing URL for student ID | Not Null (required for students) |
| approvedAt | DateTime? | Timestamp when admin approved | Nullable (null = not approved yet) |
| createdAt | DateTime | Account creation timestamp | Auto-generated, Not Null |
| updatedAt | DateTime | Last update timestamp | Auto-updated, Not Null |

**Indexes:**
- Primary: id
- Unique: email
- Foreign: universityId references University(id)
- Foreign: facultyId references Faculty(id)
- Index: email (for login queries)
- Index: role (for filtering by permission level)
- Index: facultyId (for faculty-restricted queries)
- Composite Index: (universityId, facultyId) for query optimization

**Relationships:**
- **Belongs To:** University (N:1)
- **Belongs To:** Faculty (N:1)
- **Has Many:** Account (1:N)
- **Has Many:** Session (1:N)
- **Has Many:** Course (1:N) - Sprint 3
- **Has Many:** CourseCollaborator (1:N) - Sprint 4

---

### Entity: University

**Description:** Stores information about educational institutions participating in UniShare.

| Attribute | Datatype | Description | Constraints |
|-----------|----------|-------------|-------------|
| id | String (CUID) | Unique identifier for university | Primary Key, Auto-generated |
| name | String | Official name of the university | Unique, Not Null, Min: 3 chars |
| logo | String? | URL to university logo image | Optional, Valid URL |
| description | String? | Brief description of university | Optional, Max: 500 chars |
| website | String? | Official university website URL | Optional, Valid URL |
| location | String? | City or region of university | Optional, Max: 100 chars |
| createdAt | DateTime | Record creation timestamp | Auto-generated, Not Null |
| updatedAt | DateTime | Last update timestamp | Auto-updated, Not Null |

**Indexes:**
- Primary: id
- Unique: name
- Index: name (for search optimization)

**Relationships:**
- **Has Many:** Faculty (1:N)
- **Has Many:** User (1:N)

---

### Entity: Faculty

**Description:** Stores information about academic faculties/departments within universities.

| Attribute | Datatype | Description | Constraints |
|-----------|----------|-------------|-------------|
| id | String (CUID) | Unique identifier for faculty | Primary Key, Auto-generated |
| name | String | Name of faculty/department | Not Null, Min: 3 chars |
| code | String? | Faculty abbreviation code | Optional, Max: 10 chars |
| description | String? | Brief description of faculty | Optional, Max: 300 chars |
| universityId | String | Reference to parent university | Foreign Key, Not Null |
| createdAt | DateTime | Record creation timestamp | Auto-generated, Not Null |
| updatedAt | DateTime | Last update timestamp | Auto-updated, Not Null |

**Indexes:**
- Primary: id
- Foreign: universityId references University(id)
- Unique: (universityId, name) - prevents duplicate faculty names within same university
- Index: universityId (for efficient queries)

**Relationships:**
- **Belongs To:** University (N:1)
- **Has Many:** User (1:N)

---

### Entity: Account (NextAuth)

**Description:** NextAuth account table for managing authentication providers and tokens.

| Attribute | Datatype | Description | Constraints |
|-----------|----------|-------------|-------------|
| id | String (CUID) | Unique identifier | Primary Key, Auto-generated |
| userId | String | Reference to user | Foreign Key, Not Null |
| type | String | Account type | Not Null, e.g., "oauth", "email" |
| provider | String | Auth provider name | Not Null, e.g., "credentials", "google" |
| providerAccountId | String | Provider-specific account ID | Not Null |
| refresh_token | String? | OAuth refresh token | Optional |
| access_token | String? | OAuth access token | Optional |
| expires_at | Int? | Token expiration timestamp | Optional |
| token_type | String? | Type of token | Optional, e.g., "Bearer" |
| scope | String? | OAuth scope | Optional |
| id_token | String? | OAuth ID token | Optional |
| session_state | String? | OAuth session state | Optional |
| refresh_token_expires_in | Int? | Refresh token expiry | Optional |

**Indexes:**
- Primary: id
- Foreign: userId references User(id) with CASCADE delete
- Unique: (provider, providerAccountId) - prevents duplicate provider accounts
- Index: userId (for user account queries)

**Relationships:**
- **Belongs To:** User (N:1)

---

### Entity: Session (NextAuth)

**Description:** NextAuth session table for JWT-based session management.

| Attribute | Datatype | Description | Constraints |
|-----------|----------|-------------|-------------|
| id | String (CUID) | Unique identifier | Primary Key, Auto-generated |
| sessionToken | String | JWT session token | Unique, Not Null |
| userId | String | Reference to user | Foreign Key, Not Null |
| expires | DateTime | Session expiration timestamp | Not Null |

**Indexes:**
- Primary: id
- Unique: sessionToken
- Foreign: userId references User(id) with CASCADE delete
- Index: userId (for user session queries)
- Index: expires (for cleanup queries)

**Relationships:**
- **Belongs To:** User (N:1)

---

### Entity: VerificationToken (NextAuth)

**Description:** NextAuth verification token table for email verification and password reset.

| Attribute | Datatype | Description | Constraints |
|-----------|----------|-------------|-------------|
| identifier | String | User identifier (email) | Not Null |
| token | String | Unique verification token | Unique, Not Null |
| expires | DateTime | Token expiration timestamp | Not Null |

**Indexes:**
- Primary: Composite (identifier, token)
- Unique: token
- Index: expires (for cleanup)

**Relationships:**
- No direct foreign keys (tokens reference users by email)

---

### Enum: Role

**Description:** Defines user permission levels in the system.

| Value | Description | Permissions |
|-------|-------------|-------------|
| ADMIN | Administrator | Full system access, approve/reject student registrations, manage all users, view all courses (future) |
| APPROVED | Verified Student | Full feature access: create courses, upload resources, share courses, collaborate on notes, publish articles, use timetable |
| PENDING | Awaiting Approval | Limited access: waiting page only, cannot access main features until admin approval, can view approval status |

---

## Sprint 1 Success Criteria

✅ **Infrastructure:**
- [x] Next.js 15 project initialized with TypeScript and App Router
- [x] PostgreSQL database provisioned on NeonDB (serverless)
- [x] Prisma ORM 6.5+ configured with database connection
- [x] Environment variables properly configured and validated

✅ **Database:**
- [x] Database schema created with all entities (User, University, Faculty, Account, Session, VerificationToken)
- [x] Database seeded with 3 universities and 11 faculties
- [x] All foreign key relationships established and working
- [x] Indexes created for performance optimization
- [x] Cascade delete rules applied (University → Faculty, User → Account/Session)

✅ **Authentication:**
- [x] NextAuth 5 (beta) configured with Credentials provider
- [x] JWT session strategy implemented (30-day expiration)
- [x] Session callbacks configured (jwt, session)
- [x] Role-based access foundation established
- [x] Authentication pages defined (/login, /logout, /auth/error)

✅ **File Storage:**
- [x] UploadThing configured with studentIdUploader (4MB, images)
- [x] UploadThing configured with resourceUploader (16MB, files)
- [x] Upload endpoints registered and working
- [x] Client components ready (UploadButton, UploadDropzone)

✅ **API:**
- [x] API routes created for universities (GET /api/universities)
- [x] API routes created for faculties (GET /api/faculties)
- [x] NextAuth API routes (GET/POST /api/auth/[...nextauth])
- [x] UploadThing API routes (GET/POST /api/uploadthing)

✅ **Development:**
- [x] Prisma Studio accessible for database verification
- [x] All TypeScript types properly defined
- [x] Documentation complete with use cases and data dictionary
- [x] Git repository initialized with proper .gitignore

---

## Technical Stack Summary

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Frontend Framework** | Next.js (App Router) | 15.1+ | React-based web framework with server-side rendering |
| **Language** | TypeScript | 5.0+ | Type-safe JavaScript for better development experience |
| **Database** | PostgreSQL (NeonDB) | 16+ | Serverless PostgreSQL for cloud-based data storage |
| **ORM** | Prisma | 6.5+ | Type-safe database client and migration tool |
| **Authentication** | NextAuth.js | 5.0 (beta) | Authentication library with JWT session management |
| **Password Hashing** | bcrypt | 5.1+ | Secure password hashing (12 rounds) |
| **File Storage** | UploadThing | Latest | Cloud file storage and CDN for student IDs and resources |
| **Styling** | Tailwind CSS + Shadcn UI | Latest | Utility-first CSS with pre-built components |
| **Development Tools** | Git, VSCode, Browser DevTools | Latest | Version control and development environment |

---

## Next Sprint Preview (Sprint 2)

Sprint 2 will build upon this foundation by implementing:

### 1. Student Registration System:
- Registration form with university/faculty selection dropdowns
- Student ID upload via UploadThing (studentIdUploader endpoint)
- Password hashing with bcrypt (12 rounds)
- User creation with PENDING role
- Email validation and duplicate check
- Form validation with Zod schemas

### 2. Admin Approval Workflow:
- Admin dashboard to view pending students (/admin/approvals)
- Student details page with uploaded ID verification
- Approve/reject functionality with confirmation dialogs
- Role update from PENDING to APPROVED (with approvedAt timestamp)
- Bulk approval capabilities
- Search and filter pending students

### 3. Email Notifications:
- Nodemailer integration with Gmail SMTP
- Registration confirmation emails (HTML templates)
- Approval notification emails (with login link)
- Rejection notification emails (with reason - optional)
- Email template system with branding

### 4. Authentication System:
- Login page with NextAuth credentials provider
- Role-based redirects:
  - **PENDING** → `/waiting-approval` (shows approval status)
  - **APPROVED** → `/courses` (main application)
  - **ADMIN** → `/admin` (admin dashboard)
- Session management with JWT tokens
- Logout functionality (clear session)
- Protected route middleware
- "Remember me" functionality (extended session)

---

**End of Sprint 1 Iteration Report**
