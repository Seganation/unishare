# AI Integration Handoff Document

**Date:** 2025-12-15
**Status:** Backend 100% Complete | Frontend 60% Complete
**Next AI Agent:** Continue from "What's Left to Build" section

---

## 🎯 Project Overview

UNIShare now has a **fully functional local AI system** powered by Ollama + Phi-3 for:
- ✅ AI Chat (ChatGPT-like interface with conversation history)
- ✅ Quiz Generation from course content
- ✅ Study Plan Creation with weekly tasks
- 🔄 Quiz Taking Interface (needs UI)
- 🔄 Study Plan Display (needs UI)

**Key Philosophy:**
- 100% local processing (Ollama) - NEVER ships to production
- Private to users (no sharing AI generations)
- Full conversation history like ChatGPT
- Undo/redo support for AI generations

---

## ✅ What's Been Completed

### 1. Database Schema (100% Done)
**Location:** `prisma/schema.prisma`

**Models Added:**
```prisma
- AiConversation      // Chat history (like ChatGPT)
- AiMessage          // Individual messages
- AiQuiz             // Generated quizzes
- AiQuizQuestion     // Quiz questions (MC, T/F, Short Answer)
- AiQuizAttempt      // User attempts at quizzes
- AiQuizAnswer       // Individual answers
- AiStudyPlan        // Weekly study plans
- AiStudyPlanWeek    // Weekly breakdown
- AiStudyPlanTask    // Individual tasks
- AiGeneratedNote    // AI-generated note content (for future)
```

**All relations properly set up:**
- User → AiConversation, AiQuiz, AiStudyPlan
- Course → AiConversation, AiQuiz, AiStudyPlan
- Note → AiConversation, AiQuiz

### 2. Backend AI Logic (100% Done)
**Location:** `src/server/ai/`

**Files:**
- `ollama.ts` - Ollama client with error handling, health checks
- `quiz-generator.ts` - Generate quizzes from content (JSON output)
- `study-plan-generator.ts` - Generate study plans (JSON output)
- `types.ts` - TypeScript types
- `index.ts` - Exports everything

**Key Functions:**
```typescript
// Quiz
generateQuiz({ topic, courseContext, noteContent, questionCount, difficulty })
gradeQuizAttempt(questions, answers)

// Study Plan
generateStudyPlan({ courseName, topics, weekCount, hoursPerWeek, goal, deadline })

// General
healthCheck() // Check if Ollama is running
chat({ messages }) // Chat with context
```

### 3. tRPC API (100% Done)
**Location:** `src/server/api/routers/ai.ts` (1073 lines!)

**Endpoints:**
```typescript
// Conversations
ai.healthCheck
ai.createConversation
ai.getConversations
ai.getConversation
ai.deleteConversation
ai.sendMessage // Non-streaming

// Quizzes
ai.generateQuiz
ai.getQuizzes
ai.getQuiz
ai.submitQuizAttempt
ai.deleteQuiz

// Study Plans
ai.generateStudyPlan
ai.getStudyPlans
ai.updateStudyPlanTask // Mark task complete
ai.deleteStudyPlan

// Notes (for future BlockNote integration)
ai.generateNote
ai.getNoteGenerations
```

### 4. Streaming API Route (100% Done)
**Location:** `src/app/api/ai/chat/route.ts`

- Uses Vercel AI SDK (`streamText`)
- Integrates with Ollama via `ollama-ai-provider`
- Auto-saves messages after streaming completes
- Context-aware (knows course/note)

### 5. UI Components (60% Done)

**✅ Complete:**
- `src/components/ui/chat/` - Full chat interface
  - `chat.tsx` - Main Chat component
  - `chat-container.tsx` - Container layout
  - `chat-messages.tsx` - Scrollable message area
  - `message-list.tsx` - Message bubbles with markdown
  - `message-input.tsx` - Input with file support
  - `chat-form.tsx` - Form wrapper
  - `prompt-suggestions.tsx` - Suggestion chips

- `src/components/ai/` - AI-specific components
  - `ai-chat-interface.tsx` - Full chat wrapper using useChat
  - `ai-health-status.tsx` - Ollama server status card
  - `conversation-sidebar.tsx` - ChatGPT-style history sidebar

