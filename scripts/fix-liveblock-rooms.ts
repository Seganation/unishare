// Script to update existing notes to use pageId as liveblockRoom
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating liveblockRoom values to use pageId...");

  // Get all notes
  const notes = await prisma.note.findMany();

  console.log(`Found ${notes.length} notes to update`);
  // Update each note to use its ID as the liveblockRoom
  for (const note of notes) {
    await prisma.note.update({
      where: { id: note.id },
      data: { liveblockRoom: note.id },
    });
    console.log(`Updated note ${note.id} - ${note.title}`);
  }

  console.log("✅ All notes updated successfully!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
