import { PrismaClient } from "@prisma/client";
import defaults from "../lib/default-portfolio.json";
const prisma = new PrismaClient();
async function main() {
  await prisma.portfolio.upsert({ where: { id: "main" }, update: {}, create: { id: "main", content: defaults } });
  console.log("Original portfolio data seeded without altering its UI.");
}
main().finally(() => prisma.$disconnect());
