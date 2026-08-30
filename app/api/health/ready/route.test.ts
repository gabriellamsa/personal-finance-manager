import { beforeEach, describe, expect, it, vi } from "vitest";

const runReadinessChecksMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/health/health-service", () => ({
  runReadinessChecks: runReadinessChecksMock,
}));

import { GET } from "@/app/api/health/ready/route";

const service = {
  name: "personal-finance-manager",
  release: "local",
  version: "0.1.0",
};

describe("GET /api/health/ready", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns ready with database latency", async () => {
    runReadinessChecksMock.mockResolvedValue({
      response: {
        checks: {
          configuration: { status: "pass" },
          database: { latencyMs: 8.42, status: "pass" },
        },
        requestId: "ready-check-001",
        service,
        status: "ready",
        timestamp: "2026-08-29T12:00:00.000Z",
      },
      statusCode: 200,
    });

    const response = await GET(
      new Request("http://localhost:3000/api/health/ready", {
        headers: {
          "x-request-id": "ready-check-001",
        },
      }),
    );
    const body = await response.json();

    expect(runReadinessChecksMock).toHaveBeenCalledWith("ready-check-001");
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-request-id")).toBe("ready-check-001");
    expect(body).toMatchObject({
      checks: {
        configuration: { status: "pass" },
        database: { latencyMs: 8.42, status: "pass" },
      },
      status: "ready",
    });
  });

  it("returns a sanitized 503 when the database is unavailable", async () => {
    runReadinessChecksMock.mockResolvedValue({
      failure: {
        component: "database",
        error: new Error(
          "postgresql://admin:secret@database.internal:5432/private",
        ),
      },
      response: {
        checks: {
          configuration: { status: "pass" },
          database: {
            code: "DATABASE_UNAVAILABLE",
            latencyMs: 2_000,
            status: "fail",
          },
        },
        requestId: "ready-check-002",
        service,
        status: "not_ready",
        timestamp: "2026-08-29T12:00:00.000Z",
      },
      statusCode: 503,
    });

    const response = await GET(
      new Request("http://localhost:3000/api/health/ready", {
        headers: {
          "x-request-id": "ready-check-002",
        },
      }),
    );
    const body = await response.json();
    const serializedBody = JSON.stringify(body);

    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBe("5");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-request-id")).toBe("ready-check-002");
    expect(body.checks.database).toEqual({
      code: "DATABASE_UNAVAILABLE",
      latencyMs: 2_000,
      status: "fail",
    });
    expect(serializedBody).not.toContain("database.internal");
    expect(serializedBody).not.toContain("admin:secret");
    expect(serializedBody).not.toContain("stack");
  });
});
