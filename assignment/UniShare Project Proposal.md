# PROJECT PROPOSAL

#### GROUP NAME: DOCTECH

**PROJECT TITLE:** UniShare – University Academic Resource Management System

**PROJECT MANAGER:** Rawa Dara Radha

## EXECUTIVE SUMMARY

### Introduction:

University students face a lot of problems when it comes to organizing and managing their
course resources such as lecture slides, assignments, notes, and other course materials. Currently,
students rely on platforms like WhatsApp groups, personal Google Drive folders, or not
managed files across devices, which makes it so frustrating that us as DOCTECH group are
students as well and we too face these problems like, lost materials, and difficulty collaborating
with classmates.

### Problems:

There is currently no all in one platform where students can personally or together create their
courses and manage it, upload their materials, and also sharing it with classmates. Students need
full control over their education while having the option to collaborate with other students to get
help.

### Proposed System:

UniShare is a student-driven academic platform where each approved student creates and
manages their own courses for the classes they have. After admin approval, students start with an
empty workspace and build their course structure from scratch creating courses for each class,
uploading resources, and organizing materials through predefined resource cards (Assignments,
Tasks, Content, Notes).

Courses are **private by default** and only visible to the creator. Students can invite classmates
from the same faculty to share courses with two permission levels:

**- Viewer:** Can see and download resources
**- Contributor:** Can add resources but cannot delete (ownership remains with creator)

Students can favorite courses to add them to their personal timetable, collaborate on notes in
real-time, and publish knowledge articles for the broader community. The platform is designed to
give students complete control over their education.

### Methodology:

The project will be developed using **Next.js** , **Prisma** , and **PostgreSQL (Neon DB)** for structured
data management. **UploadThing** will handle secure file storage. **Liveblocks** powers real-time
collaborative note-taking with **BlockNote** editor. **NextAuth** handles authentication with role-
based access (Admin for approvals, Approved Students for full access, Pending Students
awaiting approval). The UI will use **Tailwind CSS** and **Shadcn UI** for a modern interface.
Development follows **Agile methodology** with iterative sprints.

### Expected Output:

A fully functional web application where students can:

- Create their own course structure for classes they're taking
- Upload and organize academic materials through predefined resource cards
- Share courses privately with classmates (viewer or contributor access)
- See contributor avatars on shared courses (like GitHub)
- Favorite courses to add them to their personal calendar
- Collaborate on notes in real-time with classmates
- Publish articles to share knowledge with the community
- Maintain complete control over their academic organization

## PROBLEM STATEMENT

Currently, students manage their education materials through scattered, and unorganized ways:

**Individual Problems:**

- There isn’t a very good way to organize course materials for multiple classes
- Files scattered across devices, cloud storage, and messaging apps
- Difficulty tracking which materials belong to which course
- Lost resources when devices are replaced or storage is cleaned
- No easy way to share organized course materials with trusted classmates

**Collaboration Problems:**

- WhatsApp groups result in lost files once messages scroll away
- Google Drive sharing lacks proper permission controls (viewers can't contribute, editors
  can delete everything)
- No way to track who contributed which materials
- Difficulty maintaining organized shared folders
  **Time Management Problems:**
- No integrated way to link course materials with class schedules
- Students maintain separate calendars disconnected from their course resources

The proposed UniShare system addresses these issues by providing students with a personal
education place where they have complete control over course creation, resource organization,
and sharing with good permission levels, and also timetable management.

## GOAL

To develop a student-driven academic platform that lets university students to create, manage,
and also share their course materials with complete control and very good collaboration controls.

## OBJECTIVES

To design and develop a web-based platform with the following capabilities:

### 1. Student Registration & Approval:

### ◦ Implement user registration where students select their university and faculty

### ◦ Require student ID upload during registration

### ◦ Implement admin approval workflow with email notifications

### ◦ Role-based access (Admin, Approved Student, Pending Student)

### 2. Student-Driven Course Creation:

### ◦ Allow approved students to create courses for their classes from scratch

### ◦ Start with empty course list no pre-populated data

### ◦ Each course includes title, description, and color coding

### ◦ Courses are private by default (only visible to creator)

### 3. Resource Organization System:

### ◦ Auto-create 4 empty predefined resource cards per course:

### ▪ Assignments (with file uploads)

