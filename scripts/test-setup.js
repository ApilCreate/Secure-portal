const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("TestPass123!", 10);
  const user = await prisma.user.upsert({
    where: { email: "testlogin@example.com" },
    update: { password: hash, loginAttempts: 0, lockedUntil: null },
    create: {
      username: "testlogin",
      email: "testlogin@example.com",
      password: hash,
      isVerified: true,
    },
  });
  console.log("Test user ready:", user.email, user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