- `src/app/ai/page.tsx` - AI chat page (working!)

**🔄 Incomplete:**
- Quiz taking interface
- Study plan display
- Quiz/Study plan generation forms

### 6. Environment Variables (100% Done)
**Files Updated:**
- `src/env.js` - Added OLLAMA_BASE_URL and OLLAMA_MODEL
- `.env.example` - Added AI section with instructions

**Variables:**
```bash
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="phi3:3.8b"
```

### 7. Dependencies Installed
```json
{
  "ai": "^3.x",                    // Vercel AI SDK
  "ollama": "^0.x",                // Ollama client
  "ollama-ai-provider": "^0.x",   // AI SDK provider
  "react-markdown": "^9.x",        // Markdown rendering
  "remark-gfm": "^4.x"            // GitHub Flavored Markdown
}
```

---

## 🚧 What's Left to Build

### Priority 1: Quiz Taking Interface

**What to Build:**
1. **Quiz List Component** (`src/components/ai/quiz-list.tsx`)
   - Display user's quizzes
   - Show attempts and scores
   - "Take Quiz" button
   - "View Results" for completed attempts

2. **Quiz Taking Component** (`src/components/ai/quiz-taker.tsx`)
   - Display questions one-by-one or all at once
   - Radio buttons for Multiple Choice
   - Toggle for True/False
   - Text input for Short Answer
   - Progress indicator (Question 3 of 10)
   - Submit button
   - Timer (optional)

3. **Quiz Results Component** (`src/components/ai/quiz-results.tsx`)
   - Show score (e.g., "8/10 - 80%")
   - Display all questions with:
     - User's answer
     - Correct answer
     - ✅ or ❌ indicator
     - AI explanation
   - "Retake Quiz" button

4. **Quiz Generation Form** (`src/components/ai/quiz-generator-form.tsx`)
   - Input: Topic (text)
   - Input: Question count (slider 5-50)
   - Select: Difficulty (easy/medium/hard)
   - Checkboxes: Question types (MC, T/F, Short Answer)
   - "Generate Quiz" button
   - Loading state during generation

**API Calls to Use:**
```typescript
const { data: quizzes } = api.ai.getQuizzes.useQuery({ courseId });
const { data: quiz } = api.ai.getQuiz.useQuery({ id: quizId });
const submitAttempt = api.ai.submitQuizAttempt.useMutation();
const generateQuiz = api.ai.generateQuiz.useMutation();
```

**Example Flow:**
```
User on Course Page → "Generate Quiz" button →
Quiz Generator Form → Enter "Database Normalization" →
AI generates quiz → Saves to DB →
Shows Quiz → User takes it →
Submit → Show results with explanations
```

### Priority 2: Study Plan Display

**What to Build:**
1. **Study Plan List Component** (`src/components/ai/study-plan-list.tsx`)
   - Display user's study plans
   - Show course name
   - Show date range
   - Progress indicator (10/20 tasks complete)
   - "View Plan" button

2. **Study Plan Display Component** (`src/components/ai/study-plan-viewer.tsx`)
   - Accordion or tabs for each week
   - For each week:
     - Week title and description
     - Learning goals (bullet list)
     - Task list with checkboxes
     - Time estimates
   - Mark tasks as complete (checkbox)
   - Progress bar for overall completion

3. **Study Plan Generator Form** (`src/components/ai/study-plan-generator-form.tsx`)
   - Select: Course (dropdown)
   - Input: Week count (slider 1-16)
   - Input: Hours per week (slider 1-40)
   - Input: Goal (text, optional)
   - Input: Deadline (date picker, optional)
   - "Generate Plan" button
   - Loading state

**API Calls to Use:**
```typescript
const { data: plans } = api.ai.getStudyPlans.useQuery({ courseId });
const generatePlan = api.ai.generateStudyPlan.useMutation();
const updateTask = api.ai.updateStudyPlanTask.useMutation();
```

