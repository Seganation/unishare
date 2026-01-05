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
**Date:** January 15, 2026
**Sprint Duration:** December 2, 2025 - January 15, 2026

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

Sprint 3 implements the core student-driven course management system with AI-powered learning assistance. This sprint delivers the primary functionality where students create courses, organize resources, and leverage Google Gemini AI for personalized learning support through conversational chat, quiz generation, study planning, and note enhancement.

### Sprint 3 Goals
- ✅ Student-led course creation with customization (title, description, color, icon)
- ✅ Resource cards system with predefined and custom types
- ✅ File upload system via UploadThing (16MB max for course resources)
- ✅ Course favorites for calendar integration
- ✅ **AI Learning Assistant** with Google Gemini 2.5 Flash for conversational help
- ✅ **AI Quiz Generation** with Gemini 2.5 Pro for practice tests
- ✅ **AI Study Plan Generator** with Gemini 2.5 Pro for personalized schedules
- ✅ **AI Note Enhancement** with multiple generation types (generate, improve, summarize, expand)

### Technical Achievements
- Implemented tRPC for end-to-end type-safe API layer
- Integrated Google Gemini AI (2.5 Flash for chat, 2.5 Pro for content generation)
- Built streaming AI responses using Vercel AI SDK with Server-Sent Events (SSE)
- Created comprehensive course management with cascade delete relationships
- Implemented token usage tracking for all AI operations
- Developed nested resource organization (Course → ResourceCard → Resource)
- Added real-time AI chat with typing indicators and message history

---

## 1. Use Case Diagrams

### Student Course Management Use Case

**[DIAGRAM 1: Student Course Management Use Case - PLACEHOLDER FOR VISUAL DIAGRAM]**

**Description:**
The student course management use case illustrates the complete workflow for students to create, manage, and organize their academic courses. Students can create courses from scratch (empty course list initially), customize each course with title, description, semester, color coding, and emoji icons, view all owned and shared courses in a grid layout, edit course details at any time, delete courses (owner only with cascade delete), favorite courses for calendar integration, and manage resources within each course through predefined resource cards (Assignments, Tasks, Content, Notes) and custom cards.

**Actors:**
- Student (APPROVED role, authenticated)
- UniShare Course System
- UploadThing Service

**System Boundary:** Course Management Functions

**Use Cases:**
1. **UC-S3-001:** Create New Course
   - **Includes:** Validate Course Data, Generate Course ID, Create Default Resource Cards
2. **UC-S3-002:** View Course List
   - **Includes:** Fetch Owned Courses, Fetch Shared Courses (Sprint 4), Display Course Cards
3. **UC-S3-003:** Edit Course Details
   - **Includes:** Verify Ownership, Validate Changes, Update Course Metadata
4. **UC-S3-004:** Delete Course
   - **Includes:** Confirm Ownership, Cascade Delete Resources, Cascade Delete Cards
5. **UC-S3-005:** Favorite Course
   - **Includes:** Create Favorite Relationship, Update Calendar Availability
6. **UC-S3-006:** Unfavorite Course
   - **Includes:** Remove Favorite Relationship
7. **UC-S3-007:** Create Custom Resource Card
   - **Includes:** Validate Card Settings, Set File Upload Permission
8. **UC-S3-008:** Upload Resource to Card
   - **Includes:** Verify File Upload Permission, Upload to UploadThing, Store URL
9. **UC-S3-009:** Delete Resource
   - **Includes:** Verify Ownership/Permission, Remove File from UploadThing
10. **UC-S3-010:** Reorder Resource Cards
    - **Includes:** Update Order Values

---

### AI Learning Assistant Use Case

**[DIAGRAM 2: AI Learning Assistant Use Case - PLACEHOLDER FOR VISUAL DIAGRAM]**

**Description:**
The AI learning assistant use case demonstrates how students interact with Google Gemini AI for personalized learning support. Students can start conversations with optional course context, chat with AI using Gemini 2.5 Flash for fast responses with streaming (word-by-word typing effect), generate practice quizzes using Gemini 2.5 Pro with configurable difficulty (Easy/Medium/Hard), question types (Multiple Choice, True/False, Short Answer, Essay), and question count (5-20), create personalized study plans with weekly task breakdowns based on course content and time availability, enhance notes through four generation types (GENERATE from topics, IMPROVE existing notes, SUMMARIZE long content, EXPAND brief notes), view conversation history with all messages preserved, continue previous conversations maintaining context, and attempt generated quizzes with automatic grading and score tracking.

**Actors:**
- Student (APPROVED role, authenticated)
- Google Gemini AI (External System - 2.5 Flash & Pro models)
- Vercel AI SDK (Streaming Infrastructure)
- UniShare AI System

**System Boundary:** AI-Powered Learning Features

**Use Cases:**
1. **UC-S3-011:** Start AI Conversation
   - **Includes:** Create Conversation Record, Optionally Link Course Context
2. **UC-S3-012:** Send Message to AI
   - **Includes:** Validate Message, Call Gemini 2.5 Flash API, Stream Response (SSE), Save Message Pair
3. **UC-S3-013:** Continue Previous Conversation
   - **Includes:** Load Conversation History, Restore Context, Append New Messages
4. **UC-S3-014:** Generate AI Quiz
   - **Includes:** Specify Topic/Difficulty/Count/Types, Call Gemini 2.5 Pro, Parse JSON Response, Create Quiz Record
5. **UC-S3-015:** Attempt Generated Quiz
   - **Includes:** Display Questions, Record Answers, Calculate Score, Save Attempt
6. **UC-S3-016:** Generate AI Study Plan
   - **Includes:** Specify Duration/Hours/Goal, Call Gemini 2.5 Pro, Parse Weekly Breakdown, Save Plan
7. **UC-S3-017:** Track Study Plan Progress
   - **Includes:** Mark Tasks Complete, Update Progress Percentage
8. **UC-S3-018:** Enhance Notes with AI
   - **Includes:** Select Enhancement Type, Provide Content, Call Gemini, Return Enhanced Version
9. **UC-S3-019:** View AI Conversation History
   - **Includes:** List All Conversations, Show Message Previews
10. **UC-S3-020:** Delete AI Conversation
    - **Includes:** Verify Ownership, Cascade Delete Messages

---

## 2. Domain Model (UML Diagram)

**[DIAGRAM 3: UniShare Domain Model - Sprint 3 - PLACEHOLDER FOR VISUAL DIAGRAM]**

**Description:**
The domain model illustrates all entities introduced in Sprint 3, including **Course**, **ResourceCard**, **Resource**, **Favorite**, and the complete **AI feature set** (AiConversation, AiMessage, AiQuiz, AiQuizQuestion, AiQuizAttempt, AiStudyPlan, AiStudyPlanWeek, AiStudyPlanTask, AiGeneratedNote).

### Core Course Management Entities

**1. Course:**
- id (PK, CUID)
- title (String, required)
- description (String, optional)
- code (String, optional) - e.g., "SCSJ3104"
- color (String, default: "#3B82F6") - Hex color
- semester (String, optional) - e.g., "Fall 2025"
- icon (String, optional) - Emoji icon
- ownerId (FK → User.id, required)
- createdAt, updatedAt

**2. ResourceCard:**
- id (PK, CUID)
- title (String, required)
- description (String, optional)
- order (Int, default: 0)
- type (Enum: CardType) - ASSIGNMENT | TASK | CONTENT | NOTES | CUSTOM
- allowFileUploads (Boolean, default: true)
- courseId (FK → Course.id, CASCADE)
- createdAt, updatedAt

**3. Resource:**
- id (PK, CUID)
- title (String, required)
- description (String, optional)
- fileUrl (String, optional) - UploadThing URL
- fileType (String, optional) - MIME type
- fileSize (Int, optional) - Bytes
- order (Int, default: 0)
- cardId (FK → ResourceCard.id, CASCADE)
- uploadedById (FK → User.id)
- createdAt, updatedAt

**4. Favorite:**
- id (PK, CUID)
- userId (FK → User.id, CASCADE)
- courseId (FK → Course.id, CASCADE)
- createdAt
- Unique: (userId, courseId) - prevent duplicate favorites

### AI Feature Entities

**5. AiConversation:**
- id (PK, CUID)
- title (String, required)
- userId (FK → User.id, CASCADE)
- courseId (FK → Course.id, optional, SET_NULL) - Context course
- tokensUsed (Int, default: 0)
- createdAt, updatedAt

**6. AiMessage:**
- id (PK, CUID)
- content (String, text, required)
- role (Enum: MessageRole) - USER | ASSISTANT | SYSTEM
- conversationId (FK → AiConversation.id, CASCADE)
- tokensUsed (Int, default: 0)
- createdAt

**7. AiQuiz:**
- id (PK, CUID)
- title (String, required)
- topic (String, required)
- difficulty (Enum: QuizDifficulty) - EASY | MEDIUM | HARD
- totalQuestions (Int, required)
- courseId (FK → Course.id, optional, SET_NULL)
- userId (FK → User.id, CASCADE)
- tokensUsed (Int, default: 0)
- createdAt, updatedAt

**8. AiQuizQuestion:**
- id (PK, CUID)
- question (String, text, required)
- type (Enum: QuestionType) - MULTIPLE_CHOICE | TRUE_FALSE | SHORT_ANSWER | ESSAY
- options (Json, optional) - Array of answer options
- correctAnswer (String, text, required)
- explanation (String, text, optional)
- order (Int, required)
- quizId (FK → AiQuiz.id, CASCADE)
- createdAt

