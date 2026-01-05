# SOFTWARE PROJECT PLAN: UniShare - University Academic Resource Management System

**Field** | **Value**
--- | ---
**Name of the System** | UniShare - University Academic Resource Management System
**Group** | DOCTECH
**Project Manager** | Rawa Dara Radha
**Date** | October 2025

---

## 1. Overview

UniShare is a student-led academic platform designed to solve the problems of disorganized course materials and inadequate collaboration tools. Unlike traditional university learning management systems where content is managed by faculty, UniShare empowers students to create their own course structure, upload their own materials, share with classmates using proper permission controls, and leverage **AI-powered learning assistance** for enhanced educational outcomes.

The project will deliver a fully functional system using **Next.js 15**, Prisma, NeonDB, UploadThing, Liveblocks, BlockNote, Yjs CRDT, **Google Gemini AI**, and **Vercel AI SDK** for a secure, intelligent, and collaborative application.

---

## 2. Goals and Scope

### 2.1 Project Goals

The following goals are critical to ensure project success:

**Information** | **Detail**
--- | ---
**Motivation** | To provide students with a personal academic workspace where they have complete control over their courses, resources, and collaboration with granular permissions (viewer/contributor), timetable management, real-time collaboration, and **AI-powered intelligent learning assistance** without limitations.
**Customer** | University Students (primary users)
**Deliverable** | A fully functional, web-based student-led platform (UniShare) where students create courses from scratch, upload materials, share with permission controls, manage timetables, collaborate on notes, **chat with AI assistants, generate quizzes, create study plans**, and publish articles.
**Estimated Duration** | 1.5 Months (October 2025 - December 2025)
**Estimated Cost** | To be determined (dependent on cloud resource usage: NeonDB, UploadThing, Liveblocks, Gemini API)

**Project Goal** | **Priority** | **Comment/Description/Reference**
--- | --- | ---
**Functional Goals** | 1 (High) | To develop a student-led platform where students create their own courses from scratch, upload resources, share with permission controls (viewer/contributor), favorite courses for calendar integration, collaborate on notes in real-time, **leverage AI for learning assistance (chat, quiz generation, study plans)**, and publish articles. No predefined course data—students build everything themselves.
**Quality Goals** | 1 (High) | To ensure secure file storage (UploadThing), proper permission enforcement (viewer can't contribute, contributor can't delete), conflict-free real-time collaboration (Liveblocks with Yjs CRDT), **accurate AI responses with context awareness**, and stable performance.
**Business Goals** | 2 (Medium) | To provide an intuitive student interface inspired by modern collaboration tools, clear sharing indicators (contributor avatars like GitHub), seamless integration between courses and calendar, and **intelligent AI tutoring for personalized learning**.
**Technological Goals** | 2 (Medium) | To implement a modern, maintainable stack (Next.js 15, Prisma, PostgreSQL, Liveblocks, BlockNote, Yjs CRDT, **Google Gemini AI, Vercel AI SDK**) with robust permission system, real-time capabilities, and **streaming AI responses**.
**Constraints** | 3 (Medium) | Must operate within standard web browser environments. File storage managed through UploadThing. Real-time collaboration limited by Liveblocks service capabilities. Sharing restricted to same-faculty students. **AI usage limited by Gemini API rate limits (1,500 requests/day free tier)**.

---

### 2.2 Project Scope

**2.2.1 Included**

The project will deliver the following functionalities:

### 1. Student Registration & Admin Approval:
- Student signup with university selection, faculty selection, and student ID upload
- Admin approval workflow (admin reviews and approves/rejects)
- Email notifications via Nodemailer (registration received, approval/rejection)
- Role-based access: Admin (approvals only), Approved Student (full access), Pending Student (waiting)

### 2. Student-Led Course Creation:
- Empty course list initially—no pre-configured data
- Students create courses for their classes (title, description, color)
- Courses are private by default (only creator can see them)
- Students start with zero courses and build their structure themselves

### 3. Resource Cards System:
- Auto-created empty resource cards for each new course:
  - **Assignments:** File uploads enabled, starts empty
  - **Tasks:** No file uploads, text-based to-do items, starts empty
  - **Content:** File uploads enabled (slides, readings), starts empty
  - **Notes:** Links to collaborative editor, starts empty
- Custom resource cards: Students can create additional cards with configurable file upload options
- Students fill cards themselves by uploading materials
- File management through UploadThing

### 4. Course Sharing & Permission System:
- Faculty-restricted: Can only invite students from same faculty
- Invitation system: Send invite → recipient accepts → course appears in their list under "Shared with me"
- Two permission levels:
  - **Viewer:** Can see and download resources only (cannot add/edit/delete)
  - **Contributor:** Can add new resources but cannot delete anything
