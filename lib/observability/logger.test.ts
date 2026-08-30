import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  logEvent,
  sanitizeLogDetails,
  serializeError,
} from "@/lib/observability/logger";

describe("structured logger", () => {
  beforeEach(() => {
    vi.stubEnv("LOG_LEVEL", "debug");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("writes one valid JSON line with operational fields", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

    logEvent({
      durationMs: 12.34,
      event: "http.request.completed",
      level: "info",
      message: "HTTP request completed",
      method: "GET",
      path: "/api/transactions",
      requestId: "request-1",
      route: "/api/transactions",
      statusCode: 200,
    });

    expect(logSpy).toHaveBeenCalledOnce();
    const line = logSpy.mock.calls[0]?.[0];
    expect(typeof line).toBe("string");
    expect(JSON.parse(String(line))).toMatchObject({
      durationMs: 12.34,
      event: "http.request.completed",
      level: "info",
      method: "GET",
      path: "/api/transactions",
      requestId: "request-1",
      service: "personal-finance-manager",
      statusCode: 200,
    });
    expect(String(line)).not.toContain("\n");
  });

  it("redacts prohibited fields and sensitive string patterns", () => {
    const sanitized = sanitizeLogDetails({
      authorization: "Bearer top-secret",
      databaseUrl: "postgresql://admin:secret@database.internal/private",
      email: "jane@example.com",
      nested: {
        amountInCents: 5000,
        description: "Rent payment",
        passwordConfirmation: "Password123",
      },
      optional: undefined,
    });
    const serialized = JSON.stringify(sanitized);

    expect(serialized).not.toContain("top-secret");
    expect(serialized).not.toContain("database.internal");
    expect(serialized).not.toContain("jane@example.com");
    expect(serialized).not.toContain("Password123");
    expect(serialized).not.toContain("Rent payment");
    expect(serialized).not.toContain("optional");
  });

  it("sanitizes unknown errors and never includes connection strings", () => {
    const serialized = JSON.stringify(
      serializeError(
        new Error(
          "Connection failed for postgresql://admin:secret@db.internal/private",
        ),
      ),
    );

    expect(serialized).toContain("Unexpected error details withheld.");
    expect(serialized).not.toContain("admin:secret");
    expect(serialized).not.toContain("db.internal");
  });

  it("does not throw for circular metadata", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    vi.spyOn(console, "log").mockImplementation(() => undefined);

    expect(() =>
      logEvent({
        details: circular,
        event: "test.circular",
        level: "info",
        message: "Circular metadata",
      }),
    ).not.toThrow();
  });
});
