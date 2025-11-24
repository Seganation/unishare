/*
  Warnings:

  - Added the required column `timetableId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "timetableId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Timetable" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Timetable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimetableCollaborator" (
    "id" TEXT NOT NULL,
    "timetableId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CollaboratorRole" NOT NULL DEFAULT 'VIEWER',
    "status" "CollaboratorStatus" NOT NULL DEFAULT 'PENDING',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "TimetableCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Timetable_createdBy_idx" ON "Timetable"("createdBy");

-- CreateIndex
CREATE INDEX "TimetableCollaborator_userId_idx" ON "TimetableCollaborator"("userId");

-- CreateIndex
CREATE INDEX "TimetableCollaborator_timetableId_idx" ON "TimetableCollaborator"("timetableId");

-- CreateIndex
CREATE INDEX "TimetableCollaborator_status_idx" ON "TimetableCollaborator"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TimetableCollaborator_timetableId_userId_key" ON "TimetableCollaborator"("timetableId", "userId");

-- CreateIndex
CREATE INDEX "Event_timetableId_idx" ON "Event"("timetableId");

-- AddForeignKey
ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableCollaborator" ADD CONSTRAINT "TimetableCollaborator_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "Timetable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableCollaborator" ADD CONSTRAINT "TimetableCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "Timetable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
