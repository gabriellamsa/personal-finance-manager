import { beforeEach, describe, expect, it, vi } from "vitest";

const requireApiUserMock = vi.hoisted(() => vi.fn());
const updateProfileMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/session", () => ({
  requireApiUser: requireApiUserMock,
}));

vi.mock("@/features/profile/profile.service", () => ({
  updateProfile: updateProfileMock,
}));

const routeModulePromise = import("@/app/api/profile/route");

describe("/api/profile route handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireApiUserMock.mockResolvedValue({
      id: "user-1",
    });
  });

  it("returns validation feedback for unsupported preferences", async () => {
    const { PATCH } = await routeModulePromise;

    const response = await PATCH(
      new Request("http://localhost:3000/api/profile", {
        body: JSON.stringify({
          currencyCode: "FOO",
          email: "invalid-email",
          name: "J",
          timezone: "Mars/Phobos",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "PATCH",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "VALIDATION_ERROR",
        fieldErrors: {
          currencyCode: ["Choose a supported currency code."],
          email: ["Enter a valid email address."],
          name: ["Name must be at least 2 characters long."],
          timezone: ["Choose a supported time zone."],
        },
        message: "The submitted data is invalid.",
      },
      success: false,
    });
    expect(updateProfileMock).not.toHaveBeenCalled();
  });

  it("updates the profile for valid PATCH requests", async () => {
    const { PATCH } = await routeModulePromise;

    updateProfileMock.mockResolvedValue({
      createdAt: "2026-04-10T08:00:00.000Z",
      currencyCode: "BRL",
      email: "jane@example.com",
      id: "user-1",
      name: "Jane Doe",
      timezone: "America/Sao_Paulo",
      updatedAt: "2026-04-19T08:00:00.000Z",
    });

    const response = await PATCH(
      new Request("http://localhost:3000/api/profile", {
        body: JSON.stringify({
          currencyCode: "brl",
          email: "Jane@Example.com",
          name: "Jane Doe",
          timezone: "America/Sao_Paulo",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "PATCH",
      }),
    );

    expect(updateProfileMock).toHaveBeenCalledWith("user-1", {
      currencyCode: "BRL",
      email: "jane@example.com",
      name: "Jane Doe",
      timezone: "America/Sao_Paulo",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      data: {
        user: {
          createdAt: "2026-04-10T08:00:00.000Z",
          currencyCode: "BRL",
          email: "jane@example.com",
          id: "user-1",
          name: "Jane Doe",
          timezone: "America/Sao_Paulo",
          updatedAt: "2026-04-19T08:00:00.000Z",
        },
      },
      success: true,
    });
  });
});
