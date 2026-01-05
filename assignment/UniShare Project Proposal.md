# PROJECT PROPOSAL

#### GROUP NAME: DOCTECH

**PROJECT TITLE:** UniShare – University Academic Resource Management System

**PROJECT MANAGER:** Rawa Dara Radha

## EXECUTIVE SUMMARY

### Introduction:

University students face a lot of problems when it comes to organizing and managing their course resources such as lecture slides, assignments, notes, and other course materials. Currently, students rely on platforms like WhatsApp groups, personal Google Drive folders, or unmanaged files across devices, which makes it so frustrating that us as DOCTECH group are students as well and we too face these problems like lost materials, difficulty collaborating with classmates, and lack of intelligent learning support.

### Problems:

There is currently no all-in-one platform where students can personally or together create their courses and manage them, upload their materials, share with classmates, and get intelligent AI-powered assistance with their learning. Students need full control over their education while having the option to collaborate with other students and get personalized help from AI tutors.

### Proposed System:

UniShare is a student-driven academic platform where each approved student creates and manages their own courses for the classes they have. After admin approval, students start with an empty workspace and build their course structure from scratch—creating courses for each class, uploading resources, and organizing materials through predefined resource cards (Assignments, Tasks, Content, Notes).

Courses are **private by default** and only visible to the creator. Students can invite classmates from the same faculty to share courses with two permission levels:

- **Viewer:** Can see and download resources
- **Contributor:** Can add resources but cannot delete (ownership remains with creator)

Students can favorite courses to add them to their personal timetable, collaborate on notes in real-time using cutting-edge CRDT technology, publish knowledge articles for the broader community, and leverage **AI-powered learning assistance** for personalized help, quiz generation, and study planning. The platform is designed to give students complete control over their education while enhancing learning through intelligent features.

### AI-Powered Learning Features:

UniShare integrates **Google Gemini AI** to provide intelligent learning assistance that transforms the platform from a static resource manager into an active learning companion:

**Conversational AI Assistant (Gemini 2.5 Flash):**
- Students can chat with an AI tutor about course materials
- Context-aware responses based on uploaded course resources
- Fast streaming responses for natural conversation flow
- Conversation history preserved for continuous learning

**AI Quiz Generation (Gemini 2.5 Pro):**
- Automatic practice quiz creation from course topics
- Multiple question types: Multiple Choice, True/False, Short Answer, Essay
- Configurable difficulty levels (Easy, Medium, Hard)
- 5-20 questions per quiz with explanations
- Auto-grading and attempt tracking

**Personalized Study Plans (Gemini 2.5 Pro):**
- AI-generated weekly study schedules based on course content
- Customizable duration (1-12 weeks) and time commitment
- Goal-oriented planning with task breakdowns
- Progress tracking and completion markers

**Note Enhancement:**
- Generate notes from topics automatically
- Improve existing notes with AI suggestions
- Summarize long content for quick review
- Expand brief notes with detailed explanations

### Methodology:

The project will be developed using **Next.js 15** (latest stable), **Prisma**, and **PostgreSQL (NeonDB)** for structured data management. **UploadThing** will handle secure file storage. **Liveblocks** powers real-time collaborative note-taking with **BlockNote** editor using **Yjs CRDT** for conflict-free editing. **NextAuth** handles authentication with role-based access (Admin for approvals, Approved Students for full access, Pending Students awaiting approval).

**AI integration uses Google Gemini** (2.5 Flash for chat, 2.5 Pro for generation) via the **Vercel AI SDK** for streaming responses. The UI uses **Tailwind CSS** and **Shadcn UI** for a modern, accessible interface. Development follows **Agile methodology** with iterative sprints.

**Why Google Gemini over alternatives?**
- **Cost-effective**: Free tier supports 1,500 requests/day (suitable for educational use)
- **Large context window**: 1M tokens allows loading entire course materials for context-aware responses
- **Streaming support**: Real-time word-by-word responses via Vercel AI SDK for natural conversation
- **Model variety**: Flash (fast, cheap for chat) and Pro (high quality for generation)
- **Superior performance**: Gemini 2.5 Pro outperforms GPT-3.5 in quiz generation quality while being more affordable than GPT-4

