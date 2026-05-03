# AI Implementation Guide — Complete Reference

This document is a complete, copy-paste-ready reference for every detail of the AI implementation in this project. It is written so that any AI assistant (Copilot, Claude, etc.) can read it and reproduce the entire AI infrastructure from scratch in another project.

---

## Table of Contents

1. [Tech Stack & Packages](#1-tech-stack--packages)
2. [Environment Variables](#2-environment-variables)
3. [Folder & File Structure](#3-folder--file-structure)
4. [Database Schema (Prisma)](#4-database-schema-prisma)
5. [Backend: Server-Side AI Layer](#5-backend-server-side-ai-layer)
6. [API Routes](#6-api-routes)
7. [tRPC Router (ai.ts)](#7-trpc-router-aits)
8. [UI Components — ai-elements/ (Primitives)](#8-ui-components--ai-elements-primitives)
9. [UI Components — ai/ (Feature Components)](#9-ui-components--ai-feature-components)
10. [The AI Page (Route)](#10-the-ai-page-route)
11. [How It All Connects — Data Flow](#11-how-it-all-connects--data-flow)
12. [Key Patterns & Gotchas](#12-key-patterns--gotchas)

---

## 1. Tech Stack & Packages

### Framework

- **Next.js 15** (App Router)
- **tRPC v11** for type-safe API
- **Prisma + PostgreSQL (NeonDB)** for persistence
- **NextAuth.js v5 beta** for auth

### AI-Specific Packages

Install all of these:

```bash
npm install ai @ai-sdk/google @ai-sdk/react
# Optional: for local Ollama fallback
npm install ollama ollama-ai-provider
# Utility
npm install nanoid use-stick-to-bottom streamdown
```

#### Exact versions used (from `package.json`):

```json
"ai": "^5.0.113",
"@ai-sdk/google": "^2.0.49",
"@ai-sdk/react": "^2.0.115",
"@ai-sdk/openai-compatible": "^1.0.29",
"ollama": "^0.6.3",
"ollama-ai-provider": "^1.2.0",
"nanoid": "^5.1.6",
"use-stick-to-bottom": "^1.1.1",
"streamdown": "^1.6.10"
```

> **Critical note on versions**: This project uses **Vercel AI SDK v5** (`ai@^5.0.113`), NOT v3 or v4. The API is significantly different from older versions. Key differences:
>
> - `useChat` no longer manages input state internally — you must control `input` yourself with `useState`
> - Messages use `UIMessage` format with `parts[]` instead of a flat `content` string
> - The chat hook uses `sendMessage({ text })` instead of `handleSubmit`
> - Streaming uses `DefaultChatTransport` instead of a plain URL string
> - `toUIMessageStreamResponse()` is used on the server (not `toDataStreamResponse()`)
> - `convertToModelMessages()` converts UIMessages to model-compatible format

---

## 2. Environment Variables

Add to `.env` and validate in `src/env.js`:

```env
# AI — Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here
AI_MODEL=gemini-2.5-flash   # optional override
```

### Validation in `src/env.js`

```js
// In the server section:
GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
AI_MODEL: z.string().optional(),

// In runtimeEnv:
GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
AI_MODEL: process.env.AI_MODEL,
```

### Getting the Google API Key

1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. The free tier supports Gemini 2.5 Flash with generous limits

---

## 3. Folder & File Structure

```
src/
├── server/
│   └── ai/
│       ├── index.ts              # Public exports barrel
│       ├── config.ts             # Model configuration (providers, model selection)
│       ├── gemini.ts             # Gemini client wrapper (generateText, chat, healthCheck)
│       ├── ollama.ts             # Legacy Ollama client (optional local fallback)
│       ├── types.ts              # Shared TypeScript types (Message, GenerationOptions, etc.)
│       ├── prompts.ts            # Centralized system prompts + prompt builders
│       ├── quiz-generator.ts     # Quiz generation logic + Zod schemas
│       └── study-plan-generator.ts  # Study plan generation logic + Zod schemas
│
├── server/api/routers/
│   └── ai.ts                     # tRPC router with all AI procedures
│
├── app/api/
│   ├── chat/route.ts             # Streaming chat endpoint (/api/chat)
│   └── ai/
│       └── generate-note/route.ts  # Non-streaming note generation endpoint
│
├── app/(student)/ai/
│   └── [[...id]]/page.tsx        # Main AI chat page (supports /ai and /ai/:conversationId)
│
├── components/
│   ├── ai/                       # Feature-level components
│   │   ├── index.ts
│   │   ├── ai-chat-interface.tsx         # Main chat UI — uses useChat hook
│   │   ├── ai-chat-interface-old.tsx     # Archived version
│   │   ├── ai-health-status.tsx          # Server/model availability status card
│   │   ├── conversation-history-sidebar.tsx  # Sidebar with past conversations
│   │   ├── quiz-generator-form.tsx       # Form to trigger AI quiz generation
│   │   ├── quiz-list.tsx                 # List of generated quizzes
│   │   ├── quiz-taker.tsx                # UI for taking a quiz
│   │   ├── quiz-results.tsx              # Quiz result display
│   │   ├── quiz-attempts-list.tsx        # List of past attempts
│   │   ├── study-plan-generator-form.tsx # Form to trigger study plan generation
│   │   ├── study-plan-list.tsx           # List of study plans
│   │   └── study-plan-viewer.tsx         # Detailed study plan view
│   │
│   └── ai-elements/              # Low-level UI primitives (reusable building blocks)
│       ├── conversation.tsx      # Scroll container with stick-to-bottom
│       ├── message.tsx           # Individual message bubble (user + assistant)
│       ├── prompt-input.tsx      # Textarea + submit + attachments input area
│       ├── suggestion.tsx        # Clickable suggestion chips
│       ├── loader.tsx            # Animated spinner (used while AI is thinking)
│       ├── model-selector.tsx    # Dropdown to select AI model
│       ├── artifact.tsx          # Artifact frame for AI-generated content
│       ├── canvas.tsx            # Canvas/whiteboard element
│       ├── chain-of-thought.tsx  # Expandable reasoning display
│       ├── checkpoint.tsx
│       ├── code-block.tsx        # Syntax-highlighted code block
│       ├── confirmation.tsx
│       ├── connection.tsx
│       ├── context.tsx
│       ├── controls.tsx
│       ├── edge.tsx
│       ├── image.tsx
│       ├── inline-citation.tsx
│       ├── node.tsx
│       ├── open-in-chat.tsx
│       ├── panel.tsx
│       ├── plan.tsx
│       ├── queue.tsx
│       ├── reasoning.tsx
│       ├── shimmer.tsx
│       ├── sources.tsx
│       ├── task.tsx
│       ├── tool.tsx
│       ├── toolbar.tsx
│       └── web-preview.tsx
```

---

## 4. Database Schema (Prisma)

Add these models to `prisma/schema.prisma`. They must also be linked from `User`, `Course`, and `Note` models via relations.

### Relations to add on existing models

```prisma
model User {
  // ... existing fields ...
  aiConversations      AiConversation[]
  aiGeneratedNotes     AiGeneratedNote[]
  aiQuizzes            AiQuiz[]
  aiQuizAttempts       AiQuizAttempt[]
  aiStudyPlans         AiStudyPlan[]
}

model Course {
  // ... existing fields ...
  aiConversations AiConversation[]
  aiQuizzes       AiQuiz[]
  aiStudyPlans    AiStudyPlan[]
}

model Note {
  // ... existing fields ...
  aiConversations  AiConversation[]
  aiGeneratedNotes AiGeneratedNote[]
  aiQuizzes        AiQuiz[]
}
```

### New AI Models

```prisma
// ==================== AI CHAT ====================

model AiConversation {
  id          String      @id @default(cuid())
  title       String      @default("New Conversation")
  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  courseId    String?
  course      Course?     @relation(fields: [courseId], references: [id], onDelete: Cascade)
  noteId      String?
  note        Note?       @relation(fields: [noteId], references: [id], onDelete: Cascade)

  temperature Float       @default(0.7)
  messages    AiMessage[]

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([userId])
  @@index([courseId])
  @@index([noteId])
}

model AiMessage {
  id             String         @id @default(cuid())
  conversationId String
  conversation   AiConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  // Store complete UIMessage format as recommended by AI SDK v5
  // This preserves message structure (parts, tool calls, metadata)
  role           AiMessageRole
  data           Json           // Stores complete UIMessage: { id, role, parts[], createdAt?, metadata? }
  tokensUsed     Int?

  createdAt      DateTime       @default(now())

  @@index([conversationId])
  @@index([createdAt])
}

enum AiMessageRole {
  USER
  ASSISTANT
  SYSTEM
}

// ==================== AI NOTE GENERATION ====================

model AiGeneratedNote {
  id            String           @id @default(cuid())
  noteId        String
  note          Note             @relation(fields: [noteId], references: [id], onDelete: Cascade)
  userId        String
  user          User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  prompt        String
  tokensUsed    Int?
  contentBefore Json?
  contentAfter  Json
  type          AiGenerationType
  createdAt     DateTime         @default(now())

  @@index([noteId])
  @@index([userId])
  @@index([type])
}

enum AiGenerationType {
  GENERATE
  IMPROVE
  SUMMARIZE
  EXPAND
}

// ==================== AI QUIZ GENERATION ====================

model AiQuiz {
  id          String           @id @default(cuid())
  title       String
  description String?
  courseId    String?
  course      Course?          @relation(fields: [courseId], references: [id], onDelete: Cascade)
  noteId      String?
  note        Note?            @relation(fields: [noteId], references: [id], onDelete: Cascade)
  userId      String
  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  prompt      String
  tokensUsed  Int?
  questions   AiQuizQuestion[]
  attempts    AiQuizAttempt[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  @@index([userId])
  @@index([courseId])
  @@index([noteId])
}

model AiQuizQuestion {
  id            String           @id @default(cuid())
  quizId        String
  quiz          AiQuiz           @relation(fields: [quizId], references: [id], onDelete: Cascade)
  question      String
  type          QuizQuestionType
  options       Json?            // ["A", "B", "C", "D"] for multiple choice
  correctAnswer String
  explanation   String?
  order         Int              @default(0)
  answers       AiQuizAnswer[]

  @@index([quizId])
}

enum QuizQuestionType {
  MULTIPLE_CHOICE
  TRUE_FALSE
  SHORT_ANSWER
}

model AiQuizAttempt {
  id          String         @id @default(cuid())
  quizId      String
  quiz        AiQuiz         @relation(fields: [quizId], references: [id], onDelete: Cascade)
  userId      String
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  score       Float          // Percentage 0–100
  answers     AiQuizAnswer[]
  startedAt   DateTime       @default(now())
  completedAt DateTime?

  @@index([quizId])
  @@index([userId])
}

model AiQuizAnswer {
  id         String         @id @default(cuid())
  attemptId  String
  attempt    AiQuizAttempt  @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  questionId String
  question   AiQuizQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  userAnswer String
  isCorrect  Boolean

  @@index([attemptId])
  @@index([questionId])
}

// ==================== AI STUDY PLANS ====================

model AiStudyPlan {
  id          String            @id @default(cuid())
  title       String
  description String?
  courseId    String
  course      Course            @relation(fields: [courseId], references: [id], onDelete: Cascade)
  userId      String
  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  prompt      String
  tokensUsed  Int?
  weeks       AiStudyPlanWeek[]
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  @@index([userId])
  @@index([courseId])
}

model AiStudyPlanWeek {
  id          String          @id @default(cuid())
  studyPlanId String
  studyPlan   AiStudyPlan     @relation(fields: [studyPlanId], references: [id], onDelete: Cascade)
  weekNumber  Int
  title       String
  description String?
  goals       String[]
  tasks       AiStudyPlanTask[]

  @@index([studyPlanId])
}

model AiStudyPlanTask {
  id               String          @id @default(cuid())
  weekId           String
  week             AiStudyPlanWeek @relation(fields: [weekId], references: [id], onDelete: Cascade)
  title            String
  description      String?
  estimatedMinutes Int?
  order            Int             @default(0)

  @@index([weekId])
}
```

After adding, run:

```bash
npm run db:generate  # dev — creates migration + updates client
npm run db:migrate   # prod — deploys migration
```

---

## 5. Backend: Server-Side AI Layer

All files live in `src/server/ai/`.

### `src/server/ai/config.ts` — Model Configuration

```typescript
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { env } from "~/env";

const google = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export function getModel() {
  const modelName = env.AI_MODEL ?? "gemini-2.5-flash";
  return google(modelName);
}

export const models = {
  /** Fast: Gemini 2.5 Flash — chat, quick responses, 1M context, free tier */
  fast: google("gemini-2.5-flash"),
  /** Pro: Gemini 2.5 Pro — quiz/study plan generation, best quality, 2M context */
  pro: google("gemini-2.5-pro"),
  default: google("gemini-2.5-flash"),
} as const;

export function getModelByName(name: keyof typeof models) {
  return models[name];
}
```

### Available Gemini Models

| Model code               | Speed     | Context   | Best for                               |
| ------------------------ | --------- | --------- | -------------------------------------- |
| `gemini-2.5-flash`       | Very fast | 1M tokens | Chat, quick responses                  |
| `gemini-2.5-pro`         | Slower    | 2M tokens | Complex generation (quiz, study plans) |
| `gemini-3-flash-preview` | Fast      | 1M tokens | Newer preview                          |
| `gemini-3-pro-preview`   | Slower    | 1M tokens | Most capable, preview                  |

### `src/server/ai/types.ts` — Shared Types

```typescript
export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

export interface GenerationOptions {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatOptions {
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  model?: string;
  temperature?: number;
}

export interface NoteGenerationContext {
  courseName?: string;
  topic: string;
  context?: string;
  format?: "markdown" | "plain";
}
```

### `src/server/ai/gemini.ts` — Gemini Wrapper (generateText, chat, healthCheck)

```typescript
import { generateText as aiGenerateText } from "ai";
import { models } from "./config";

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "SERVER_UNAVAILABLE"
      | "MODEL_NOT_FOUND"
      | "GENERATION_FAILED"
      | "INVALID_API_KEY",
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}

export const OllamaError = AIProviderError; // backwards compat alias

export async function isOllamaAvailable(): Promise<boolean> {
  return true; // Gemini is always available if API key is set
}

export async function isModelAvailable(): Promise<boolean> {
  return true;
}

export async function generateText(options: {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<{ text: string; tokensUsed?: number }> {
  try {
    const result = await aiGenerateText({
      model: models.default,
      system: options.systemPrompt,
      prompt: options.prompt,
      temperature: options.temperature ?? 0.7,
      ...(options.maxTokens && { maxTokens: options.maxTokens }),
    });
    return { text: result.text, tokensUsed: result.usage?.totalTokens };
  } catch (error) {
    throw new AIProviderError(
      "Failed to generate text with Gemini",
      "GENERATION_FAILED",
      error,
    );
  }
}

export async function chat(options: {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  model?: string;
  temperature?: number;
}): Promise<{ text: string; tokensUsed?: number }> {
  try {
    const result = await aiGenerateText({
      model: models.default,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
    });
    return { text: result.text, tokensUsed: result.usage?.totalTokens };
  } catch (error) {
    throw new AIProviderError(
      "Failed to chat with Gemini",
      "GENERATION_FAILED",
      error,
    );
  }
}

export async function healthCheck(): Promise<{
  available: boolean;
  modelAvailable: boolean;
  models: string[];
  error?: string;
}> {
  return {
    available: true,
    modelAvailable: true,
    models: ["gemini-2.5-flash", "gemini-2.5-pro"],
  };
}

export async function listAvailableModels(): Promise<string[]> {
  return ["gemini-2.5-flash", "gemini-2.5-pro"];
}
```

### `src/server/ai/prompts.ts` — Centralized Prompts

```typescript
export const UNISHARE_CONTEXT = `You are an AI assistant for UNIShare, a university student platform...`;

export const QUIZ_GENERATION_SYSTEM_PROMPT = `${UNISHARE_CONTEXT}

Task: Generate educational quizzes for university students.

Output Requirements:
- ONLY respond with valid JSON (no markdown, no explanations)
- Follow this exact structure:

{
  "title": "Quiz Title",
  "description": "Brief description",
  "questions": [
    {
      "question": "Question text?",
      "type": "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "Why this is correct"
    }
  ]
}`;

export const STUDY_PLAN_SYSTEM_PROMPT = `${UNISHARE_CONTEXT}

Task: Create realistic, achievable study plans for university courses.
// ... JSON structure ...`;

export function getChatSystemPrompt(context?: {
  noteTitle?: string;
  courseTitle?: string;
}): string {
  let prompt = UNISHARE_CONTEXT;
  if (context?.noteTitle) {
    prompt += `\n\nContext: You are helping with a note titled "${context.noteTitle}".`;
  } else if (context?.courseTitle) {
    prompt += `\n\nContext: You are helping with a course titled "${context.courseTitle}".`;
  }
  prompt += `\n\nGuidelines:\n- Clear, concise explanations\n- Use markdown formatting\n- Break down complex topics\n- Provide examples`;
  return prompt;
}

export function buildQuizPrompt(options: {
  topic: string;
  questionCount: number;
  difficulty: "easy" | "medium" | "hard";
  questionTypes: string[];
  courseContext?: string;
  noteContent?: string;
}): string {
  const {
    topic,
    questionCount,
    difficulty,
    questionTypes,
    courseContext,
    noteContent,
  } = options;
  let prompt = `Generate ${questionCount} ${difficulty} questions about: ${topic}\n`;
  prompt += `Question types to include: ${questionTypes.join(", ")}\n`;
  if (courseContext) prompt += `Course context: ${courseContext}\n`;
  if (noteContent)
    prompt += `Note content for reference:\n${noteContent.substring(0, 2000)}\n`;
  return prompt;
}

export function buildStudyPlanPrompt(options: {
  courseName: string;
  weekCount: number;
  hoursPerWeek: number;
  goal: string;
  courseDescription?: string;
  topics?: string[];
  deadline?: Date;
}): string {
  const {
    courseName,
    weekCount,
    hoursPerWeek,
    goal,
    courseDescription,
    topics,
    deadline,
  } = options;
  let prompt = `Create a ${weekCount}-week study plan for: ${courseName}\n`;
  prompt += `Available study time: ${hoursPerWeek} hours per week\n`;
  prompt += `Goal: ${goal}\n`;
  if (courseDescription) prompt += `Course description: ${courseDescription}\n`;
  if (topics?.length) prompt += `Key topics: ${topics.join(", ")}\n`;
  if (deadline) prompt += `Deadline: ${deadline.toLocaleDateString()}\n`;
  return prompt;
}
```

### `src/server/ai/quiz-generator.ts`

````typescript
import { generateText } from "ai";
import { z } from "zod";
import { models } from "./config";
import { QUIZ_GENERATION_SYSTEM_PROMPT, buildQuizPrompt } from "./prompts";

export const QuizQuestionSchema = z.object({
  question: z.string(),
  type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  explanation: z.string().optional(),
});

export const QuizSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  questions: z.array(QuizQuestionSchema),
});

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type GeneratedQuiz = z.infer<typeof QuizSchema>;

export async function generateQuiz(options: {
  topic: string;
  courseContext?: string;
  noteContent?: string;
  questionCount?: number;
  difficulty?: "easy" | "medium" | "hard";
  questionTypes?: Array<"MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER">;
}): Promise<{ quiz: GeneratedQuiz; tokensUsed?: number }> {
  const {
    topic,
    courseContext,
    noteContent,
    questionCount = 10,
    difficulty = "medium",
    questionTypes = ["MULTIPLE_CHOICE", "TRUE_FALSE"],
  } = options;

  const result = await generateText({
    model: models.pro,
    system: QUIZ_GENERATION_SYSTEM_PROMPT,
    prompt: buildQuizPrompt({
      topic,
      questionCount,
      difficulty,
      questionTypes,
      courseContext,
      noteContent,
    }),
    temperature: 0.7,
  });

  let cleanedText = result.text.trim();
  if (cleanedText.startsWith("```json")) {
    cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  } else if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText.replace(/```\n?/g, "");
  }

  const parsed = JSON.parse(cleanedText);
  const quiz = QuizSchema.parse(parsed);
  return { quiz, tokensUsed: result.usage?.totalTokens };
}

export function gradeQuizAttempt(
  questions: Array<{
    type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
    correctAnswer: string;
  }>,
  answers: Array<{ questionId: string; userAnswer: string }>,
): {
  score: number;
  results: Array<{ questionId: string; isCorrect: boolean }>;
} {
  const results = answers.map((answer, index) => {
    const question = questions[index];
    if (!question) return { questionId: answer.questionId, isCorrect: false };
    let isCorrect = false;
    if (question.type === "SHORT_ANSWER") {
      isCorrect =
        answer.userAnswer.trim().toLowerCase() ===
        question.correctAnswer.trim().toLowerCase();
    } else {
      isCorrect = answer.userAnswer === question.correctAnswer;
    }
    return { questionId: answer.questionId, isCorrect };
  });
  const score =
    (results.filter((r) => r.isCorrect).length / questions.length) * 100;
  return { score, results };
}
````

### `src/server/ai/index.ts` — Public Barrel

```typescript
export {
  isOllamaAvailable,
  isModelAvailable,
  generateText,
  generateTextStream,
  chat,
  listAvailableModels,
  healthCheck,
  OllamaError,
  AIProviderError,
} from "./gemini";

export { generateQuiz, gradeQuizAttempt } from "./quiz-generator";
export type { QuizQuestion, GeneratedQuiz } from "./quiz-generator";

export { generateStudyPlan } from "./study-plan-generator";
export type {
  StudyPlanTask,
  StudyPlanWeek,
  GeneratedStudyPlan,
} from "./study-plan-generator";

export type { Message } from "./types";
```

---

## 6. API Routes

### `src/app/api/chat/route.ts` — Streaming Chat Endpoint

This is the **most critical** file. It receives a single new message + context, loads conversation history from the database, streams the response back using Vercel AI SDK v5, and saves all new messages when complete.

```typescript
import { streamText, convertToModelMessages, createIdGenerator } from "ai";
import type { UIMessage } from "ai";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { models } from "~/server/ai/config";
import { getChatSystemPrompt } from "~/server/ai/prompts";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes max

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const json = (await req.json()) as {
    message: UIMessage; // Single message from client (AI SDK v5 pattern)
    conversationId?: string;
    courseId?: string;
    noteId?: string;
    temperature?: number;
  };

  const { message, conversationId, courseId, noteId, temperature = 0.7 } = json;

  if (!conversationId)
    return new Response("No conversation ID provided", { status: 400 });

  // Load or create the conversation
  let conversation = await db.aiConversation.findFirst({
    where: { id: conversationId, userId: session.user.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, data: true },
      },
      note: { select: { title: true, content: true } },
      course: { select: { title: true } },
    },
  });

  let previousMessages: UIMessage[] = [];

  if (conversation?.messages) {
    previousMessages = conversation.messages.map((msg) => {
      const uiMessage = msg.data as unknown as UIMessage;
      return {
        id: uiMessage.id || msg.id,
        role: uiMessage.role,
        parts: uiMessage.parts,
      } as UIMessage;
    });
  }

  if (!conversation) {
    // Auto-generate a title using AI
    const textContent = message.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join(" ");
    let title = textContent.substring(0, 50);
    try {
      const titleResult = await streamText({
        model: models.fast,
        messages: [
          {
            role: "system",
            content:
              "Generate a very short, concise title (max 6 words). Only return the title.",
          },
          { role: "user", content: textContent },
        ],
        temperature: 0.3,
      });
      const titleText = await titleResult.text;
      if (titleText && titleText.length < 100) title = titleText.trim();
    } catch {}

    conversation = await db.aiConversation.create({
      data: {
        id: conversationId,
        title,
        userId: session.user.id,
        courseId,
        noteId,
        temperature,
      },
      include: {
        messages: { select: { id: true, role: true, data: true } },
        note: { select: { title: true, content: true } },
        course: { select: { title: true } },
      },
    });
  }

  const systemMessage = getChatSystemPrompt({
    noteTitle: conversation?.note?.title,
    courseTitle: conversation?.course?.title,
  });

  const allMessages = [...previousMessages, message];
  let tokenUsage: number | undefined;

  const result = streamText({
    model: models.fast,
    messages: convertToModelMessages(allMessages),
    system: systemMessage,
    temperature,
    async onFinish({ usage }) {
      tokenUsage = usage.totalTokens;
    },
  });

  return result.toUIMessageStreamResponse({
    originalMessages: allMessages,
    generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
    async onFinish({ messages }) {
      // Save only NEW messages (not already in DB)
      const existingIds = new Set(previousMessages.map((m) => m.id));
      const newMessages = messages.filter((msg) => !existingIds.has(msg.id));

      for (const msg of newMessages) {
        await db.aiMessage.create({
          data: {
            id: msg.id,
            conversationId: conversationId!,
            role: msg.role.toUpperCase() as "USER" | "ASSISTANT" | "SYSTEM",
            data: msg as unknown as never,
            tokensUsed: msg.role === "assistant" ? tokenUsage : undefined,
          },
        });
      }

      await db.aiConversation.update({
        where: { id: conversationId! },
        data: { updatedAt: new Date() },
      });
    },
  });
}
```

### `src/app/api/ai/generate-note/route.ts` — Non-Streaming Note Generation

```typescript
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { generateText } from "~/server/ai";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z.object({
  noteId: z.string(),
  prompt: z.string().min(1).max(5000),
  type: z.enum(["GENERATE", "IMPROVE", "SUMMARIZE", "EXPAND"]),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const validation = requestSchema.safeParse(body);
  if (!validation.success) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
    });
  }

  const { noteId, prompt, type, temperature } = validation.data;

  // Verify access to the note (check ownership / collaborator status)
  // ... (database access check) ...

  const systemPrompt =
    "You are a helpful teaching assistant. Format your response using markdown.";

  const result = await generateText({ prompt, systemPrompt, temperature });

  return new Response(
    JSON.stringify({ text: result.text, tokensUsed: result.tokensUsed }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
}
```

---

## 7. tRPC Router (`ai.ts`)

Location: `src/server/api/routers/ai.ts`

Must be registered in `src/server/api/root.ts`:

```typescript
import { aiRouter } from "~/server/api/routers/ai";
export const appRouter = createTRPCRouter({
  // ...other routers
  ai: aiRouter,
});
```

### Procedures Summary

| Procedure               | Type     | Description                                           |
| ----------------------- | -------- | ----------------------------------------------------- |
| `ai.healthCheck`        | query    | Returns AI server availability status                 |
| `ai.createConversation` | mutation | Creates a new conversation (used for linking context) |
| `ai.getConversations`   | query    | Paginated list of user's conversations (for sidebar)  |
| `ai.getConversation`    | query    | Single conversation with all messages                 |
| `ai.deleteConversation` | mutation | Delete a conversation + all its messages              |
| `ai.sendMessage`        | mutation | Non-streaming message send (fallback)                 |
| `ai.generateNote`       | mutation | Generate / improve note content                       |
| `ai.generateQuiz`       | mutation | AI quiz generation → saves to DB                      |
| `ai.getQuizzes`         | query    | List all quizzes for user/course/note                 |
| `ai.getQuiz`            | query    | Single quiz with questions                            |
| `ai.submitQuizAttempt`  | mutation | Grade and store quiz answers                          |
| `ai.generateStudyPlan`  | mutation | AI study plan generation → saves to DB                |
| `ai.getStudyPlans`      | query    | List study plans for a course                         |
| `ai.getStudyPlan`       | query    | Single study plan with weeks and tasks                |

### Key procedure: `generateQuiz`

```typescript
generateQuiz: protectedProcedure
  .input(z.object({
    topic: z.string().min(1).max(500),
    courseId: z.string().optional(),
    noteId: z.string().optional(),
    questionCount: z.number().min(1).max(30).optional().default(10),
    difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
    questionTypes: z.array(z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"])).optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const { quiz, tokensUsed } = await generateQuiz({
      topic: input.topic,
      courseContext: /* fetch course title from DB */,
      questionCount: input.questionCount,
      difficulty: input.difficulty,
      questionTypes: input.questionTypes,
    });

    // Save to DB
    const savedQuiz = await ctx.db.aiQuiz.create({
      data: {
        title: quiz.title,
        description: quiz.description,
        userId: ctx.session.user.id,
        courseId: input.courseId,
        noteId: input.noteId,
        prompt: input.topic,
        tokensUsed,
        questions: {
          create: quiz.questions.map((q, i) => ({
            question: q.question,
            type: q.type,
            options: q.options ?? null,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            order: i,
          })),
        },
      },
      include: { questions: true },
    });

    return savedQuiz;
  }),
```

---

## 8. UI Components — `ai-elements/` (Primitives)

These are low-level reusable building blocks. They are independent of any specific AI feature and can be composed freely.

### `conversation.tsx` — Scrollable Chat Container

Uses `use-stick-to-bottom` package for auto-scroll behavior.

```tsx
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";

// The outer wrapper — handles auto-scroll
export const Conversation = ({ className, ...props }) => (
  <StickToBottom
    className={cn("relative flex-1 overflow-y-hidden", className)}
    initial="smooth"
    resize="smooth"
    role="log"
    {...props}
  />
);

// The inner content wrapper — centers messages
export const ConversationContent = ({ className, ...props }) => (
  <StickToBottom.Content
    className={cn(
      "mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-4 md:px-8",
      className,
    )}
    {...props}
  />
);

// Shows when conversation is empty
export const ConversationEmptyState = ({
  title,
  description,
  children,
  ...props
}) => (
  <div
    className="flex size-full flex-col items-center justify-center gap-3 p-8 text-center"
    {...props}
  >
    {children}
  </div>
);

// Floating scroll-to-bottom button
export const ConversationScrollButton = ({ className, ...props }) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();
  return (
    !isAtBottom && (
      <Button
        className="absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full"
        onClick={scrollToBottom}
        size="icon"
        variant="outline"
      >
        <ArrowDownIcon className="size-4" />
      </Button>
    )
  );
};
```

### `message.tsx` — Message Bubble

Handles both user (right-aligned, dark bubble) and assistant (left-aligned, plain) messages.

```tsx
import { Streamdown } from "streamdown"; // for streaming markdown rendering

// Usage:
// <Message from="user"> or <Message from="assistant">
//   <MessageContent>
//     <MessageResponse>{text}</MessageResponse>
//   </MessageContent>
//   <MessageActions>
//     <MessageAction onClick={...} label="Copy"><CopyIcon /></MessageAction>
//   </MessageActions>
// </Message>

export const Message = ({ from, className, ...props }) => (
  <div
    className={cn(
      "group flex w-full max-w-[95%] flex-col gap-2",
      from === "user" ? "is-user ml-auto justify-end" : "is-assistant",
      className,
    )}
    {...props}
  />
);

export const MessageContent = ({ children, className, ...props }) => (
  <div
    className={cn(
      "is-user:dark flex w-fit max-w-full min-w-0 flex-col gap-2 overflow-hidden text-base",
      "group-[.is-user]:ml-auto group-[.is-user]:rounded-lg group-[.is-user]:bg-zinc-900 group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-white",
      "group-[.is-assistant]:text-foreground",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

// MessageResponse renders markdown text (wraps content in prose styles)
export const MessageResponse = ({ className, ...props }) => (
  <div
    className={cn("prose prose-base max-w-none ...", className)}
    {...props}
  />
);
```

### `prompt-input.tsx` — Input Area

A fully-featured prompt input with textarea, submit button, and optional file attachment support. Managed via a `PromptInput` context provider pattern.

```tsx
// Basic usage:
<PromptInput onSubmit={handleSubmit}>
  <PromptInputBody>
    <PromptInputTextarea
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="Ask AI anything..."
    />
  </PromptInputBody>
  <PromptInputFooter>
    <Badge variant="secondary">Gemini 2.5 Flash</Badge>
    <PromptInputSubmit
      disabled={!input || status === "streaming"}
      status={status}
    />
  </PromptInputFooter>
</PromptInput>
```

The `onSubmit` callback receives a `PromptInputMessage`:

```typescript
type PromptInputMessage = {
  text?: string;
  files?: File[];
};
```

The `PromptInputSubmit` automatically shows a spinner when `status === "streaming"` and renders a stop button. The `status` value comes from `useChat`.

### `suggestion.tsx` — Suggestion Chips

```tsx
<Suggestions>
  {suggestions.map((s, i) => (
    <Suggestion key={i} suggestion={s} onClick={handleSuggestionClick} />
  ))}
</Suggestions>
```

### `loader.tsx` — Loading Spinner

A custom SVG spinner shown while AI is generating a response:

```tsx
import { Loader } from "~/components/ai-elements/loader";

// Show while waiting for response:
{
  (status === "submitted" || status === "streaming") && <Loader />;
}
```

---

## 9. UI Components — `ai/` (Feature Components)

### `ai-chat-interface.tsx` — Main Chat Component

This is the heart of the chat UI. It uses `useChat` from `@ai-sdk/react`.

**Critical AI SDK v5 patterns used here:**

```tsx
"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { nanoid } from "nanoid";

// In AI SDK v5, input state is managed OUTSIDE the hook
const [input, setInput] = useState("");

// Generate a stable ID for new conversations client-side
const [stableId] = useState(() => nanoid());

const { messages, sendMessage, status, regenerate, error } = useChat({
  id: stableId || conversationId,
  // Pass existing messages when loading a saved conversation
  messages: initialMessages.length > 0 ? initialMessages : undefined,
  transport: new DefaultChatTransport({
    api: "/api/chat",
    // AI SDK v5: Send only the last message + metadata (not full history)
    // The server loads previous messages from the database
    prepareSendMessagesRequest({ messages }) {
      return {
        body: {
          message: messages[messages.length - 1], // Only new message
          conversationId: conversationIdRef.current,
          courseId,
          noteId,
          model,
          temperature,
        },
      };
    },
  }),
  onFinish: async () => {
    // Called when streaming is complete
    // Good place to update URL or notify parent
  },
});

// Sending a message:
const handleSubmit = async (message: PromptInputMessage) => {
  sendMessage({ text: message.text || "" });
  setInput("");
};

// Regenerating a message:
<MessageAction
  onClick={() => regenerate({ messageId: message.id })}
  label="Retry"
>
  <RefreshCcwIcon />
</MessageAction>;
```

**Rendering messages (AI SDK v5 `parts` format):**

```tsx
{
  messages.map((message) => (
    <div key={message.id}>
      {(message.parts ?? []).map((part, i) => {
        if (part.type === "text") {
          return (
            <Message key={`${message.id}-${i}`} from={message.role}>
              <MessageContent>
                <MessageResponse className="prose prose-base max-w-none">
                  {part.text}
                </MessageResponse>
              </MessageContent>
            </Message>
          );
        }
        return null;
      })}
    </div>
  ));
}
```

**Status values** from `useChat` in AI SDK v5:

- `"idle"` — waiting for input
- `"submitted"` — message sent, waiting for first token
- `"streaming"` — receiving tokens
- `"error"` — an error occurred

### `conversation-history-sidebar.tsx` — Chat Sidebar

Loads and displays the user's past conversations via tRPC. Supports pagination with "Load More".

```tsx
const { data, refetch, isFetching } = api.ai.getConversations.useQuery(
  { limit },
  {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 30000, // 30 seconds fresh
  },
);
```

### `ai-health-status.tsx`

Status card showing if the AI backend is available. Polls every 30 seconds via `api.ai.healthCheck`.

### `quiz-generator-form.tsx`

Form that calls `api.ai.generateQuiz.useMutation()`. Accepts topic, question count, difficulty, and question types.

---

## 10. The AI Page (Route)

Location: `src/app/(student)/ai/[[...id]]/page.tsx`

The `[[...id]]` catch-all route handles both:

- `/ai` — new conversation
- `/ai/:conversationId` — existing conversation

**Key pattern: URL-based key for managing remounts**

```tsx
"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

export default function AIPage() {
  const router = useRouter();
  const params = useParams();
  const conversationIdFromUrl = params.id
    ? Array.isArray(params.id)
      ? params.id[0]
      : params.id
    : undefined;

  const [selectedConversationId, setSelectedConversationId] = useState(
    conversationIdFromUrl,
  );
  const [newChatKey, setNewChatKey] = useState(0);

  useEffect(() => {
    setSelectedConversationId(conversationIdFromUrl);
  }, [conversationIdFromUrl]);

  const handleNewChat = useCallback(() => {
    setSelectedConversationId(undefined);
    setNewChatKey((prev) => prev + 1);
    router.push("/ai");
  }, [router]);

  const handleConversationCreated = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
    // Use replaceState to update URL without triggering re-mount
    window.history.replaceState(null, "", `/ai/${conversationId}`);
  }, []);

  return (
    <div className="fixed inset-0 top-16 flex overflow-hidden">
      {/* Sidebar */}
      <div className="hidden h-full w-[280px] shrink-0 border-r lg:block">
        <ChatHistorySidebar
          selectedConversationId={selectedConversationId}
          onSelectConversation={(id) => {
            setSelectedConversationId(id);
            if (id) router.push(`/ai/${id}`);
            else router.push("/ai");
          }}
          onNewChat={handleNewChat}
        />
      </div>

      {/* Chat — use key to control remounting */}
      <div className="flex-1 overflow-hidden">
        <AIChatInterface
          key={conversationIdFromUrl || `new-${newChatKey}`}
          conversationId={selectedConversationId}
          onConversationCreated={handleConversationCreated}
        />
      </div>
    </div>
  );
}
```

**Why `window.history.replaceState` instead of `router.push` for new conversations?**
Because `router.push` causes a full component remount which interrupts the streaming response. `replaceState` silently updates the URL so the user can refresh/share the link without losing the chat.

---

## 11. How It All Connects — Data Flow

### New Conversation Flow

```
User types message → PromptInput → handleSubmit
  → sendMessage({ text }) via useChat
  → DefaultChatTransport sends POST /api/chat
    → body: { message: UIMessage, conversationId: nanoid(), courseId?, noteId? }
  → chat/route.ts:
    1. Auth check
    2. conversationId new → create AiConversation in DB (auto-generate title with AI)
    3. streamText() with Gemini
    4. Return toUIMessageStreamResponse()
  → AI SDK streams tokens to client
  → useChat populates `messages` array in real-time
  → onFinish: save new UIMessages to DB (AiMessage records)
  → onFinish callback: call onConversationCreated(conversationId)
  → window.history.replaceState updates URL to /ai/:id
```

### Existing Conversation Flow

```
User clicks sidebar item → router.push(/ai/:id)
  → URL changes → AIChatInterface remounts with new key
  → api.ai.getConversation.useQuery({ id }) loads from DB
  → Messages are passed as initialMessages to useChat
  → useChat renders existing conversation
  → User sends new message:
    → POST /api/chat with { message, conversationId }
    → Server loads previousMessages from DB + appends new message
    → Streams response
    → Saves only NEW messages to DB
```

### Quiz Generation Flow

```
QuizGeneratorForm → api.ai.generateQuiz.useMutation()
  → tRPC ai.generateQuiz procedure
  → generateQuiz() from quiz-generator.ts
    → models.pro (Gemini 2.5 Pro)
    → Returns JSON quiz structure
  → Validate with QuizSchema (Zod)
  → Save AiQuiz + AiQuizQuestion records to DB
  → Return quiz ID to client
  → Redirect to quiz view
```

---

## 12. Key Patterns & Gotchas

### AI SDK v5 — Most Important Differences

1. **No managed input**: `useChat` does NOT track the textarea value. You must use `useState` for `input` yourself.
2. **`sendMessage()` not `handleSubmit()`**: The hook exposes `sendMessage({ text })` instead of a form submit handler.
3. **`parts[]` not `content`**: Messages have `message.parts[].text`, not `message.content`. Always iterate over `parts`.
4. **`DefaultChatTransport`**: Replaces the plain `api` string option. Configure with `prepareSendMessagesRequest` to control what body is sent.
5. **Only send the last message**: The pattern is to send ONLY the latest message to the server. The server loads previous messages from its own database. This avoids re-sending the full conversation history on every request.
6. **`toUIMessageStreamResponse()`**: Server must return this (not `toDataStreamResponse()`). It includes message ID generation and a callback for post-stream saving.
7. **`convertToModelMessages()`**: Used server-side to convert `UIMessage[]` (with `parts`) to the format the model accepts.
8. **`createIdGenerator()`**: Use this for consistent server-side message ID generation that survives page refreshes.

### Conversation ID Strategy

- New conversations: generate a `nanoid()` client-side BEFORE sending the first message
- Store the ID in a `ref` (not state) so it doesn't trigger re-renders
- Pass this ID to the server on the first message — server creates the DB record with that ID
- After streaming completes, call `window.history.replaceState` to update the URL without remounting

### Message Persistence Format

Messages are stored in the `data` column as a complete `UIMessage` object (JSON). This is the v5 recommendation — store the full `UIMessage` structure, not just the text content. This preserves future compatibility with tool calls, multi-part messages, and metadata.

```typescript
// When saving:
await db.aiMessage.create({
  data: {
    id: msg.id,
    conversationId,
    role: msg.role.toUpperCase() as "USER" | "ASSISTANT" | "SYSTEM",
    data: msg as unknown as never, // Full UIMessage stored in Json column
    tokensUsed: ...,
  },
});

// When loading:
const uiMessage = msg.data as unknown as UIMessage;
return {
  id: uiMessage.id || msg.id,
  role: uiMessage.role,
  parts: uiMessage.parts,
} as UIMessage;
```

### Streaming Markdown

The `streamdown` package (`"streamdown": "^1.6.10"`) is used inside `message.tsx` for rendering markdown that streams in progressively. It handles the case where markdown syntax is incomplete mid-stream (e.g., a code block that hasn't closed yet).

### Auto-Scroll

The `use-stick-to-bottom` package automatically scrolls to the bottom as new tokens arrive. It stops scrolling if the user manually scrolls up (respecting their intent). The `ConversationScrollButton` appears when not at the bottom.

### Quiz JSON Parsing

The AI is instructed to return pure JSON, but sometimes wraps it in markdown code blocks (` ```json `). Always strip markdown fences before parsing:

````typescript
let cleanedText = result.text.trim();
if (cleanedText.startsWith("```json")) {
  cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
} else if (cleanedText.startsWith("```")) {
  cleanedText = cleanedText.replace(/```\n?/g, "");
}
const parsed = JSON.parse(cleanedText);
````

### Route Configuration

Both AI routes must have:

```typescript
export const runtime = "nodejs"; // NOT "edge" — Prisma requires Node.js runtime
export const maxDuration = 300; // Increase from default 10s for long AI responses
```

### The `[[...id]]` Catch-All Route

Using `[[...id]]` (double brackets = optional catch-all) means the route handles:

- `/ai` → `params.id` is `undefined`
- `/ai/abc123` → `params.id` is `["abc123"]`

Always normalize: `Array.isArray(params.id) ? params.id[0] : params.id`

---

## Quick Setup Checklist for a New Project

- [ ] Install packages: `npm install ai @ai-sdk/google @ai-sdk/react nanoid use-stick-to-bottom streamdown`
- [ ] Add `GOOGLE_GENERATIVE_AI_API_KEY` to `.env`
- [ ] Add env validation to `src/env.js`
- [ ] Create `src/server/ai/` folder with `config.ts`, `gemini.ts`, `types.ts`, `prompts.ts`, `index.ts`
- [ ] Add Prisma models: `AiConversation`, `AiMessage`, `AiMessageRole` enum
- [ ] Add optional models: `AiGeneratedNote`, `AiQuiz`, `AiStudyPlan` and related
- [ ] Create `src/app/api/chat/route.ts` streaming endpoint
- [ ] Create tRPC `aiRouter` and register in `root.ts`
- [ ] Create `src/components/ai-elements/` primitives: `conversation.tsx`, `message.tsx`, `prompt-input.tsx`, `suggestion.tsx`, `loader.tsx`
- [ ] Create `src/components/ai/ai-chat-interface.tsx` featuring `useChat` from `@ai-sdk/react`
- [ ] Create `src/components/ai/conversation-history-sidebar.tsx`
- [ ] Create `src/app/(student)/ai/[[...id]]/page.tsx` with URL-based key pattern
- [ ] Run `npm run db:generate` to apply schema changes
