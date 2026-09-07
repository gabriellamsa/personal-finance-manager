# Application Support & Reliability Case Study

## Context

Personal Finance Manager was already a working full-stack application with authenticated user flows, PostgreSQL persistence, Prisma data access, standardized API responses, automated tests, and continuous integration.

This case study evolves that existing product instead of creating a separate demonstration application. The finance domain, product identity, user flows, schema, and repository remain unchanged. The work focuses on making the application easier to monitor, diagnose, validate, and support.

## Repository history

- Product: Personal Finance Manager
- Repository: `personal-finance-manager`
- Baseline tag: `application-support-baseline`
- Implementation branch: `feat/application-support-observability`
- Completion tag: `application-support-v1` for the merged observability foundation

The baseline tag identifies the product state before the operational-readiness implementation. This makes the before-and-after change reviewable without duplicating the application in another repository.

## Initial operational problem

The application could process finance workflows, but it lacked a reliable way to answer basic incident questions:

- Is the application process alive?
- Is it ready to serve database-backed traffic?
- Did PostgreSQL fail or did the HTTP process fail?
- Which logs belong to a specific failed request?
- How long did an API request take?
- Can an error be investigated without exposing financial or authentication data?
- Is there a documented procedure for a readiness incident?

The original `/api/health` response only confirmed that one HTTP handler could respond. It did not distinguish liveness from readiness or verify PostgreSQL connectivity. Unexpected route errors used an isolated `console.error` without structured context or request correlation.

## Implemented operational foundation

### Health checks

`GET /api/health/live` confirms that the current application process can receive and answer an HTTP request. It does not access PostgreSQL and remains healthy during a database outage.

`GET /api/health/ready` validates required configuration and executes a minimal read-only `SELECT 1` through the existing Prisma client. A bounded timeout prevents the HTTP check from waiting indefinitely. Dependency failure produces HTTP `503` with a sanitized component status.

### Structured logging

Server logs are emitted as one JSON object per line with stable event names and operational metadata. Request completion events include:

- timestamp and level;
- service, environment, and release;
- request ID;
- method and pathname;
- stable route template;
- status code;
- duration in milliseconds.

Direct Prisma logging is disabled so driver errors cannot bypass the application's sanitization boundary.

### Request correlation

Every Route Handler uses the same observability wrapper. A valid incoming `X-Request-Id` is preserved; missing or invalid values are replaced with a UUID. The selected value is propagated through Node.js `AsyncLocalStorage`, returned in the response header, and included in related logs.

Responses also include `Server-Timing` with application duration while preserving any existing timing values.

### Error visibility

The existing `handleRouteError` remains the central conversion boundary for Zod, application, and Prisma errors. Public API contracts remain compatible. Unexpected errors are recorded with sanitized technical classifications, while stack traces, database connection details, request bodies, credentials, and user data remain outside responses and logs.

Next.js `instrumentation.ts` captures uncaught server errors outside the wrapped Route Handler boundary using the framework's supported `onRequestError` hook.

### Operational documentation

- [Observability Foundation](./observability.md) defines contracts, events, correlation, configuration, security, and local verification.
- [Readiness Check Failure](./runbooks/readiness-check-failure.md) provides a support-oriented triage and recovery procedure.

## Before and after

| Capability | Baseline | Operational readiness implementation |
|---|---|---|
| Process health | Single generic endpoint | Dedicated liveness endpoint |
| Database readiness | Not checked | Real read-only Prisma check |
| Dependency timeout | Not available | Bounded and configurable |
| Request correlation | Not available | Validated or generated request ID |
| API duration | Not recorded consistently | Structured duration and `Server-Timing` |
| Route coverage | Isolated error handling | Shared wrapper across all Route Handlers |
| Error logs | Unstructured `console.error` | Sanitized JSON events |
| Support procedure | Not documented | Readiness incident runbook |
| Automated health validation | Not available | Unit, route, and Playwright coverage |

## Incident demonstration

The portfolio demonstration is automated by `npm run ops:drill`. It runs isolated local application processes and verifies the following sequence without stopping or modifying the configured PostgreSQL database:

1. baseline liveness and readiness return HTTP `200`;
2. an isolated application process receives an intentionally unavailable local PostgreSQL endpoint;
3. liveness remains HTTP `200` because the HTTP process is alive;
4. readiness returns HTTP `503` with `DATABASE_UNAVAILABLE`;
5. the known request ID identifies both `health.check.failed` and `http.request.completed`;
6. captured output contains neither the connection string nor the database password;
7. a recovered process using valid configuration returns readiness HTTP `200`.

The command fails if any assertion is not satisfied and is executed by CI after the production build. Raw logs remain in memory and are not committed. The sanitized [PostgreSQL Readiness Drill Report](./incident-reports/postgresql-readiness-drill.md) records the verified result.

The manual failure procedure must not be run against a shared, staging, or production database without explicit authorization.

## Validation evidence

The implementation is validated through the existing project pipeline:

- ESLint for static quality checks;
- Vitest for health behavior, timeout, request IDs, logging, redaction, route wrapping, and regression coverage;
- Playwright for live HTTP contracts and the existing finance flows;
- Next.js production build and TypeScript validation;
- an isolated PostgreSQL failure-and-recovery drill after the production build;
- `git diff --check` for patch integrity.

The complete local gate executed on 2026-08-30 passed 53 Vitest tests, six Playwright scenarios, the Next.js 16.3.3 production build, the PostgreSQL failure-and-recovery drill, runtime HTTP contract checks, and a security-focused review of the changed source and configuration files. The reproducible evidence and honest limitations are recorded in the [Validation and Release Readiness Report](./validation-report.md).

No second CI workflow, external monitoring provider, schema migration, or fake dependency check is introduced.

## Security controls

The observability boundary does not log request or response bodies, cookies, authorization headers, IP addresses, user agents, email addresses, transaction descriptions, notes, amounts, custom category names, profiles, JWTs, secrets, or connection strings.

Health responses are public because infrastructure probes must access them, but they expose only service metadata and sanitized component status. Both endpoints use `Cache-Control: no-store`.

## Current limitations

This implementation is an operational foundation, not a complete monitoring platform:

- logs depend on stdout or stderr capture by the runtime environment;
- no external aggregation or retention backend is configured;
- no alerting or paging exists;
- no historical uptime or persistent metrics exist;
- no distributed tracing exists;
- process uptime and request context are instance-local;
- the HTTP timeout cannot cancel an underlying Prisma operation that is already in progress.

## Portfolio narrative

> I took an existing full-stack application and improved its operational readiness by adding health checks, structured logging, request correlation, database readiness checks, automated validation, and support runbooks.

The case study demonstrates operational improvement of a real application rather than a separate or duplicated observability demo.

## Connected import integration

The application now also provides an authenticated, idempotent import API for the [Transaction Import & Recovery Pipeline](https://github.com/gabriellamsa/transaction-import-recovery-pipeline). The [current validation record](release-validation/portfolio-publication.md) and [recorded aggregate results](evidence/integration-results.json) document first delivery, identical replay, changed-payload rejection, and local cleanup.
