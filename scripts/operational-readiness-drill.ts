import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import path from "node:path";

const HOST = "127.0.0.1";
const STARTUP_TIMEOUT_MS = 30_000;
const EVENT_TIMEOUT_MS = 3_000;

type JsonRecord = Record<string, unknown>;

type RunningApplication = {
  getLogs: () => string;
  origin: string;
  stop: () => Promise<void>;
};

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function assertCondition(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function asRecord(value: unknown, label: string): JsonRecord {
  assertCondition(
    typeof value === "object" && value !== null && !Array.isArray(value),
    `${label} must be a JSON object.`,
  );

  return value as JsonRecord;
}

async function getAvailablePort(excludedPorts: Set<number> = new Set()) {
  while (true) {
    const port = await new Promise<number>((resolve, reject) => {
      const server = createServer();

      server.once("error", reject);
      server.listen(0, HOST, () => {
        const address = server.address();

        assertCondition(
          typeof address === "object" && address !== null,
          "Could not allocate a local port.",
        );

        const allocatedPort = address.port;
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(allocatedPort);
        });
      });
    });

    if (!excludedPorts.has(port)) {
      return port;
    }
  }
}

function createUnavailableDatabaseUrl(databaseUrl: string, port: number) {
  const parsedUrl = new URL(databaseUrl);

  assertCondition(
    parsedUrl.protocol === "postgresql:" || parsedUrl.protocol === "postgres:",
    "DATABASE_URL must use the PostgreSQL protocol.",
  );

  parsedUrl.hostname = HOST;
  parsedUrl.port = String(port);

  return parsedUrl.toString();
}

async function waitForApplication(origin: string, hasExited: () => boolean) {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;

  while (Date.now() < deadline) {
    assertCondition(!hasExited(), "Application process exited during startup.");

    try {
      const response = await fetch(`${origin}/api/health/live`, {
        headers: { "X-Request-Id": "ops-drill-startup" },
      });

      if (response.status === 200) {
        return;
      }
    } catch {
      // The server may refuse connections while Next.js is still starting.
    }

    await delay(200);
  }

  throw new Error("Application did not become live before the startup timeout.");
}

