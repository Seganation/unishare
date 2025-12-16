/*
  Warnings:

  - You are about to drop the column `content` on the `AiMessage` table. All the data in the column will be lost.
  - Added the required column `data` to the `AiMessage` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add new `data` column as nullable first
ALTER TABLE "AiMessage" ADD COLUMN "data" JSONB;

-- Step 2: Migrate existing content to UIMessage format
UPDATE "AiMessage"
SET "data" = jsonb_build_object(
  'id', id,
  'role', CASE
    WHEN "role" = 'USER' THEN 'user'
    WHEN "role" = 'ASSISTANT' THEN 'assistant'
    WHEN "role" = 'SYSTEM' THEN 'system'
    ELSE LOWER("role"::text)
  END,
  'parts', jsonb_build_array(
    jsonb_build_object(
      'type', 'text',
      'text', "content"
    )
  )
)
WHERE "data" IS NULL;

-- Step 3: Make data column NOT NULL now that it's populated
ALTER TABLE "AiMessage" ALTER COLUMN "data" SET NOT NULL;

-- Step 4: Drop the old content column
ALTER TABLE "AiMessage" DROP COLUMN "content";

