/**
 * Script to fix existing articles with content = {} to content = []
 * This ensures BlockNote editor can load them properly
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Checking for articles with invalid content format...");

  // Find all articles
  const articles = await prisma.article.findMany({
    select: { id: true, title: true, content: true },
  });

  console.log(`📝 Found ${articles.length} total articles`);

  let fixedCount = 0;

  for (const article of articles) {
    // Check if content is an empty object or not an array
    if (
      !Array.isArray(article.content) ||
      (typeof article.content === "object" &&
        !Array.isArray(article.content) &&
        Object.keys(article.content).length === 0)
    ) {
      console.log(`  ⚠️  Fixing article: ${article.title}`);
      await prisma.article.update({
        where: { id: article.id },
        data: { content: [] },
      });
      fixedCount++;
    }
  }

  console.log(`✅ Fixed ${fixedCount} articles`);
  console.log("✨ Done!");
}

main()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
