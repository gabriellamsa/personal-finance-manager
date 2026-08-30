# Observability Foundation

## Purpose

This foundation gives application support engineers a safe way to determine whether an application instance is alive, whether it can serve database-backed traffic, and how to correlate an API response with structured server logs. It is intentionally vendor-neutral and writes logs to stdout or stderr.

It does not provide centralized log storage, alerting, historical uptime, metrics, or distributed tracing.

## Architecture

Every Route Handler is wrapped by `withRouteObservability`. The wrapper validates or creates a request ID, starts a Node.js `AsyncLocalStorage` context, measures handler duration, preserves the original response, appends operational headers, and writes one completion event.

`handleRouteError` remains the central exception-to-HTTP-response boundary. It preserves existing response bodies and status codes and records sanitized details for unexpected or service-unavailable errors. Next.js `instrumentation.ts` uses the stable `onRequestError` hook for uncaught server errors outside the wrapped Route Handler boundary.

The readiness service validates required configuration and executes a read-only Prisma `SELECT 1` query with a bounded timeout. It never reads user data or runs migrations.

## Health endpoints

### `GET /api/health/live`

Liveness answers whether the current application process can handle HTTP traffic. It does not access PostgreSQL or any external dependency.

- Success: HTTP `200`
- Cache policy: `Cache-Control: no-store`
- Correlation: `X-Request-Id`

```json
{
  "status": "ok",
  "service": {
    "name": "personal-finance-manager",
    "version": "0.1.0",
    "release": "local"
  },
  "timestamp": "2026-08-29T12:00:00.000Z",
  "processUptimeSeconds": 123.45,
  "requestId": "support-live-001"
}
```

`processUptimeSeconds` is the lifetime of the current process only. It is not historical or service-wide uptime.

### `GET /api/health/ready`

Readiness answers whether required configuration is valid and PostgreSQL is reachable.

- Ready: HTTP `200`, overall status `ready`
- Unavailable: HTTP `503`, overall status `not_ready`, `Retry-After: 5`
- Cache policy: `Cache-Control: no-store`
- Correlation: `X-Request-Id`

```json
{
  "status": "ready",
  "service": {
    "name": "personal-finance-manager",
    "version": "0.1.0",
    "release": "local"
  },
  "checks": {
    "configuration": { "status": "pass" },
    "database": { "status": "pass", "latencyMs": 8.42 }
  },
  "timestamp": "2026-08-29T12:00:00.000Z",
  "requestId": "support-ready-001"
}
```

A database failure exposes only the component state and a stable public code:

```json
{
  "status": "not_ready",
  "service": {
    "name": "personal-finance-manager",
    "version": "0.1.0",
    "release": "local"
  },
  "checks": {
    "configuration": { "status": "pass" },
    "database": {
      "status": "fail",
      "code": "DATABASE_UNAVAILABLE",
      "latencyMs": 16.28
    }
  },
  "timestamp": "2026-08-29T12:00:00.000Z",
  "requestId": "support-ready-002"
}
```

When configuration is invalid, its check is `fail` and the database check is `skip`. A timed-out database check uses `DATABASE_TIMEOUT`. Internal Prisma messages and connection details are never returned.

`GET /api/health` remains a minimal backward-compatible bootstrap probe for the existing Playwright server startup. New operational integrations should use `/live` or `/ready` according to the required semantics.

## Request correlation

Clients may send `X-Request-Id`. Values must contain only letters, numbers, `.`, `_`, `:`, and `-`, with a maximum length of 128 characters. Missing or invalid values are replaced with a UUID. The selected value is returned in `X-Request-Id`, included in health response bodies, and attached to request-scoped logs.

API responses also include `Server-Timing: app;dur=<milliseconds>`. Existing `Server-Timing` values are preserved and the application duration is appended.

Only the URL pathname and a stable route template are logged. Query strings and dynamic identifiers are excluded.

## Structured logs

Logs contain one JSON object per line. Normal events use stdout; warnings and errors use stderr through `console.warn` and `console.error`.

Common fields are:

- `timestamp`, `level`, `service`, `environment`, and `release`
- `event` and `message`
- `requestId`, `method`, `path`, and stable `route`
- `statusCode` and `durationMs`
- sanitized `error` or `details` when applicable

Implemented event names include:

