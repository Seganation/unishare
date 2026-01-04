# SOFTWARE PROJECT PLAN: UniShare -

# University Academic Resource Management

# System

```
Field Value
Name of the
System
```
```
UniShare - University Academic Resource Management
System
Group DOCTECH
```

## 1. Overview

UniShare is a student led academic platform made so it solves the problem of not organized
course materials and really bad collaboration tools. Unlike university learning management
systems where content is managed by faculty, UniShare empowers students to create their own
course structure, upload their own materials, and also share with classmates using proper
permission controls. The project will deliver a fully functional system using Next.js, Prisma,
NeonDB, UploadThing, Liveblocks, and BlockNote for a secure and convenient application.

## 2. Goals and Scope

### 2.1 Project Goals

The following goals are the most important ones to ensure project success:

```
Information Detail
```
```
Motivation
```
```
To provide students with a personal academic place where they have a lot
of control over their courses, resources, and also sharing with very good
permissions (viewer/contributor), a very nice timetable management, and
real-time collaboration without limits.
Customer University Students (primary users).
```
```
Deliverable
```
```
A fully functional, web-based student led platform (UniShare) where
students create courses from scratch, upload materials, share with
permission controls, manage timetables, collaborate on notes, and publish
articles.
Estimated
Duration
1.5 Months (Oct 2025 - Dec 2025).
```
```
Estimated Cost To be determined (Dependent on cloud resource usage estimates).
```
```
Project
Goal
Priority Comment/Description/Reference
```
```
Functional
Goals
1 (High)
```
```
To develop a student led platform where students create their own
courses from scratch, upload resources, share with permission
controls (viewer/contributor), favorite courses for calendar
integration, collaborate on notes in real-time, and publish articles. No
predefined course data students build everything themselves.
```
```
Quality
Goals
1 (High)
```
```
To ensure secure file storage (UploadThing), proper permission
enforcement (viewer can't contribute, contributor can't delete),
conflict free real-time collaboration (Liveblocks), and stable
performance.
```

### 2.2 Project Scope

**2.2.1 Included**

The project will deliver the following things in the areas below:

### 1. Student Registration & Admin Approval:

### ◦ Student signup with university selection, faculty selection, and student ID upload

### ◦ Admin approval workflow (admin reviews and approves/rejects)

### ◦ Email notifications via Nodemailer (registration received, approval/rejection)

### ◦ Role-based access: Admin (approvals only), Approved Student (full access),

```
Pending Student (waiting)
```
### 2. Student Led Course Creation:

### ◦ Empty course list initially no pre config data

### ◦ Students create courses for their classes (title, description, color, etc...)

### ◦ Courses are private by default (only creator can see them)

### ◦ Students start with zero courses and build their structure themselves

### 3. Resource Cards System:

### ◦ Auto-created empty resource cards for each new course:

### ▪ Assignments: File uploads enabled, starts empty

### ▪ Tasks: No file uploads, text-based to-do items, starts empty

### ▪ Content: File uploads enabled (slides, readings), starts empty

### ▪ Notes: Links to collaborative editor, starts empty

### ◦ Custom resource cards: Students can create additional cards with configurable

```
file upload options and some other settings
```
### ◦ Students fill cards themselves by uploading materials

### ◦ File management through UploadThing

### 4. Course Sharing & Permission System:

### ◦ Faculty restricted: Can only invite students from same faculty

```
Business
Goals
```
#### 2

```
(Medium)
```
```
To provide a really good student interface that gets its inspiration
from, clear sharing indicators (contributor avatars like GitHub), and
real easy way of integrating between courses and calendar.
```
```
Technologic
al Goals
```
#### 2

```
(Medium)
```
```
To implement a modern, maintainable stack (Next.js, Prisma,
PostgreSQL, Liveblocks, BlockNote) with really good permission
system and real-time capabilities.
```
```
Constraints
```
#### 3

```
(Medium)
```
```
Must operate within standard web browser environments. File storage
managed through UploadThing. Real-time collaboration limited by
Liveblocks service capabilities. Sharing restricted to same faculty
students.
```

### ◦ Invitation system: Send invite → recipient accepts → course appears in their list

```
under the title “Shared with me”
```
### ◦ Two permission levels:

### ▪ Viewer: Can see and download resources only (cannot add/edit/delete)

### ▪ Contributor: Can add new resources but cannot delete anything

### ◦ Ownership: Course creator retains ownership, only owner can delete course or

```
remove collaborators
```
### ◦ Clear indicators: Shared courses labeled clearly in UI ("Shared with me" but in

```
the notification panel will be “Course Shared by [Student Name]”)
```
### ◦ Contributor avatars: Display profile pictures of all contributors (like GitHub)

### ◦ Owner controls: Only owner can change course settings, manage collaborators,

```
delete course
```
### 5. Favorites & Calendar Integration:

### ◦ Students can favorite any course (owned or shared)

