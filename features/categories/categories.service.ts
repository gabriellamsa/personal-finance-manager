import "server-only";

import type { Prisma, TransactionType } from "@prisma/client";

import { DEFAULT_CATEGORIES } from "@/features/categories/default-categories";
import type { CategoryListItem } from "@/features/categories/categories.types";
import { prisma } from "@/lib/db/prisma";
import { ConflictError, NotFoundError } from "@/lib/http/errors";
import { slugify } from "@/lib/utils/slugify";
import type { CreateCategoryInput } from "@/features/categories/categories.schemas";

async function ensureSystemCategories() {
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((category) => ({
      color: category.color,
      icon: category.icon,
      name: category.name,
      scope: "SYSTEM",
      slug: category.slug,
      systemKey: category.systemKey,
      type: category.type,
    })),
    skipDuplicates: true,
  });
}

function toCategoryListItem(
  category: Prisma.CategoryGetPayload<{
    select: {
      color: true;
      icon: true;
      id: true;
      name: true;
      scope: true;
      slug: true;
      systemKey: true;
      type: true;
    };
  }>,
  usage?: {
    totalAmountInCents: number;
    transactionCount: number;
  },
): CategoryListItem {
  return {
    color: category.color,
    icon: category.icon,
    id: category.id,
    name: category.name,
    scope: category.scope,
    slug: category.slug,
    systemKey: category.systemKey,
    totalAmountInCents: usage?.totalAmountInCents ?? 0,
    transactionCount: usage?.transactionCount ?? 0,
    type: category.type,
  };
}

async function generateUniqueSlug(
  userId: string,
  name: string,
  type: TransactionType,
) {
  const baseSlug = slugify(name);
  let candidate = baseSlug;
  let suffix = 1;

  while (true) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        slug: candidate,
        type,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!existingCategory) {
      return candidate;
    }

    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
}

export async function listAvailableCategories(userId: string) {
  await ensureSystemCategories();

  const [categories, usage] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ type: "asc" }, { scope: "asc" }, { name: "asc" }],
      select: {
        color: true,
        icon: true,
        id: true,
        name: true,
        scope: true,
        slug: true,
        systemKey: true,
        type: true,
      },
      where: {
        OR: [{ scope: "SYSTEM" }, { userId }],
      },
    }),
    prisma.transaction.groupBy({
      _count: {
        _all: true,
      },
      _sum: {
        amountInCents: true,
      },
      by: ["categoryId"],
      where: {
        userId,
      },
    }),
  ]);

  const usageByCategoryId = new Map(
    usage.map((item) => [
      item.categoryId,
      {
        totalAmountInCents: item._sum.amountInCents ?? 0,
        transactionCount: item._count._all,
      },
    ]),
  );

  return categories.map((category) =>
    toCategoryListItem(category, usageByCategoryId.get(category.id)),
  );
}

export async function createCategory(userId: string, input: CreateCategoryInput) {
  const slug = await generateUniqueSlug(userId, input.name, input.type);

  try {
    const category = await prisma.category.create({
      data: {
        color: input.color,
        icon: "tag",
        name: input.name,
        scope: "CUSTOM",
        slug,
        type: input.type,
        userId,
      },
      select: {
        color: true,
        icon: true,
        id: true,
        name: true,
        scope: true,
        slug: true,
        systemKey: true,
        type: true,
      },
    });

    return toCategoryListItem(category);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new ConflictError("A category with this name already exists.");
    }

    throw error;
  }
}

export async function getCategoryForUser(userId: string, categoryId: string) {
  await ensureSystemCategories();

  const category = await prisma.category.findFirst({
    select: {
      color: true,
      icon: true,
      id: true,
      name: true,
      scope: true,
      slug: true,
      systemKey: true,
      type: true,
    },
    where: {
      id: categoryId,
      OR: [{ scope: "SYSTEM" }, { userId }],
    },
  });

  if (!category) {
    throw new NotFoundError("The selected category does not exist.");
  }

  return category;
}
