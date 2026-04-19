import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { ConflictError, NotFoundError } from "@/lib/http/errors";
import type { UpdateProfileInput } from "@/features/profile/profile.schemas";

const profileUserSelect = {
  createdAt: true,
  currencyCode: true,
  email: true,
  id: true,
  name: true,
  timezone: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type ProfileUser = Prisma.UserGetPayload<{
  select: typeof profileUserSelect;
}>;

export async function getProfileSettings(userId: string) {
  const [user, transactionCount, customCategoryCount] = await Promise.all([
    prisma.user.findUnique({
      select: profileUserSelect,
      where: {
        id: userId,
      },
    }),
    prisma.transaction.count({
      where: {
        userId,
      },
    }),
    prisma.category.count({
      where: {
        scope: "CUSTOM",
        userId,
      },
    }),
  ]);

  if (!user) {
    throw new NotFoundError("The requested profile could not be found.");
  }

  return {
    customCategoryCount,
    transactionCount,
    user,
  };
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const currentUser = await prisma.user.findUnique({
    select: {
      id: true,
    },
    where: {
      id: userId,
    },
  });

  if (!currentUser) {
    throw new NotFoundError("The requested profile could not be found.");
  }

  const userWithEmail = await prisma.user.findUnique({
    select: {
      id: true,
    },
    where: {
      email: input.email,
    },
  });

  if (userWithEmail && userWithEmail.id !== userId) {
    throw new ConflictError("An account with this email already exists.");
  }

  return prisma.user.update({
    data: {
      currencyCode: input.currencyCode,
      email: input.email,
      name: input.name,
      timezone: input.timezone,
    },
    select: profileUserSelect,
    where: {
      id: userId,
    },
  });
}
