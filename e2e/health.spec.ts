import { expect, test } from "@playwright/test";

test("health endpoints expose safe operational contracts", async ({ request }) => {
  const livenessResponse = await request.get("/api/health/live", {
    headers: {
      "X-Request-Id": "e2e-live-check-001",
    },
  });
  const livenessBody = await livenessResponse.json();

  expect(livenessResponse.status()).toBe(200);
  expect(livenessResponse.headers()["cache-control"]).toBe("no-store");
  expect(livenessResponse.headers()["x-request-id"]).toBe(
    "e2e-live-check-001",
  );
  expect(livenessBody).toMatchObject({
    requestId: "e2e-live-check-001",
    status: "ok",
  });

  const readinessResponse = await request.get("/api/health/ready", {
    headers: {
      "X-Request-Id": "e2e-ready-check-001",
    },
  });
  const readinessBody = await readinessResponse.json();
  const serializedBody = JSON.stringify(readinessBody);

  expect(readinessResponse.status()).toBe(200);
  expect(readinessResponse.headers()["cache-control"]).toBe("no-store");
  expect(readinessResponse.headers()["x-request-id"]).toBe(
    "e2e-ready-check-001",
  );
  expect(readinessBody).toMatchObject({
    checks: {
      configuration: { status: "pass" },
      database: { status: "pass" },
    },
    requestId: "e2e-ready-check-001",
    status: "ready",
  });
  expect(readinessBody.checks.database.latencyMs).toEqual(expect.any(Number));
  expect(serializedBody).not.toContain("DATABASE_URL");
  expect(serializedBody).not.toContain("JWT_SECRET");
  expect(serializedBody).not.toContain("postgresql://");
});
