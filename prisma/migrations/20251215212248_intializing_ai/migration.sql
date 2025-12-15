-- CreateEnum
CREATE TYPE "AiMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AiGenerationType" AS ENUM ('GENERATE', 'IMPROVE', 'SUMMARIZE', 'EXPAND');

-- CreateEnum
CREATE TYPE "QuizQuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER');

-- CreateTable
CREATE TABLE "AiConversation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Conversation',
    "userId" TEXT NOT NULL,
    "courseId" TEXT,
    "noteId" TEXT,
    "model" TEXT NOT NULL DEFAULT 'phi3:3.8b',
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "AiMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiGeneratedNote" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "contentBefore" JSONB,
    "contentAfter" JSONB NOT NULL,
    "type" "AiGenerationType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiGeneratedNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiQuiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "courseId" TEXT,
    "noteId" TEXT,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'phi3:3.8b',
    "tokensUsed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiQuiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiQuizQuestion" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" "QuizQuestionType" NOT NULL,
    "options" JSONB,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AiQuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiQuizAttempt" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AiQuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiQuizAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "AiQuizAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiStudyPlan" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'phi3:3.8b',
    "tokensUsed" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiStudyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiStudyPlanWeek" (
    "id" TEXT NOT NULL,
    "studyPlanId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "goals" TEXT[],

    CONSTRAINT "AiStudyPlanWeek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiStudyPlanTask" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "estimatedMinutes" INTEGER,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AiStudyPlanTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiConversation_userId_idx" ON "AiConversation"("userId");

-- CreateIndex
CREATE INDEX "AiConversation_courseId_idx" ON "AiConversation"("courseId");

-- CreateIndex
CREATE INDEX "AiConversation_noteId_idx" ON "AiConversation"("noteId");

-- CreateIndex
CREATE INDEX "AiMessage_conversationId_idx" ON "AiMessage"("conversationId");

-- CreateIndex
CREATE INDEX "AiMessage_createdAt_idx" ON "AiMessage"("createdAt");

-- CreateIndex
CREATE INDEX "AiGeneratedNote_noteId_idx" ON "AiGeneratedNote"("noteId");

-- CreateIndex
CREATE INDEX "AiGeneratedNote_userId_idx" ON "AiGeneratedNote"("userId");

-- CreateIndex
CREATE INDEX "AiGeneratedNote_type_idx" ON "AiGeneratedNote"("type");

-- CreateIndex
CREATE INDEX "AiQuiz_userId_idx" ON "AiQuiz"("userId");

-- CreateIndex
CREATE INDEX "AiQuiz_courseId_idx" ON "AiQuiz"("courseId");

-- CreateIndex
CREATE INDEX "AiQuiz_noteId_idx" ON "AiQuiz"("noteId");

-- CreateIndex
CREATE INDEX "AiQuizQuestion_quizId_idx" ON "AiQuizQuestion"("quizId");

-- CreateIndex
CREATE INDEX "AiQuizAttempt_quizId_idx" ON "AiQuizAttempt"("quizId");

-- CreateIndex
CREATE INDEX "AiQuizAttempt_userId_idx" ON "AiQuizAttempt"("userId");

-- CreateIndex
CREATE INDEX "AiQuizAnswer_attemptId_idx" ON "AiQuizAnswer"("attemptId");

-- CreateIndex
CREATE INDEX "AiQuizAnswer_questionId_idx" ON "AiQuizAnswer"("questionId");

-- CreateIndex
CREATE INDEX "AiStudyPlan_userId_idx" ON "AiStudyPlan"("userId");

-- CreateIndex
CREATE INDEX "AiStudyPlan_courseId_idx" ON "AiStudyPlan"("courseId");

-- CreateIndex
CREATE INDEX "AiStudyPlanWeek_studyPlanId_idx" ON "AiStudyPlanWeek"("studyPlanId");

-- CreateIndex
CREATE INDEX "AiStudyPlanTask_weekId_idx" ON "AiStudyPlanTask"("weekId");

-- AddForeignKey
ALTER TABLE "AiConversation" ADD CONSTRAINT "AiConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiConversation" ADD CONSTRAINT "AiConversation_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiConversation" ADD CONSTRAINT "AiConversation_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiMessage" ADD CONSTRAINT "AiMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiGeneratedNote" ADD CONSTRAINT "AiGeneratedNote_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiGeneratedNote" ADD CONSTRAINT "AiGeneratedNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuiz" ADD CONSTRAINT "AiQuiz_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuiz" ADD CONSTRAINT "AiQuiz_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuiz" ADD CONSTRAINT "AiQuiz_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuizQuestion" ADD CONSTRAINT "AiQuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "AiQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuizAttempt" ADD CONSTRAINT "AiQuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "AiQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuizAttempt" ADD CONSTRAINT "AiQuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuizAnswer" ADD CONSTRAINT "AiQuizAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "AiQuizAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiQuizAnswer" ADD CONSTRAINT "AiQuizAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "AiQuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiStudyPlan" ADD CONSTRAINT "AiStudyPlan_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiStudyPlan" ADD CONSTRAINT "AiStudyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiStudyPlanWeek" ADD CONSTRAINT "AiStudyPlanWeek_studyPlanId_fkey" FOREIGN KEY ("studyPlanId") REFERENCES "AiStudyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiStudyPlanTask" ADD CONSTRAINT "AiStudyPlanTask_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "AiStudyPlanWeek"("id") ON DELETE CASCADE ON UPDATE CASCADE;
