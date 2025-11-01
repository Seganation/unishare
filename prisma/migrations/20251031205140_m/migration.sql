-- DropIndex
DROP INDEX "public"."Note_courseId_key";

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "icon" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Untitled';

-- CreateIndex
CREATE INDEX "Note_courseId_idx" ON "Note"("courseId");

-- CreateIndex
CREATE INDEX "Note_courseId_order_idx" ON "Note"("courseId", "order");

-- CreateIndex
CREATE INDEX "Note_parentId_idx" ON "Note"("parentId");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;