### ◦ Calendar dropdown filtering: Only favorited courses appear when adding

```
events like timetable schedule
```
### ◦ Weekly timetable using full calendar functionalities from react-big-calendar

### ◦ Create recurring class events (day, start time, end time, location)

### ◦ Color coded events matching course colors

### ◦ Conflict detection for overlapping classes

### ◦ Multiple views (week, day, list)

### 6. Real-Time Collaborative Notes:

### ◦ BlockNote editor with Liveblocks synchronization

### ◦ Each course has one collaborative notes space

### ◦ Conflict-free editing with CRDT

### ◦ Live cursors and presence indicators

### ◦ Sidebar navigation for organizing note pages

### ◦ Faculty restricted: Can only share notes with same-faculty students

### ◦ Auto-save functionality

### 7. Public Articles System:

### ◦ Article creation using BlockNote editor (solo mode, no real-time)

### ◦ Draft and publish workflow

### ◦ Published articles visible to everyone (no login required)

### ◦ Article browsing, search, and filtering by tags

### ◦ View counter and read time estimation

### ◦ Author dashboard for managing articles

### ◦ Admin can feature articles

### 8. User Profiles & Contributions:

### ◦ Profile picture upload

### ◦ Profile pictures displayed as contributor avatars on shared courses

### ◦ User dashboard showing:

### ▪ Courses I created


### ▪ Courses shared with me

### ▪ My contributions to shared courses

### 9. Data Structure:

### ◦ Structured data management (Prisma/PostgreSQL)

### ◦ Universities, Faculties, Users, Courses, Resources, CourseCollaborators (with

```
permission roles), Notes, Events, Articles, Tags
```
### 10. Secure File Storage:

### ◦ UploadThing for file uploads and delivery

### ◦ File associations with resources and courses

**2.2.2 Excluded**

The following items are specifically excluded from the current project scope:

1. Native mobile application development (web-only).
2. Integration with existing university systems (Canvas, Blackboard, student registration
    systems).
3. Institution-managed or faculty-managed course creation this is **student driven only**.
4. Public course listings or discovery all courses are private unless explicitly shared.
5. Comment sections, private messaging, or social features beyond course sharing and
    article publishing.
6. Advanced analytics or usage tracking beyond basic view counters.
7. Direct integration with university calendars or external calendar systems.
8. User training materials and large-scale university deployment (focus on core system
    development).

## 3. Organization

### 3.1 Organizational Boundaries and Interfaces

The project is within the **DOCTECH** development team. The only external users are **University
Students** (the users of the platform) and maybe **University Management** (who may benefit
from student-organized resources).


**- Parent Organization (University):** The project must align with university policies
    regarding data privacy and intellectual property. The **Project Advisor (Mr. Sassan**
    **Sarbast )** acts as the only interface to the parent organization.
**- Customer Organization (Students):** Students are the primary users. Feedback will be
    gathered during Sprint 4 (QA) to validate usability and meet functional goals.
**- Subcontracted Organizations:** No external subcontracts are planned. All technology
    choices (NeonDB, UploadThing, Liveblocks) are managed via standard cloud service
    agreements.

### 3.2 Project Organization

**Project Manager:** Rawa Dara Radha

## 4. Schedule

The project will follow an **Agile methodology** broken down into five Sprints, each focusing on a
key set of features.

### 4.1 Work Breakdown Structure

The WBS is structured around the Agile Sprints defined below. Key work packages include:
**Setup & Architecture** , **Authentication & Admin Approval** , **Student Course Management** ,

```
Name Roles Description
```
```
Rawa Dara
Radha
```
```
Project
Manager
```
```
Oversees development, ensures progress aligns with
milestones, and manages coordination between team
members.
```
```
Parwar Yassin
qadr
Lead Developer
```
```
Implements authentication, course management, sharing
permissions, collaboration features, and API endpoints
using Next.js and Prisma.
```
```
Drud Zmnako
```
#### UI/UX

```
Designer
```
```
Designs and develops the user interface with Tailwind
CSS and Shadcn UI, focusing on student-driven
workflows and collaboration indicators.
```
```
Muhamad ahmad Tester & QA
```
```
Conducts system testing, ensures app stability, validates
user experience including permission levels and sharing
workflows.
```
```
Aland haval
```
```
Storage &
System
Monitoring
Engineer
```
```
Monitors UploadThing, NeonDB, and Liveblocks usage,
manages storage limits, and ensures stable performance.
```

**Sharing & Permissions** , **Collaborative Notes** , **Calendar** , **Articles** , and **Final Quality
Assurance (QA)**.

### 4.2 Schedule and Milestones

### 4.3 Development Process

```
Code Milestone Description Milestone Criteria
Planned
Date
```
#### M

```
Proposal &
Plan Approval
```
```
Formal
acceptance of
the Project
Proposal and
Software
Project Plan.
```
```
Budget and scope are released/approved. 2025-10-
```
#### M

