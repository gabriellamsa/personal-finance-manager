import { describe, expect, it, vi } from "vitest";

const queryRawMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $queryRaw: queryRawMock,
  },
}));

import { GET } from "@/app/api/health/live/route";

describe("GET /api/health/live", () => {
  it("returns an uncached liveness response without using Prisma", async () => {
    const response = await GET(
      new Request("http://localhost:3000/api/health/live", {
        headers: {
          "x-request-id": "live-check-001",
        },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-request-id")).toBe("live-check-001");
    expect(response.headers.get("server-timing")).toMatch(
      /^app;dur=\d+\.\d{2}$/,
    );
    expect(body).toMatchObject({
      requestId: "live-check-001",
      service: {
        name: "personal-finance-manager",
        release: "local",
        version: "0.1.0",
      },
      status: "ok",
    });
    expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(body.processUptimeSeconds).toEqual(expect.any(Number));
    expect(queryRawMock).not.toHaveBeenCalled();
    expect(JSON.stringify(body)).not.toContain("DATABASE_URL");
    expect(JSON.stringify(body)).not.toContain("JWT_SECRET");
  });
});
