import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";

const prisma = new PrismaClient();

async function testLogin() {
  const email = "admin@unishare.com";
  const password = "admin123";

  console.log("Testing login for:", email);
  console.log("Password:", password);
  console.log("---");

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log("❌ User not found in database");
    return;
  }

  console.log("✅ User found:", {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  console.log("\nPassword hash in DB:", user.password.substring(0, 20) + "...");

  const isValid = await compare(password, user.password);
  console.log("\nPassword validation:", isValid ? "✅ VALID" : "❌ INVALID");

  await prisma.$disconnect();
}

testLogin().catch(console.error);