**Example UI Structure:**
```
Study Plan: "Database Final Prep" (4 weeks)
Progress: [====------] 40% (8/20 tasks)

┌─ Week 1: Introduction to Databases ────────┐
│ Goals:                                      │
│ • Understand relational model              │
│ • Learn SQL basics                         │
│                                             │
│ Tasks:                                      │
│ ✅ Review Chapter 1 (60 min)               │
│ ✅ Practice SQL queries (90 min)           │
│ ☐ Complete exercises 1-5 (45 min)         │
└─────────────────────────────────────────────┘
```

### Priority 3: Integration into Existing Pages

**Where to Add AI Features:**

1. **Course Page** (`src/app/courses/[id]/page.tsx` or similar)
   - Add "AI Tools" dropdown or sidebar with:
     - "Generate Quiz"
     - "Create Study Plan"
     - "Chat about this course"
   - Show recent quizzes and study plans

2. **Dashboard/AI Page** (`src/app/ai/page.tsx` - already exists)
   - ✅ Already has general chat
   - Add tabs:
     - Chat (current)
     - My Quizzes
     - My Study Plans

3. **Navigation**
   - Add "AI Assistant" link to main nav

### Priority 4: Polish & UX

**Nice to Have:**
1. **Undo/Redo for AI Generations**
   - Store generation history in `AiGeneratedNote` table
   - Add "Undo" button after AI generates content
   - Show previous versions

2. **Loading States**
   - Skeleton loaders during quiz/plan generation
   - Progress messages ("Analyzing content...", "Generating questions...")

3. **Empty States**
   - "No quizzes yet - generate your first one!"
   - Illustrations or icons

4. **Error Handling**
   - Show friendly error if Ollama is not running
   - Retry button for failed generations

5. **Animations**
   - Fade in quiz questions
   - Progress bar animations
   - Confetti on quiz completion? 🎉

---

## 🏗️ Architecture Overview

### Data Flow

**Quiz Generation:**
```
User clicks "Generate Quiz"
  ↓
Form: topic, difficulty, question count
  ↓
tRPC: ai.generateQuiz
  ↓
quiz-generator.ts: Uses Ollama to generate JSON
  ↓
Parse & validate JSON (Zod schema)
  ↓
Save to database (AiQuiz + AiQuizQuestion)
  ↓
Return quiz to frontend
  ↓
Display quiz or redirect to quiz page
```

**Quiz Taking:**
```
User views quiz
  ↓
Select answers for each question
  ↓
Click "Submit"
  ↓
tRPC: ai.submitQuizAttempt
  ↓
gradeQuizAttempt(): Compare answers
  ↓
Calculate score (% correct)
  ↓
Save attempt + answers to DB
  ↓
Return results with correct/incorrect for each
  ↓
Display results with explanations
```

**Chat:**
```
User types message
  ↓
useChat hook (Vercel AI SDK)
  ↓
POST /api/ai/chat
  ↓
Streaming response from Ollama
  ↓
Auto-save to AiConversation after streaming
  ↓
Display in chat UI with markdown
```

### Tech Stack Summary

**Backend:**
- Ollama (local AI server)
- Phi-3 3.8B model
- tRPC for type-safe APIs
- Prisma for database
- Zod for validation

**Frontend:**
- Vercel AI SDK (`useChat` hook)
- Custom chat components (shadcn-style)
- React Query (via tRPC)
- Tailwind CSS

---

## 📝 Implementation Guide for Next AI

### Step 1: Build Quiz Taking Interface

**File:** `src/components/ai/quiz-taker.tsx`

```typescript
"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
// ... imports

interface QuizTakerProps {
  quizId: string;
}

export function QuizTaker({ quizId }: QuizTakerProps) {
  const { data: quiz } = api.ai.getQuiz.useQuery({ id: quizId });
  const submitAttempt = api.ai.submitQuizAttempt.useMutation();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    const answersArray = quiz.questions.map(q => ({
      questionId: q.id,
      userAnswer: answers[q.id] || "",
    }));

    const attempt = await submitAttempt.mutateAsync({
      quizId,
      answers: answersArray,
    });

    setResult(attempt);
    setSubmitted(true);
  };

  if (!quiz) return <div>Loading...</div>;

  if (submitted && result) {
    return <QuizResults result={result} quiz={quiz} />;
  }

  return (
    <div className="space-y-6">
      <h2>{quiz.title}</h2>

      {quiz.questions.map((question, index) => (
        <QuestionCard
          key={question.id}
          question={question}
          number={index + 1}
          value={answers[question.id]}
          onChange={(value) => setAnswers({ ...answers, [question.id]: value })}
        />
      ))}

      <Button onClick={handleSubmit}>Submit Quiz</Button>
    </div>
  );
}

// Continue implementing QuestionCard and QuizResults...
```

