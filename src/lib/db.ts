import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// Build-time safety: if DATABASE_URL is undefined (which happens during
// `next build` page-data collection on Vercel when DATABASE_URL is set as
// a runtime-only env var), fall back to a placeholder so the PrismaClient
// constructor doesn't throw. Real queries will then fail at runtime, which
// is what we want — the route will return a 500 instead of breaking the
// whole build.
const datasourceUrl = process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder";

function createPrismaClient() {
  return new PrismaClient({
    log: ["error"],
    datasources: {
      db: {
        url: datasourceUrl,
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const db = prisma;
