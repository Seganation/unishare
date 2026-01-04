# UniShare - Sprint 3 Iteration Report

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
**Date:** January 10, 2026  
**Sprint Duration:** December 6, 2025 - January 10, 2026

---

## Table of Contents

1. Use Case Diagrams
2. Domain Model (UML Diagram)
3. Sequence Diagrams
4. Use Case Scenarios
5. Data Description
6. Data Dictionary

---

## Sprint 3 Overview

Sprint 3 focused on implementing the core student-driven course management system, resource organization, and introducing AI-powered learning assistance features. This sprint marks a significant expansion beyond the original scope with the integration of Google Gemini AI to enhance student learning experiences.

### Sprint 3 Goals
- ✅ Student-led course creation and management
- ✅ Resource cards system with file uploads
- ✅ Course detail pages with comprehensive views
- ✅ Favorites system for course organization
- ⚠️ **AI Learning Assistant** (ADDED - not in original scope)
- ⚠️ **AI Quiz Generation** (ADDED - not in original scope)
- ⚠️ **AI Study Plan Generator** (ADDED - not in original scope)
- ⚠️ **AI Note Enhancement** (ADDED - not in original scope)

### Technical Achievements
- Implemented tRPC for type-safe API layer
- Integrated Google Gemini 2.5 Flash and Pro models
- Built streaming AI chat interface
- Created comprehensive course management system
- Implemented nested resource organization

---

## 1. Use Case Diagrams

### Student Course Management Use Case

[Diagram 1: Student Course Management]

**Actors:**
- Student (APPROVED role)

**Use Cases:**
1. **Create Course**
   - Student creates new course with title, description, color, semester
   - System generates unique course ID
   - System creates default resource cards (Assignments, Tasks, Content, Notes)
   - System marks course as private by default

2. **View Courses**
   - Student views list of owned courses
   - Student views shared courses (from collaborators)
   - System displays course cards with icons, colors, titles

3. **Edit Course**
   - Student updates course details (title, description, color, semester, icon)
   - System validates and saves changes
   - System updates course metadata

4. **Delete Course**
   - Student initiates course deletion
   - System confirms ownership (only owner can delete)
   - System cascade deletes all resources, cards, collaborations
   - System removes course from database

5. **Favorite Course**
   - Student marks course as favorite
   - System stores favorite relationship
   - System filters favorited courses in calendar views

6. **Manage Resources**
   - Student creates custom resource cards
   - Student uploads files to resource cards (UploadThing)
   - Student organizes resources by card type
   - Student deletes resources (if owner)

### AI Learning Assistant Use Case ⚠️

[Diagram 2: AI Learning Assistant]

**Actors:**
- Student (APPROVED role)
- Google Gemini AI (External System)

**Use Cases:**
1. **Start AI Conversation**
   - Student navigates to AI assistant page
   - Student optionally selects a course context
   - System creates new AI conversation
   - System displays chat interface

2. **Chat with AI**
   - Student sends message to AI
   - System streams response from Gemini 2.5 Flash
   - System saves conversation history
   - System displays AI response with typing effect

3. **Generate Quiz**
   - Student requests quiz generation
   - Student specifies topic, difficulty, question count, types
   - System sends request to Gemini 2.5 Pro
   - System parses AI response into structured quiz
   - System saves quiz to database
   - Student can take quiz later

4. **Generate Study Plan**
   - Student requests study plan for course
   - Student specifies duration, hours per week, goal, deadline
   - System sends request to Gemini 2.5 Pro
   - System parses AI response into weekly breakdown
   - System saves study plan to database
   - Student can track progress

5. **Enhance Notes**
   - Student requests AI improvement of notes
   - Student provides existing note content
   - System sends to Gemini with enhancement prompt
   - System returns improved version
   - Student can accept or modify

6. **View Conversation History**
   - Student views past AI conversations
   - Student continues previous conversations
   - System loads conversation messages
   - System maintains context

---

## 2. Domain Model (UML Diagram)

[Diagram 3: UniShare Domain Model - Sprint 3]

### Core Entities

