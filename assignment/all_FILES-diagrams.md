# UniShare Project - Complete Diagram Audit

**Master Reference: Every Diagram Across All Documents**

---

## 📄 DOCUMENT 1: Unishare_Proposal.pdf

### Diagrams Present: **0 diagrams**

**Status:** Text-only document with no visual diagrams

**Content:** Executive summary, problem statement, goals, objectives, NABC methodology, team roles

---

## 📄 DOCUMENT 2: Unishare_ProjectPlan.pdf

### Diagrams Present: **0 diagrams**

**Status:** Text-only document with tables only (no visual diagrams)

**Content:** Project goals, scope, team organization table, WBS text description, milestone table, deliverables table

**Tables (NOT diagrams):**

- Team members and roles table
- Milestone schedule table
- Deliverables and receivers table

---

## 📄 DOCUMENT 3: UniShare_Iteration_1.pdf (Sprint 1)

### Diagrams Present: **5 diagrams**

---

#### **Diagram 1: System Administrator Use Case**

**Type:** Use Case Diagram
**Location:** Section 1 - Use Case Diagrams

**Contains:**

- **Actor:** System Administrator (stick figure, pink circle)
- **System Boundary:** Two yellow boxes labeled "System Configuration Functions" and "Supporting Functions"
- **Use Cases (6 main functions):**
  1. Configure Database Connection
  2. Run Prisma Migrations
  3. Seed Initial Data
  4. Setup NextAuth
  5. Configure UploadThing
  6. Verify System Health
- **Supporting Functions (6 includes relationships):**
  1. Validate Environment Vars
  2. Create Database Schema
  3. Insert Universities & Faculties
  4. Generate JWT Secret
  5. Register Upload Endpoints
  6. Test Database Connection
- **Relationships:** Dotted lines showing "includes" relationships between main functions and supporting functions

**Purpose:** Shows initial platform setup process where admin configures infrastructure

---

#### **Diagram 2: Admin Approval Workflow Use Case**

**Type:** Use Case Diagram
**Location:** Section 1 - Use Case Diagrams

**Contains:**

- **Actors:**
  - Admin (stick figure, pink circle)
  - UniShare System (external system box, purple)
- **System Boundary:** Yellow box labeled "Admin Functions"
- **Use Cases (6 main functions with UC codes):**
  - UC006: Admin Login
  - UC007: Approve/Reject Users
  - UC008: Manage Accounts
  - UC009: Monitor System
  - UC010: Review Feedback
  - UC011: Provide Support
- **Extended Functions (2 includes):**
  - Verify Student ID (included in Approve/Reject)
  - Send Email Notification (included in Manage Accounts)
- **Relationships:** Solid lines from Admin to use cases, dotted "includes" lines to extended functions

**Purpose:** Shows admin's role in reviewing and approving pending student registrations

---

#### **Diagram 3: UniShare Domain Model - Sprint 1**

**Type:** UML Class Diagram / ER Diagram
**Location:** Section 2 - Domain Model (UML Diagram)

**Contains:**

**Entities (6 boxes):**

1. **University**
   - Attributes: id (PK), name (UK), code, location, website, createdAt, updatedAt
   - Relationships: "contains" → Faculty (1:N), "has students" → User (1:N)

2. **Faculty**
   - Attributes: id (PK), name, code, description, universityId (FK), createdAt, updatedAt
   - Relationships: "belongs to" → University (N:1), "has students" → User (1:N)

3. **User**
   - Attributes: id (PK), name, email (UK), password, profileImage, role, universityId (FK), facultyId (FK), studentIdUrl, approvedAt, createdAt, updatedAt
   - Relationships: "belongs to" → University (N:1), "belongs to" → Faculty (N:1), "has" → Account (1:N), "has" → Session (1:N), "assigned" → Role enum

4. **Account**
   - Attributes: id (PK), userId (FK), type, provider, providerAccountId, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state
   - Relationships: "belongs to" → User (N:1)

5. **Session**
   - Attributes: id (PK), sessionToken (UK), userId (FK), expires
   - Relationships: "belongs to" → User (N:1)

6. **VerificationToken**
   - Attributes: identifier, token (UK), expires
   - Relationships: None (standalone token table)

**Enum:**

- **Role:** ADMIN, APPROVED, PENDING

