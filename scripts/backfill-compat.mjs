#!/usr/bin/env node
/**
 * Safe upgrade backfill — fills missing project slugs / presentationMode.
 * Does not wipe CMS content.
 *
 * Usage: node scripts/backfill-compat.mjs
 */
import { PrismaClient } from "@prisma/client";
import { backfillProjects } from "../lib/migrate/index.js";

const prisma = new PrismaClient();

async function main() {
  const result = await backfillProjects(prisma);
  console.log(
    `Backfill complete: ${result.updatedSlugs} slug(s), ${result.updatedModes} presentationMode(s) updated.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