### Expected Output:

A fully functional web application where students can:

- Create their own course structure for classes they're taking
- Upload and organize academic materials through predefined resource cards
- Share courses privately with classmates (viewer or contributor access)
- See contributor avatars on shared courses (like GitHub)
- Favorite courses to add them to their personal calendar
- Collaborate on notes in real-time with classmates using CRDT technology
- **Chat with AI assistant for help with coursework and concepts**
- **Generate practice quizzes automatically with AI**
- **Create personalized study plans using AI**
- **Enhance notes with AI-powered improvements**
- Publish articles to share knowledge with the community
- Maintain complete control over their academic organization

## PROBLEM STATEMENT

Currently, students manage their education materials through scattered and unorganized ways:

**Individual Problems:**

- There isn't a very good way to organize course materials for multiple classes
- Files scattered across devices, cloud storage, and messaging apps
- Difficulty tracking which materials belong to which course
- Lost resources when devices are replaced or storage is cleaned
- No easy way to share organized course materials with trusted classmates
- **No intelligent assistance for learning, quiz practice, or study planning**

**Collaboration Problems:**

- WhatsApp groups result in lost files once messages scroll away
- Google Drive sharing lacks proper permission controls (viewers can't contribute, editors can delete everything)
- No way to track who contributed which materials
- Difficulty maintaining organized shared folders
- **No AI-powered tools to help students study more effectively**

**Time Management Problems:**

- No integrated way to link course materials with class schedules
- Students maintain separate calendars disconnected from their course resources
- **No personalized study plans to help students allocate time effectively**

The proposed UniShare system addresses these issues by providing students with a personal education space where they have complete control over course creation, resource organization, and sharing with granular permission levels, timetable management, and **AI-powered learning assistance** for personalized help.

## GOAL

To develop a student-driven academic platform that enables university students to create, manage, and share their course materials with complete control, granular collaboration controls, and **AI-powered intelligent learning assistance** for enhanced educational outcomes.

## OBJECTIVES

To design and develop a web-based platform with the following capabilities:

### 1. Student Registration & Approval:

- Implement user registration where students select their university and faculty
- Require student ID upload during registration
- Implement admin approval workflow with email notifications
- Role-based access (Admin, Approved Student, Pending Student)

### 2. Student-Driven Course Creation:

- Allow approved students to create courses for their classes from scratch
- Start with empty course list—no pre-populated data
- Each course includes title, description, and color coding
- Courses are private by default (only visible to creator)

### 3. Resource Organization System:

- Auto-create 4 empty predefined resource cards per course:
  - Assignments (with file uploads)
  - Tasks (no file uploads, text-based to-do items)
  - Content (with file uploads for slides, readings)
  - Notes (links to collaborative editor)
- Allow custom resource card creation with configurable file upload options
- Students fill resource cards themselves by uploading materials

### 4. Course Sharing & Collaboration:

- Faculty-restricted sharing (can only invite students from same faculty)
- Two permission levels:
  - Viewer: Can see and download all resources
  - Contributor: Can add resources but cannot delete
- Invitation system where invited students must accept
- Shared courses appear in recipient's course list with clear "Shared" indicator
- Display contributor avatars (like GitHub) for courses with multiple contributors
- Course ownership always remains with original creator

### 5. Favorites & Calendar Integration:

- Students can favorite any course (owned or shared)
- Only favorited courses appear in calendar dropdown
- Implement weekly timetable with class scheduling
- Color-coded events matching course colors
- Conflict detection for overlapping classes

### 6. Real-Time Collaborative Notes:

- BlockNote editor with Liveblocks synchronization
- Conflict-free editing with Yjs CRDT (no "last write wins" conflicts)
- Live cursors showing collaborator positions
- Faculty-restricted note sharing
- Sidebar navigation for organizing note pages
- Nested pages support for structured note organization

### 7. Public Articles System:

- Students can write and publish articles for the community
- Articles visible to everyone (even without login)
- Draft and publish workflow
- Tag system and search capabilities

### 8. User Profile & Contributions:

- Profile pictures displayed as contributor avatars on shared courses
- User dashboard showing owned courses, shared courses, and contributions

### 9. AI-Powered Learning Assistance:

- **Conversational AI Assistant:**
  - Integration with Google Gemini 2.5 Flash for fast, cost-effective responses
  - Context-aware help based on course materials
  - Streaming chat interface for natural conversation
  - Conversation history and management

- **AI Quiz Generation:**
  - Gemini 2.5 Pro for high-quality quiz creation
  - Multiple question types (Multiple Choice, True/False, Short Answer, Essay)
  - Configurable difficulty levels and question counts (5-20)
  - Automatic grading and attempt tracking

- **Personalized Study Plans:**
  - AI-generated weekly study schedules
  - Customizable duration (1-12 weeks) and time commitment
  - Goal-oriented planning with task breakdowns
  - Integration with course content for context

- **Note Enhancement:**
  - Generate notes from topics
  - Improve existing notes with AI
  - Summarize and expand content
  - Multiple generation types (generate, improve, summarize, expand)

## OUTCOMES

A student-centric platform where:

- **Students have full autonomy** over their academic organization—they create their own course structure from scratch
- **Private by default** with selective sharing—students control who accesses their materials
- **Proper collaboration** with contributor roles that prevent accidental deletions
- **Visual contribution tracking** through profile picture avatars (like GitHub)
- **Integrated scheduling** where only relevant (favorited) courses appear in calendar
- **Real-time collaboration** on notes with classmates using industry-standard CRDT technology
- **AI-powered learning** with personalized tutoring, quiz generation, and study planning
- **Knowledge sharing** through public articles accessible to everyone
- **No admin micromanagement**—admins only approve students, don't touch course content

## NEEDS, APPROACH, BENEFITS, COMPETITOR (NABC)

| Elements | Description |
|----------|-------------|
| **Needs** | Students need a personal workspace to organize their academic materials with full control, ability to share selectively with proper permissions, integrated scheduling, real-time collaboration, **and intelligent AI assistance for learning**—all without admin interference in their course management. |
| **Approach** | Build a student-driven platform using Next.js 15, Prisma, PostgreSQL (NeonDB), UploadThing, Liveblocks, BlockNote, Yjs CRDT, and **Google Gemini AI (2.5 Flash & Pro) via Vercel AI SDK**. Students create their own courses (starting from empty), upload materials, share with invitation-based permissions (viewer/contributor), favorite courses for calendar integration, collaborate in real-time with conflict-free editing, **and get AI-powered help with chat, quizzes, and study plans**. |
| **Benefits** | Complete student autonomy over academic organization, private-by-default with selective sharing, proper collaboration controls (contributors can't delete), visual contribution tracking, integrated schedule management, real-time note collaboration with CRDT technology, **AI-powered personalized learning assistance**, and community knowledge sharing through articles. |
| **Competitor** | Google Drive lacks course structure and proper permission controls (editors can delete everything). Notion doesn't have faculty-based sharing, integrated calendars, or AI tutoring. WhatsApp groups lose files quickly. Canvas/Blackboard are institution-managed, not student-controlled. **ChatGPT lacks course-specific context and integration**. Quizlet doesn't auto-generate from course materials. UniShare gives students complete ownership while enabling intelligent collaboration and AI-enhanced learning. |

## TEAM MEMBERS AND ROLES

| # | Name | Roles | Description |
|---|------|-------|-------------|
| 1 | Rawa Dara Radha | Project Manager | Oversees development, ensures progress aligns with milestones, manages coordination between team members, and handles AI integration architecture. |
| 2 | Parwar Yassin qadr | Lead Developer | Implements authentication, course management, sharing permissions, AI integration (Gemini API, Vercel AI SDK), and API endpoints using Next.js 15 and Prisma. |
| 3 | Drud Zmnako | UI/UX Designer | Designs and develops the user interface with Figma and Shadcn UI, focusing on student-driven workflows, collaboration indicators, and AI chat interface. |
| 4 | Muhamad ahmad | Tester & QA | Conducts system testing, ensures app stability, validates user experience including permission levels, AI response quality, and quiz generation accuracy. |
| 5 | Aland haval | Storage & System Monitoring Engineer | Monitors UploadThing, NeonDB, and Liveblocks usage, tracks Gemini API token consumption, manages storage limits, and ensures stable performance. |
