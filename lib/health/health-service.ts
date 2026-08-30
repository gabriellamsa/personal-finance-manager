import "server-only";

import { prisma } from "@/lib/db/prisma";
import { getEnv } from "@/lib/env";
import { getPublicServiceMetadata } from "@/lib/observability/metadata";

const DEFAULT_HEALTH_CHECK_TIMEOUT_MS = 2_000;
const MIN_HEALTH_CHECK_TIMEOUT_MS = 100;
const MAX_HEALTH_CHECK_TIMEOUT_MS = 10_000;

type PassingCheck = {
  status: "pass";
};

type FailingCheck = {
  status: "fail";
};

type SkippedCheck = {
  status: "skip";
};

type DatabaseCheck =
  | (PassingCheck & { latencyMs: number })
  | (FailingCheck & {
      code: "DATABASE_TIMEOUT" | "DATABASE_UNAVAILABLE";
      latencyMs: number;
    })
  | SkippedCheck;

export type LivenessResponse = {
  processUptimeSeconds: number;
  requestId: string;
  service: ReturnType<typeof getPublicServiceMetadata>;
  status: "ok";
  timestamp: string;
};

export type ReadinessResponse = {
  checks: {
    configuration: PassingCheck | FailingCheck;
    database: DatabaseCheck;
  };
  requestId: string;
  service: ReturnType<typeof getPublicServiceMetadata>;
  status: "not_ready" | "ready";
  timestamp: string;
};

export type ReadinessResult = {
  failure?: {
    component: "configuration" | "database";
    error: unknown;
  };
  response: ReadinessResponse;
  statusCode: 200 | 503;
};

export type ReadinessDependencies = {
  checkConfiguration?: () => void;
  checkDatabase?: () => Promise<void>;
  now?: () => number;
  timeoutMs?: number;
};

class HealthCheckTimeoutError extends Error {
  readonly code = "DATABASE_TIMEOUT";

  constructor() {
    super("Database health check exceeded its timeout.");
    this.name = "HealthCheckTimeoutError";
  }
}

function roundMetric(value: number) {
  return Math.round(value * 100) / 100;
}

export function getHealthCheckTimeoutMs() {
  const configuredTimeout = Number(process.env.HEALTH_CHECK_TIMEOUT_MS);

  if (
    Number.isInteger(configuredTimeout) &&
    configuredTimeout >= MIN_HEALTH_CHECK_TIMEOUT_MS &&
    configuredTimeout <= MAX_HEALTH_CHECK_TIMEOUT_MS
  ) {
    return configuredTimeout;
  }

  return DEFAULT_HEALTH_CHECK_TIMEOUT_MS;
}

export async function checkDatabaseConnection() {
  await prisma.$queryRaw`SELECT 1`;
}

async function executeWithTimeout(
  check: () => Promise<void>,
  timeoutMs: number,
) {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      check(),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new HealthCheckTimeoutError()), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export function createLivenessResponse(requestId: string): LivenessResponse {
  return {
    processUptimeSeconds: roundMetric(process.uptime()),
    requestId,
    service: getPublicServiceMetadata(),
    status: "ok",
    timestamp: new Date().toISOString(),
  };
}

export async function runReadinessChecks(
  requestId: string,
  dependencies: ReadinessDependencies = {},
): Promise<ReadinessResult> {
  const checkConfiguration = dependencies.checkConfiguration ?? (() => getEnv());
  const checkDatabase = dependencies.checkDatabase ?? checkDatabaseConnection;
  const now = dependencies.now ?? performance.now.bind(performance);
  const timeoutMs = dependencies.timeoutMs ?? getHealthCheckTimeoutMs();
  const baseResponse = {
    requestId,
    service: getPublicServiceMetadata(),
    timestamp: new Date().toISOString(),
  };

  try {
    checkConfiguration();
  } catch (error) {
    return {
      failure: {
        component: "configuration",
        error,
      },
      response: {
        ...baseResponse,
        checks: {
          configuration: { status: "fail" },
          database: { status: "skip" },
        },
        status: "not_ready",
      },
      statusCode: 503,
    };
  }

  const startedAt = now();

  try {
    await executeWithTimeout(checkDatabase, timeoutMs);
    const latencyMs = roundMetric(now() - startedAt);

    return {
      response: {
        ...baseResponse,
        checks: {
          configuration: { status: "pass" },
          database: {
            latencyMs,
            status: "pass",
          },
        },
        status: "ready",
      },
      statusCode: 200,
    };
  } catch (error) {
    const latencyMs = roundMetric(now() - startedAt);
    const code =
      error instanceof HealthCheckTimeoutError
        ? "DATABASE_TIMEOUT"
        : "DATABASE_UNAVAILABLE";

    return {
      failure: {
        component: "database",
        error,
      },
      response: {
        ...baseResponse,
        checks: {
          configuration: { status: "pass" },
          database: {
            code,
            latencyMs,
            status: "fail",
          },
        },
        status: "not_ready",
      },
      statusCode: 503,
    };
  }
}