- Ownership: Course creator retains ownership, only owner can delete course or remove collaborators
- Clear indicators: Shared courses labeled clearly in UI ("Shared with me" / "Course Shared by [Student Name]")
- Contributor avatars: Display profile pictures of all contributors (like GitHub)
- Owner controls: Only owner can change course settings, manage collaborators, delete course

### 5. Favorites & Calendar Integration:
- Students can favorite any course (owned or shared)
- Calendar dropdown filtering: Only favorited courses appear when adding events to timetable
- Weekly timetable using FullCalendar 6.1+
- Create recurring class events (day, start time, end time, location)
- Color-coded events matching course colors
- Conflict detection for overlapping classes
- Multiple views (week, day, list)
- Email reminders for upcoming classes (cron job integration)

### 6. Real-Time Collaborative Notes:
- BlockNote 0.41+ editor with Liveblocks 3.9+ synchronization
- Each course has collaborative notes space with nested pages
- Conflict-free editing with Yjs CRDT 13.6+ (no "last write wins" conflicts)
- Live cursors and presence indicators showing collaborators
- Sidebar navigation for organizing note pages hierarchically
- Faculty-restricted: Can only share notes with same-faculty students
- Auto-save functionality every 5 seconds
- Content stored in Liveblocks Yjs document (industry standard)

### 7. Public Articles System:
- Article creation using BlockNote editor (solo mode, no real-time)
- Draft and publish workflow with slug generation
- Published articles visible to everyone (no login required)
- Article browsing, search, and filtering by tags
- View counter and read time estimation
- Author dashboard for managing articles
- Admin can feature articles

### 8. User Profiles & Contributions:
- Profile picture upload with avatar color selection
- Profile pictures displayed as contributor avatars on shared courses
- User dashboard showing:
  - Courses I created
  - Courses shared with me
  - My contributions to shared courses

### 9. Data Structure:
- Structured data management (Prisma/PostgreSQL)
- Core models: Universities, Faculties, Users, Courses, Resources, CourseCollaborators (with permission roles), Notes, Events, Articles, Tags
- **AI models:** AiConversation, AiMessage, AiQuiz, AiQuizQuestion, AiQuizAttempt, AiStudyPlan, AiStudyPlanWeek, AiStudyPlanTask, AiGeneratedNote

### 10. Secure File Storage:
- UploadThing for file uploads and delivery
- File associations with resources and courses
- Student ID verification uploads

### 11. AI Learning Assistant:
- **Conversational AI Assistant** using Google Gemini 2.5 Flash
- Streaming chat interface with real-time word-by-word responses
- Context-aware responses based on course materials
- Conversation history and management
- Course-specific chat for targeted help
- Integration with Vercel AI SDK 5.0+ for streaming

### 12. AI Quiz Generation:
- **Gemini 2.5 Pro** for high-quality quiz creation
- Multiple question types:
  - Multiple Choice (4 options)
  - True/False
  - Short Answer
  - Essay questions
- Configurable difficulty levels (Easy, Medium, Hard)
- 5-20 questions per quiz
- AI-generated explanations for correct answers
- Quiz attempt tracking and automatic grading
- Score calculation and history

### 13. AI Study Plan Generation:
- **Gemini 2.5 Pro** for personalized study plan creation
- Weekly task breakdown based on course content
- Customizable duration (1-12 weeks)
- Hours per week configuration
- Goal-oriented planning with specific tasks
- Progress tracking with completion markers
- Integration with course context

### 14. AI Note Enhancement:
- Generate notes from topics automatically
- Improve existing notes with AI suggestions
- Summarize long content for quick review
- Expand brief notes with detailed explanations
- Multiple generation types: GENERATE, IMPROVE, SUMMARIZE, EXPAND
- Token usage tracking for analytics

---

**2.2.2 Excluded**

The following items are specifically excluded from the current project scope:

1. Native mobile application development (web-only)
2. Integration with existing university systems (Canvas, Blackboard, student registration systems)
3. Institution-managed or faculty-managed course creation—this is **student-driven only**
4. Public course listings or discovery—all courses are private unless explicitly shared
5. Comment sections, private messaging, or social features beyond course sharing and article publishing
6. Advanced analytics or usage tracking beyond basic view counters and token usage
7. Direct integration with university calendars or external calendar systems (iCal, Google Calendar)
8. User training materials and large-scale university deployment (focus on core system development)
9. Voice/video chat features
10. AI fine-tuning or custom model training (using pre-trained Gemini models as-is)

---

## 3. Organization

### 3.1 Organizational Boundaries and Interfaces

