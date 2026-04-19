import { beforeEach, describe, expect, it, vi } from "vitest";

const requireApiUserMock = vi.hoisted(() => vi.fn());
const updateCustomCategoryMock = vi.hoisted(() => vi.fn());
const deleteCustomCategoryMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/session", () => ({
  requireApiUser: requireApiUserMock,
}));

vi.mock("@/features/categories/categories.service", () => ({
  deleteCustomCategory: deleteCustomCategoryMock,
  updateCustomCategory: updateCustomCategoryMock,
}));

const routeModulePromise = import("@/app/api/categories/[categoryId]/route");

describe("/api/categories/[categoryId] route handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireApiUserMock.mockResolvedValue({
      id: "user-1",
    });
  });

  it("updates a custom category with valid PATCH payloads", async () => {
    const { PATCH } = await routeModulePromise;

    updateCustomCategoryMock.mockResolvedValue({
      color: "#1D4ED8",
      id: "category-1",
      icon: "tag",
      name: "Client Work",
      scope: "CUSTOM",
      slug: "client-work",
      systemKey: null,
      totalAmountInCents: 0,
      transactionCount: 0,
      type: "INCOME",
    });

    const response = await PATCH(
      new Request("http://localhost:3000/api/categories/category-1", {
        body: JSON.stringify({
          color: "#1D4ED8",
          name: "Client Work",
          type: "INCOME",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "PATCH",
      }),
      {
        params: Promise.resolve({
          categoryId: "category-1",
        }),
      },
    );

    expect(updateCustomCategoryMock).toHaveBeenCalledWith("user-1", "category-1", {
      color: "#1D4ED8",
      name: "Client Work",
      type: "INCOME",
    });
    expect(response.status).toBe(200);
  });

  it("deletes a custom category for valid DELETE requests", async () => {
    const { DELETE } = await routeModulePromise;

    deleteCustomCategoryMock.mockResolvedValue({
      deleted: true,
      id: "category-1",
    });

    const response = await DELETE(
      new Request("http://localhost:3000/api/categories/category-1", {
        method: "DELETE",
      }),
      {
        params: Promise.resolve({
          categoryId: "category-1",
        }),
      },
    );

    expect(deleteCustomCategoryMock).toHaveBeenCalledWith("user-1", "category-1");
    expect(response.status).toBe(200);
  });
});
