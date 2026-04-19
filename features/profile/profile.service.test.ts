import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConflictError, NotFoundError } from "@/lib/http/errors";

const userFindUniqueMock = vi.hoisted(() => vi.fn());
const userUpdateMock = vi.hoisted(() => vi.fn());
const transactionCountMock = vi.hoisted(() => vi.fn());
const categoryCountMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    category: {
      count: categoryCountMock,
    },
    transaction: {
      count: transactionCountMock,
    },
    user: {
      findUnique: userFindUniqueMock,
      update: userUpdateMock,
    },
  },
}));

import {
  getProfileSettings,
  updateProfile,
} from "@/features/profile/profile.service";

describe("profile.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the profile snapshot with account counts", async () => {
    userFindUniqueMock.mockResolvedValue({
      createdAt: new Date("2026-04-10T08:00:00.000Z"),
      currencyCode: "USD",
      email: "jane@example.com",
      id: "user-1",
      name: "Jane Doe",
      timezone: "UTC",
      updatedAt: new Date("2026-04-18T09:30:00.000Z"),
    });
    transactionCountMock.mockResolvedValue(12);
    categoryCountMock.mockResolvedValue(3);

    const result = await getProfileSettings("user-1");

    expect(result).toEqual({
      customCategoryCount: 3,
      transactionCount: 12,
      user: {
        createdAt: new Date("2026-04-10T08:00:00.000Z"),
        currencyCode: "USD",
        email: "jane@example.com",
        id: "user-1",
        name: "Jane Doe",
        timezone: "UTC",
        updatedAt: new Date("2026-04-18T09:30:00.000Z"),
      },
    });
  });

  it("updates the profile when the target email is available", async () => {
    userFindUniqueMock
      .mockResolvedValueOnce({
        id: "user-1",
      })
      .mockResolvedValueOnce(null);
    userUpdateMock.mockResolvedValue({
      createdAt: new Date("2026-04-10T08:00:00.000Z"),
      currencyCode: "BRL",
      email: "jane@example.com",
      id: "user-1",
      name: "Jane Doe",
      timezone: "America/Sao_Paulo",
      updatedAt: new Date("2026-04-19T08:00:00.000Z"),
    });

    const result = await updateProfile("user-1", {
      currencyCode: "BRL",
      email: "jane@example.com",
      name: "Jane Doe",
      timezone: "America/Sao_Paulo",
    });

    expect(userUpdateMock).toHaveBeenCalledWith({
      data: {
        currencyCode: "BRL",
        email: "jane@example.com",
        name: "Jane Doe",
        timezone: "America/Sao_Paulo",
      },
      select: {
        createdAt: true,
        currencyCode: true,
        email: true,
        id: true,
        name: true,
        timezone: true,
        updatedAt: true,
      },
      where: {
        id: "user-1",
      },
    });
    expect(result).toEqual({
      createdAt: new Date("2026-04-10T08:00:00.000Z"),
      currencyCode: "BRL",
      email: "jane@example.com",
      id: "user-1",
      name: "Jane Doe",
      timezone: "America/Sao_Paulo",
      updatedAt: new Date("2026-04-19T08:00:00.000Z"),
    });
  });

  it("rejects duplicate emails owned by another account", async () => {
    userFindUniqueMock
      .mockResolvedValueOnce({
        id: "user-1",
      })
      .mockResolvedValueOnce({
        id: "user-2",
      });

    await expect(
      updateProfile("user-1", {
        currencyCode: "USD",
        email: "taken@example.com",
        name: "Jane Doe",
        timezone: "UTC",
      }),
    ).rejects.toBeInstanceOf(ConflictError);

    expect(userUpdateMock).not.toHaveBeenCalled();
  });

  it("rejects updates when the user does not exist", async () => {
    userFindUniqueMock.mockResolvedValueOnce(null);

    await expect(
      updateProfile("missing-user", {
        currencyCode: "USD",
        email: "jane@example.com",
        name: "Jane Doe",
        timezone: "UTC",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