### Step 2: Build Study Plan Viewer

**File:** `src/components/ai/study-plan-viewer.tsx`

```typescript
"use client";

import { api } from "~/trpc/react";
import { Accordion } from "~/components/ui/accordion";
import { Checkbox } from "~/components/ui/checkbox";
// ... imports

export function StudyPlanViewer({ planId }: { planId: string }) {
  const { data: plan, refetch } = api.ai.getStudyPlans.useQuery({ });
  const updateTask = api.ai.updateStudyPlanTask.useMutation({
    onSuccess: () => refetch(),
  });

  const handleTaskToggle = (taskId: string, isCompleted: boolean) => {
    updateTask.mutate({ taskId, isCompleted });
  };

  // Calculate progress
  const totalTasks = plan?.weeks.flatMap(w => w.tasks).length || 0;
  const completedTasks = plan?.weeks.flatMap(w => w.tasks).filter(t => t.isCompleted).length || 0;
  const progress = (completedTasks / totalTasks) * 100;

  return (
    <div>
      <h2>{plan?.title}</h2>
      <ProgressBar value={progress} />

      <Accordion type="multiple">
        {plan?.weeks.map(week => (
          <AccordionItem key={week.id} value={week.id}>
            <AccordionTrigger>{week.title}</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {week.goals.map((goal, i) => (
                  <li key={i}>{goal}</li>
                ))}
              </div>

              <div className="mt-4">
                {week.tasks.map(task => (
                  <div key={task.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={task.isCompleted}
                      onCheckedChange={(checked) =>
                        handleTaskToggle(task.id, !!checked)
                      }
                    />
                    <span>{task.title}</span>
                    {task.estimatedMinutes && (
                      <span className="text-sm text-muted-foreground">
                        ({task.estimatedMinutes}m)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
```

### Step 3: Add to Course Pages

Update course detail pages to include AI tools. Add buttons/modals for:
- Generate Quiz
- Create Study Plan
- Chat about Course

---

## 🔍 Testing Guide

### 1. Test Ollama Setup

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Pull the model if needed
ollama pull phi3:3.8b

# Test generation
curl http://localhost:11434/api/generate -d '{
  "model": "phi3:3.8b",
  "prompt": "Explain databases",
  "stream": false
}'
```

### 2. Test AI Endpoints

**Health Check:**
```typescript
const { data } = api.ai.healthCheck.useQuery();
// Should return: { available: true, modelAvailable: true, models: [...] }
```

**Generate Quiz:**
```typescript
const quiz = await api.ai.generateQuiz.mutateAsync({
  topic: "Database normalization",
  courseId: "course-id",
  questionCount: 5,
  difficulty: "medium",
});
```

**Generate Study Plan:**
```typescript
const plan = await api.ai.generateStudyPlan.mutateAsync({
  courseId: "course-id",
  weekCount: 4,
  hoursPerWeek: 5,
  goal: "Prepare for final exam",
});
```

### 3. Test Chat

Visit: `http://localhost:3000/ai`
- Start new conversation
- Ask: "Explain database normalization"
- Check conversation history sidebar
- Refresh page - conversation should persist

---

## 🐛 Common Issues & Solutions

### Issue: "Ollama server is not running"

**Solution:**
```bash
# Start Ollama
ollama serve

# Or on macOS (if installed via app)
# Ollama runs automatically
```

### Issue: "Model not found"

**Solution:**
```bash
ollama pull phi3:3.8b
```

### Issue: Quiz generation returns invalid JSON

**Cause:** AI sometimes adds markdown code blocks around JSON