**Course Entity** (NEW in Sprint 3):
- `id`: String (CUID) - Primary key
- `title`: String - Course name
- `description`: String (optional) - Course details
- `code`: String (optional) - Course code (e.g., "SCSJ3104")
- `color`: String - Hex color for UI (#FF5733)
- `semester`: String (optional) - Term/semester
- `icon`: String (optional) - Emoji icon
- `ownerId`: String - Foreign key to User
- `createdAt`: DateTime - Creation timestamp
- `updatedAt`: DateTime - Last update

**ResourceCard Entity** (NEW in Sprint 3):
- `id`: String (CUID) - Primary key
- `title`: String - Card name
- `description`: String (optional) - Card purpose
- `order`: Int - Display order
- `type`: CardType - ASSIGNMENT | TASK | CONTENT | NOTES | CUSTOM
- `allowFileUploads`: Boolean - File upload permission
- `courseId`: String - Foreign key to Course
- `createdAt`: DateTime - Creation timestamp
- `updatedAt`: DateTime - Last update

**Resource Entity** (NEW in Sprint 3):
- `id`: String (CUID) - Primary key
- `title`: String - Resource name
- `description`: String (optional) - Resource details
- `fileUrl`: String (optional) - UploadThing URL
- `fileType`: String (optional) - MIME type
- `fileSize`: Int (optional) - Bytes
- `order`: Int - Display order within card
- `cardId`: String - Foreign key to ResourceCard
- `uploadedById`: String - Foreign key to User
- `createdAt`: DateTime - Upload timestamp
- `updatedAt`: DateTime - Last update

**Favorite Entity** (NEW in Sprint 3):
- `id`: String (CUID) - Primary key
- `userId`: String - Foreign key to User
- `courseId`: String - Foreign key to Course
- `createdAt`: DateTime - Favorite timestamp

**AiConversation Entity** ⚠️ (NEW - UNDOCUMENTED):
- `id`: String (CUID) - Primary key
- `title`: String - Conversation title
- `userId`: String - Foreign key to User
- `courseId`: String (optional) - Context course
- `createdAt`: DateTime - Conversation start
- `updatedAt`: DateTime - Last message

**AiMessage Entity** ⚠️ (NEW - UNDOCUMENTED):
- `id`: String (CUID) - Primary key
- `content`: String (text) - Message content
- `role`: MessageRole - USER | ASSISTANT | SYSTEM
- `conversationId`: String - Foreign key to AiConversation
- `createdAt`: DateTime - Message timestamp

**AiQuiz Entity** ⚠️ (NEW - UNDOCUMENTED):
- `id`: String (CUID) - Primary key
- `title`: String - Quiz title
- `topic`: String - Quiz topic
- `difficulty`: QuizDifficulty - EASY | MEDIUM | HARD
- `totalQuestions`: Int - Number of questions
- `courseId`: String (optional) - Related course
- `userId`: String - Foreign key to User (creator)
- `createdAt`: DateTime - Generation timestamp

**AiQuizQuestion Entity** ⚠️ (NEW - UNDOCUMENTED):
- `id`: String (CUID) - Primary key
- `question`: String (text) - Question text
- `type`: QuestionType - MULTIPLE_CHOICE | TRUE_FALSE | SHORT_ANSWER | ESSAY
- `options`: Json - Answer options array
- `correctAnswer`: String - Correct answer
- `explanation`: String (optional) - Answer explanation
- `order`: Int - Question order
- `quizId`: String - Foreign key to AiQuiz
- `createdAt`: DateTime

**AiQuizAttempt Entity** ⚠️ (NEW - UNDOCUMENTED):
- `id`: String (CUID) - Primary key
- `quizId`: String - Foreign key to AiQuiz
- `userId`: String - Foreign key to User
- `answers`: Json - User answers object
- `score`: Float (optional) - Percentage score
- `completedAt`: DateTime (optional) - Completion time
- `createdAt`: DateTime - Attempt start

**AiStudyPlan Entity** ⚠️ (NEW - UNDOCUMENTED):
- `id`: String (CUID) - Primary key
- `title`: String - Plan title
- `goal`: String (optional) - Learning goal
- `weekCount`: Int - Number of weeks
- `hoursPerWeek`: Int - Study hours per week
- `deadline`: DateTime (optional) - Target date
- `weeks`: Json - Weekly breakdown array
- `courseId`: String (optional) - Related course
- `userId`: String - Foreign key to User
- `createdAt`: DateTime - Generation timestamp

**AiGeneratedNote Entity** ⚠️ (NEW - UNDOCUMENTED):
- `id`: String (CUID) - Primary key
- `originalContent`: String (text) - Original note
- `generatedContent`: String (text) - AI-enhanced version
- `prompt`: String - Enhancement prompt
- `type`: NoteGenerationType - GENERATE | IMPROVE | SUMMARIZE
- `tokensUsed`: Int - API token count
- `userId`: String - Foreign key to User
- `createdAt`: DateTime - Generation timestamp

### Relationships

**User ↔ Course**: One-to-Many
- User owns multiple courses (ownerId)
- Each course has one owner

**Course ↔ ResourceCard**: One-to-Many (Cascade Delete)
- Course contains multiple resource cards
- Each resource card belongs to one course
- Deleting course deletes all cards

**ResourceCard ↔ Resource**: One-to-Many (Cascade Delete)
- Resource card contains multiple resources
- Each resource belongs to one card
- Deleting card deletes all resources

**User ↔ Resource**: One-to-Many
- User uploads multiple resources
- Each resource has one uploader

**User ↔ Favorite**: One-to-Many
- User can favorite multiple courses
- Each favorite links one user to one course

**Course ↔ Favorite**: One-to-Many
- Course can be favorited by multiple users
- Each favorite links one course to one user

**User ↔ AiConversation**: One-to-Many ⚠️
- User can have multiple AI conversations
- Each conversation belongs to one user

**Course ↔ AiConversation**: One-to-Many (Optional) ⚠️
- Course can be context for multiple conversations
- Each conversation may reference one course

**AiConversation ↔ AiMessage**: One-to-Many (Cascade Delete) ⚠️
- Conversation contains multiple messages
- Each message belongs to one conversation

**User ↔ AiQuiz**: One-to-Many ⚠️
- User can generate multiple quizzes
- Each quiz created by one user

**Course ↔ AiQuiz**: One-to-Many (Optional) ⚠️
- Course can have multiple quizzes
- Each quiz may relate to one course

**AiQuiz ↔ AiQuizQuestion**: One-to-Many (Cascade Delete) ⚠️
- Quiz contains multiple questions
- Each question belongs to one quiz

**AiQuiz ↔ AiQuizAttempt**: One-to-Many ⚠️
- Quiz can have multiple attempts
- Each attempt is for one quiz

**User ↔ AiQuizAttempt**: One-to-Many ⚠️
- User can attempt multiple quizzes
- Each attempt by one user

**User ↔ AiStudyPlan**: One-to-Many ⚠️
- User can create multiple study plans
- Each plan created by one user

**Course ↔ AiStudyPlan**: One-to-Many (Optional) ⚠️
- Course can have multiple study plans
- Each plan may relate to one course

**User ↔ AiGeneratedNote**: One-to-Many ⚠️
- User can generate multiple notes
- Each note generated by one user

---

## 3. Sequence Diagrams

### Sequence 1: Create Course Flow

[Diagram 4: Create Course Sequence Diagram]

**Participants:**
- Student
- Course Form UI
- tRPC Client
- tRPC Router
- Prisma ORM
- PostgreSQL Database

**Flow:**
1. Student navigates to "Create Course" page
2. Student fills form (title, description, color, semester, icon)
3. Student submits form
4. Course Form UI validates input (Zod schema)
5. tRPC Client calls `api.course.create.mutate()`
6. tRPC Router receives request
7. Router verifies user authentication (session)
8. Router validates user role (APPROVED only)
9. Prisma creates Course record with ownerId
10. Prisma creates 4 default ResourceCards:
    - Assignments (order: 0, type: ASSIGNMENT, allowFileUploads: true)
    - Tasks (order: 1, type: TASK, allowFileUploads: false)
    - Content (order: 2, type: CONTENT, allowFileUploads: true)
    - Notes (order: 3, type: NOTES, allowFileUploads: false)
11. Database commits transaction
12. Database returns Course + ResourceCards
13. Prisma returns course object
14. tRPC Router returns success response
15. tRPC Client updates cache
16. UI redirects to course detail page
17. Student sees new course

**Error Handling:**
- Validation error → Return 400 with error messages
- Unauthorized → Return 401, redirect to login
- Database error → Return 500, rollback transaction

### Sequence 2: Upload Resource to Card

[Diagram 5: Resource Upload Sequence Diagram]

**Participants:**
- Student
- Resource Upload UI
- UploadThing Client
- UploadThing Server
- tRPC Client
- tRPC Router
- Prisma ORM
- PostgreSQL Database

**Flow:**
1. Student selects resource card in course
2. Student clicks "Upload" button
3. Resource Upload UI opens file picker
4. Student selects file(s)
5. UI validates file (size: max 16MB, type: PDF/images/docs/zip)
6. UploadThing Client uploads file to cloud
7. UploadThing Server stores file (S3-backed)
8. UploadThing Server returns file URL
9. UploadThing Client receives URL
10. tRPC Client calls `api.resource.create.mutate()` with:
    - cardId
    - title (file name)
    - fileUrl
    - fileType (MIME)
    - fileSize (bytes)
11. tRPC Router validates:
    - User owns course containing card
    - Card allows file uploads
12. Prisma creates Resource record
13. Database commits
14. Database returns Resource
15. tRPC Router returns success
16. UI updates resource list
17. Student sees new resource in card

**Error Handling:**
- File too large → Show error before upload
- Invalid file type → Block upload
- Unauthorized → Return 403
- Card doesn't allow uploads → Return 400

### Sequence 3: AI Chat Conversation ⚠️

[Diagram 6: AI Chat Sequence Diagram]

**Participants:**
- Student
- Chat UI
- `/api/chat` Route (Next.js API)
- Vercel AI SDK
- Google Gemini API
- Prisma ORM
- PostgreSQL Database

**Flow:**
1. Student navigates to AI assistant (`/ai` or `/ai/{conversationId}`)
2. If new conversation:
   - tRPC Client calls `api.ai.createConversation.mutate()`
   - Prisma creates AiConversation
   - System generates title "New Conversation"
3. Chat UI loads conversation history (if exists)
4. Student types message
5. Student presses Send
6. Chat UI adds user message to display (optimistic update)
7. Chat UI calls POST `/api/chat` with:
   - `conversationId`
   - `messages` array (conversation history)
   - `courseId` (optional context)
8. API Route validates user session
9. API Route loads course context (if courseId provided):
   - Fetches course title, resources, recent notes
10. API Route creates system prompt:
    - "You are a helpful AI learning assistant"
    - Course context (if available)
11. Vercel AI SDK calls `streamText()` with:
    - Model: `google("gemini-2.5-flash")`
    - Messages: conversation history
    - System: context prompt
12. Google Gemini API generates response (streaming)
13. API Route receives text stream
14. API Route sends Server-Sent Events (SSE) to client
15. Chat UI receives stream chunks
16. Chat UI displays AI response with typing effect
17. When stream complete:
    - API Route saves user message to database
    - API Route saves AI message to database
    - Prisma creates 2 AiMessage records
18. Chat UI updates conversation title (first AI response)
19. Student sees complete AI response

**Error Handling:**
- No API key → Return 500 "AI service not configured"
- Rate limit → Return 429 "Too many requests"
- Invalid conversation → Return 404
- Gemini error → Return 500, display friendly message

### Sequence 4: AI Quiz Generation ⚠️

[Diagram 7: Quiz Generation Sequence Diagram]

**Participants:**
- Student
- Quiz Form UI
- tRPC Client
- tRPC Router (ai.generateQuiz)
- Quiz Generator Service
- Google Gemini API
- Prisma ORM
- PostgreSQL Database

**Flow:**
1. Student navigates to "AI Quiz" page
2. Student fills quiz form:
   - Topic (e.g., "Database Normalization")
   - Question count (5-20)
   - Difficulty (Easy/Medium/Hard)
   - Question types (Multiple Choice, True/False, etc.)
   - Course (optional)
3. Student submits form
4. Quiz Form UI validates input
5. tRPC Client calls `api.ai.generateQuiz.mutate()`
6. tRPC Router validates user session
7. Router creates quiz generation prompt:
   - Topic and difficulty
   - Question count and types
   - JSON output format specification
8. Router calls `generateText()` with:
   - Model: `google("gemini-2.5-pro")` (high quality)
   - Prompt: structured quiz request
9. Google Gemini API generates quiz JSON
10. Router receives generated text
11. Router parses JSON response
12. Router validates quiz structure:
    - Has questions array
    - Each question has required fields
    - Correct answers provided
13. Prisma begins transaction
14. Prisma creates AiQuiz record:
    - title (from topic)
    - topic
    - difficulty
    - totalQuestions
    - courseId (optional)
    - userId (current user)
15. Prisma creates AiQuizQuestion records (bulk insert):
    - For each question in parsed JSON
    - Sets order, type, options, correctAnswer
16. Database commits transaction
17. Router returns Quiz with Questions
18. tRPC Client receives quiz
19. UI redirects to quiz detail page
20. Student can start quiz attempt

**Error Handling:**
- Invalid JSON from AI → Retry with clearer prompt
- Missing required fields → Return 400
- Gemini error → Return 500
- Exceeded question limit → Return 400

### Sequence 5: Generate Study Plan ⚠️

[Diagram 8: Study Plan Generation Sequence Diagram]

**Participants:**
- Student
- Study Plan Form UI
- tRPC Client
- tRPC Router (ai.generateStudyPlan)
- Study Plan Generator Service
- Google Gemini API
- Prisma ORM
- PostgreSQL Database

**Flow:**
1. Student selects course
2. Student clicks "Generate Study Plan"
3. Student fills form:
   - Week count (1-12 weeks)
   - Hours per week (1-40)
   - Goal (optional, e.g., "Prepare for final exam")
   - Deadline (optional)
4. Student submits form
5. tRPC Client calls `api.ai.generateStudyPlan.mutate()`
6. Router loads course context:
   - Course title and description
   - Existing resources (for content awareness)
7. Router creates study plan prompt:
   - Course information
   - Duration and time commitment
   - Student goal
   - JSON output format (weeks array)
8. Router calls `generateText()` with:
   - Model: `google("gemini-2.5-pro")`
   - Prompt: detailed study plan request
9. Gemini generates structured plan
10. Router parses JSON:
    - Weeks array with tasks
    - Each week has title, topics, tasks
11. Prisma creates AiStudyPlan record:
    - title
    - goal
    - weekCount
    - hoursPerWeek
    - deadline
    - weeks (JSON field)
    - courseId
    - userId
12. Database commits
13. Router returns study plan
14. UI displays weekly breakdown:
    - Week-by-week accordion
    - Tasks with checkboxes (future: track progress)
15. Student reviews plan

**Error Handling:**
- Invalid week count → Return 400
- Course not found → Return 404
- Gemini timeout → Return 500, retry

---

## 4. Use Case Scenarios

### Use Case 1: Create Course with Resources (UC-S3-001)

| Field | Value |
|-------|-------|
| **Use Case ID** | UC-S3-001 |
| **Use Case Name** | Create Course with Resources |
| **Actors** | Student (APPROVED) |
| **Description** | Student creates a new course and uploads initial resources |
| **Pre-conditions** | - User is logged in<br>- User has APPROVED role<br>- User has selected university and faculty |
| **Flow of Events** | 1. Student clicks "Create Course" button<br>2. System displays course creation form<br>3. Student enters course title (e.g., "Application Development")<br>4. Student optionally enters description<br>5. Student selects color from palette<br>6. Student selects emoji icon<br>7. Student enters semester (e.g., "Fall 2025")<br>8. Student submits form<br>9. System validates input<br>10. System creates Course record<br>11. System generates 4 default ResourceCards<br>12. System redirects to course detail page<br>13. Student sees course with empty resource cards<br>14. Student clicks "Upload" on Assignments card<br>15. Student selects PDF file (e.g., assignment1.pdf)<br>16. System uploads to UploadThing<br>17. System creates Resource record with file URL<br>18. Student sees resource appear in Assignments card |
| **Post-conditions** | - Course created in database<br>- 4 default resource cards exist<br>- 1 resource uploaded<br>- Student redirected to course page |
| **Alternative Flows** | **A1: Validation Error**<br>- At step 9, if title is empty, system shows error<br>- Student corrects and resubmits<br><br>**A2: Upload Fails**<br>- At step 16, if file too large, system shows error<br>- Student selects smaller file |
| **Priority** | High |

### Use Case 2: Favorite Course for Calendar (UC-S3-002)

| Field | Value |
|-------|-------|
| **Use Case ID** | UC-S3-002 |
| **Use Case Name** | Favorite Course for Calendar |
| **Actors** | Student (APPROVED) |
| **Description** | Student marks course as favorite to include in calendar |
| **Pre-conditions** | - User is logged in<br>- User owns or has access to courses |
| **Flow of Events** | 1. Student views courses list page<br>2. Student hovers over course card<br>3. Student clicks star icon<br>4. System creates Favorite record<br>5. Star icon turns solid/yellow<br>6. Course is now marked as favorite<br>7. Student navigates to Timetable page<br>8. Student clicks "Add Event" button<br>9. System displays course dropdown<br>10. Only favorited courses appear in dropdown<br>11. Student selects favorited course<br>12. Student creates calendar event linked to course |
| **Post-conditions** | - Favorite relationship created<br>- Course appears in calendar course selector<br>- Star icon indicates favorite status |
| **Alternative Flows** | **A1: Unfavorite**<br>- Student clicks solid star icon<br>- System deletes Favorite record<br>- Star becomes outline<br>- Course removed from calendar dropdown |
| **Priority** | Medium |

### Use Case 3: Chat with AI Learning Assistant ⚠️ (UC-S3-003)

| Field | Value |
|-------|-------|
| **Use Case ID** | UC-S3-003 |
| **Use Case Name** | Chat with AI Learning Assistant |
| **Actors** | Student (APPROVED), Google Gemini AI |
| **Description** | Student asks AI assistant for help with coursework |
| **Pre-conditions** | - User is logged in<br>- GOOGLE_GENERATIVE_AI_API_KEY is configured<br>- User has internet connection |
| **Flow of Events** | 1. Student clicks "AI Assistant" in navigation<br>2. System displays chat interface<br>3. System shows "Start new conversation" or conversation list<br>4. Student clicks "New Chat"<br>5. System creates AiConversation record<br>6. Student optionally selects course context<br>7. System loads course information (title, resources)<br>8. Student types question (e.g., "Explain database normalization")<br>9. Student presses Enter<br>10. System adds user message to UI<br>11. System sends request to /api/chat endpoint<br>12. API calls Gemini 2.5 Flash model<br>13. Gemini streams response<br>14. System displays AI response word-by-word<br>15. When complete, system saves both messages to database<br>16. Student can ask follow-up questions<br>17. Conversation history maintained |
| **Post-conditions** | - AiConversation created<br>- AiMessage records saved for user and AI<br>- Conversation appears in history<br>- Student can continue conversation later |
| **Alternative Flows** | **A1: API Error**<br>- At step 12, if Gemini unavailable, show error message<br>- Student can retry<br><br>**A2: Rate Limit**<br>- If too many requests, show "Please wait" message<br>- Disable send button temporarily |
| **Priority** | High (NEW feature) |

### Use Case 4: Generate Quiz with AI ⚠️ (UC-S3-004)

| Field | Value |
|-------|-------|
| **Use Case ID** | UC-S3-004 |
| **Use Case Name** | Generate Quiz with AI |
| **Actors** | Student (APPROVED), Google Gemini AI |
| **Description** | Student generates practice quiz using AI |
| **Pre-conditions** | - User is logged in<br>- GOOGLE_GENERATIVE_AI_API_KEY is configured |
| **Flow of Events** | 1. Student navigates to "AI Quiz" page<br>2. System displays quiz generation form<br>3. Student enters topic (e.g., "Object-Oriented Programming")<br>4. Student selects question count (e.g., 10)<br>5. Student selects difficulty (Medium)<br>6. Student checks question types (Multiple Choice, True/False)<br>7. Student optionally selects course context<br>8. Student clicks "Generate Quiz"<br>9. System shows loading indicator<br>10. System calls Gemini 2.5 Pro with structured prompt<br>11. Gemini generates quiz in JSON format<br>12. System parses JSON response<br>13. System creates AiQuiz record<br>14. System creates AiQuizQuestion records (bulk)<br>15. System redirects to quiz page<br>16. Student sees generated questions<br>17. Student can start quiz attempt or edit questions |
| **Post-conditions** | - AiQuiz created with questions<br>- Quiz available for taking<br>- Quiz linked to course (if selected)<br>- Questions have correct answers and explanations |
| **Alternative Flows** | **A1: Generation Fails**<br>- At step 11, if Gemini returns invalid JSON, retry<br>- If still fails, show error and option to regenerate<br><br>**A2: Edit Questions**<br>- After step 16, student clicks "Edit"<br>- Student modifies question text or answers<br>- System updates AiQuizQuestion record |
| **Priority** | High (NEW feature) |

### Use Case 5: Generate Study Plan ⚠️ (UC-S3-005)

| Field | Value |
|-------|-------|
| **Use Case ID** | UC-S3-005 |
| **Use Case Name** | Generate Personalized Study Plan |
| **Actors** | Student (APPROVED), Google Gemini AI |
| **Description** | Student generates structured study plan for course |
| **Pre-conditions** | - User is logged in<br>- User has courses<br>- GOOGLE_GENERATIVE_AI_API_KEY is configured |
| **Flow of Events** | 1. Student opens course detail page<br>2. Student clicks "Generate Study Plan"<br>3. System displays study plan form<br>4. Student enters week count (e.g., 4 weeks)<br>5. Student enters hours per week (e.g., 5 hours)<br>6. Student enters goal (e.g., "Prepare for final exam")<br>7. Student selects deadline (e.g., Feb 15, 2026)<br>8. Student submits form<br>9. System loads course resources for context<br>10. System calls Gemini 2.5 Pro with course info<br>11. Gemini generates weekly breakdown with tasks<br>12. System parses JSON response<br>13. System creates AiStudyPlan record with weeks array<br>14. System displays study plan<br>15. Student sees week-by-week tasks:<br>    - Week 1: Introduction and basics<br>    - Week 2: Advanced concepts<br>    - Week 3: Practice problems<br>    - Week 4: Review and exam prep<br>16. Student can check off completed tasks (future feature) |
| **Post-conditions** | - AiStudyPlan created<br>- Weekly tasks defined<br>- Plan linked to course<br>- Student has structured learning path |
| **Alternative Flows** | **A1: Invalid Duration**<br>- At step 9, if week count > 12, show error<br>- Student adjusts duration<br><br>**A2: No Course Context**<br>- If course has no resources, Gemini uses topic only<br>- Generated plan is more generic |
| **Priority** | Medium (NEW feature) |

---

## 5. Data Description

### Course Table
Stores student-created courses for organizing academic materials.

**Key Fields:**
- **id**: Unique identifier (CUID format)
- **title**: Course name displayed in UI
- **color**: Hex color code for visual identification (#FF5733)
- **icon**: Emoji icon for course card
- **ownerId**: Foreign key linking to User who created course
- **createdAt**: Timestamp for creation tracking

**Business Rules:**
- Only course owner can delete course
- Deleting course cascades to all ResourceCards and Resources
- Course is private by default (visible only to owner)
- Title is required, description is optional
- Color defaults to system-generated value if not provided

### ResourceCard Table
Represents organizational containers within courses (like folders).

**Key Fields:**
- **id**: Unique identifier
- **title**: Card name (e.g., "Assignments", "Lecture Notes")
- **type**: Enum - ASSIGNMENT | TASK | CONTENT | NOTES | CUSTOM
- **allowFileUploads**: Boolean flag for upload permission
- **order**: Integer for display ordering
- **courseId**: Foreign key to parent Course

**Business Rules:**
- New courses get 4 default cards automatically created
- Default cards: Assignments (0), Tasks (1), Content (2), Notes (3)
- Tasks card (type: TASK) has allowFileUploads = false
- Custom cards can enable/disable file uploads
- Cards are ordered by 'order' field ascending

### Resource Table
Stores individual files/items within ResourceCards.

**Key Fields:**
- **id**: Unique identifier
- **title**: Resource name (often filename)
- **fileUrl**: UploadThing cloud storage URL
- **fileType**: MIME type (application/pdf, image/jpeg, etc.)
- **fileSize**: Size in bytes
- **cardId**: Foreign key to parent ResourceCard
- **uploadedById**: Foreign key to User who uploaded

**Business Rules:**
- File upload only allowed if ResourceCard.allowFileUploads = true
- Max file size: 16MB (enforced by UploadThing)
- Supported types: PDF, images, DOCX, XLSX, ZIP
- Only uploader or course owner can delete resource
- fileUrl is optional (for text-based resources like tasks)

### Favorite Table
Tracks which courses students have marked as favorites.

**Key Fields:**
- **id**: Unique identifier
- **userId**: Foreign key to User
- **courseId**: Foreign key to Course
- **createdAt**: Timestamp when favorited

**Business Rules:**
- Unique constraint on (userId, courseId) - can't favorite twice
- Favorited courses appear in calendar course dropdown
- Favoriting doesn't affect course permissions
- Student can favorite both owned and shared courses

### AiConversation Table ⚠️
Stores AI chat conversations for learning assistance.

**Key Fields:**
- **id**: Unique identifier
- **title**: Conversation title (auto-generated from first AI response)
- **userId**: Foreign key to User who owns conversation
- **courseId**: Optional foreign key for course context
- **createdAt**: Conversation start timestamp
- **updatedAt**: Last message timestamp

**Business Rules:**
- New conversations start with title "New Conversation"
- Title updates after first AI response
- Course context improves AI responses (if courseId provided)
- Conversations are private (only visible to owner)
- Deleting conversation cascades to all AiMessages

### AiMessage Table ⚠️
Stores individual messages within AI conversations.

**Key Fields:**
- **id**: Unique identifier
- **content**: Message text (TEXT type for long content)
- **role**: Enum - USER | ASSISTANT | SYSTEM
- **conversationId**: Foreign key to AiConversation
- **createdAt**: Message timestamp

**Business Rules:**
- Messages are immutable (cannot edit after creation)
- role = USER for student messages
- role = ASSISTANT for AI responses
- role = SYSTEM for context messages (rare)
- Messages ordered by createdAt chronologically

### AiQuiz Table ⚠️
Stores AI-generated quizzes for practice and assessment.

**Key Fields:**
- **id**: Unique identifier
- **title**: Quiz title (from topic)
- **topic**: Subject matter (e.g., "Database Normalization")
- **difficulty**: Enum - EASY | MEDIUM | HARD
- **totalQuestions**: Count of questions
- **courseId**: Optional course link
- **userId**: Creator/owner

**Business Rules:**
- Quiz generation uses Gemini 2.5 Pro model
- Question count range: 5-20
- Deleting quiz cascades to AiQuizQuestions and AiQuizAttempts
- Quiz is reusable (multiple attempts allowed)
- Linked course provides context for generation

### AiQuizQuestion Table ⚠️
Stores individual questions within AI quizzes.

**Key Fields:**
- **id**: Unique identifier
- **question**: Question text (TEXT type)
- **type**: Enum - MULTIPLE_CHOICE | TRUE_FALSE | SHORT_ANSWER | ESSAY
- **options**: JSON array of answer choices (for multiple choice)
- **correctAnswer**: Correct answer string
- **explanation**: Optional explanation of answer
- **order**: Display order (0-indexed)
- **quizId**: Foreign key to AiQuiz

**Business Rules:**
- MULTIPLE_CHOICE type requires options array
- TRUE_FALSE type has 2 options: ["True", "False"]
- SHORT_ANSWER and ESSAY have flexible answer matching
- correctAnswer is always stored for grading
- Questions ordered by 'order' field

### AiQuizAttempt Table ⚠️
Tracks student attempts at AI-generated quizzes.

**Key Fields:**
- **id**: Unique identifier
- **quizId**: Foreign key to AiQuiz
- **userId**: Foreign key to User attempting quiz
- **answers**: JSON object mapping questionId → answer
- **score**: Percentage score (0-100)
- **completedAt**: Completion timestamp (null if in-progress)
- **createdAt**: Attempt start

**Business Rules:**
- Student can attempt same quiz multiple times
- score is null until quiz completed
- answers stored as: `{ "q1": "Answer A", "q2": "True", ... }`
- Auto-graded for MULTIPLE_CHOICE and TRUE_FALSE
- Manual review needed for SHORT_ANSWER and ESSAY

### AiStudyPlan Table ⚠️
Stores AI-generated structured study plans.

**Key Fields:**
- **id**: Unique identifier
- **title**: Plan title (from goal or course)
- **goal**: Student's learning objective
- **weekCount**: Number of weeks (1-12)
- **hoursPerWeek**: Study hours per week (1-40)
- **deadline**: Optional target date
- **weeks**: JSON array of weekly tasks
- **courseId**: Optional course link
- **userId**: Creator/owner

**Business Rules:**
- Study plan generation uses Gemini 2.5 Pro
- weeks JSON structure: `[{ week: 1, title: "...", topics: [...], tasks: [...] }]`
- Each week has title, topics array, tasks array
- Plan linked to course for context
- Student can generate multiple plans per course

### AiGeneratedNote Table ⚠️
Tracks AI-enhanced or generated notes.

**Key Fields:**
- **id**: Unique identifier
- **originalContent**: Student's original note (if improving)
- **generatedContent**: AI-generated/enhanced version
- **prompt**: Prompt used for generation
- **type**: Enum - GENERATE | IMPROVE | SUMMARIZE
- **tokensUsed**: Token count for cost tracking
- **userId**: Owner

**Business Rules:**
- type = IMPROVE when enhancing existing notes
- type = GENERATE when creating from topic
- type = SUMMARIZE when condensing content
- originalContent is null for GENERATE type
- tokensUsed tracked for API cost monitoring

---

## 6. Data Dictionary

| Table | Field | Type | Constraints | Description |
|-------|-------|------|-------------|-------------|
| **Course** | id | String | PRIMARY KEY, CUID | Unique course identifier |
| | title | String | NOT NULL | Course name (e.g., "Application Development") |
| | description | String | NULL | Optional course description |
| | code | String | NULL | Course code (e.g., "SCSJ3104") |
| | color | String | NOT NULL, DEFAULT hex | Hex color code for UI (#FF5733) |
| | semester | String | NULL | Term/semester (e.g., "Fall 2025") |
| | icon | String | NULL | Emoji icon for course card |
| | ownerId | String | NOT NULL, FOREIGN KEY → User.id | Course creator/owner |
| | createdAt | DateTime | NOT NULL, DEFAULT now() | Creation timestamp |
| | updatedAt | DateTime | NOT NULL, AUTO UPDATE | Last modification timestamp |
| **ResourceCard** | id | String | PRIMARY KEY, CUID | Unique card identifier |
| | title | String | NOT NULL | Card name |
| | description | String | NULL | Optional card description |
| | order | Int | NOT NULL | Display order (0-indexed) |
| | type | CardType | NOT NULL | ASSIGNMENT \| TASK \| CONTENT \| NOTES \| CUSTOM |
| | allowFileUploads | Boolean | NOT NULL, DEFAULT true | File upload permission flag |
| | courseId | String | NOT NULL, FOREIGN KEY → Course.id, CASCADE | Parent course |
| | createdAt | DateTime | NOT NULL, DEFAULT now() | Creation timestamp |
| | updatedAt | DateTime | NOT NULL, AUTO UPDATE | Last modification timestamp |
| **Resource** | id | String | PRIMARY KEY, CUID | Unique resource identifier |
| | title | String | NOT NULL | Resource name (often filename) |
| | description | String | NULL | Optional resource description |
| | fileUrl | String | NULL | UploadThing cloud storage URL |
| | fileType | String | NULL | MIME type (application/pdf, image/jpeg) |
| | fileSize | Int | NULL | File size in bytes |
| | order | Int | NOT NULL | Display order within card |
| | cardId | String | NOT NULL, FOREIGN KEY → ResourceCard.id, CASCADE | Parent card |
| | uploadedById | String | NOT NULL, FOREIGN KEY → User.id | Uploader user |
| | createdAt | DateTime | NOT NULL, DEFAULT now() | Upload timestamp |
| | updatedAt | DateTime | NOT NULL, AUTO UPDATE | Last modification timestamp |
| **Favorite** | id | String | PRIMARY KEY, CUID | Unique favorite identifier |
| | userId | String | NOT NULL, FOREIGN KEY → User.id | User who favorited |
| | courseId | String | NOT NULL, FOREIGN KEY → Course.id | Favorited course |
| | createdAt | DateTime | NOT NULL, DEFAULT now() | Favorite timestamp |
| | | | UNIQUE (userId, courseId) | Prevent duplicate favorites |
| **AiConversation** ⚠️ | id | String | PRIMARY KEY, CUID | Unique conversation identifier |
| | title | String | NOT NULL | Conversation title (auto-generated) |
| | userId | String | NOT NULL, FOREIGN KEY → User.id | Conversation owner |
| | courseId | String | NULL, FOREIGN KEY → Course.id | Optional course context |
| | createdAt | DateTime | NOT NULL, DEFAULT now() | Conversation start |
| | updatedAt | DateTime | NOT NULL, AUTO UPDATE | Last message timestamp |
| **AiMessage** ⚠️ | id | String | PRIMARY KEY, CUID | Unique message identifier |
| | content | String (Text) | NOT NULL | Message text content |
| | role | MessageRole | NOT NULL | USER \| ASSISTANT \| SYSTEM |
| | conversationId | String | NOT NULL, FOREIGN KEY → AiConversation.id, CASCADE | Parent conversation |
| | createdAt | DateTime | NOT NULL, DEFAULT now() | Message timestamp |
| **AiQuiz** ⚠️ | id | String | PRIMARY KEY, CUID | Unique quiz identifier |
| | title | String | NOT NULL | Quiz title |
| | topic | String | NOT NULL | Subject matter |
| | difficulty | QuizDifficulty | NOT NULL | EASY \| MEDIUM \| HARD |
| | totalQuestions | Int | NOT NULL | Number of questions |
| | courseId | String | NULL, FOREIGN KEY → Course.id | Optional course link |
| | userId | String | NOT NULL, FOREIGN KEY → User.id | Quiz creator |
| | createdAt | DateTime | NOT NULL, DEFAULT now() | Generation timestamp |
| **AiQuizQuestion** ⚠️ | id | String | PRIMARY KEY, CUID | Unique question identifier |
| | question | String (Text) | NOT NULL | Question text |
| | type | QuestionType | NOT NULL | MULTIPLE_CHOICE \| TRUE_FALSE \| SHORT_ANSWER \| ESSAY |
| | options | Json | NULL | Answer choices array (for multiple choice) |
| | correctAnswer | String | NOT NULL | Correct answer |
| | explanation | String | NULL | Optional answer explanation |
| | order | Int | NOT NULL | Question order (0-indexed) |
| | quizId | String | NOT NULL, FOREIGN KEY → AiQuiz.id, CASCADE | Parent quiz |
| | createdAt | DateTime | NOT NULL, DEFAULT now() | Creation timestamp |
| **AiQuizAttempt** ⚠️ | id | String | PRIMARY KEY, CUID | Unique attempt identifier |
| | quizId | String | NOT NULL, FOREIGN KEY → AiQuiz.id | Quiz being attempted |
| | userId | String | NOT NULL, FOREIGN KEY → User.id | Student attempting quiz |
| | answers | Json | NOT NULL | User answers object |
| | score | Float | NULL | Percentage score (0-100) |
| | completedAt | DateTime | NULL | Completion timestamp |
| | createdAt | DateTime | NOT NULL, DEFAULT now() | Attempt start timestamp |
| **AiStudyPlan** ⚠️ | id | String | PRIMARY KEY, CUID | Unique study plan identifier |
| | title | String | NOT NULL | Plan title |
| | goal | String | NULL | Learning objective |
| | weekCount | Int | NOT NULL | Number of weeks (1-12) |
| | hoursPerWeek | Int | NOT NULL | Study hours per week (1-40) |
| | deadline | DateTime | NULL | Target completion date |
| | weeks | Json | NOT NULL | Weekly breakdown array |
| | courseId | String | NULL, FOREIGN KEY → Course.id | Optional course link |
| | userId | String | NOT NULL, FOREIGN KEY → User.id | Plan creator |
| | createdAt | DateTime | NOT NULL, DEFAULT now() | Generation timestamp |
| **AiGeneratedNote** ⚠️ | id | String | PRIMARY KEY, CUID | Unique generated note identifier |
| | originalContent | String (Text) | NULL | Original note (for IMPROVE type) |
| | generatedContent | String (Text) | NOT NULL | AI-generated/enhanced version |
| | prompt | String | NOT NULL | Generation prompt used |
| | type | NoteGenerationType | NOT NULL | GENERATE \| IMPROVE \| SUMMARIZE |
| | tokensUsed | Int | NOT NULL | Token count for cost tracking |
| | userId | String | NOT NULL, FOREIGN KEY → User.id | Note owner |
| | createdAt | DateTime | NOT NULL, DEFAULT now() | Generation timestamp |

---

## Sprint 3 Success Criteria

### Core Features ✅
- [x] Student-led course creation with customization (title, description, color, icon, semester)
- [x] Automatic generation of 4 default resource cards (Assignments, Tasks, Content, Notes)
- [x] Custom resource card creation with configurable file upload settings
- [x] File upload via UploadThing (max 16MB, PDF/images/docs/zip)
- [x] Resource organization within cards
- [x] Course detail pages with comprehensive views
- [x] Course editing and deletion (owner-only)
- [x] Favorites system for course organization
- [x] tRPC API layer for type-safe backend communication

### AI Features ✅ (UNDOCUMENTED - NEW SCOPE)
- [x] AI conversational assistant powered by Google Gemini 2.5 Flash
- [x] Streaming chat interface with conversation history
- [x] Course-aware AI responses (context from selected course)
- [x] AI quiz generation with Gemini 2.5 Pro
  - [x] Multiple question types (Multiple Choice, True/False, Short Answer, Essay)
  - [x] Configurable difficulty levels (Easy, Medium, Hard)
  - [x] 5-20 questions per quiz
  - [x] Automatic question parsing and validation
- [x] AI study plan generation
  - [x] Weekly task breakdown
  - [x] Customizable duration (1-12 weeks)
  - [x] Hours per week configuration
  - [x] Goal-oriented planning
- [x] AI note generation and improvement capabilities
- [x] Conversation management (view, continue, delete conversations)
- [x] Quiz attempt tracking and grading

### Technical Achievements ✅
- [x] Migration from Ollama (local) to Google Gemini (cloud)
- [x] Vercel AI SDK integration for streaming responses
- [x] tRPC router for AI endpoints (1,118 lines of code)
- [x] JSON schema validation for AI responses
- [x] Token usage tracking for cost management
- [x] Error handling for AI service failures
- [x] Rate limiting protection
- [x] Optimized prompts for better AI responses

### Database Schema ✅
- [x] Course, ResourceCard, Resource tables implemented
- [x] Favorite table for course favoriting
- [x] 8 AI-related tables (Conversation, Message, Quiz, QuizQuestion, QuizAttempt, StudyPlan, GeneratedNote)
- [x] Proper foreign key relationships and cascade deletes
- [x] Indexes for performance optimization
- [x] JSON fields for flexible data storage (quiz options, study plan weeks)

### User Experience ✅
- [x] Intuitive course creation wizard
- [x] Drag-and-drop file uploads
- [x] Real-time AI response streaming (word-by-word)
- [x] Loading indicators for AI generation
- [x] Error messages for failed AI requests
- [x] Responsive UI for all screen sizes
- [x] Consistent design with Shadcn UI components

---

## Technical Stack Summary (Sprint 3)

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Next.js | 15.2.3 | App Router, Server Components, Server Actions |
| **Language** | TypeScript | 5.8.2 | Type safety, better DX |
| **Database** | PostgreSQL (NeonDB) | Latest | Serverless database |
| **ORM** | Prisma | 6.5.0 | Type-safe database client |
| **API Layer** | tRPC | 11.x | End-to-end type safety |
| **AI Provider** | Google Gemini | 2.5 Flash/Pro | Conversational AI, quiz/plan generation |
| **AI Framework** | Vercel AI SDK | 5.0.113 | Streaming, hooks, providers |
| **File Storage** | UploadThing | 7.7.4 | Serverless file uploads |
| **UI Library** | Shadcn UI | Latest | Component library |
| **CSS** | Tailwind CSS | 4.0.15 | Utility-first styling |
| **Forms** | React Hook Form + Zod | Latest | Form validation |
| **Icons** | Lucide React | 0.548.0 | Icon library |

---

## Known Issues & Limitations

### AI System
- ⚠️ **Rate Limiting**: Free tier Gemini has 15 req/min limit - may affect multiple concurrent users
- ⚠️ **Cost Tracking**: Token usage tracked but no billing alerts yet
- ⚠️ **Prompt Injection**: No robust protection against malicious prompts
- ⚠️ **Hallucinations**: AI may generate incorrect information - needs disclaimer
- ⚠️ **Quiz Validation**: AI-generated quizzes not always perfectly formatted

### Course System
- ⚠️ **No Search**: Cannot search courses by title or code yet
- ⚠️ **No Tags**: No tagging system for course categorization
- ⚠️ **Limited Filters**: Cannot filter by semester or faculty

### File Uploads
- ⚠️ **Size Limit**: 16MB max - may be insufficient for large video lectures
- ⚠️ **No Preview**: PDF previews not implemented
- ⚠️ **No Virus Scan**: Uploaded files not scanned for malware

---

## Next Sprint Preview (Sprint 4)

Sprint 4 will focus on collaboration features and the articles system:

### Planned Features
1. **Course Sharing System**:
   - Faculty-restricted invitation system
   - Viewer permission (read-only, download)
   - Contributor permission (add resources, no delete)
   - Owner controls (full management)
   - Contributor avatars display (like GitHub)

2. **Real-Time Collaborative Notes** (Liveblocks + BlockNote):
   - Each course has one collaborative notes space
   - Live cursors and presence indicators
   - Conflict-free editing with CRDT (Yjs)
   - Nested pages for organization
   - Faculty-restricted sharing
   - Auto-save functionality

3. **Public Articles System**:
   - Article creation using BlockNote editor (solo mode)
   - Draft and publish workflow
   - Published articles visible to everyone (no login required)
   - Article browsing, search, filtering by tags
   - View counter and read time estimation
   - Author dashboard for managing articles
   - Admin can feature articles

4. **Notification System** (Already Partially Implemented ⚠️):
   - In-app notifications for shares, invitations
   - Email notifications for important events
   - User preferences for notification types
   - Cron job for scheduled notifications

---

## Conclusion

Sprint 3 has been highly successful, delivering all planned course management features PLUS a comprehensive AI learning assistance system powered by Google Gemini. The project is significantly ahead of schedule with:

- **90% of Sprint 3 complete** (target: Jan 10, 2026)
- **75% of Sprint 4 complete** (target: Feb 5, 2026)
- **4 major AI features** not in original scope
- **Robust tRPC API architecture** for type safety
- **Production-ready infrastructure** with error handling and validation

The addition of AI features transforms UniShare from a simple course management tool into an intelligent learning companion that can:
- Answer student questions contextually
- Generate practice quizzes automatically
- Create personalized study plans
- Enhance and organize notes

**Overall Project Completion: ~85%** (including undocumented features)

**Recommendation**: Update Project Proposal and Plan documents to reflect AI integration, justify the added value, and document the technology decisions that led to choosing Google Gemini over other AI providers.

---

**End of Sprint 3 Iteration Report**