**9. AiQuizAttempt:**
- id (PK, CUID)
- quizId (FK → AiQuiz.id, CASCADE)
- userId (FK → User.id, CASCADE)
- answers (Json, required) - User answers object
- score (Float, optional) - Percentage (0-100)
- completedAt (DateTime, optional)
- createdAt, updatedAt

**10. AiStudyPlan:**
- id (PK, CUID)
- title (String, required)
- goal (String, text, optional)
- weekCount (Int, required, min: 1, max: 12)
- hoursPerWeek (Int, required, min: 1, max: 40)
- deadline (DateTime, optional)
- courseId (FK → Course.id, optional, SET_NULL)
- userId (FK → User.id, CASCADE)
- tokensUsed (Int, default: 0)
- createdAt, updatedAt

**11. AiStudyPlanWeek:**
- id (PK, CUID)
- weekNumber (Int, required)
- title (String, required)
- studyPlanId (FK → AiStudyPlan.id, CASCADE)
- createdAt

**12. AiStudyPlanTask:**
- id (PK, CUID)
- title (String, required)
- description (String, text, optional)
- estimatedHours (Int, required)
- completed (Boolean, default: false)
- weekId (FK → AiStudyPlanWeek.id, CASCADE)
- order (Int, required)
- createdAt, updatedAt

**13. AiGeneratedNote:**
- id (PK, CUID)
- originalContent (String, text, optional)
- generatedContent (String, text, required)
- prompt (String, text, required)
- type (Enum: NoteGenerationType) - GENERATE | IMPROVE | SUMMARIZE | EXPAND
- tokensUsed (Int, default: 0)
- userId (FK → User.id, CASCADE)
- createdAt

### Key Relationships

**User ↔ Course:** One-to-Many
- User owns multiple courses
- Each course has one owner
- User deletion does NOT cascade to courses (prevent data loss)

**Course ↔ ResourceCard:** One-to-Many (CASCADE DELETE)
- Course contains 4+ resource cards (4 default + custom)
- Deleting course deletes all cards

**ResourceCard ↔ Resource:** One-to-Many (CASCADE DELETE)
- Card contains multiple resources
- Deleting card deletes all resources

**User ↔ Resource:** One-to-Many
- User uploads multiple resources
- Resource tracks uploader

**User + Course ↔ Favorite:** Many-to-Many (via Favorite)
- User favorites multiple courses
- Course favorited by multiple users
- Unique constraint prevents duplicates

**User ↔ AiConversation:** One-to-Many (CASCADE DELETE)
- User has multiple AI conversations
- Deleting user deletes conversations

**Course ↔ AiConversation:** One-to-Many (SET_NULL)
- Course provides context for conversations
- Deleting course sets courseId to NULL (preserve conversations)

**AiConversation ↔ AiMessage:** One-to-Many (CASCADE DELETE)
- Conversation contains multiple messages
- Deleting conversation deletes messages

**User ↔ AiQuiz:** One-to-Many (CASCADE DELETE)
- User generates multiple quizzes

**Course ↔ AiQuiz:** One-to-Many (SET_NULL)
- Course context for quizzes

**AiQuiz ↔ AiQuizQuestion:** One-to-Many (CASCADE DELETE)
- Quiz contains 5-20 questions

**AiQuiz ↔ AiQuizAttempt:** One-to-Many (CASCADE DELETE)
- Quiz can be attempted multiple times

**User ↔ AiQuizAttempt:** One-to-Many (CASCADE DELETE)
- User attempts multiple quizzes

**User ↔ AiStudyPlan:** One-to-Many (CASCADE DELETE)
- User creates multiple study plans

**Course ↔ AiStudyPlan:** One-to-Many (SET_NULL)
- Study plan linked to course

**AiStudyPlan ↔ AiStudyPlanWeek:** One-to-Many (CASCADE DELETE)
- Plan contains 1-12 weeks

**AiStudyPlanWeek ↔ AiStudyPlanTask:** One-to-Many (CASCADE DELETE)
- Week contains multiple tasks

**User ↔ AiGeneratedNote:** One-to-Many (CASCADE DELETE)
- User generates multiple note enhancements

### Enums

**CardType:**
- ASSIGNMENT - File uploads enabled, for homework/projects
- TASK - No uploads, text-based to-do items
- CONTENT - File uploads enabled, for slides/readings
- NOTES - No uploads, links to collaborative notes
- CUSTOM - User-defined, configurable upload permission

**MessageRole:**
- USER - Student's messages
- ASSISTANT - AI responses
- SYSTEM - System-generated context/instructions

**QuizDifficulty:**
- EASY - Basic comprehension
- MEDIUM - Application/analysis
- HARD - Synthesis/evaluation

**QuestionType:**
- MULTIPLE_CHOICE - 4 options, one correct
- TRUE_FALSE - Boolean answer
- SHORT_ANSWER - Brief text response
- ESSAY - Extended written response

**NoteGenerationType:**
- GENERATE - Create notes from topic
- IMPROVE - Enhance existing notes
- SUMMARIZE - Condense long content
- EXPAND - Add detail to brief notes

---

## 3. Sequence Diagrams

### Sequence 1: Create Course with Default Resource Cards

**[DIAGRAM 4: Create Course Sequence Diagram - PLACEHOLDER FOR VISUAL DIAGRAM]**

**Description:**
This sequence demonstrates the end-to-end course creation process including automatic generation of four default resource cards.

**Participants:**
1. Student (User)
2. Course Creation Form (Next.js Client Component)
3. Form Validation (Zod Schema)
4. tRPC Client (Type-Safe API)
5. tRPC Router (Server-Side Handler)
6. Prisma ORM
7. PostgreSQL Database (NeonDB)

**Flow:**
1. Student → Course Form: Navigate to `/courses/new`
2. Course Form → Student: Display form fields (title, description, code, semester, color picker, icon selector)
3. Student → Course Form: Enter course title "Application Development"
4. Student → Course Form: Enter description "Building web apps with Next.js"
5. Student → Course Form: Enter code "SCSJ3104"
6. Student → Course Form: Select semester "Fall 2025"
7. Student → Course Form: Select color "#3B82F6" (blue)
8. Student → Course Form: Select icon "💻" (computer emoji)
9. Student → Course Form: Click "Create Course" button
10. Course Form → Form Validation: Validate all fields
11. Form Validation → Form Validation: Check title (required, 2-100 chars)
12. Form Validation → Form Validation: Check description (optional, max 500 chars)
13. Form Validation → Form Validation: Check code (optional, max 20 chars)
14. Form Validation → Form Validation: Check color (valid hex code)
15. Form Validation → Course Form: Validation passed
16. Course Form → tRPC Client: Call `api.course.create.mutate({ title, description, code, semester, color, icon })`
17. tRPC Client → tRPC Router: Send mutation request with type-safe payload
18. tRPC Router → tRPC Router: Verify authentication (session exists)
19. tRPC Router → tRPC Router: Check user role (must be APPROVED)
20. tRPC Router → Prisma: Begin transaction
21. Prisma → Database: `BEGIN TRANSACTION`
22. Prisma → Database: `INSERT INTO courses (id, title, description, code, semester, color, icon, ownerId)`
23. Database → Prisma: Course created with id `clx123abc`
24. Prisma → Database: `INSERT INTO resource_cards` (4 records):
    - Card 1: title="Assignments", order=0, type=ASSIGNMENT, allowFileUploads=true
    - Card 2: title="Tasks", order=1, type=TASK, allowFileUploads=false
    - Card 3: title="Content", order=2, type=CONTENT, allowFileUploads=true
    - Card 4: title="Notes", order=3, type=NOTES, allowFileUploads=false
25. Database → Prisma: 4 resource cards created
26. Prisma → Database: `COMMIT TRANSACTION`
27. Database → Prisma: Transaction committed successfully
28. Prisma → tRPC Router: Return course object with nested cards
29. tRPC Router → tRPC Client: Return success response with course data
30. tRPC Client → tRPC Client: Update React Query cache
31. tRPC Client → Course Form: Mutation successful
32. Course Form → Student: Redirect to `/courses/clx123abc`
33. Student: See new course detail page with 4 empty resource cards

**Alternative Flows:**
- **A1: Validation fails**
  - At step 15, if validation fails (e.g., title too short)
  - Show field-specific errors inline
  - Student corrects errors and resubmits
- **A2: User not authenticated**
  - At step 18, if no session exists
  - tRPC returns 401 UNAUTHORIZED
  - Redirect to `/login`
- **A3: User role is PENDING**
  - At step 19, if role check fails
  - tRPC returns 403 FORBIDDEN
  - Show error: "Your account is pending approval"
- **A4: Database transaction fails**
  - At step 26, if commit fails
  - Prisma rolls back transaction
  - Show error: "Failed to create course, please try again"

---

### Sequence 2: AI Chat Conversation with Streaming

**[DIAGRAM 5: AI Chat Sequence Diagram - PLACEHOLDER FOR VISUAL DIAGRAM]**

**Description:**
This sequence illustrates the real-time AI chat workflow using Google Gemini 2.5 Flash with streaming responses via Vercel AI SDK.

**Participants:**
1. Student (User)
2. AI Chat UI (Next.js Client Component)
3. tRPC Client
4. tRPC Router (AI Handler)
5. Vercel AI SDK
6. Google Gemini 2.5 Flash API
7. Prisma ORM
8. PostgreSQL Database