### ▪ Tasks (no file uploads, text-based to-do items)

### ▪ Content (with file uploads for slides, readings)

### ▪ Notes (links to collaborative editor)

### ◦ Allow custom resource card creation with configurable file upload options

### ◦ Students fill resource cards themselves by uploading materials

### 4. Course Sharing & Collaboration:

### ◦ Faculty-restricted sharing (can only invite students from same faculty)

### ◦ Two permission levels:

### ▪ Viewer: Can see and download all resources

### ▪ Contributor: Can add resources but cannot delete

### ◦ Invitation system where invited students must accept

### ◦ Shared courses appear in recipient's course list with clear "Shared" indicator

### ◦ Display contributor avatars (like GitHub) for courses with multiple contributors

### ◦ Course ownership always remains with original creator

### 5. Favorites & Calendar Integration:

### ◦ Students can favorite any course (owned or shared)

### ◦ Only favorited courses appear in calendar dropdown

### ◦ Implement weekly timetable with class scheduling

### ◦ Color-coded events matching course colors

### ◦ Conflict detection for overlapping classes

### 6. Real-Time Collaborative Notes:

### ◦ BlockNote editor with Liveblocks synchronization

### ◦ Conflict-free editing with live cursors

### ◦ Faculty-restricted note sharing

### ◦ Sidebar navigation for organizing note pages

### 7. Public Articles System:

### ◦ Students can write and publish articles for the community

### ◦ Articles visible to everyone (even without login)

### ◦ Draft and publish workflow

### ◦ Tag system and search capabilities

### 8. User Profile & Contributions:

### ◦ Profile pictures displayed as contributor avatars on shared courses

### ◦ User dashboard showing owned courses, shared courses, and contributions

## OUTCOMES

A student-centric platform where:

**- Students have full autonomy** over their academic organization—they create their own
course structure from scratch
**- Private by default** with selective sharing—students control who accesses their materials
**- Proper collaboration** with contributor roles that prevent accidental deletions
**- Visual contribution tracking** through profile picture avatars (like GitHub)
**- Integrated scheduling** where only relevant (favorited) courses appear in calendar
**- Real-time collaboration** on notes with classmates from the same faculty
**- Knowledge sharing** through public articles accessible to everyone
**- No admin micromanagement** —admins only approve students, don't touch course
content

## NEEDS, APPROACH, BENEFITS, COMPETITOR

## (NABC)

```
Eleme
nts
```

```
Description
```

```
Needs
Students need a personal workspace to organize their academic materials with full
control, ability to share selectively with proper permissions, integrated scheduling, and
real-time collaboration—all without admin interference in their course management.
Appr
oach
```

```
Build a student-driven platform using Next.js, Prisma, PostgreSQL, UploadThing,
Liveblocks, and BlockNote. Students create their own courses (starting from empty),
upload materials, share with invitation-based permissions (viewer/contributor), favorite
courses for calendar integration, and collaborate in real-time.
```

## TEAM MEMBERS AND ROLES

```
Benefi
ts
```

```
Complete student autonomy over academic organization, private-by-default with
selective sharing, proper collaboration controls (contributors can't delete), visual
contribution tracking, integrated schedule management, real-time note collaboration,
and community knowledge sharing through articles.
Comp
etitor
```

```
Google Drive lacks course structure and proper permission controls (editors can delete
everything). Notion doesn't have faculty-based sharing or integrated calendars.
WhatsApp groups lose files quickly. Canvas/Blackboard are institution-managed, not
student-controlled. UniShare gives students complete ownership while enabling
```

```
Name Roles Description
```

#### 1

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
2
Parwar
Yassin qadr
```

```
Lead
Developer
```

```
Implements authentication, course management, sharing
permissions, and API endpoints using Next.js and Prisma.
```

```
3
Drud
Zmnako
```

#### UI/UX

```
Designer
```

```
Designs and develops the user interface with Figma, focusing
on student-driven workflows and collaboration indicators.
```

```
4
Muhamad
ahmad
Tester & QA
Conducts system testing, ensures app stability, and validates
user experience including permission levels.
```

```
5 Aland haval
```

```
Storage &
System
Monitoring
Engineer
```

```
Monitors UploadThing and NeonDB usage, manages storage
limits, and ensures stable performance.
```
