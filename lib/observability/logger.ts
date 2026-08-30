import "server-only";

import { getOperationalMetadata } from "@/lib/observability/metadata";

const MAX_LOG_STRING_LENGTH = 500;
const SENSITIVE_KEYS = new Set([
  "accesstoken",
  "amount",
  "amountincents",
  "apikey",
  "authorization",
  "category",
  "categoryname",
  "cookie",
  "databaseurl",
  "description",
  "email",
  "headers",
  "jwt",
  "jwtsecret",
  "name",
  "notes",
  "password",
  "passwordconfirmation",
  "profile",
  "refreshtoken",
  "requestbody",
  "responsebody",
  "secret",
  "setcookie",
  "token",
  "user",
  "value",
]);
const LOG_LEVELS = ["debug", "info", "warn", "error"] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

type LogDetails = Record<string, unknown>;

export type LogEvent = {
  details?: LogDetails;
  durationMs?: number;
  error?: unknown;
  event: string;
  level: LogLevel;
  message: string;
  method?: string;
  path?: string;
  requestId?: string;
  route?: string;
  statusCode?: number;
};

type SafeLogValue =
  | boolean
  | null
  | number
  | string
  | SafeLogValue[]
  | { [key: string]: SafeLogValue };

function redactString(value: string) {
  return value
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[REDACTED]")
    .replace(/\bBearer\s+[^\s]+/gi, "Bearer [REDACTED]")
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[REDACTED]")
    .replace(/\b[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/g, "[REDACTED]")
    .replace(/\b(?:DATABASE_URL|JWT_SECRET|API_KEY)\s*=\s*[^\s]+/gi, "[REDACTED]")
    .slice(0, MAX_LOG_STRING_LENGTH);
}

function isSensitiveKey(key: string) {
  const normalizedKey = key.replace(/[^A-Za-z0-9]/g, "").toLowerCase();
  return SENSITIVE_KEYS.has(normalizedKey);
}

function sanitizeValue(
  value: unknown,
  seen: WeakSet<object>,
): SafeLogValue {
  if (value === null || typeof value === "boolean" || typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return redactString(value);
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value !== "object") {
    return String(value).slice(0, MAX_LOG_STRING_LENGTH);
  }

  if (seen.has(value)) {
    return "[CIRCULAR]";
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, seen));
  }

  const sanitized: Record<string, SafeLogValue> = {};

  for (const [key, item] of Object.entries(value)) {
    if (item === undefined) {
      continue;
    }

    sanitized[key] = isSensitiveKey(key)
      ? "[REDACTED]"
      : sanitizeValue(item, seen);
  }

  return sanitized;
}

export function sanitizeLogDetails(details: LogDetails): SafeLogValue {
  return sanitizeValue(details, new WeakSet());
}

export function serializeError(error: unknown): SafeLogValue {
  if (error instanceof Error) {
    const errorWithCode = error as Error & { code?: unknown };
    const isPrismaError = error.name.startsWith("PrismaClient");
    const canIncludeMessage =
      error.name === "AppError" || error.name === "HealthCheckTimeoutError";
    const serialized: Record<string, SafeLogValue> = {
      name: error.name,
    };

    if (!isPrismaError && canIncludeMessage) {
      serialized.message = redactString(error.message);
    } else if (!isPrismaError) {
      serialized.message = "Unexpected error details withheld.";
    }

    if (typeof errorWithCode.code === "string") {
      serialized.code = redactString(errorWithCode.code);
    } else if (isPrismaError) {
      serialized.code = "PRISMA_ERROR";
    }

    return serialized;
  }

  return {
    name: "UnknownError",
  };
}

function resolveMinimumLogLevel() {
  const configuredLevel = process.env.LOG_LEVEL;

  if (configuredLevel === "silent") {
    return "silent" as const;
  }

  return LOG_LEVELS.includes(configuredLevel as LogLevel)
    ? (configuredLevel as LogLevel)
    : process.env.NODE_ENV === "test"
      ? ("silent" as const)
      : ("info" as const);
}

function shouldLog(level: LogLevel) {
  const minimumLevel = resolveMinimumLogLevel();

  return (
    minimumLevel !== "silent" &&
    LOG_LEVELS.indexOf(level) >= LOG_LEVELS.indexOf(minimumLevel)
  );
}

export function logEvent(event: LogEvent) {
  if (!shouldLog(event.level)) {
    return;
  }

  try {
    const metadata = getOperationalMetadata();
    const entry = {
      timestamp: new Date().toISOString(),
      level: event.level,
      service: metadata.name,
      environment: metadata.environment,
      release: metadata.release,
      event: event.event,
      message: redactString(event.message),
      ...(event.requestId ? { requestId: event.requestId } : {}),
      ...(event.method ? { method: event.method } : {}),
      ...(event.path ? { path: event.path } : {}),
      ...(event.route ? { route: event.route } : {}),
      ...(event.statusCode === undefined ? {} : { statusCode: event.statusCode }),
      ...(event.durationMs === undefined ? {} : { durationMs: event.durationMs }),
      ...(event.error === undefined ? {} : { error: serializeError(event.error) }),
      ...(event.details === undefined
        ? {}
        : { details: sanitizeLogDetails(event.details) }),
    };
    const line = JSON.stringify(entry);

    if (event.level === "error") {
      console.error(line);
    } else if (event.level === "warn") {
      console.warn(line);
    } else {
      console.log(line);
    }
  } catch {
    // Logging must never break the request it is observing.
  }
}