**Flow:**
1. Student → AI Chat UI: Navigate to `/ai/chat`
2. AI Chat UI → tRPC: Call `api.ai.listConversations.useQuery()`
3. tRPC → Database: `SELECT * FROM ai_conversations WHERE userId = {userId}`
4. Database → tRPC: Return conversation list
5. AI Chat UI → Student: Display conversation history sidebar
6. Student → AI Chat UI: Click "New Conversation" button
7. AI Chat UI → AI Chat UI: Open new chat interface
8. Student → AI Chat UI: Optionally select course context from dropdown
9. Student → AI Chat UI: Type message "Explain polymorphism in Java"
10. Student → AI Chat UI: Press Enter to send
11. AI Chat UI → tRPC Client: Call `api.ai.sendMessage.mutate({ message, courseId?, conversationId? })`
12. tRPC Router → Prisma: Check if conversationId exists
13. **If new conversation:**
    - Prisma → Database: `INSERT INTO ai_conversations (title, userId, courseId)`
    - Database → Prisma: Return conversation id
14. **If existing conversation:**
    - Prisma → Database: `SELECT * FROM ai_conversations WHERE id = {conversationId}`
    - Verify ownership (userId matches)
15. Prisma → Database: `INSERT INTO ai_messages (content, role=USER, conversationId)`
16. Database → Prisma: User message saved
17. tRPC Router → Vercel AI SDK: Initialize Gemini 2.5 Flash model
18. Vercel AI SDK → Vercel AI SDK: Configure streaming settings:
    ```typescript
    {
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      maxTokens: 2048
    }
    ```
19. tRPC Router → Vercel AI SDK: Prepare messages array:
    ```typescript
    [
      { role: 'system', content: 'You are a helpful AI tutor' },
      { role: 'user', content: 'Explain polymorphism in Java' }
    ]
    ```
20. Vercel AI SDK → Gemini API: Send POST request to Gemini endpoint
21. Gemini API → Vercel AI SDK: Start Server-Sent Events (SSE) stream
22. Vercel AI SDK → tRPC Router: Stream response chunks
23. tRPC Router → AI Chat UI: Forward stream via SSE
24. AI Chat UI → AI Chat UI: Render tokens word-by-word (typing effect):
    - "Polymorphism"
    - "in Java"
    - "is a"
    - "fundamental"
    - "OOP concept..."
25. AI Chat UI → Student: Display streaming response with typing animation
26. **Stream completes:**
27. Gemini API → Vercel AI SDK: Send `[DONE]` marker
28. Vercel AI SDK → tRPC Router: Stream complete, return full text and token count
29. tRPC Router → Prisma: Save AI response
30. Prisma → Database: `INSERT INTO ai_messages (content, role=ASSISTANT, conversationId, tokensUsed)`
31. Database → Prisma: Message saved
32. Prisma → Database: `UPDATE ai_conversations SET tokensUsed = tokensUsed + {count}`
33. tRPC Router → AI Chat UI: Stream complete
34. AI Chat UI → Student: Show complete message with timestamp
35. Student: Can continue conversation with context preserved

**Token Usage Tracking:**
- Each message tracks `tokensUsed` (prompt + completion tokens)
- Conversation tracks cumulative `tokensUsed` for analytics
- Used for cost monitoring and usage reports

**Alternative Flows:**
- **A1: Stream connection fails**
  - At step 21, if network error or API unavailable
  - Show error: "AI is currently unavailable"
  - Save user message but don't create assistant message
- **A2: Rate limit exceeded**
  - At step 21, if Gemini returns 429
  - Show error: "Too many requests, please wait"
  - Display retry countdown
- **A3: Conversation ownership verification fails**
  - At step 14, if userId doesn't match conversation owner
  - Return 403 FORBIDDEN
  - Show error: "You don't have access to this conversation"

---

### Sequence 3: AI Quiz Generation

**[DIAGRAM 6: AI Quiz Generation Sequence Diagram - PLACEHOLDER FOR VISUAL DIAGRAM]**

**Description:**
This sequence shows how students generate practice quizzes using Google Gemini 2.5 Pro with structured JSON output.

**Participants:**
1. Student (User)
2. Quiz Generation Form
3. tRPC Client
4. tRPC Router (AI Quiz Handler)
5. Google Gemini 2.5 Pro API
6. Prisma ORM
7. PostgreSQL Database

**Flow:**
1. Student → Quiz Form: Navigate to `/ai/quiz/generate`
2. Quiz Form → Student: Display generation form:
   - Topic (text input, required)
   - Course context (dropdown, optional)
   - Difficulty (select: Easy/Medium/Hard)
   - Question count (slider: 5-20)
   - Question types (checkboxes: MC, T/F, Short Answer, Essay)
3. Student → Quiz Form: Enter topic "Object-Oriented Programming"
4. Student → Quiz Form: Select course context "Application Development"
5. Student → Quiz Form: Select difficulty "Medium"
6. Student → Quiz Form: Set question count to 10
7. Student → Quiz Form: Check types: Multiple Choice, True/False
8. Student → Quiz Form: Click "Generate Quiz" button
9. Quiz Form → Quiz Form: Show loading state with progress animation
10. Quiz Form → tRPC Client: Call `api.ai.generateQuiz.mutate({ topic, courseId, difficulty, count, types })`
11. tRPC Client → tRPC Router: Send generation request
12. tRPC Router → tRPC Router: Verify authentication and role
13. tRPC Router → Gemini 2.5 Pro: Build prompt:
    ```
    Generate a {count} question quiz about {topic} at {difficulty} difficulty.
    Question types: {types}

    Return JSON:
    {
      "title": "Quiz title",
      "questions": [
        {
          "question": "Question text",
          "type": "MULTIPLE_CHOICE",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "B",
          "explanation": "Why B is correct"
        }
      ]
    }
    ```
14. Gemini 2.5 Pro → Gemini 2.5 Pro: Generate structured quiz
15. Gemini 2.5 Pro → tRPC Router: Return JSON response + token count
16. tRPC Router → tRPC Router: Parse JSON response
17. tRPC Router → tRPC Router: Validate quiz structure (all questions valid)
18. tRPC Router → Prisma: Begin transaction
19. Prisma → Database: `INSERT INTO ai_quizzes (title, topic, difficulty, totalQuestions, courseId, userId, tokensUsed)`
20. Database → Prisma: Quiz created with id
21. Prisma → Database: `INSERT INTO ai_quiz_questions` (10 records, one per question)
22. Database → Prisma: All questions created
23. Prisma → Database: `COMMIT TRANSACTION`
24. tRPC Router → tRPC Client: Return quiz object with questions
25. tRPC Client → Quiz Form: Generation successful
26. Quiz Form → Student: Redirect to `/ai/quiz/{quizId}`
27. Student: See generated quiz with all questions
28. Student: Can attempt quiz or save for later

**Gemini 2.5 Pro Configuration:**
```typescript
{
  model: 'gemini-2.5-pro',
  temperature: 0.3,  // Lower for more consistent structured output
  maxTokens: 4096,
  responseFormat: 'json'
}
```

**Question Types Generated:**
- **Multiple Choice:** 4 options, one correct, explanation provided
- **True/False:** Boolean answer, explanation provided
- **Short Answer:** Expected answer provided, grading requires manual review
- **Essay:** Rubric or key points provided for evaluation

**Alternative Flows:**
- **A1: JSON parsing fails**
  - At step 16, if Gemini returns invalid JSON
  - Retry with modified prompt (up to 3 attempts)
  - If all attempts fail, show error: "Quiz generation failed"
- **A2: Validation fails**
  - At step 17, if questions don't match expected types
  - Log error and retry generation
  - If retry fails, show error with details
- **A3: Rate limit or quota exceeded**
  - At step 15, if Gemini returns quota error
  - Show error: "Daily AI quota exceeded, try again tomorrow"
  - Log usage for admin review

---

### Sequence 4: AI Study Plan Generation

**[DIAGRAM 7: AI Study Plan Generation Sequence Diagram - PLACEHOLDER FOR VISUAL DIAGRAM]**

**Description:**
This sequence illustrates personalized study plan creation using Gemini 2.5 Pro with weekly task breakdowns.

**Participants:**
1. Student (User)
2. Study Plan Form
3. tRPC Client
4. tRPC Router (AI Study Plan Handler)
5. Google Gemini 2.5 Pro API
6. Prisma ORM
7. PostgreSQL Database

**Flow:**
1. Student → Study Plan Form: Navigate to `/ai/study-plan/generate`
2. Study Plan Form → Student: Display form:
   - Title (text, required)
   - Goal (textarea, optional)
   - Course context (dropdown, optional)
   - Duration (slider: 1-12 weeks)
   - Hours per week (slider: 1-40 hours)
   - Deadline (date picker, optional)