**Cardinality Notation:**

- 1:N (one-to-many)
- N:1 (many-to-one)
- PK (primary key)
- FK (foreign key)
- UK (unique key)

**Purpose:** Foundational data model for Sprint 1 showing authentication infrastructure

---

#### **Diagram 4: Platform Initialization Sequence Diagram**

**Type:** Sequence Diagram
**Location:** Section 3 - Sequence Diagrams

**Contains:**

**Participants (6 lifelines):**

1. Developer
2. Terminal
3. Prisma CLI
4. PostgreSQL Database
5. NextAuth Config
6. UploadThing Setup

**Flow (28 steps):**

1. Developer → Terminal: Run `npm install`
2. Terminal → Node: Install dependencies
3. Developer → Terminal: Create `.env` file
4. Developer → .env: Add DATABASE_URL
5. Developer → .env: Add NEXTAUTH_URL, NEXTAUTH_SECRET
6. Developer → .env: Add UPLOADTHING_SECRET, UPLOADTHING_APP_ID
7. Developer → Terminal: Run `npx prisma generate`
8. Prisma CLI → Database: Test connection
9. Database → Prisma: Connection successful
10. Developer → Terminal: Run `npx prisma migrate dev`
11. Prisma CLI → Database: Create tables
12. Database → Prisma: Tables created
13. Developer → Terminal: Run seed script
14. Prisma CLI → Database: Insert universities
15. Database → Prisma: 3 universities inserted
16. Prisma CLI → Database: Insert faculties
17. Database → Prisma: 15+ faculties inserted
18. Developer → NextAuth Config: Setup credentials provider
19. NextAuth → NextAuth: Generate JWT secret if missing
20. Developer → UploadThing: Configure upload endpoints
21. Developer → UploadThing: Define studentIdUploader (max 4MB, images)
22. Developer → UploadThing: Define resourceUploader (max 16MB, files)
23. UploadThing → UploadThing: Validate configuration
24. Developer → Terminal: Run `npm run dev`
25. Terminal → Next.js: Start development server
26. Next.js → Database: Verify connection
27. Database → Next.js: Connected
28. Developer: System ready for development

**Notation:**

- Solid arrows: Synchronous calls
- Dashed arrows: Return values
- Activation bars: Processing time
- Notes: Configuration details

**Purpose:** Shows complete platform initialization workflow from package installation to running dev server

---

#### **Diagram 5: Student Registration Sequence Diagram**

**Type:** Sequence Diagram
**Location:** Section 3 - Sequence Diagrams

**Contains:**

**Participants (7 lifelines):**

1. Student
2. Registration Form UI
3. Validation System
4. UploadThing Client
5. UploadThing Server
6. PostgreSQL Database
7. Email Service (Nodemailer)

**Flow (23 steps):**

1. Student → UI: Navigate to /signup
2. UI → Student: Display registration form
3. Student → UI: Enter name
4. Student → UI: Enter email
5. Student → UI: Enter password
6. Student → UI: Select university dropdown
7. UI → Database: Fetch universities
8. Database → UI: Return universities list
9. UI → Student: Display universities
10. Student → UI: Select university (e.g., "Qaiwan International University")
11. UI → Database: Fetch faculties for selected university
12. Database → UI: Return faculties list
13. UI → Student: Display faculties
14. Student → UI: Select faculty (e.g., "Computer Science")
15. Student → UI: Upload student ID image
16. UI → UploadThing Client: Send file
17. UploadThing Client → UploadThing Server: Upload to cloud (S3)
18. UploadThing Server → UploadThing Client: Return file URL
19. Student → UI: Click "Register" button
20. UI → Validation: Validate all fields (Zod schema)
21. Validation → UI: All valid
22. UI → Database: Create user with PENDING role
23. Database: Hash password (bcrypt, 12 rounds)
24. Database: INSERT INTO users
25. Database → UI: User created successfully
26. UI → Email Service: Send confirmation email
27. Email Service → Student: Email sent to inbox
28. UI → Student: Redirect to /waiting-approval page
29. Student: Sees "Your account is pending approval" message

**Alternative Flows:**

- Email already exists → Show error at step 22
- Upload fails → Retry at step 17
- Validation fails → Highlight errors at step 21

