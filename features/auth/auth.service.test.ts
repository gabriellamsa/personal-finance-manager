import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConflictError, ValidationError } from "@/lib/http/errors";

const userFindUniqueMock = vi.hoisted(() => vi.fn());
const userCreateMock = vi.hoisted(() => vi.fn());
const userUpdateMock = vi.hoisted(() => vi.fn());
const hashPasswordMock = vi.hoisted(() => vi.fn());
const verifyPasswordMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: {
      create: userCreateMock,
      findUnique: userFindUniqueMock,
      update: userUpdateMock,
    },
  },
}));

vi.mock("@/lib/crypto/password", () => ({
  hashPassword: hashPasswordMock,
  verifyPassword: verifyPasswordMock,
}));

import {
  authenticateUser,
  changePassword,
  registerUser,
} from "@/features/auth/auth.service";

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new user with a hashed password", async () => {
    hashPasswordMock.mockResolvedValue("hashed-password");
    userFindUniqueMock.mockResolvedValue(null);
    userCreateMock.mockResolvedValue({
      currencyCode: "USD",
      email: "jane@example.com",
      id: "user-1",
      name: "Jane Doe",
      sessionVersion: 0,
      timezone: "UTC",
    });

    const result = await registerUser({
      confirmPassword: "Password123",
      email: "jane@example.com",
      name: "Jane Doe",
      password: "Password123",
    });

    expect(hashPasswordMock).toHaveBeenCalledWith("Password123");
    expect(userCreateMock).toHaveBeenCalledWith({
      data: {
        email: "jane@example.com",
        name: "Jane Doe",
        passwordHash: "hashed-password",
      },
      select: {
        currencyCode: true,
        email: true,
        id: true,
        name: true,
        sessionVersion: true,
        timezone: true,
      },
    });
    expect(result).toEqual({
      currencyCode: "USD",
      email: "jane@example.com",
      id: "user-1",
      name: "Jane Doe",
      sessionVersion: 0,
      timezone: "UTC",
    });
  });

  it("rejects duplicate emails during registration", async () => {
    userFindUniqueMock.mockResolvedValue({
      id: "existing-user",
    });

    await expect(
      registerUser({
        confirmPassword: "Password123",
        email: "jane@example.com",
        name: "Jane Doe",
        password: "Password123",
      }),
    ).rejects.toBeInstanceOf(ConflictError);

    expect(hashPasswordMock).not.toHaveBeenCalled();
    expect(userCreateMock).not.toHaveBeenCalled();
  });

  it("returns the public user payload when credentials are valid", async () => {
    userFindUniqueMock.mockResolvedValue({
      currencyCode: "USD",
      email: "jane@example.com",
      id: "user-1",
      name: "Jane Doe",
      passwordHash: "hashed-password",
      sessionVersion: 0,
      timezone: "UTC",
    });
    verifyPasswordMock.mockResolvedValue(true);

    const result = await authenticateUser({
      email: "jane@example.com",
      password: "Password123",
    });

    expect(verifyPasswordMock).toHaveBeenCalledWith(
      "hashed-password",
      "Password123",
    );
    expect(result).toEqual({
      currencyCode: "USD",
      email: "jane@example.com",
      id: "user-1",
      name: "Jane Doe",
      sessionVersion: 0,
      timezone: "UTC",
    });
  });

  it("rejects invalid credentials during authentication", async () => {
    userFindUniqueMock.mockResolvedValue({
      currencyCode: "USD",
      email: "jane@example.com",
      id: "user-1",
      name: "Jane Doe",
      passwordHash: "hashed-password",
      sessionVersion: 0,
      timezone: "UTC",
    });
    verifyPasswordMock.mockResolvedValue(false);

    await expect(
      authenticateUser({
        email: "jane@example.com",
        password: "wrong-password",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("changes the password and increments the session version", async () => {
    userFindUniqueMock.mockResolvedValue({
      currencyCode: "USD",
      email: "jane@example.com",
      id: "user-1",
      name: "Jane Doe",
      passwordHash: "hashed-password",
      sessionVersion: 2,
      timezone: "UTC",
    });
    verifyPasswordMock.mockResolvedValue(true);
    hashPasswordMock.mockResolvedValue("new-hashed-password");
    userUpdateMock.mockResolvedValue({
      currencyCode: "USD",
      email: "jane@example.com",
      id: "user-1",
      name: "Jane Doe",
      sessionVersion: 3,
      timezone: "UTC",
    });

    const result = await changePassword("user-1", {
      confirmNewPassword: "NewPassword123",
      currentPassword: "Password123",
      newPassword: "NewPassword123",
    });

    expect(verifyPasswordMock).toHaveBeenCalledWith(
      "hashed-password",
      "Password123",
    );
    expect(hashPasswordMock).toHaveBeenCalledWith("NewPassword123");
    expect(userUpdateMock).toHaveBeenCalledWith({
      data: {
        passwordHash: "new-hashed-password",
        sessionVersion: {
          increment: 1,
        },
      },
      select: {
        currencyCode: true,
        email: true,
        id: true,
        name: true,
        sessionVersion: true,
        timezone: true,
      },
      where: {
        id: "user-1",
      },
    });
    expect(result).toEqual({
      currencyCode: "USD",
      email: "jane@example.com",
      id: "user-1",
      name: "Jane Doe",
      sessionVersion: 3,
      timezone: "UTC",
    });
  });
});