3. Student → Study Plan Form: Enter title "OOP Mastery Plan"
4. Student → Study Plan Form: Enter goal "Master OOP concepts for final exam"
5. Student → Study Plan Form: Select course "Application Development"
6. Student → Study Plan Form: Set duration to 4 weeks
7. Student → Study Plan Form: Set hours per week to 10
8. Student → Study Plan Form: Set deadline "2026-02-15"
9. Student → Study Plan Form: Click "Generate Plan" button
10. Study Plan Form → tRPC Client: Call `api.ai.generateStudyPlan.mutate({ title, goal, courseId, weekCount, hoursPerWeek, deadline })`
11. tRPC Router → tRPC Router: Fetch course content if courseId provided
12. tRPC Router → Database: `SELECT title, description FROM courses WHERE id = {courseId}`
13. Database → tRPC Router: Return course context
14. tRPC Router → Gemini 2.5 Pro: Build prompt with course context:
    ```
    Create a {weekCount} week study plan for: {goal}
    Course: {courseTitle} - {courseDescription}
    Available time: {hoursPerWeek} hours/week
    Deadline: {deadline}

    Return JSON:
    {
      "weeks": [
        {
          "weekNumber": 1,
          "title": "Week title",
          "tasks": [
            {
              "title": "Task title",
              "description": "Task details",
              "estimatedHours": 3
            }
          ]
        }
      ]
    }
    ```
15. Gemini 2.5 Pro → Gemini 2.5 Pro: Generate weekly breakdown
16. Gemini 2.5 Pro → tRPC Router: Return JSON with weeks and tasks
17. tRPC Router → tRPC Router: Parse and validate JSON structure
18. tRPC Router → Prisma: Begin transaction
19. Prisma → Database: `INSERT INTO ai_study_plans (title, goal, weekCount, hoursPerWeek, deadline, courseId, userId, tokensUsed)`
20. Database → Prisma: Study plan created
21. Prisma → Database: `INSERT INTO ai_study_plan_weeks` (4 records, one per week)
22. Database → Prisma: Weeks created
23. Prisma → Database: `INSERT INTO ai_study_plan_tasks` (multiple tasks per week)
24. Database → Prisma: Tasks created
25. Prisma → Database: `COMMIT TRANSACTION`
26. tRPC Router → tRPC Client: Return study plan with nested weeks and tasks
27. Study Plan Form → Student: Redirect to `/ai/study-plan/{planId}`
28. Student: See study plan with weekly breakdown:
    - **Week 1:** Introduction to OOP (3 tasks, 10 hours total)
    - **Week 2:** Classes and Objects (4 tasks, 10 hours total)
    - **Week 3:** Inheritance and Polymorphism (4 tasks, 10 hours total)
    - **Week 4:** Advanced Concepts & Review (3 tasks, 10 hours total)
29. Student: Can mark tasks as complete to track progress

**Study Plan Structure:**
- Each week has multiple tasks
- Tasks have estimated hours (total per week matches hoursPerWeek)
- Tasks include specific learning objectives and resources
- Progress tracked via completed checkboxes

**Alternative Flows:**
- **A1: Invalid time allocation**
  - If total task hours don't match hoursPerWeek
  - Adjust task estimates proportionally
- **A2: No course context**
  - If courseId is null
  - Generate plan based only on goal description
  - Still create detailed weekly tasks

---

## 4. Use Case Scenarios

### Use Case 1: Create Course with Default Resources

**ID:** UC-S3-001
**Actors:** Student (APPROVED role)
**Description:** Student creates a new course which automatically generates four default resource cards for organization.

**Preconditions:**
- Student is authenticated with APPROVED role
- Student has navigated to course creation page

**Flow of Events:**
1. Student navigates to `/courses/new`
2. System displays course creation form
3. Student enters course title "Application Development"
4. Student enters description "Learning web development with Next.js 15"
5. Student enters course code "SCSJ3104"
6. Student selects semester "Fall 2025" from dropdown
7. Student clicks color picker and selects "#3B82F6" (blue)
8. Student clicks icon selector and chooses "💻" emoji
9. Student clicks "Create Course" button
10. System validates all inputs using Zod schema
11. System checks title length (2-100 characters) ✓
12. System validates color is valid hex code ✓
13. System validates optional fields (description, code, semester) ✓
14. System sends tRPC mutation to server
15. Server verifies user is authenticated (checks JWT session)
16. Server verifies user role is APPROVED
17. Server begins database transaction
18. Server creates Course record:
    - Generates CUID for course id
    - Sets ownerId to current user's id
    - Stores title, description, code, semester, color, icon
    - Sets createdAt and updatedAt timestamps
19. Database returns course with id `clx123abc`
20. Server creates 4 default ResourceCards:
    - **Card 1 - Assignments:**
      - title: "Assignments"
      - order: 0
      - type: ASSIGNMENT
      - allowFileUploads: true
      - courseId: `clx123abc`
    - **Card 2 - Tasks:**
      - title: "Tasks"
      - order: 1
      - type: TASK
      - allowFileUploads: false
      - courseId: `clx123abc`
    - **Card 3 - Content:**
      - title: "Content"
      - order: 2
      - type: CONTENT
      - allowFileUploads: true
      - courseId: `clx123abc`
    - **Card 4 - Notes:**
      - title: "Notes"
      - order: 3
      - type: NOTES
      - allowFileUploads: false
      - courseId: `clx123abc`
21. Database creates all 4 resource cards
22. Server commits transaction
23. Server returns course object with nested resource cards to client
24. tRPC client updates React Query cache
25. Frontend redirects student to `/courses/clx123abc`
26. Student sees course detail page:
    - Course header with title, color, icon
    - 4 empty resource cards in grid layout
    - Each card shows title and "No resources yet" message
    - "Add Resource" button on cards with allowFileUploads=true

**Postconditions:**
- Course record created in database
- 4 default resource cards created
- Student redirected to course detail page
- Course appears in student's course list

**Alternative Flows:**
- **A1: Title too short**
  - At step 11, if title < 2 characters
  - Show error: "Title must be at least 2 characters"
  - Student corrects title and resubmits
- **A2: Invalid hex color**
  - At step 12, if color format invalid
  - Show error: "Invalid color format"
  - Default to "#3B82F6" and continue
- **A3: User not approved**
  - At step 16, if user role is PENDING
  - Return 403 FORBIDDEN error
  - Show error: "Your account is pending approval"
  - Redirect to `/waiting-approval`
- **A4: Database transaction fails**
  - At step 22, if commit fails (network error, constraint violation)
  - Roll back all changes
  - Show error: "Failed to create course, please try again"
  - Log error for debugging

**Priority:** Critical

---

### Use Case 2: Chat with AI Assistant

**ID:** UC-S3-012
**Actors:** Student (APPROVED role), Google Gemini 2.5 Flash
**Description:** Student interacts with AI assistant for learning help with streaming responses and conversation context.

**Preconditions:**
- Student is authenticated with APPROVED role
- Google Gemini API is accessible
- Vercel AI SDK is configured

**Flow of Events:**
1. Student navigates to `/ai/chat`
2. System displays AI chat interface:
   - Sidebar with conversation history
   - "New Conversation" button
   - Optional course context selector
   - Message input textarea
   - Send button
3. Student clicks "New Conversation"
4. System displays empty chat window with welcome message
5. Student optionally selects course "Application Development" from dropdown
6. Student types message in textarea: "Explain the difference between let and const in JavaScript"
7. Student presses Enter or clicks Send button
8. System validates message (not empty, max 5000 characters)
9. System shows message in chat with user avatar and timestamp
10. System shows typing indicator with animated dots
11. System calls tRPC mutation: `api.ai.sendMessage.mutate({ message, courseId })`
12. Server verifies authentication and role
13. Server creates new AiConversation record:
    - title: Auto-generated from first message (e.g., "JavaScript Variables")
    - userId: Current user's id
    - courseId: Selected course id (optional)
    - tokensUsed: 0 (initial)
14. Server creates user AiMessage record:
    - content: Student's message
    - role: USER
    - conversationId: Newly created conversation id
15. Server prepares context for Gemini:
    - System message: "You are a helpful AI tutor for university students"
    - If courseId provided: Fetch course title and description for context
    - User message: Student's question
16. Server initializes Vercel AI SDK with Gemini 2.5 Flash:
    ```typescript
    const model = google('gemini-2.5-flash', {
      temperature: 0.7,
      maxOutputTokens: 2048
    });
    ```
17. Server calls `streamText()` from AI SDK:
    ```typescript
    const { textStream, usage } = await streamText({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    });
    ```
18. Gemini API begins streaming response via Server-Sent Events (SSE)
19. Server forwards stream to client via tRPC subscription
20. Client receives stream chunks word-by-word:
    - Chunk 1: "In"
    - Chunk 2: "JavaScript,"
    - Chunk 3: "both"
    - Chunk 4: "`let`"
    - Chunk 5: "and"
    - Chunk 6: "`const`"
    - ...continues...
21. Client renders tokens in real-time with typing effect
22. Student sees AI response appearing character by character
23. Stream continues until complete response delivered
24. Gemini sends `[DONE]` marker indicating stream end
25. Server receives full response text and token usage:
    - Prompt tokens: 45
    - Completion tokens: 312
    - Total tokens: 357
26. Server creates assistant AiMessage record:
    - content: Full AI response text
    - role: ASSISTANT
    - conversationId: Same conversation id
    - tokensUsed: 357
27. Server updates AiConversation tokensUsed:
    ```sql
    UPDATE ai_conversations
    SET tokensUsed = tokensUsed + 357
    WHERE id = {conversationId}
    ```
28. Client displays complete message with checkmark icon
29. System re-enables message input
30. Student can continue conversation with context preserved

**Postconditions:**
- New conversation created in database
- User and assistant messages saved
- Token usage tracked for analytics
- Conversation appears in sidebar history
- Student can send follow-up messages with full context

**Alternative Flows:**
- **A1: Empty message**
  - At step 8, if message is empty or only whitespace
  - Show inline error: "Message cannot be empty"
  - Input remains focused, student can type