**Purpose:** Complete student registration flow with file upload and approval workflow

---

## 📄 DOCUMENT 4: Unishare_Iteration_2.pdf (Sprint 2)

### Diagrams Present: **5 diagrams**

---

#### **Diagram 1: Student Registration and Authentication Use Case**

**Type:** Use Case Diagram
**Location:** Section 1 - Use Case Diagrams

**Contains:**

- **Actor:** Student (stick figure)
- **System Boundary:** Box labeled "UniShare System"
- **Use Cases (4 functions):**
  1. Register (with university/faculty selection)
  2. Login (credential authentication)
  3. View Dashboard (role-based)
  4. Logout (session termination)
- **Relationships:** Lines connecting Student to each use case

**Purpose:** Shows student authentication workflow

---

#### **Diagram 2: Admin Approval Workflow Use Case**

**Type:** Use Case Diagram
**Location:** Section 1 - Use Case Diagrams

**Contains:**

- **Actors:**
  - Admin (stick figure, pink circle)
  - UniShare System (external system box)
- **System Boundary:** Yellow box labeled "Admin Functions"
- **Use Cases (6 main):**
  - UC006: Admin Login
  - UC007: Approve/Reject Users
  - UC008: Manage Accounts
  - UC009: Monitor System
  - UC010: Review Feedback
  - UC011: Provide Support
- **Extended Functions:**
  - Verify Student ID (includes)
  - Send Email Notification (includes)

**Note:** This is almost IDENTICAL to Iteration 1 Diagram 2 (same admin workflow, reused)

**Purpose:** Admin approval workflow (same as Sprint 1, included for completeness)

---

#### **Diagram 3: UniShare Domain Model - Sprint 2**

**Type:** UML Class Diagram / ER Diagram
**Location:** Section 2 - Domain Model (UML Diagram)

**Contains:**

**Entities (6 boxes - SAME AS SPRINT 1):**

1. **University**
   - Attributes: id (PK), name (UK), code, description, website, location, createdAt, updatedAt
   - Relationships: "contains" → Faculty (1:N), "has" → User (1:N)

2. **Faculty**
   - Attributes: id (PK), name, code, description, universityId (FK), createdAt, updatedAt
   - Relationships: "belongs to" → University (N:1), "has students" → User (1:N)

3. **User**
   - Attributes: id (PK), name, email (UK), password, profileImage, role, universityId (FK), facultyId (FK), studentIdUrl, approvedAt, createdAt, updatedAt
   - Relationships: "belongs to" → University (N:1), "belongs to" → Faculty (N:1), "has" → Account (1:N), "has" → Session (1:N)

4. **Account**
   - Attributes: id (PK), userId (FK), type, provider, providerAccountId, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state
   - Relationships: "belongs to" → User (N:1)

5. **Session**
   - Attributes: id (PK), sessionToken (UK), userId (FK), expires
   - Relationships: "belongs to" → User (N:1)

6. **Role Enum**
   - Values: ADMIN, APPROVED, PENDING

**Note:** NO NEW ENTITIES in Sprint 2 - same database schema as Sprint 1, just implemented authentication flows

**Purpose:** Shows same domain model as Sprint 1 (no schema changes in Sprint 2)

---

#### **Diagram 4: Student Registration Sequence Diagram**

**Type:** Sequence Diagram
**Location:** Section 3 - Sequence Diagrams

**Contains:**

**Participants (7 lifelines):**

1. Student
2. Registration Form
3. Validation System
4. UploadThing
5. Database
6. Email Service
7. Waiting Page

**Flow (20 steps):**

1. Student → Form: Navigate to signup
2. Form → Student: Display form
3. Student → Form: Fill details (name, email, password)
4. Student → Form: Select university
5. Form → Database: Fetch universities
6. Database → Form: Return list
7. Student → Form: Select faculty
8. Form → Database: Fetch faculties for university
9. Database → Form: Return faculties
10. Student → Form: Upload student ID
11. Form → UploadThing: Upload file
12. UploadThing → Form: Return URL
13. Student → Form: Click Register
14. Form → Validation: Validate inputs
15. Validation → Form: Valid
16. Form → Database: Create user (PENDING role, hashed password)
17. Database → Form: User created
18. Form → Email Service: Send confirmation
19. Email Service → Student: Email delivered
20. Form → Waiting Page: Redirect
21. Waiting Page → Student: Show "Awaiting approval" message