The project is managed within the **DOCTECH** development team. The primary external users are **University Students** (the users of the platform) and **University Management** (who may benefit from student-organized resources).

- **Parent Organization (University):** The project must align with university policies regarding data privacy and intellectual property. The **Project Advisor (Mr. Sassan Sarbast)** acts as the primary interface to the parent organization.
- **Customer Organization (Students):** Students are the primary users. Feedback will be gathered during Sprint 4 (QA) to validate usability and meet functional goals.
- **Subcontracted Organizations:** No external subcontracts are planned. All technology choices (NeonDB, UploadThing, Liveblocks, Google Gemini) are managed via standard cloud service agreements.

---

### 3.2 Project Organization

**Project Manager:** Rawa Dara Radha

**Name** | **Roles** | **Description**
--- | --- | ---
Rawa Dara Radha | Project Manager | Oversees development, ensures progress aligns with milestones, manages coordination between team members, and handles AI integration architecture.
Parwar Yassin qadr | Lead Developer | Implements authentication, course management, sharing permissions, **AI integration (Gemini API, Vercel AI SDK)**, collaboration features, and API endpoints using Next.js 15 and Prisma.
Drud Zmnako | UI/UX Designer | Designs and develops the user interface with Tailwind CSS and Shadcn UI, focusing on student-driven workflows, collaboration indicators, and **AI chat interface**.
Muhamad ahmad | Tester & QA | Conducts system testing, ensures app stability, validates user experience including permission levels, sharing workflows, and **AI response quality**.
Aland haval | Storage & System Monitoring Engineer | Monitors UploadThing, NeonDB, and Liveblocks usage, **tracks Gemini API token consumption**, manages storage limits, and ensures stable performance.

---

## 4. Schedule

The project will follow an **Agile methodology** broken down into five Sprints, each focusing on a key set of features.

### 4.1 Work Breakdown Structure

The WBS is structured around the Agile Sprints defined below. Key work packages include:
- **Setup & Architecture**
- **Authentication & Admin Approval**
- **Student Course Management**
- **AI Integration (Chat, Quiz, Study Plans)**
- **Sharing & Permissions**
- **Collaborative Notes (Liveblocks + BlockNote + Yjs)**
- **Calendar & Timetable**
- **Articles & Community**
- **Final Quality Assurance (QA)**

---

### 4.2 Schedule and Milestones

**Code** | **Milestone** | **Description** | **Milestone Criteria** | **Planned Date**
--- | --- | --- | --- | ---
**M1** | Proposal & Plan Approval | Formal acceptance of the Project Proposal and Software Project Plan | Budget and scope are released/approved | 2025-10-20
**M2** | Sprint 1: Core Setup | Foundation of the application | Next.js 15/Prisma/PostgreSQL setup complete. NextAuth working with basic roles. UploadThing integration successful. Database seeded with universities and faculties. | 2025-11-10
**M3** | Sprint 2: Authentication & Admin | Development of the student approval system and admin dashboard | Student registration with university/faculty selection and ID upload functional. Admin approval workflow complete. Email notifications working via Nodemailer. Role-based redirects implemented. | 2025-12-01
**M4** | Sprint 3: Course & Resource Management + AI | Development of student-driven course creation, resource card system, and **AI learning features** | Students can create their own courses from scratch. Predefined and custom resource cards functional. File uploads working. **AI chat assistant with Gemini 2.5 Flash integrated. AI quiz generation with Gemini 2.5 Pro functional. AI study plan creation working. Note enhancement features complete.** | 2026-01-15
**M5** | Sprint 4: Sharing, Notes & Articles | Implementation of course sharing permissions, real-time collaboration, and articles | Faculty-restricted invitation system working. Viewer and Contributor permissions enforced. Contributor avatars displayed. BlockNote editor integrated with Liveblocks for real-time notes with Yjs CRDT. Nested pages functional. Article creation and public browsing complete. Notification system implemented. | 2026-02-05
**M6** | Sprint 5: Calendar & Final Release | Implementation of favorites/calendar system and final delivery | Favorites system functional. Only favorited courses appear in calendar dropdown. FullCalendar integrated with event creation and weekly view. Conflict detection working. Cron jobs for reminders. System is stable, documentation reviewed, and final project report submitted. | 2026-02-20

---

### 4.3 Development Process

The project will use an **Agile/Scrum** approach. We will utilize iterative prototyping and gather user feedback at the end of each sprint. The process is chosen for its flexibility in managing scope and incorporating feedback from end-users (students) to ensure the system meets real-world usability needs.

The architecture will be strictly component-based (Next.js 15 App Router components) to facilitate parallel development. We will use **TypeScript** for type safety across the entire stack, including AI integrations.

---

### 4.4 Development Environment

