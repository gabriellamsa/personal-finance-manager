import { beforeEach, describe, expect, it, vi } from "vitest";

const registerUserMock = vi.hoisted(() => vi.fn());
const createSessionTokenMock = vi.hoisted(() => vi.fn());
const setSessionCookieMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/auth/auth.service", () => ({
  registerUser: registerUserMock,
}));

vi.mock("@/lib/auth/session", () => ({
  createSessionToken: createSessionTokenMock,
  setSessionCookie: setSessionCookieMock,
}));

const routeModulePromise = import("@/app/api/auth/register/route");

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a validation response for malformed payloads", async () => {
    const { POST } = await routeModulePromise;

    const response = await POST(
      new Request("http://localhost:3000/api/auth/register", {
        body: JSON.stringify({
          confirmPassword: "",
          email: "invalid-email",
          name: "",
          password: "short",
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
          confirmPassword: [
            "Confirm your password.",
            "Passwords do not match.",
          ],
          email: ["Enter a valid email address."],
          name: ["Name must be at least 2 characters long."],
          password: [
            "Password must be at least 8 characters long.",
            "Password must include at least one uppercase letter.",
            "Password must include at least one number.",
          ],
        },
        message: "The submitted data is invalid.",
      },
      success: false,
    });
    expect(registerUserMock).not.toHaveBeenCalled();
  });

  it("creates a session and returns the authenticated user", async () => {
    const { POST } = await routeModulePromise;

    registerUserMock.mockResolvedValue({
      currencyCode: "USD",
      email: "jane@example.com",
      id: "user-1",
      name: "Jane Doe",
      timezone: "UTC",
    });
    createSessionTokenMock.mockResolvedValue("signed-session-token");

    const response = await POST(
      new Request("http://localhost:3000/api/auth/register", {
        body: JSON.stringify({
          confirmPassword: "Password123",
          email: "jane@example.com",
          name: "Jane Doe",
          password: "Password123",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      }),
    );

    expect(createSessionTokenMock).toHaveBeenCalledWith({
      currencyCode: "USD",
      email: "jane@example.com",
      id: "user-1",
      name: "Jane Doe",
      timezone: "UTC",
    });
    expect(setSessionCookieMock).toHaveBeenCalledWith("signed-session-token");
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      data: {
        user: {
          currencyCode: "USD",
          email: "jane@example.com",
          id: "user-1",
          name: "Jane Doe",
          timezone: "UTC",
        },
      },
      success: true,
    });
  });
});
