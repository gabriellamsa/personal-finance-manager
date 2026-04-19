import { beforeEach, describe, expect, it, vi } from "vitest";

const requireApiUserMock = vi.hoisted(() => vi.fn());
const changePasswordMock = vi.hoisted(() => vi.fn());
const createSessionTokenMock = vi.hoisted(() => vi.fn());
const setSessionCookieMock = vi.hoisted(() => vi.fn());
const consumeAuthRateLimitMock = vi.hoisted(() => vi.fn());
const resetAuthRateLimitMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth/session", () => ({
  createSessionToken: createSessionTokenMock,
  requireApiUser: requireApiUserMock,
  setSessionCookie: setSessionCookieMock,
}));

vi.mock("@/features/auth/auth.service", () => ({
  changePassword: changePasswordMock,
  toAuthenticatedUser: (user: {
    currencyCode: string;
    email: string;
    id: string;
    name: string;
    timezone: string;
  }) => ({
    currencyCode: user.currencyCode,
    email: user.email,
    id: user.id,
    name: user.name,
    timezone: user.timezone,
  }),
}));

vi.mock("@/lib/security/auth-rate-limit", () => ({
  consumeAuthRateLimit: consumeAuthRateLimitMock,
  resetAuthRateLimit: resetAuthRateLimitMock,
}));

const routeModulePromise = import("@/app/api/auth/change-password/route");

describe("POST /api/auth/change-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireApiUserMock.mockResolvedValue({
      id: "user-1",
    });
  });

  it("returns a validation response for malformed payloads", async () => {
    const { POST } = await routeModulePromise;

    const response = await POST(
      new Request("http://localhost:3000/api/auth/change-password", {
        body: JSON.stringify({
          confirmNewPassword: "short",
          currentPassword: "",
          newPassword: "short",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "VALIDATION_ERROR",
        fieldErrors: {
          currentPassword: ["Current password is required."],
          newPassword: [
            "Password must be at least 8 characters long.",
            "Password must include at least one uppercase letter.",
            "Password must include at least one number.",
          ],
        },
        message: "The submitted data is invalid.",
      },
      success: false,
    });
    expect(changePasswordMock).not.toHaveBeenCalled();
  });

  it("updates the password, refreshes the session, and returns the user", async () => {
    const { POST } = await routeModulePromise;

    changePasswordMock.mockResolvedValue({
      currencyCode: "USD",
      email: "jane@example.com",
      id: "user-1",
      name: "Jane Doe",
      sessionVersion: 1,
      timezone: "UTC",
    });
    createSessionTokenMock.mockResolvedValue("signed-token");

    const response = await POST(
      new Request("http://localhost:3000/api/auth/change-password", {
        body: JSON.stringify({
          confirmNewPassword: "NewPassword123",
          currentPassword: "Password123",
          newPassword: "NewPassword123",
        }),
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "127.0.0.1",
        },
        method: "POST",
      }),
    );

    expect(consumeAuthRateLimitMock).toHaveBeenCalledWith(
      "change-password",
      "127.0.0.1:user-1",
    );
    expect(createSessionTokenMock).toHaveBeenCalledWith({
      currencyCode: "USD",
      email: "jane@example.com",
      id: "user-1",
      name: "Jane Doe",
      sessionVersion: 1,
      timezone: "UTC",
    });
    expect(setSessionCookieMock).toHaveBeenCalledWith("signed-token");
    expect(resetAuthRateLimitMock).toHaveBeenCalledWith(
      "change-password",
      "127.0.0.1:user-1",
    );
    expect(response.status).toBe(200);
  });
});
