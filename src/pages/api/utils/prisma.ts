import { PrismaClient } from "@prisma/client";

declare global {
  // Allow global `var` declarations
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query"], // Optional: Enables query logging in development
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