async function startApplication(
  databaseUrl: string,
  port: number,
): Promise<RunningApplication> {
  const nextBin = path.join(
    process.cwd(),
    "node_modules",
    "next",
    "dist",
    "bin",
    "next",
  );
  const environment = { ...process.env };
  delete environment.FORCE_COLOR;

  const child = spawn(
    process.execPath,
    [nextBin, "start", "--hostname", HOST, "--port", String(port)],
    {
      cwd: process.cwd(),
      env: {
        ...environment,
        APP_URL: `http://${HOST}:${port}`,
        DATABASE_URL: databaseUrl,
        HEALTH_CHECK_TIMEOUT_MS: "1000",
        LOG_LEVEL: "info",
        NODE_ENV: "production",
        NO_COLOR: "1",
        RELEASE_SHA: "ops-drill",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let output = "";

  child.stdout.on("data", (chunk: Buffer) => {
    output += chunk.toString("utf8");
  });
  child.stderr.on("data", (chunk: Buffer) => {
    output += chunk.toString("utf8");
  });

  const origin = `http://${HOST}:${port}`;
  await waitForApplication(origin, () => child.exitCode !== null);

  return {
    getLogs: () => output,
    origin,
    stop: async () => {
      if (child.exitCode !== null) {
        return;
      }

      child.kill("SIGTERM");
      await Promise.race([once(child, "exit"), delay(5_000)]);

      if (child.exitCode === null) {
        child.kill("SIGKILL");
        await once(child, "exit");
      }
    },
  };
}

async function requestHealth(
  origin: string,
  endpoint: "live" | "ready",
  requestId: string,
) {
  const response = await fetch(`${origin}/api/health/${endpoint}`, {
    headers: { "X-Request-Id": requestId },
  });
  const body = asRecord(await response.json(), `${endpoint} response`);

  assertCondition(
    response.headers.get("x-request-id") === requestId,
    `${endpoint} response did not preserve the request ID.`,
  );

  return {
    body,
    status: response.status,
  };
}

function parseStructuredEvents(logs: string) {
  const events: JsonRecord[] = [];

  for (const line of logs.split(/\r?\n/)) {
    const candidate = line.trim();

    if (!candidate.startsWith("{") || !candidate.endsWith("}")) {
      continue;
    }

    try {
      events.push(asRecord(JSON.parse(candidate), "structured log event"));
    } catch {
      // Next.js also writes human-readable process output; only JSON events matter.
    }
  }

  return events;
}

async function waitForCorrelatedEvents(
  application: RunningApplication,
  requestId: string,
) {
  const deadline = Date.now() + EVENT_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const events = parseStructuredEvents(application.getLogs()).filter(
      (event) => event.requestId === requestId,
    );
    const names = new Set(events.map((event) => event.event));

    if (
      names.has("health.check.failed") &&
      names.has("http.request.completed")
    ) {
      return [...names].filter(
        (name): name is string => typeof name === "string",
      );
    }

    await delay(50);
  }

  throw new Error("Correlated incident events were not emitted before timeout.");
}

async function runApplicationPhase<T>(
  databaseUrl: string,
  excludedPorts: Set<number>,
  operation: (application: RunningApplication) => Promise<T>,
) {
  const applicationPort = await getAvailablePort(excludedPorts);
  excludedPorts.add(applicationPort);
  const application = await startApplication(databaseUrl, applicationPort);

  try {
    return await operation(application);
  } finally {
    await application.stop();
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const jwtSecret = process.env.JWT_SECRET;

  assertCondition(databaseUrl, "DATABASE_URL is required for the drill.");
  assertCondition(jwtSecret, "JWT_SECRET is required for the drill.");

  const usedPorts = new Set<number>();
  const unavailableDatabasePort = await getAvailablePort(usedPorts);
  usedPorts.add(unavailableDatabasePort);
  const unavailableDatabaseUrl = createUnavailableDatabaseUrl(
    databaseUrl,
    unavailableDatabasePort,
  );

  const baseline = await runApplicationPhase(
    databaseUrl,
    usedPorts,
    async (application) => {
      const live = await requestHealth(
        application.origin,
        "live",
        "ops-drill-baseline-live",
      );
      const ready = await requestHealth(
        application.origin,
        "ready",
        "ops-drill-baseline-ready",
      );

      assertCondition(live.status === 200, "Baseline liveness must return 200.");
      assertCondition(ready.status === 200, "Baseline readiness must return 200.");
      assertCondition(ready.body.status === "ready", "Baseline must be ready.");

      return {
        livenessStatus: live.status,
        readinessStatus: ready.status,
      };
    },
  );

  const incident = await runApplicationPhase(
    unavailableDatabaseUrl,
    usedPorts,
    async (application) => {
      const live = await requestHealth(
        application.origin,
        "live",
        "ops-drill-incident-live",
      );
      const requestId = "ops-drill-incident-ready";
      const ready = await requestHealth(application.origin, "ready", requestId);
      const checks = asRecord(ready.body.checks, "incident checks");
      const database = asRecord(checks.database, "incident database check");

      assertCondition(live.status === 200, "Incident liveness must remain 200.");
      assertCondition(ready.status === 503, "Incident readiness must return 503.");
      assertCondition(
        ready.body.status === "not_ready",
        "Incident must report not_ready.",
      );
      assertCondition(
        database.code === "DATABASE_UNAVAILABLE",
        "Incident must report DATABASE_UNAVAILABLE.",
      );

      const correlatedEvents = await waitForCorrelatedEvents(
        application,
        requestId,
      );
      const capturedOutput = application.getLogs();
      const databasePassword = new URL(databaseUrl).password;

      assertCondition(
        !capturedOutput.includes(unavailableDatabaseUrl),
        "Logs exposed the unavailable database URL.",
      );
      assertCondition(
        !capturedOutput.toLowerCase().includes("postgresql://"),
        "Logs exposed a PostgreSQL connection string.",
      );
      assertCondition(
        !databasePassword || !capturedOutput.includes(databasePassword),
        "Logs exposed a database password.",
      );

      return {
        correlatedEvents: correlatedEvents.sort(),
        databaseCode: database.code,
        livenessStatus: live.status,
        readinessStatus: ready.status,
        requestId,
        sensitiveDataExposed: false,
      };
    },
  );

  const recovery = await runApplicationPhase(
    databaseUrl,
    usedPorts,
    async (application) => {
      const ready = await requestHealth(
        application.origin,
        "ready",
        "ops-drill-recovery-ready",
      );

      assertCondition(ready.status === 200, "Recovery readiness must return 200.");
      assertCondition(ready.body.status === "ready", "Recovery must be ready.");

      return {
        readinessStatus: ready.status,
      };
    },
  );

  console.log(
    JSON.stringify(
      {
        baseline,
        drill: "postgresql-readiness-failure",
        incident,
        recovery,
        status: "passed",
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  const errorName = error instanceof Error ? error.name : "UnknownError";

  console.error(`Operational readiness drill failed (${errorName}).`);
  process.exitCode = 1;
});
