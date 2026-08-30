import { afterEach, describe, expect, it, vi } from "vitest";

const queryRawMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $queryRaw: queryRawMock,
  },
}));

import {
  checkDatabaseConnection,
  createLivenessResponse,
  runReadinessChecks,
} from "@/lib/health/health-service";

describe("health-service", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("creates liveness without querying the database", () => {
    const response = createLivenessResponse("request-live-1");

    expect(response).toEqual({
      processUptimeSeconds: expect.any(Number),
      requestId: "request-live-1",
      service: {
        name: "personal-finance-manager",
        release: "local",
        version: "0.1.0",
      },
      status: "ok",
      timestamp: expect.any(String),
    });
    expect(queryRawMock).not.toHaveBeenCalled();
  });

  it("uses a read-only query for the default database check", async () => {
    queryRawMock.mockResolvedValue([{ result: 1 }]);

    await checkDatabaseConnection();

    expect(queryRawMock).toHaveBeenCalledOnce();
    expect(queryRawMock.mock.calls[0]?.[0]).toEqual(["SELECT 1"]);
  });

  it("returns ready after configuration and database checks pass", async () => {
    const checkConfiguration = vi.fn();
    const checkDatabase = vi.fn().mockResolvedValue(undefined);
    const now = vi.fn().mockReturnValueOnce(10).mockReturnValueOnce(18.42);

    const result = await runReadinessChecks("request-ready-1", {
      checkConfiguration,
      checkDatabase,
      now,
      timeoutMs: 100,
    });

    expect(checkConfiguration).toHaveBeenCalledOnce();
    expect(checkDatabase).toHaveBeenCalledOnce();
    expect(result.statusCode).toBe(200);
    expect(result.response).toMatchObject({
      checks: {
        configuration: { status: "pass" },
        database: { latencyMs: 8.42, status: "pass" },
      },
      requestId: "request-ready-1",
      status: "ready",
    });
  });

  it("returns a sanitized unavailable result when the database fails", async () => {
    const internalError = new Error(
      "postgresql://admin:secret@database.internal:5432/private",
    );

    const result = await runReadinessChecks("request-ready-2", {
      checkConfiguration: vi.fn(),
      checkDatabase: vi.fn().mockRejectedValue(internalError),
      now: vi.fn().mockReturnValueOnce(20).mockReturnValueOnce(24),
      timeoutMs: 100,
    });

    expect(result.statusCode).toBe(503);
    expect(result.failure).toEqual({
      component: "database",
      error: internalError,
    });
    expect(result.response).toMatchObject({
      checks: {
        configuration: { status: "pass" },
        database: {
          code: "DATABASE_UNAVAILABLE",
          latencyMs: 4,
          status: "fail",
        },
      },
      status: "not_ready",
    });
    expect(JSON.stringify(result.response)).not.toContain("database.internal");
    expect(JSON.stringify(result.response)).not.toContain("secret");
  });

  it("returns not ready when the database check times out", async () => {
    vi.useFakeTimers();

    const resultPromise = runReadinessChecks("request-ready-3", {
      checkConfiguration: vi.fn(),
      checkDatabase: () => new Promise(() => undefined),
      timeoutMs: 250,
    });

    await vi.advanceTimersByTimeAsync(250);
    const result = await resultPromise;

    expect(result.statusCode).toBe(503);
    expect(result.response.checks.database).toMatchObject({
      code: "DATABASE_TIMEOUT",
      status: "fail",
    });
  });

  it("skips the database check when required configuration is invalid", async () => {
    const checkDatabase = vi.fn();

    const result = await runReadinessChecks("request-ready-4", {
      checkConfiguration: () => {
        throw new Error("Invalid environment variables.");
      },
      checkDatabase,
    });

    expect(result.statusCode).toBe(503);
    expect(result.response.checks).toEqual({
      configuration: { status: "fail" },
      database: { status: "skip" },
    });
    expect(checkDatabase).not.toHaveBeenCalled();
  });
});