- **A2: Message too long**
  - At step 8, if message > 5000 characters
  - Show error: "Message must be under 5000 characters"
  - Display character count
- **A3: Streaming connection fails**
  - At step 19, if network error or API timeout
  - Show error toast: "AI is currently unavailable"
  - Save user message to database
  - Student can retry by sending same message again
- **A4: Gemini rate limit exceeded**
  - At step 18, if Gemini returns 429 TOO_MANY_REQUESTS
  - Show error: "Too many requests. Please wait 60 seconds."
  - Display countdown timer
  - Auto-retry after countdown
- **A5: Invalid API response**
  - At step 24, if stream contains malformed data
  - Terminate stream gracefully
  - Show error: "AI response failed, please try again"
  - Log error with conversation id for debugging

**Priority:** High

---

### Use Case 3: Generate AI Quiz

**ID:** UC-S3-014
**Actors:** Student (APPROVED role), Google Gemini 2.5 Pro
**Description:** Student generates practice quiz using AI with customizable difficulty, question types, and question count.

**Preconditions:**
- Student is authenticated with APPROVED role
- Google Gemini 2.5 Pro API is accessible
- Student has navigated to quiz generation page

**Flow of Events:**
1. Student navigates to `/ai/quiz/generate`
2. System displays quiz generation form:
   - Topic (text input, required, placeholder: "e.g., Object-Oriented Programming")
   - Course context (dropdown, optional, shows student's courses)
   - Difficulty (radio buttons: Easy, Medium, Hard)
   - Question count (slider: 5-20, default: 10)
   - Question types (checkboxes: Multiple Choice, True/False, Short Answer, Essay)
   - Generate button
3. Student enters topic "Polymorphism in Java"
4. Student selects course "Application Development" for context
5. Student selects difficulty "Medium"
6. Student sets question count to 10 using slider
7. Student checks question types: "Multiple Choice" and "True/False"
8. Student clicks "Generate Quiz" button
9. System validates form:
   - Topic not empty ✓
   - At least one question type selected ✓
   - Question count between 5-20 ✓
10. System shows loading overlay with animated spinner:
    - "Generating your quiz..."
    - "This may take 10-30 seconds"
11. System disables form to prevent duplicate submissions
12. System calls tRPC mutation: `api.ai.generateQuiz.mutate({ topic, courseId, difficulty, questionCount, questionTypes })`
13. Server verifies authentication and role
14. Server fetches course context if courseId provided:
    ```sql
    SELECT title, description FROM courses WHERE id = {courseId}
    ```
15. Server prepares detailed prompt for Gemini 2.5 Pro:
    ```
    You are an expert quiz generator for university students.

    Generate a quiz with the following specifications:
    - Topic: Polymorphism in Java
    - Course Context: Application Development - Building web apps...
    - Difficulty: Medium
    - Number of questions: 10
    - Question types: Multiple Choice (4 options), True/False

    For each question, provide:
    1. Clear question text
    2. Question type
    3. All options (for MC)
    4. Correct answer
    5. Brief explanation

    Return ONLY valid JSON in this format:
    {
      "title": "Quiz title",
      "questions": [
        {
          "question": "What is polymorphism?",
          "type": "MULTIPLE_CHOICE",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "B",
          "explanation": "Why B is correct..."
        }
      ]
    }
    ```
16. Server calls Gemini 2.5 Pro with structured output:
    ```typescript
    const { text, usage } = await generateText({
      model: google('gemini-2.5-pro'),
      prompt: quizPrompt,
      temperature: 0.3,  // Lower for consistent structure
      maxTokens: 4096
    });
    ```
17. Gemini 2.5 Pro processes request (10-30 seconds)
18. Gemini returns JSON response:
    ```json
    {
      "title": "Polymorphism in Java - Medium Quiz",
      "questions": [
        {
          "question": "Which of the following best describes polymorphism in Java?",
          "type": "MULTIPLE_CHOICE",
          "options": [
            "A. The ability to create multiple classes",
            "B. The ability of an object to take many forms",
            "C. The process of hiding implementation details",
            "D. The creation of subclasses"
          ],
          "correctAnswer": "B",
          "explanation": "Polymorphism means 'many forms' and allows objects to be treated as instances of their parent class."
        },
        // ... 9 more questions
      ]
    }
    ```
19. Server parses JSON response using `JSON.parse()`
20. Server validates quiz structure:
    - Check questions array exists and has 10 items ✓
    - Check each question has required fields ✓
    - Validate question types match requested types ✓
    - Ensure correctAnswer is in options for MC questions ✓
21. **If validation fails:**
    - Log error with full response
    - Retry generation once with refined prompt
    - If retry fails, return error to client
22. **If validation passes:**
23. Server begins database transaction
24. Server creates AiQuiz record:
    ```sql
    INSERT INTO ai_quizzes (
      title, topic, difficulty, totalQuestions, courseId, userId, tokensUsed
    ) VALUES (
      'Polymorphism in Java - Medium Quiz',
      'Polymorphism in Java',
      'MEDIUM',
      10,
      {courseId},
      {userId},
      {usage.totalTokens}
    )
    ```
25. Database returns quiz id `clx456def`
26. Server creates 10 AiQuizQuestion records:
    ```sql
    INSERT INTO ai_quiz_questions (
      question, type, options, correctAnswer, explanation, order, quizId
    ) VALUES ...
    ```
27. Database creates all 10 questions
28. Server commits transaction
29. Server returns quiz object to client:
    ```typescript
    {
      id: 'clx456def',
      title: 'Polymorphism in Java - Medium Quiz',
      topic: 'Polymorphism in Java',
      difficulty: 'MEDIUM',
      totalQuestions: 10,
      questions: [...],
      tokensUsed: 1847,
      createdAt: '2026-01-15T10:30:00Z'
    }
    ```
30. Client receives successful response
31. System hides loading overlay
32. System redirects to `/ai/quiz/clx456def`
33. Student sees generated quiz page:
    - Quiz title and metadata
    - "Start Quiz" button
    - Option to view questions without attempting
34. Student can:
    - Attempt quiz now
    - Save for later
    - Share with classmates (Sprint 4 feature)

**Postconditions:**
- Quiz record created with 10 questions
- Token usage tracked (typically 1500-2500 tokens)
- Quiz appears in student's AI quiz history
- Student can attempt quiz multiple times

**Alternative Flows:**
- **A1: No question types selected**
  - At step 9, validation fails
  - Show error: "Please select at least one question type"
  - Form remains enabled
- **A2: Topic too vague**
  - At step 17, Gemini returns generic questions
  - Server detects low quality (simple validation)
  - Suggest student provide more specific topic
- **A3: JSON parsing fails**
  - At step 19, if Gemini returns invalid JSON
  - Log error: "Invalid JSON from Gemini"
  - Retry with modified prompt: "Return ONLY valid JSON, no markdown"
  - If retry fails, show error: "Quiz generation failed, please try again"
- **A4: Rate limit exceeded**
  - At step 17, if Gemini returns 429 error
  - Show error: "Daily AI quota exceeded. Try again tomorrow."
  - Log usage for admin review
- **A5: Question validation fails**
  - At step 20, if questions don't match criteria
  - Example: MC question has 3 options instead of 4
  - Retry generation with stricter prompt
  - If retry fails, return error with details

**Priority:** High

---

## 5. Data Description

### Course Management Workflow

The course management system empowers students to create and organize their academic courses from scratch. Students begin with an empty course list and build their structure by creating courses for each class they're taking. Each course creation triggers automatic generation of four predefined resource cards (Assignments, Tasks, Content, Notes) that serve as organizational containers. Students can customize courses with titles, descriptions, course codes, semester information, color coding for visual organization, and emoji icons for quick recognition.

The resource card system provides a structured approach to organizing course materials. The Assignments card enables file uploads for homework and projects, the Tasks card supports text-based to-do lists without file uploads, the Content card allows uploading slides, readings, and supplementary materials, and the Notes card links to the collaborative note system (Sprint 4). Students can create additional custom resource cards with configurable file upload permissions to suit their specific organizational needs.

File uploads leverage UploadThing with a maximum file size of 16MB per file, supporting images (JPG, PNG, GIF, WEBP), PDFs, Word documents (DOC, DOCX), and PowerPoint presentations (PPT, PPTX). Each uploaded resource tracks the uploader (User), file metadata (type, size), and maintains proper order within its parent card. The system implements cascade delete rules ensuring that deleting a course removes all associated resource cards and resources, preventing orphaned data.

The favorites system allows students to mark courses for calendar integration. Favorited courses appear in dropdown filters when creating timetable events (Sprint 5), enabling students to schedule only relevant classes. The favorite relationship uses a unique constraint on (userId, courseId) to prevent duplicate favorites and implements cascade delete on both foreign keys.

### AI Learning Assistant Workflow

The AI learning assistant provides personalized educational support through four primary features: conversational chat, quiz generation, study plan creation, and note enhancement. All AI features use Google Gemini models (2.5 Flash for chat, 2.5 Pro for content generation) accessed via the Vercel AI SDK.

**Conversational Chat:**
Students initiate conversations with optional course context, which loads course title and description to provide relevant responses. The system uses Gemini 2.5 Flash for fast, cost-effective responses with streaming enabled via Server-Sent Events (SSE). Messages stream word-by-word to the client, creating a natural typing effect. Each message tracks token usage (prompt tokens + completion tokens), and conversations maintain cumulative token counts for analytics. Conversations preserve full message history, allowing students to ask follow-up questions with context.

The streaming implementation uses the Vercel AI SDK's `streamText()` function with Gemini 2.5 Flash configured at temperature 0.7 for balanced creativity and accuracy. The server forwards stream chunks to the client via tRPC subscriptions, and the React component renders tokens in real-time using state updates. When the stream completes, the full response and token count are saved to the database.

**Quiz Generation:**
Students specify topic, difficulty (Easy/Medium/Hard), question count (5-20), and question types (Multiple Choice, True/False, Short Answer, Essay). The system builds a detailed prompt for Gemini 2.5 Pro requesting structured JSON output. Gemini 2.5 Pro is used instead of Flash for quiz generation because it produces higher quality, more accurate questions with better explanations. The temperature is set to 0.3 (lower than chat) to ensure consistent formatting and reduce hallucinations.

The server validates the JSON response structure, checking that the questions array has the requested number of items, each question has all required fields (question, type, options, correctAnswer, explanation), question types match requested types, and correctAnswer is valid (exists in options for MC). If validation fails, the system retries once with a refined prompt emphasizing strict JSON formatting. Validated quizzes are saved with cascade relationships: AiQuiz → AiQuizQuestion.

**Study Plan Generation:**
Students provide a title, optional goal, duration (1-12 weeks), hours per week (1-40), optional deadline, and optional course context. The system fetches course details if courseId is provided and builds a prompt requesting a weekly breakdown with specific tasks. Gemini 2.5 Pro generates structured JSON with weeks and tasks, where each week contains 3-5 tasks and total task hours match the specified hoursPerWeek.

The server parses the JSON and creates a nested structure: AiStudyPlan → AiStudyPlanWeek (1-12 weeks) → AiStudyPlanTask (multiple per week). Students can mark individual tasks as complete, and the system calculates progress percentage based on completed tasks. Study plans are linked to courses via optional courseId (SET_NULL on course delete to preserve plans).

**Note Enhancement:**
Students select an enhancement type (GENERATE, IMPROVE, SUMMARIZE, EXPAND) and provide content. GENERATE creates notes from a topic with no original content, IMPROVE enhances existing notes with better structure and clarity, SUMMARIZE condenses long content into key points, and EXPAND adds detail and examples to brief notes. The system calls Gemini 2.5 Pro with type-specific prompts and saves both original and generated content along with token usage. Students can accept the AI-generated version or modify it before saving to their note system.

### Token Usage and Cost Tracking

Every AI operation tracks token usage at multiple levels. Individual messages store tokensUsed (prompt + completion), conversations accumulate tokensUsed across all messages, quizzes store generation token cost, study plans track generation cost, and note enhancements record individual costs. This enables usage analytics (cost reports per user, quota enforcement, identifying high-usage features) and optimization (detecting inefficient prompts, adjusting temperature/maxTokens settings).

Gemini pricing (as of January 2026): Gemini 2.5 Flash is $0.075 per 1M input tokens, $0.30 per 1M output tokens; Gemini 2.5 Pro is $1.25 per 1M input tokens, $5.00 per 1M output tokens. The free tier allows 1,500 requests per day, 1M tokens per minute. The system logs all token usage and monitors against rate limits.

---

## 6. Data Dictionary

### Entity: Course

**Description:** Represents a student-created course for organizing academic materials. Each course is private by default and owned by one student.

| Attribute | Datatype | Description | Constraints | Sprint 3 Usage |
|-----------|----------|-------------|-------------|----------------|
| id | String (CUID) | Unique identifier | Primary Key | Auto-generated on creation |
| title | String | Course name | Required, Min: 2, Max: 100 | Student provides during creation |
| description | String? | Course details | Optional, Max: 500 chars | Optional field in form |
| code | String? | Course code | Optional, Max: 20 chars | E.g., "SCSJ3104" |
| color | String | Hex color code | Default: "#3B82F6", Pattern: /^#[0-9A-F]{6}$/i | Color picker selection |
| semester | String? | Term information | Optional, Max: 50 chars | E.g., "Fall 2025" |
| icon | String? | Emoji icon | Optional, Max: 10 chars | Single emoji character |
| ownerId | String | Course owner | Foreign Key → User.id, Required | Current authenticated user |
| createdAt | DateTime | Creation timestamp | Auto-generated | Set automatically |
| updatedAt | DateTime | Last update | Auto-updated | Updated on edits |

**Relationships:**
- **Belongs To:** User (N:1) via ownerId
- **Has Many:** ResourceCard (1:N, CASCADE DELETE)
- **Has Many:** Favorite (1:N, CASCADE DELETE)
- **Has Many:** AiConversation (1:N, SET_NULL) - optional context
- **Has Many:** AiQuiz (1:N, SET_NULL) - optional context
- **Has Many:** AiStudyPlan (1:N, SET_NULL) - optional context

**Indexes:**
- Primary: id
- Foreign: ownerId
- Index: (ownerId, createdAt) for efficient course list queries

---

### Entity: ResourceCard

**Description:** Organizational containers within courses for grouping related resources (Assignments, Tasks, etc.).

| Attribute | Datatype | Description | Constraints | Sprint 3 Usage |
|-----------|----------|-------------|-------------|----------------|
| id | String (CUID) | Unique identifier | Primary Key | Auto-generated |
| title | String | Card name | Required, Min: 1, Max: 100 | "Assignments", "Tasks", etc. |
| description | String? | Card purpose | Optional, Max: 300 chars | Optional description |
| order | Int | Display order | Default: 0, Min: 0 | 0-3 for default cards |
| type | Enum (CardType) | Card category | ASSIGNMENT\|TASK\|CONTENT\|NOTES\|CUSTOM | Determines behavior |
| allowFileUploads | Boolean | Upload permission | Default: true | true for ASSIGNMENT/CONTENT, false for TASK/NOTES |
| courseId | String | Parent course | Foreign Key → Course.id, CASCADE DELETE | Links to owning course |
| createdAt | DateTime | Creation timestamp | Auto-generated | Set automatically |
| updatedAt | DateTime | Last update | Auto-updated | Updated on edits |

**Default Cards Created Automatically:**
1. Assignments (order: 0, type: ASSIGNMENT, allowFileUploads: true)
2. Tasks (order: 1, type: TASK, allowFileUploads: false)
3. Content (order: 2, type: CONTENT, allowFileUploads: true)
4. Notes (order: 3, type: NOTES, allowFileUploads: false)

**Relationships:**
- **Belongs To:** Course (N:1, CASCADE DELETE)
- **Has Many:** Resource (1:N, CASCADE DELETE)

**Cascade Rules:**
- Deleting course → deletes all cards
- Deleting card → deletes all resources in card

---

### Entity: Resource

**Description:** Individual files or items within resource cards (uploaded materials, links, etc.).

| Attribute | Datatype | Description | Constraints | Sprint 3 Usage |
|-----------|----------|-------------|-------------|----------------|
| id | String (CUID) | Unique identifier | Primary Key | Auto-generated |
| title | String | Resource name | Required, Min: 1, Max: 200 | File name or custom title |
| description | String? | Resource details | Optional, Max: 1000 chars | Optional description |
| fileUrl | String? | UploadThing URL | Optional, Valid URL | Uploaded file location |
| fileType | String? | MIME type | Optional | E.g., "application/pdf" |
| fileSize | Int? | File size in bytes | Optional, Max: 16MB (16777216 bytes) | Tracked for storage limits |
| order | Int | Order within card | Default: 0, Min: 0 | Display order |
| cardId | String | Parent card | Foreign Key → ResourceCard.id, CASCADE DELETE | Links to containing card |
| uploadedById | String | Uploader | Foreign Key → User.id | Tracks who uploaded |
| createdAt | DateTime | Upload timestamp | Auto-generated | Set automatically |
| updatedAt | DateTime | Last update | Auto-updated | Updated on edits |

**File Upload Constraints:**
- Max file size: 16MB (16,777,216 bytes)
- Allowed types: Images (JPG, PNG, GIF, WEBP), PDF, Word (DOC, DOCX), PowerPoint (PPT, PPTX)
- Uploaded to UploadThing S3 CDN

**Relationships:**
- **Belongs To:** ResourceCard (N:1, CASCADE DELETE)
- **Belongs To:** User (N:1) via uploadedById

---

### Entity: Favorite

**Description:** Links users to courses they've favorited for calendar integration and quick access.

| Attribute | Datatype | Description | Constraints | Sprint 3 Usage |
|-----------|----------|-------------|-------------|----------------|
| id | String (CUID) | Unique identifier | Primary Key | Auto-generated |
| userId | String | User who favorited | Foreign Key → User.id, CASCADE DELETE | Current user |
| courseId | String | Favorited course | Foreign Key → Course.id, CASCADE DELETE | Selected course |
| createdAt | DateTime | Favorite timestamp | Auto-generated | When favorited |

**Unique Constraint:**
- (userId, courseId) - prevents duplicate favorites

**Relationships:**
- **Belongs To:** User (N:1, CASCADE DELETE)
- **Belongs To:** Course (N:1, CASCADE DELETE)

**Usage:**
- Used in calendar dropdown to filter courses (Sprint 5)
- Students can favorite both owned and shared courses

---

### Entity: AiConversation

**Description:** Stores AI chat conversations with optional course context.

| Attribute | Datatype | Description | Constraints | Sprint 3 Usage |
|-----------|----------|-------------|-------------|----------------|
| id | String (CUID) | Unique identifier | Primary Key | Auto-generated |
| title | String | Conversation title | Required, Max: 200 chars | Auto-generated from first message |
| userId | String | Conversation owner | Foreign Key → User.id, CASCADE DELETE | Current user |
| courseId | String? | Optional course context | Foreign Key → Course.id, SET_NULL | Selected course for context |
| tokensUsed | Int | Cumulative tokens | Default: 0, Min: 0 | Sum of all message tokens |
| createdAt | DateTime | Start timestamp | Auto-generated | First message time |
| updatedAt | DateTime | Last message time | Auto-updated | Updated on new messages |

**Relationships:**
- **Belongs To:** User (N:1, CASCADE DELETE)
- **Belongs To:** Course (N:1, SET_NULL) - optional context
- **Has Many:** AiMessage (1:N, CASCADE DELETE)

**Token Tracking:**
- Cumulative sum of all message tokensUsed
- Used for usage analytics and cost tracking

---

### Entity: AiMessage

**Description:** Individual messages within AI conversations (user and assistant messages).

| Attribute | Datatype | Description | Constraints | Sprint 3 Usage |
|-----------|----------|-------------|-------------|----------------|
| id | String (CUID) | Unique identifier | Primary Key | Auto-generated |
| content | String (text) | Message text | Required, Max: 10000 chars | User question or AI answer |
| role | Enum (MessageRole) | Message source | USER\|ASSISTANT\|SYSTEM | Identifies sender |
| conversationId | String | Parent conversation | Foreign Key → AiConversation.id, CASCADE DELETE | Links to conversation |
| tokensUsed | Int | Token count | Default: 0, Min: 0 | Prompt + completion tokens |
| createdAt | DateTime | Message timestamp | Auto-generated | When message sent |

**Relationships:**
- **Belongs To:** AiConversation (N:1, CASCADE DELETE)

**Streaming Implementation:**
- Messages created after stream completes
- Full content and token count saved together

---

### Entity: AiQuiz

**Description:** AI-generated practice quizzes with configurable settings.

| Attribute | Datatype | Description | Constraints | Sprint 3 Usage |
|-----------|----------|-------------|-------------|----------------|
| id | String (CUID) | Unique identifier | Primary Key | Auto-generated |
| title | String | Quiz title | Required, Max: 200 chars | AI-generated or custom |
| topic | String | Quiz subject | Required, Max: 200 chars | Student-provided |
| difficulty | Enum (QuizDifficulty) | Difficulty level | EASY\|MEDIUM\|HARD | Student-selected |
| totalQuestions | Int | Question count | Required, Min: 5, Max: 20 | Student-selected |
| courseId | String? | Optional course context | Foreign Key → Course.id, SET_NULL | Selected course |
| userId | String | Quiz creator | Foreign Key → User.id, CASCADE DELETE | Current user |
| tokensUsed | Int | Generation cost | Default: 0, Min: 0 | Gemini 2.5 Pro tokens |
| createdAt | DateTime | Generation timestamp | Auto-generated | When quiz created |
| updatedAt | DateTime | Last update | Auto-updated | Updated on edits |

**Relationships:**
- **Belongs To:** User (N:1, CASCADE DELETE)
- **Belongs To:** Course (N:1, SET_NULL)
- **Has Many:** AiQuizQuestion (1:N, CASCADE DELETE)
- **Has Many:** AiQuizAttempt (1:N, CASCADE DELETE)

**Generation Settings:**
- Uses Gemini 2.5 Pro (higher quality than Flash)
- Temperature: 0.3 (consistent output)
- Typical token usage: 1500-2500 tokens per quiz

---

### Entity: AiQuizQuestion

**Description:** Individual questions within AI-generated quizzes.

| Attribute | Datatype | Description | Constraints | Sprint 3 Usage |
|-----------|----------|-------------|-------------|----------------|
| id | String (CUID) | Unique identifier | Primary Key | Auto-generated |
| question | String (text) | Question text | Required, Max: 1000 chars | AI-generated |
| type | Enum (QuestionType) | Question format | MULTIPLE_CHOICE\|TRUE_FALSE\|SHORT_ANSWER\|ESSAY | AI-selected based on request |
| options | Json? | Answer choices | Optional, Required for MC/TF | Array of strings for MC, ["True", "False"] for TF |
| correctAnswer | String (text) | Correct response | Required, Max: 1000 chars | AI-provided |
| explanation | String (text)? | Answer explanation | Optional, Max: 1000 chars | AI-generated reasoning |
| order | Int | Question order | Required, Min: 0 | 0-19 for 20-question quiz |
| quizId | String | Parent quiz | Foreign Key → AiQuiz.id, CASCADE DELETE | Links to quiz |
| createdAt | DateTime | Creation timestamp | Auto-generated | Same as quiz creation |

**Relationships:**
- **Belongs To:** AiQuiz (N:1, CASCADE DELETE)

**Question Type Details:**
- **MULTIPLE_CHOICE:** options array has 4 items, correctAnswer is one of the options
- **TRUE_FALSE:** options array is ["True", "False"], correctAnswer is "True" or "False"
- **SHORT_ANSWER:** options is null, correctAnswer is expected response
- **ESSAY:** options is null, correctAnswer contains rubric or key points

---

### Entity: AiQuizAttempt

**Description:** Records of students attempting AI-generated quizzes with answers and scores.

| Attribute | Datatype | Description | Constraints | Sprint 3 Usage |
|-----------|----------|-------------|-------------|----------------|
| id | String (CUID) | Unique identifier | Primary Key | Auto-generated |
| quizId | String | Quiz being attempted | Foreign Key → AiQuiz.id, CASCADE DELETE | Selected quiz |
| userId | String | Student attempting | Foreign Key → User.id, CASCADE DELETE | Current user |
| answers | Json | User's answers | Required | Object mapping questionId to answer |
| score | Float? | Percentage score | Optional, Min: 0, Max: 100 | Calculated after completion |
| completedAt | DateTime? | Completion time | Optional | Set when quiz submitted |
| createdAt | DateTime | Attempt start | Auto-generated | When quiz started |
| updatedAt | DateTime | Last update | Auto-updated | Updated on answer changes |

**Relationships:**
- **Belongs To:** AiQuiz (N:1, CASCADE DELETE)
- **Belongs To:** User (N:1, CASCADE DELETE)

**Answers Format:**
```json
{
  "clxQuestion1": "B",
  "clxQuestion2": "True",
  "clxQuestion3": "Polymorphism allows..."
}
```

**Scoring:**
- Auto-graded for MC and T/F (compare with correctAnswer)
- Manual review needed for Short Answer and Essay

---

### Entity: AiStudyPlan

**Description:** AI-generated personalized study plans with weekly breakdowns.

| Attribute | Datatype | Description | Constraints | Sprint 3 Usage |
|-----------|----------|-------------|-------------|----------------|
| id | String (CUID) | Unique identifier | Primary Key | Auto-generated |
| title | String | Plan title | Required, Max: 200 chars | Student-provided |
| goal | String (text)? | Learning objective | Optional, Max: 1000 chars | Student-provided |
| weekCount | Int | Number of weeks | Required, Min: 1, Max: 12 | Student-selected |
| hoursPerWeek | Int | Study hours/week | Required, Min: 1, Max: 40 | Student-selected |
| deadline | DateTime? | Target completion | Optional | Student-selected |
| courseId | String? | Related course | Foreign Key → Course.id, SET_NULL | Optional context |
| userId | String | Plan creator | Foreign Key → User.id, CASCADE DELETE | Current user |
| tokensUsed | Int | Generation cost | Default: 0, Min: 0 | Gemini 2.5 Pro tokens |
| createdAt | DateTime | Generation timestamp | Auto-generated | When plan created |
| updatedAt | DateTime | Last update | Auto-updated | Updated on progress |

**Relationships:**
- **Belongs To:** User (N:1, CASCADE DELETE)
- **Belongs To:** Course (N:1, SET_NULL)
- **Has Many:** AiStudyPlanWeek (1:N, CASCADE DELETE)

**Generation Settings:**
- Uses Gemini 2.5 Pro
- Temperature: 0.5 (balanced creativity and structure)
- Typical token usage: 2000-3500 tokens

---

### Entity: AiStudyPlanWeek

**Description:** Individual weeks within AI study plans.

| Attribute | Datatype | Description | Constraints | Sprint 3 Usage |
|-----------|----------|-------------|-------------|----------------|
| id | String (CUID) | Unique identifier | Primary Key | Auto-generated |
| weekNumber | Int | Week sequence | Required, Min: 1, Max: 12 | 1-12 based on plan duration |
| title | String | Week theme | Required, Max: 200 chars | AI-generated |
| studyPlanId | String | Parent plan | Foreign Key → AiStudyPlan.id, CASCADE DELETE | Links to plan |
| createdAt | DateTime | Creation timestamp | Auto-generated | Same as plan creation |

**Relationships:**
- **Belongs To:** AiStudyPlan (N:1, CASCADE DELETE)
- **Has Many:** AiStudyPlanTask (1:N, CASCADE DELETE)

---

### Entity: AiStudyPlanTask

**Description:** Individual tasks within study plan weeks.

| Attribute | Datatype | Description | Constraints | Sprint 3 Usage |
|-----------|----------|-------------|-------------|----------------|
| id | String (CUID) | Unique identifier | Primary Key | Auto-generated |
| title | String | Task name | Required, Max: 200 chars | AI-generated |
| description | String (text)? | Task details | Optional, Max: 1000 chars | AI-generated instructions |
| estimatedHours | Int | Time needed | Required, Min: 1, Max: 40 | AI-estimated |
| completed | Boolean | Completion status | Default: false | Student marks complete |
| weekId | String | Parent week | Foreign Key → AiStudyPlanWeek.id, CASCADE DELETE | Links to week |
| order | Int | Task sequence | Required, Min: 0 | Display order within week |
| createdAt | DateTime | Creation timestamp | Auto-generated | Same as plan creation |
| updatedAt | DateTime | Last update | Auto-updated | Updated when completed |

**Relationships:**
- **Belongs To:** AiStudyPlanWeek (N:1, CASCADE DELETE)

**Progress Tracking:**
- Students check completed checkbox
- Progress percentage = (completed tasks / total tasks) * 100

---

### Entity: AiGeneratedNote

**Description:** AI-enhanced notes with multiple generation types.

| Attribute | Datatype | Description | Constraints | Sprint 3 Usage |
|-----------|----------|-------------|-------------|----------------|
| id | String (CUID) | Unique identifier | Primary Key | Auto-generated |
| originalContent | String (text)? | Input content | Optional, Max: 10000 chars | Student-provided (null for GENERATE type) |
| generatedContent | String (text) | AI output | Required, Max: 10000 chars | AI-generated |
| prompt | String (text) | Enhancement request | Required, Max: 1000 chars | Student-provided instructions |
| type | Enum (NoteGenerationType) | Generation mode | GENERATE\|IMPROVE\|SUMMARIZE\|EXPAND | Student-selected |
| tokensUsed | Int | Generation cost | Default: 0, Min: 0 | Gemini tokens |
| userId | String | Note owner | Foreign Key → User.id, CASCADE DELETE | Current user |
| createdAt | DateTime | Generation timestamp | Auto-generated | When note created |

**Relationships:**
- **Belongs To:** User (N:1, CASCADE DELETE)

**Generation Types:**
- **GENERATE:** originalContent is null, create notes from prompt
- **IMPROVE:** originalContent provided, enhance quality
- **SUMMARIZE:** originalContent provided, condense to key points
- **EXPAND:** originalContent provided, add detail and examples

---

### Enum: CardType

**Description:** Categorizes resource cards within courses.

| Value | Description | File Uploads Allowed | Default Behavior |
|-------|-------------|---------------------|------------------|
| ASSIGNMENT | Homework and projects | Yes (true) | Created automatically, order: 0 |
| TASK | Text-based to-do items | No (false) | Created automatically, order: 1 |
| CONTENT | Slides, readings, materials | Yes (true) | Created automatically, order: 2 |
| NOTES | Links to collaborative notes | No (false) | Created automatically, order: 3 |
| CUSTOM | User-defined cards | Configurable | Created manually by students |

---

### Enum: MessageRole

**Description:** Identifies the source of AI chat messages.

| Value | Description | Usage |
|-------|-------------|-------|
| USER | Student's messages | Questions and prompts from student |
| ASSISTANT | AI responses | Answers from Gemini 2.5 Flash |
| SYSTEM | System instructions | Context and system prompts (not displayed in UI) |

---

### Enum: QuizDifficulty

**Description:** Defines quiz complexity levels.

| Value | Description | Question Characteristics |
|-------|-------------|-------------------------|
| EASY | Basic comprehension | Simple recall, definitions, basic concepts |
| MEDIUM | Application and analysis | Problem-solving, comparisons, explanations |
| HARD | Synthesis and evaluation | Critical thinking, complex scenarios, advanced concepts |

---

### Enum: QuestionType

**Description:** Defines quiz question formats.

| Value | Description | Answer Format | Auto-Gradable |
|-------|-------------|---------------|--------------|
| MULTIPLE_CHOICE | 4 options, one correct | Single letter (A-D) | Yes |
| TRUE_FALSE | Boolean question | "True" or "False" | Yes |
| SHORT_ANSWER | Brief text response | Text (1-2 sentences) | No (manual review) |
| ESSAY | Extended written response | Text (paragraph+) | No (manual review) |

---

### Enum: NoteGenerationType

**Description:** Types of AI note enhancements.

| Value | Description | Original Content | Use Case |
|-------|-------------|------------------|----------|
| GENERATE | Create from topic | Not required (null) | "Generate notes about polymorphism" |
| IMPROVE | Enhance existing | Required | "Improve my rough notes" |
| SUMMARIZE | Condense content | Required | "Summarize this lecture transcript" |
| EXPAND | Add detail | Required | "Expand on these bullet points" |

---

## Sprint 3 Success Criteria

✅ **Course Management:**
- [x] Course creation with title, description, code, semester, color, icon
- [x] 4 default resource cards auto-created (Assignments, Tasks, Content, Notes)
- [x] Custom resource card creation with configurable upload permissions
- [x] Course editing (all fields modifiable)
- [x] Course deletion with cascade delete (removes cards and resources)
- [x] Course list view with grid layout and color coding
- [x] tRPC integration for type-safe API calls

✅ **Resource Management:**
- [x] File upload to resource cards via UploadThing (16MB max)
- [x] Supported file types: Images, PDF, Word, PowerPoint
- [x] Resource metadata tracking (fileType, fileSize, uploadedBy)
- [x] Resource ordering within cards
- [x] Resource deletion (owner or uploader only)
- [x] Cascade delete on card deletion

✅ **Favorites System:**
- [x] Favorite/unfavorite courses
- [x] Unique constraint prevents duplicate favorites
- [x] Cascade delete on user or course deletion
- [x] Favorites filter in calendar (Sprint 5 integration)

✅ **AI Learning Assistant:**
- [x] Conversation creation with optional course context
- [x] Real-time streaming chat with Gemini 2.5 Flash
- [x] Server-Sent Events (SSE) for word-by-word typing effect
- [x] Conversation history sidebar
- [x] Continue previous conversations with full context
- [x] Token usage tracking per message and conversation
- [x] Vercel AI SDK integration

✅ **AI Quiz Generation:**
- [x] Quiz generation with Gemini 2.5 Pro
- [x] Configurable difficulty (Easy, Medium, Hard)
- [x] Configurable question count (5-20)
- [x] Multiple question types (MC, T/F, Short Answer, Essay)
- [x] JSON parsing and validation
- [x] Quiz questions with explanations
- [x] Quiz attempt system with answer recording
- [x] Auto-grading for MC and T/F questions

✅ **AI Study Plan Generation:**
- [x] Study plan creation with weekly breakdown
- [x] Configurable duration (1-12 weeks)
- [x] Configurable hours per week (1-40)
- [x] Course context integration
- [x] Weekly tasks with estimated hours
- [x] Progress tracking with completion checkboxes
- [x] Nested structure: Plan → Week → Task

✅ **AI Note Enhancement:**
- [x] Four generation types (GENERATE, IMPROVE, SUMMARIZE, EXPAND)
- [x] Topic-based note generation
- [x] Existing note improvement
- [x] Content summarization
- [x] Brief note expansion
- [x] Token usage tracking per generation

---

## Technical Stack Summary

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Frontend Framework** | Next.js (App Router) | 15.1+ | React-based UI with server components |
| **Language** | TypeScript | 5.0+ | Type-safe development |
| **Database** | PostgreSQL (NeonDB) | 16+ | Course, resource, and AI data |
| **ORM** | Prisma | 6.5+ | Type-safe database queries |
| **API Layer** | tRPC | 11.0+ | End-to-end type safety |
| **File Upload** | UploadThing | Latest | Resource file storage (S3 CDN) |
| **AI Provider** | Google Gemini | 2.5 Flash & Pro | Chat and content generation |
| **AI SDK** | Vercel AI SDK | 5.0.113 | Streaming AI responses |
| **Streaming** | Server-Sent Events (SSE) | Native | Real-time AI chat streaming |
| **Form Validation** | Zod | 3.22+ | Schema validation |
| **Styling** | Tailwind CSS + Shadcn UI | Latest | Modern responsive UI |

**AI Model Selection:**
- **Gemini 2.5 Flash:** Used for conversational chat (fast, cheap, good for real-time)
- **Gemini 2.5 Pro:** Used for quiz generation, study plans, note enhancement (higher quality, better for structured output)

---

## Next Sprint Preview (Sprint 4)

Sprint 4 will implement sharing and collaboration features:

### 1. Course Sharing System:
- Faculty-restricted sharing (same faculty only)
- Two permission levels:
  - **VIEWER:** Read-only access to resources
  - **CONTRIBUTOR:** Can add resources, cannot delete
- Invitation system with accept/reject workflow
- Contributor avatars displayed on shared courses
- "Shared with me" section in course list

### 2. Real-Time Collaborative Notes:
- BlockNote 0.41+ editor integration
- Liveblocks 3.9+ for real-time sync
- Yjs CRDT 13.6+ for conflict-free editing
- Live cursors showing collaborator positions
- Nested pages for organized notes
- Sidebar navigation
- Auto-save every 5 seconds

### 3. Public Articles System:
- Article creation using BlockNote
- Draft and publish workflow
- Slug generation for URLs
- Tag system for categorization
- Public browsing (no login required)
- Search and filter capabilities
- View counter and read time estimation

### 4. Notification System:
- Course invitation notifications
- Contributor added/removed notifications
- Resource uploaded notifications
- Real-time notification badge
- Mark as read functionality

---

**End of Sprint 3 Iteration Report**