**Purpose:** Complete registration flow with file upload

---

#### **Diagram 5: Admin Approval & Login Authentication Sequence Diagram**

**Type:** Sequence Diagram (Combined - TWO flows in ONE diagram)
**Location:** Section 3 - Sequence Diagrams

**Contains:**

**Part A - Admin Approval Flow:**

**Participants:**

1. Admin
2. Login System
3. Approval Page
4. Database
5. Email Service

**Flow (25 steps):**

1. Admin → Login System: Navigate to /login
2. Login System → Admin: Display login form
3. Admin → Login System: Enter credentials
4. Login System → Database: Verify admin credentials
5. Database → Login System: Valid admin
6. Login System → Admin: Redirect to /admin
7. Admin → Approval Page: Navigate to /admin/approvals
8. Approval Page → Database: Fetch PENDING users
9. Database → Approval Page: Return pending users list
10. Approval Page → Admin: Display pending users
11. Admin → Approval Page: Click on user
12. Approval Page → Database: Fetch user details
13. Database → Approval Page: Return user info + student ID
14. Approval Page → Admin: Display user details
15. Admin: Review information
16. **[Approve User]**
17. Admin → Approval Page: Click Approve
18. Approval Page → Database: UPDATE user SET role='APPROVED', approvedAt=now()
19. Database → Approval Page: User updated
20. Approval Page → Email Service: Send approval email
21. Email Service → Student: Email delivered
22. Approval Page → Admin: Show success message
23. **[Reject User]**
24. Admin → Approval Page: Click Reject
25. Approval Page → Database: DELETE user OR SET role='REJECTED'
26. Database → Approval Page: User rejected
27. Approval Page → Email Service: Send rejection email
28. Email Service → Student: Email delivered
29. Approval Page → Database: Fetch PENDING users
30. Database → Approval Page: Return updated list
31. Approval Page → Admin: Display updated list

**Part B - Login Authentication Flow:**

**Participants:**

1. User (Student or Admin)
2. Login Page
3. NextAuth
4. Database

**Flow (12 steps):**

1. User → Login Page: Navigate to /login
2. Login Page → User: Display form
3. User → Login Page: Enter email and password
4. Login Page → NextAuth: Submit credentials
5. NextAuth → Database: Fetch user by email
6. Database → NextAuth: Return user
7. NextAuth: Compare password hash (bcrypt)
8. NextAuth: Password matches
9. NextAuth: Check user role
10. **If PENDING:** NextAuth → User: Redirect to /waiting-approval
11. **If APPROVED:** NextAuth → User: Redirect to /courses
12. **If ADMIN:** NextAuth → User: Redirect to /admin
13. NextAuth → Database: Create JWT session
14. Database → NextAuth: Session created
15. User: Logged in successfully

**Purpose:** Shows complete approval workflow and role-based authentication

---

## 📄 DOCUMENT 5: Iteration 3 (Sprint 3) - TO BE CREATED

### Diagrams Required: **8 diagrams**

(These are from the report I created - need to be converted to actual visual diagrams)

1. Student Course Management Use Case
2. AI Learning Assistant Use Case
3. UniShare Domain Model - Sprint 3 (adds 11 entities)
4. Create Course Sequence Diagram
5. Upload Resource to Card Sequence Diagram
6. AI Chat Conversation Sequence Diagram
7. AI Quiz Generation Sequence Diagram
8. Generate Study Plan Sequence Diagram

---

## 📄 DOCUMENT 6: Iteration 4 (Sprint 4) - TO BE CREATED

### Diagrams Required: **9 diagrams**

(These are from the report I created - need to be converted to actual visual diagrams)

1. Course Sharing & Permissions Use Case
2. Real-Time Collaborative Notes Use Case
3. Public Articles System Use Case
4. Notification System Use Case
5. UniShare Domain Model - Sprint 4 (adds 11 more entities)
6. Course Sharing Sequence Diagram
7. Liveblocks Real-Time Collaboration Sequence Diagram
8. Article Publishing Sequence Diagram
9. Timetable Reminder Cron Job Sequence Diagram

---

## 📊 COMPLETE DIAGRAM INVENTORY

