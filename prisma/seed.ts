import { PrismaClient } from "../app/generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.role.upsert({
    where: { role_id: 1 },
    update: {},
    create: {
      role_id: 1,
      role_name: "USER",
    },
  });

  await prisma.role.upsert({
    where: { role_id: 2 },
    update: {},
    create: {
      role_id: 2,
      role_name: "ADMIN",
    },
  });

  console.log("Seeded roles.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });