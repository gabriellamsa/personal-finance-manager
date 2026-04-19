import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConflictError, ValidationError } from "@/lib/http/errors";

const categoryCreateManyMock = vi.hoisted(() => vi.fn());
const categoryFindFirstMock = vi.hoisted(() => vi.fn());
const categoryCreateMock = vi.hoisted(() => vi.fn());
const categoryUpdateMock = vi.hoisted(() => vi.fn());
const categoryDeleteMock = vi.hoisted(() => vi.fn());
const transactionCountMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    category: {
      create: categoryCreateMock,
      createMany: categoryCreateManyMock,
      delete: categoryDeleteMock,
      findFirst: categoryFindFirstMock,
      update: categoryUpdateMock,
    },
    transaction: {
      count: transactionCountMock,
    },
  },
}));

import {
  createCategory,
  deleteCustomCategory,
  updateCustomCategory,
} from "@/features/categories/categories.service";

describe("categories.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    categoryCreateManyMock.mockResolvedValue({
      count: 0,
    });
  });

  it("creates a custom category with a unique slug", async () => {
    categoryFindFirstMock.mockResolvedValueOnce(null);
    categoryCreateMock.mockResolvedValue({
      color: "#0F766E",
      icon: "tag",
      id: "category-1",
      name: "Side Hustle",
      scope: "CUSTOM",
      slug: "side-hustle",
      systemKey: null,
      type: "INCOME",
    });

    const result = await createCategory("user-1", {
      color: "#0F766E",
      name: "Side Hustle",
      type: "INCOME",
    });

    expect(categoryCreateMock).toHaveBeenCalledWith({
      data: {
        color: "#0F766E",
        icon: "tag",
        name: "Side Hustle",
        scope: "CUSTOM",
        slug: "side-hustle",
        type: "INCOME",
        userId: "user-1",
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
    expect(result.slug).toBe("side-hustle");
  });

  it("prevents changing the category type while transactions are assigned", async () => {
    categoryFindFirstMock.mockResolvedValue({
      color: "#0F766E",
      icon: "tag",
      id: "category-1",
      name: "Consulting",
      scope: "CUSTOM",
      slug: "consulting",
      systemKey: null,
      type: "INCOME",
      userId: "user-1",
    });
    transactionCountMock.mockResolvedValue(3);

    await expect(
      updateCustomCategory("user-1", "category-1", {
        color: "#0F766E",
        name: "Consulting",
        type: "EXPENSE",
      }),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(categoryUpdateMock).not.toHaveBeenCalled();
  });

  it("updates a custom category when the type remains consistent", async () => {
    categoryFindFirstMock
      .mockResolvedValueOnce({
        color: "#0F766E",
        icon: "tag",
        id: "category-1",
        name: "Consulting",
        scope: "CUSTOM",
        slug: "consulting",
        systemKey: null,
        type: "INCOME",
        userId: "user-1",
      })
      .mockResolvedValueOnce(null);
    transactionCountMock.mockResolvedValue(2);
    categoryUpdateMock.mockResolvedValue({
      color: "#1D4ED8",
      icon: "tag",
      id: "category-1",
      name: "Client Work",
      scope: "CUSTOM",
      slug: "client-work",
      systemKey: null,
      type: "INCOME",
    });

    const result = await updateCustomCategory("user-1", "category-1", {
      color: "#1D4ED8",
      name: "Client Work",
      type: "INCOME",
    });

    expect(result.transactionCount).toBe(2);
    expect(result.name).toBe("Client Work");
  });

  it("blocks deletion when transactions still reference the category", async () => {
    categoryFindFirstMock.mockResolvedValue({
      color: "#0F766E",
      icon: "tag",
      id: "category-1",
      name: "Consulting",
      scope: "CUSTOM",
      slug: "consulting",
      systemKey: null,
      type: "INCOME",
      userId: "user-1",
    });
    transactionCountMock.mockResolvedValue(1);

    await expect(
      deleteCustomCategory("user-1", "category-1"),
    ).rejects.toBeInstanceOf(ConflictError);

    expect(categoryDeleteMock).not.toHaveBeenCalled();
  });
});