| Document         | Diagrams Present | Status                             |
| ---------------- | ---------------- | ---------------------------------- |
| **Proposal**     | 0                | ✅ Complete (no diagrams required) |
| **Project Plan** | 0                | ✅ Complete (no diagrams required) |
| **Iteration 1**  | 5                | ✅ Complete (all diagrams present) |
| **Iteration 2**  | 5                | ✅ Complete (all diagrams present) |
| **Iteration 3**  | 8                | ❌ Missing (needs creation)        |
| **Iteration 4**  | 9                | ❌ Missing (needs creation)        |
| **TOTAL**        | **27 diagrams**  | **10 complete, 17 needed**         |

---

## 🔄 DIAGRAM REUSE ANALYSIS

### Diagrams That Are IDENTICAL or VERY SIMILAR:

1. **Admin Approval Use Case:**
   - Iteration 1, Diagram 2 = Iteration 2, Diagram 2
   - SAME diagram, reused in Sprint 2
   - Shows: Admin functions (login, approve/reject, manage accounts, etc.)

2. **Domain Model:**
   - Iteration 1, Diagram 3 ≈ Iteration 2, Diagram 3
   - ALMOST IDENTICAL (Sprint 2 added no new entities)
   - Shows: Same 6 entities (User, University, Faculty, Account, Session, VerificationToken)

### Diagrams That Are UNIQUE:

- All other diagrams are unique to their sprints
- Sprint 3 & 4 introduce completely new entities and workflows
- No reuse possible for Sprint 3 & 4 diagrams

---

## 📐 DIAGRAM STYLES & CONVENTIONS

### Use Case Diagrams:

- **Actors:** Stick figures (students, admins)
- **System boundary:** Rectangular box with system name
- **Use cases:** Ovals with function names
- **Relationships:**
  - Solid lines: Actor-to-use case
  - Dotted lines with «includes»: Include relationships
  - Dotted lines with «extends»: Extend relationships
- **Colors:**
  - Actors: Pink circles
  - System boundary: Yellow boxes
  - Use cases: Light blue/purple boxes
  - External systems: Purple boxes

### Domain Model (UML Class Diagrams):

- **Entities:** Rectangles with 3 sections (name | attributes | methods)
- **Attributes:** Listed with datatype (e.g., "id: String (PK)")
- **Relationships:**
  - Lines with labels ("contains", "belongs to", "has")
  - Cardinality notation (1, N, 0..1, 1..\*)
  - Arrow direction indicates relationship direction
- **Keys:**
  - PK = Primary Key
  - FK = Foreign Key
  - UK = Unique Key

### Sequence Diagrams:

- **Participants:** Boxes at top with names
- **Lifelines:** Vertical dashed lines
- **Activation bars:** Rectangles showing processing time
- **Messages:**
  - Solid arrows: Synchronous calls (→)
  - Dashed arrows: Return values (⟵)
  - Numbered: Sequential order (optional)
- **Notes:** Yellow boxes with additional info
- **Alt frames:** Alternative flows (approve vs reject)
- **Loop frames:** Repeated actions

---

## ✅ VERIFICATION CHECKLIST

For each existing diagram:

**Iteration 1:**

- ✅ Diagram 1: System Administrator Use Case - PRESENT
- ✅ Diagram 2: Admin Approval Workflow Use Case - PRESENT
- ✅ Diagram 3: Domain Model Sprint 1 - PRESENT
- ✅ Diagram 4: Platform Initialization Sequence - PRESENT
- ✅ Diagram 5: Student Registration Sequence - PRESENT

**Iteration 2:**

- ✅ Diagram 1: Student Use Case - PRESENT
- ✅ Diagram 2: Admin Approval Use Case (reused) - PRESENT
- ✅ Diagram 3: Domain Model Sprint 2 (same as Sprint 1) - PRESENT
- ✅ Diagram 4: Student Registration Sequence - PRESENT
- ✅ Diagram 5: Admin Approval & Login Sequence - PRESENT

**Iteration 3:**

- ❌ All 8 diagrams need creation

**Iteration 4:**

- ❌ All 9 diagrams need creation

---

**END OF DIAGRAM AUDIT**

**Total Diagrams Documented:** 10
**Total Diagrams Needed:** 17
**Overall Progress:** 37% complete
