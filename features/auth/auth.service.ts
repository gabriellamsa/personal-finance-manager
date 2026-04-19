import "server-only";

import { type Prisma } from "@prisma/client";

import { hashPassword, verifyPassword } from "@/lib/crypto/password";
import { prisma } from "@/lib/db/prisma";
import { ConflictError, ValidationError } from "@/lib/http/errors";
import {
  type ChangePasswordInput,
  type SignInInput,
  type SignUpInput,
} from "@/features/auth/auth.schemas";

const publicUserSelect = {
  currencyCode: true,
  email: true,
  id: true,
  name: true,
  timezone: true,
} satisfies Prisma.UserSelect;

export type AuthenticatedUser = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;

const sessionUserSelect = {
  ...publicUserSelect,
  sessionVersion: true,
} satisfies Prisma.UserSelect;

export type SessionAuthenticatedUser = Prisma.UserGetPayload<{
  select: typeof sessionUserSelect;
}>;

export function toAuthenticatedUser(
  user: SessionAuthenticatedUser,
): AuthenticatedUser {
  return {
    currencyCode: user.currencyCode,
    email: user.email,
    id: user.id,
    name: user.name,
    timezone: user.timezone,
  };
}

export async function registerUser(input: SignUpInput) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    throw new ConflictError("An account with this email already exists.");
  }

  const passwordHash = await hashPassword(input.password);

  return prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash,
    },
    select: sessionUserSelect,
  });
}

export async function authenticateUser(input: SignInInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
    select: {
      ...sessionUserSelect,
      passwordHash: true,
    },
  });

  if (!user) {
    throw new ValidationError("Invalid email or password.");
  }

  const isPasswordValid = await verifyPassword(user.passwordHash, input.password);

  if (!isPasswordValid) {
    throw new ValidationError("Invalid email or password.");
  }

  return {
    currencyCode: user.currencyCode,
    email: user.email,
    id: user.id,
    name: user.name,
    sessionVersion: user.sessionVersion,
    timezone: user.timezone,
  };
}

export async function changePassword(
  userId: string,
  input: ChangePasswordInput,
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      ...sessionUserSelect,
      passwordHash: true,
    },
  });

  if (!user) {
    throw new ValidationError("Unable to validate the current account.");
  }

  const isPasswordValid = await verifyPassword(
    user.passwordHash,
    input.currentPassword,
  );

  if (!isPasswordValid) {
    throw new ValidationError("Current password is incorrect.", {
      currentPassword: ["Current password is incorrect."],
    });
  }

  const passwordHash = await hashPassword(input.newPassword);

  return prisma.user.update({
    data: {
      passwordHash,
      sessionVersion: {
        increment: 1,
      },
    },
    select: sessionUserSelect,
    where: {
      id: userId,
    },
  });
}
