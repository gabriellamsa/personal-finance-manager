import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { withRouteObservability } from "@/lib/observability/route-observability";

describe("withRouteObservability", () => {
  beforeEach(() => {
    vi.stubEnv("LOG_LEVEL", "debug");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("preserves responses and adds correlation and timing headers", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const handler = withRouteObservability(
      "/api/example",
      async () =>
        Response.json(
          { preserved: true },
          {
            headers: {
              "Server-Timing": "db;dur=2.00",
              "X-Existing": "preserved",
            },
            status: 201,
          },
        ),
    );

    const response = await handler(
      new Request("http://localhost:3000/api/example?token=secret", {
        headers: {
          "x-request-id": "support-case-001",
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ preserved: true });
    expect(response.headers.get("x-existing")).toBe("preserved");
    expect(response.headers.get("x-request-id")).toBe("support-case-001");
    expect(response.headers.get("server-timing")).toMatch(
      /^db;dur=2\.00, app;dur=\d+\.\d{2}$/,
    );

    const logEntry = JSON.parse(String(logSpy.mock.calls[0]?.[0]));
    expect(logEntry.path).toBe("/api/example");
    expect(JSON.stringify(logEntry)).not.toContain("token=secret");
  });

  it("preserves dynamic route context", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const handler = withRouteObservability(
      "/api/example/[exampleId]",
      async (_request: Request, context: { params: Promise<{ exampleId: string }> }) => {
        const { exampleId } = await context.params;
        return Response.json({ exampleId });
      },
    );

    const response = await handler(
      new Request("http://localhost:3000/api/example/private-id"),
      { params: Promise.resolve({ exampleId: "private-id" }) },
    );

    await expect(response.json()).resolves.toEqual({ exampleId: "private-id" });
    const logEntry = JSON.parse(String(logSpy.mock.calls[0]?.[0]));
    expect(logEntry.route).toBe("/api/example/[exampleId]");
    expect(logEntry.route).not.toContain("private-id");
  });

  it("converts thrown errors once and preserves the public error contract", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const handler = withRouteObservability("/api/example", async () => {
      throw new Error("Unexpected private failure");
    });

    const response = await handler(
      new Request("http://localhost:3000/api/example"),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong while processing the request.",
      },
      success: false,
    });
    expect(response.headers.get("x-request-id")).toBeTruthy();

    const entries = errorSpy.mock.calls.map(([line]) => JSON.parse(String(line)));
    expect(entries.filter((entry) => entry.event === "application.unhandled_error"))
      .toHaveLength(1);
    expect(entries.filter((entry) => entry.event === "http.request.completed"))
      .toHaveLength(1);
  });
});