- `http.request.completed`
- `health.check.completed`
- `health.check.failed`
- `application.error`
- `application.unhandled_error`

Example:

```json
{"timestamp":"2026-08-29T12:00:00.000Z","level":"info","service":"personal-finance-manager","environment":"development","release":"local","event":"http.request.completed","message":"HTTP request completed","requestId":"support-ready-001","method":"GET","path":"/api/health/ready","route":"/api/health/ready","statusCode":200,"durationMs":8.91}
```

## Log levels and configuration

| Variable | Required | Default | Purpose |
|---|---:|---|---|
| `RELEASE_SHA` | No | `local` | Safe release identifier, sanitized and limited before exposure |
| `HEALTH_CHECK_TIMEOUT_MS` | No | `2000` | Database readiness timeout; accepted range is 100–10000 ms |
| `LOG_LEVEL` | No | `info` | Minimum level: `debug`, `info`, `warn`, `error`, or `silent` |

Tests default to silent logging unless `LOG_LEVEL` is explicitly set.

## Data protection

Request bodies, response bodies, cookies, authorization headers, IP addresses, user agents, user objects, and Prisma metadata are not passed to the logger. Call sites supply only operational fields. A second defensive serialization layer redacts common credential and personal-data keys, PostgreSQL connection strings, bearer tokens, JWT-like strings, email addresses, and known secret assignments. Strings are length-limited, circular objects are handled safely, and logging failures never break requests.

Financial amounts, transaction descriptions, notes, custom category names, profiles, and email addresses must never be added to log metadata.

Direct Prisma logging is disabled so driver errors cannot bypass sanitization. Database failures are reported through the structured application events instead.

## Local verification

Start PostgreSQL, configure `.env`, apply migrations, and start the application:

```bash
npm run db:deploy
npm run dev
```

In another terminal:

```bash
curl -i http://localhost:3000/api/health/live
curl -i http://localhost:3000/api/health/ready
curl -i \
  -H "X-Request-Id: support-investigation-001" \
  http://localhost:3000/api/health/ready
```

Use the returned request ID to search one-line JSON logs. For example, with a local log capture:

```bash
rg '"requestId":"support-investigation-001"' application.log
```

Do not capture application logs in a repository file or commit them.

## Safely simulating database unavailability

The preferred verification is the automated local drill:

```bash
npm run build
npm run ops:drill
```

The drill does not stop or modify the configured PostgreSQL database. It starts isolated production application processes, verifies the healthy baseline, points one isolated process at an intentionally unavailable local port, checks the incident contract and correlated events, and then starts a recovered process with the valid configuration.

Expected safe summary:

```json
{
  "baseline": {
    "livenessStatus": 200,
    "readinessStatus": 200
  },
  "incident": {
    "livenessStatus": 200,
    "readinessStatus": 503,
    "databaseCode": "DATABASE_UNAVAILABLE",
    "sensitiveDataExposed": false
  },
  "recovery": {
    "readinessStatus": 200
  },
  "status": "passed"
}
```

The script also requires the incident request ID to appear in both `health.check.failed` and `http.request.completed`. It fails if captured output contains the database connection string or password. Raw logs are kept in memory only and are not written to the repository.

For a manual exercise, use only a disposable local development environment. Stop the local PostgreSQL service through the same service manager used to start it, call `/api/health/live` and `/api/health/ready`, restore PostgreSQL, and validate recovery.

Do not test this procedure against shared, staging, or production databases. Do not print environment-variable values while troubleshooting. See [Readiness Check Failure](./runbooks/readiness-check-failure.md) for the complete procedure.

## Limitations

- Logs exist only in process stdout or stderr until the hosting environment captures them.
- There is no external aggregation backend, retention policy, alerting, or paging.
- There are no persistent metrics, historical uptime calculations, or service-level objectives.
- Request correlation is local to this application; distributed tracing is not implemented.
- Process uptime and request context are instance-local in multi-instance or serverless environments.
- A timed-out Prisma query cannot be cancelled by this wrapper; the HTTP readiness result is bounded, while the underlying driver operation may finish later.

## Future external telemetry integration

A future phase may route the existing structured events and uncaught-error boundary to an external backend such as OpenTelemetry or Sentry. That work would require a separate provider decision, credentials, data-retention review, sampling policy, and cost approval. No external telemetry provider is configured now.
