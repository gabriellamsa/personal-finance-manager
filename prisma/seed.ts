import { PrismaClient } from "@prisma/client";

import { DEFAULT_CATEGORIES } from "../features/categories/default-categories";

const prisma = new PrismaClient();

async function main() {
  await Promise.all(
    DEFAULT_CATEGORIES.map((category) =>
      prisma.category.upsert({
        where: {
          systemKey: category.systemKey,
        },
        update: {
          color: category.color,
          icon: category.icon,
          name: category.name,
          slug: category.slug,
          type: category.type,
        },
        create: {
          color: category.color,
          icon: category.icon,
          name: category.name,
          scope: "SYSTEM",
          slug: category.slug,
          systemKey: category.systemKey,
          type: category.type,
        },
      }),
    ),
  );
}

main()
  .catch((error) => {
    console.error("Failed to seed default categories.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
