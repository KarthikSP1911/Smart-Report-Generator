import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient({
  log: ["warn", "error"],
});

export default prisma;