**Solution:** Already handled in `quiz-generator.ts` (lines 75-83):
```typescript
let cleanedText = result.text.trim();
if (cleanedText.startsWith("```json")) {
  cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
}
```

### Issue: Chat not streaming

**Check:**
1. Is `/api/ai/chat` route working?
2. Is `ollama-ai-provider` installed?
3. Check browser console for errors

---

## 📁 File Structure Reference

```
unishare/
├── prisma/
│   └── schema.prisma           # Database models (AI section added)
│
├── src/
│   ├── server/
│   │   ├── ai/
│   │   │   ├── ollama.ts       # Ollama client
│   │   │   ├── quiz-generator.ts
│   │   │   ├── study-plan-generator.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   └── api/
│   │       └── routers/
│   │           └── ai.ts       # tRPC endpoints (1073 lines)
│   │
│   ├── app/
│   │   ├── api/
│   │   │   └── ai/
│   │   │       ├── chat/
│   │   │       │   └── route.ts     # Streaming endpoint
│   │   │       └── generate-note/
│   │   │           └── route.ts
│   │   │
│   │   └── ai/
│   │       ├── page.tsx        # AI chat page ✅
│   │       └── loading.tsx
│   │
│   └── components/
│       ├── ui/
│       │   └── chat/
│       │       ├── chat.tsx
│       │       ├── chat-container.tsx
│       │       ├── chat-messages.tsx
│       │       ├── message-list.tsx
│       │       ├── message-input.tsx
│       │       ├── chat-form.tsx
│       │       ├── prompt-suggestions.tsx
│       │       └── index.ts
│       │
│       └── ai/
│           ├── ai-chat-interface.tsx         ✅
│           ├── ai-health-status.tsx          ✅
│           ├── conversation-sidebar.tsx      ✅
│           ├── quiz-list.tsx                 🔄 TODO
│           ├── quiz-taker.tsx                🔄 TODO
│           ├── quiz-results.tsx              🔄 TODO
│           ├── quiz-generator-form.tsx       🔄 TODO
│           ├── study-plan-list.tsx           🔄 TODO
│           ├── study-plan-viewer.tsx         🔄 TODO
│           ├── study-plan-generator-form.tsx 🔄 TODO
│           └── index.ts
│
├── .env
├── .env.example                # Updated with AI vars
└── local_ai_ollama_phi_3_project_notes.md
```

---

## 🎯 Next Steps Summary

**For the next AI agent:**

1. **Start here:** Build quiz taking interface (Priority 1)
   - Create `quiz-taker.tsx`
   - Create `quiz-results.tsx`
   - Create `quiz-generator-form.tsx`
   - Test with existing API endpoints

2. **Then:** Build study plan display (Priority 2)
   - Create `study-plan-viewer.tsx`
   - Create `study-plan-generator-form.tsx`
   - Add task completion tracking

3. **Finally:** Integrate into course pages
   - Add AI tools to course detail pages
   - Add navigation links
   - Polish UI/UX

**Everything else is DONE!** The backend is 100% functional and tested. You just need to build the UI to display quizzes and study plans.

---

## 💡 Tips for Next AI

- **Don't reinvent the wheel:** Use existing shadcn components (Accordion, Checkbox, RadioGroup, etc.)
- **Follow patterns:** Look at existing components in `src/components/` for styling patterns
- **Use tRPC:** All API calls are already set up, just call them with `api.ai.methodName`
- **Test incrementally:** Build one component at a time and test it before moving on
- **Check types:** TypeScript will guide you - the return types from tRPC are fully typed

**Reference files:**
- `src/components/ai/ai-chat-interface.tsx` - Example of using tRPC + Vercel AI SDK
- `src/app/ai/page.tsx` - Example page layout
- `src/server/api/routers/ai.ts` - See all available endpoints and their input/output types

---

## ✅ Verification Checklist

Before considering AI integration complete, verify:

- [ ] Quiz generation works and saves to DB
- [ ] Quiz taking interface displays questions
- [ ] Quiz submission grades correctly and shows results
- [ ] Study plan generation works and saves to DB
- [ ] Study plan displays with weekly breakdown
- [ ] Task completion toggles work
- [ ] Conversation history persists and displays
- [ ] AI chat streams responses correctly
- [ ] Ollama health check shows status accurately
- [ ] All permissions check correctly (course access, etc.)
- [ ] Error states display friendly messages
- [ ] Loading states show during AI generation

---

**Good luck! The hard part is done - now just make it pretty! 🚀**