```
Sprint 1: Core
Setup
```
```
Foundation of
the
application.
```
```
Next.js/Prisma/PostgreSQL setup complete.
NextAuth working with basic roles.
UploadThing integration successful.
```
#### 2025-11-

#### M

```
Sprint 2:
Authentication
& Admin
```
```
Development
of the student
approval
system and
admin
dashboard.
```
```
Student registration with university/faculty
selection and ID upload functional. Admin
approval workflow complete. Email
notifications working via Nodemailer.
```
#### 2025-12-

#### M

```
Sprint 3:
Course &
Resource
Management
```
```
Development
of student-
driven course
creation and
resource card
system.
```
```
Students can create their own courses from
scratch. Predefined and custom resource
cards functional. File uploads working.
Course detail pages complete.
```
#### 2026-01-

#### M

```
Sprint 4:
Sharing, Notes
& Articles
```
```
Implementatio
n of course
sharing
permissions,
real-time
collaboration,
and articles.
```
```
Faculty-restricted invitation system
working. Viewer and Contributor
permissions enforced. Contributor avatars
displayed. BlockNote editor integrated with
Liveblocks for real-time notes. Article
creation and public browsing complete. Full
system testing and bug fixing.
```
#### 2026-02-

#### M

```
Sprint 5:
Calendar &
Final Release
```
```
Implementatio
n of favorites/
calendar
system and
final delivery.
```
```
Favorites system functional. Only favorited
courses appear in calendar dropdown.
FullCalendar integrated with event creation
and weekly view. Conflict detection
working. System is stable, documentation
reviewed, and final project report submitted.
```
#### 2026-02-


The project will use an **Agile/Scrum** approach. We will utilize iterative prototyping and gather
user feedback at the end of each sprint. The process is chosen for its flexibility in managing
scope and incorporating feedback from the end-users (students) to ensure the system meets real-
world usability needs. The architecture will be strictly component-based (Next.js components) to
facilitate parallel development.

### 4.4 Development Environment

### 4.5 Measurements Program

Project-specific data will be collected to assess the achievement of quality and functional goals.

```
Item Applied for
Availability by
(Milestone)
Framework Next.js (React) M
Language TypeScript/JavaScript, SQL M
Database PostgreSQL (Neon DB) M
ORM Prisma M
File Storage UploadThing M
Real-time
Collaboration
Liveblocks M
```
```
Editor BlockNote M
Calendar FullCalendar M
Styling Tailwind CSS, Shadcn UI M
Auth NextAuth M
Email Nodemailer M
```
```
Tools
Git, VSCode, Browser Dev
Tools
```
#### M

```
Type of data Purpose Responsible
# Defects found
per Sprint
To assess code quality and testing effectiveness. Tester & QA
```
```
Mean Time To
Resolve (MTTR)
To track team efficiency in addressing critical issues.Lead Developer
```
```
UI Usability Score
To assess achievement of the Business Goal (user-
friendly interface) via post-M4 user feedback.
UI/UX Designer
```
```
Storage Latency
(ms)
```
```
To assess the achievement of the Quality Goal
(secure, efficient retrieval).
```
```
Storage & System
Monitoring Engineer
```

## 5. Delivery Plan

### 5.1 Deliverables and Receivers

## 6. Abbreviations and Definitions

```
# Changed
Requirements
```
```
To track scope stability and manage the Change
Control process.
Project Manager
```
```
Permission
Enforcement Rate
```
```
To measure accuracy of viewer/contributor
permission controls.
Tester & QA
```
```
Collaboration
Session Success
Rate
```
```
To measure real-time collaboration reliability and
user experience.
Tester & QA
```
```
Code Deliverable Milestone PIC
D1 UniShare Live Web Application M5 Rawa Dara Radha (PM)
```
```
D2 Final Codebase (Source Code) M
Parwar Yassin qadr (Lead
Dev)
D3 System Requirements Specification (SRS) M1 Rawa Dara Radha (PM)
```
```
D4 Database Schema and Design Document M
Parwar Yassin qadr (Lead
Dev)
D5 User Documentation (Guides for Student) M4 Muhamad ahmad (Tester/QA)
```
```
D
Final Project Report and Presentation
Slides
M5 Rawa Dara Radha (PM)
```
```
Abbreviation Definition
CCB Change Control Board
CI Configuration Item
CM Configuration Management
COTS Commercial Off The Shelf
CR Change Request
QA Quality Assurance
WBS Work Breakdown Structure
```
```
UploadThing
Cloud file storage and delivery
service
Neon DB Serverless PostgreSQL Database
```

## 7. References

```
Liveblocks
Real-time collaboration
infrastructure
BlockNote Block-based rich text editor
CRDT Conflict-free Replicated Data Type
```
```
Doc.
No.
Title
```
```
[1] UniShare Project Proposal
```
```
[2]
Project Requirements Specification for
UniShare
[3] Reference project plan doc
```

