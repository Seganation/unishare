/*
  Warnings:

  - You are about to drop the column `model` on the `AiConversation` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `AiGeneratedNote` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `AiQuiz` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `AiStudyPlan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AiConversation" DROP COLUMN "model";

-- AlterTable
ALTER TABLE "AiGeneratedNote" DROP COLUMN "model";

-- AlterTable
ALTER TABLE "AiQuiz" DROP COLUMN "model";

-- AlterTable
ALTER TABLE "AiStudyPlan" DROP COLUMN "model";

-- AlterTable
ALTER TABLE "Note" ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "content" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defaultTimetableId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_defaultTimetableId_fkey" FOREIGN KEY ("defaultTimetableId") REFERENCES "Timetable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