**Item** | **Applied for** | **Availability by (Milestone)**
--- | --- | ---
**Framework** | Next.js 15 (React 19) | M2
**Language** | TypeScript, SQL | M2
**Database** | PostgreSQL (NeonDB) | M2
**ORM** | Prisma 6.5+ | M2
**File Storage** | UploadThing | M2
**Real-time Collaboration** | Liveblocks 3.9+ | M5
**CRDT Engine** | Yjs 13.6+ | M5
**Editor** | BlockNote 0.41+ | M5
**Calendar** | FullCalendar 6.1+ | M6
**AI Provider** | Google Gemini (2.5 Flash & Pro) | M4
**AI SDK** | Vercel AI SDK 5.0+ | M4
**Styling** | Tailwind CSS, Shadcn UI | M2
**Auth** | NextAuth 5 (beta) | M3
**Email** | Nodemailer (Gmail SMTP) | M3
**Cron Jobs** | Vercel Cron / Next.js API Routes | M6
**Tools** | Git, VSCode, Browser Dev Tools, Postman | M2

---

### 4.5 Measurements Program

Project-specific data will be collected to assess the achievement of quality and functional goals.

**Type of Data** | **Purpose** | **Responsible**
--- | --- | ---
**# Defects found per Sprint** | To assess code quality and testing effectiveness | Tester & QA
**Mean Time To Resolve (MTTR)** | To track team efficiency in addressing critical issues | Lead Developer
**UI Usability Score** | To assess achievement of the Business Goal (user-friendly interface) via post-M5 user feedback | UI/UX Designer
**Storage Latency (ms)** | To assess the achievement of the Quality Goal (secure, efficient retrieval) | Storage & System Monitoring Engineer
**# Changed Requirements** | To track scope stability and manage the Change Control process | Project Manager
**Permission Enforcement Rate** | To measure accuracy of viewer/contributor permission controls | Tester & QA
**Collaboration Session Success Rate** | To measure real-time collaboration reliability and user experience | Tester & QA
**AI Response Accuracy** | To measure quality and relevance of AI-generated content (quizzes, study plans, chat) | Tester & QA
**Gemini API Token Usage** | To monitor AI costs and optimize token consumption | Storage & System Monitoring Engineer
**AI Streaming Latency** | To measure response time for AI chat (first token, full response) | Lead Developer

---

## 5. Delivery Plan

### 5.1 Deliverables and Receivers

**Code** | **Deliverable** | **Milestone** | **PIC**
--- | --- | --- | ---
**D1** | UniShare Live Web Application | M6 | Rawa Dara Radha (PM)
**D2** | Final Codebase (Source Code) | M6 | Parwar Yassin qadr (Lead Dev)
**D3** | System Requirements Specification (SRS) | M1 | Rawa Dara Radha (PM)
**D4** | Database Schema and Design Document | M4 | Parwar Yassin qadr (Lead Dev)
**D5** | User Documentation (Guides for Students) | M5 | Muhamad ahmad (Tester/QA)
**D6** | Final Project Report and Presentation Slides | M6 | Rawa Dara Radha (PM)

---

## 6. Abbreviations and Definitions

**Abbreviation** | **Definition**
--- | ---
**CCB** | Change Control Board
**CI** | Configuration Item
**CM** | Configuration Management
**COTS** | Commercial Off The Shelf
**CR** | Change Request
**QA** | Quality Assurance
**WBS** | Work Breakdown Structure
**UploadThing** | Cloud file storage and delivery service
**NeonDB** | Serverless PostgreSQL Database
**Liveblocks** | Real-time collaboration infrastructure
**BlockNote** | Block-based rich text editor
**CRDT** | Conflict-free Replicated Data Type
**Yjs** | CRDT framework for building collaborative applications
**Gemini** | Google's generative AI model family (2.5 Flash, 2.5 Pro)
**AI SDK** | Vercel AI Software Development Kit for streaming AI responses
**SSE** | Server-Sent Events (for streaming AI responses)
**LLM** | Large Language Model
**API** | Application Programming Interface
**JWT** | JSON Web Token
**SMTP** | Simple Mail Transfer Protocol

---

## 7. References

**Doc. No.** | **Title**
--- | ---
**[1]** | UniShare Project Proposal
**[2]** | Project Requirements Specification for UniShare
**[3]** | Next.js 15 Documentation (https://nextjs.org/docs)
**[4]** | Liveblocks Documentation (https://liveblocks.io/docs)
**[5]** | Google Gemini API Documentation (https://ai.google.dev/docs)
**[6]** | Vercel AI SDK Documentation (https://sdk.vercel.ai/docs)
**[7]** | Prisma ORM Documentation (https://www.prisma.io/docs)
