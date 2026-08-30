# Readiness Check Failure

## Purpose

Use this runbook when `GET /api/health/ready` returns HTTP `503`. The goal is to distinguish application-process health, configuration failure, and PostgreSQL unavailability without exposing secrets or changing data.

## Trigger conditions and expected symptoms

- An operational probe receives HTTP `503` from `/api/health/ready`.
- The response reports `status: "not_ready"`.
- `checks.configuration.status` is `fail`, or `checks.database.status` is `fail`.
- `/api/health/live` may continue returning HTTP `200` because liveness does not depend on PostgreSQL.

Database-backed authentication, transaction, category, profile, and dashboard operations may be unavailable. Liveness success does not mean the application can process those operations.

## Initial triage

1. Record the UTC timestamp and `X-Request-Id` response header.
2. Call `/api/health/live` and confirm whether the application process responds.
3. Call `/api/health/ready` with a new support correlation ID.
4. Record the overall status, component statuses, safe public code, and latency.
5. Search structured logs for the request ID and the `health.check.failed` event.
6. Determine whether configuration failed, PostgreSQL failed, or the database check timed out.

```bash
curl -i http://localhost:3000/api/health/live
curl -i \
  -H "X-Request-Id: readiness-investigation-001" \
  http://localhost:3000/api/health/ready
```

## Evidence to collect

- UTC start and end time of the observed failure
- Request ID and release identifier
- HTTP status and sanitized health response
- `health.check.failed`, `application.error`, and related `http.request.completed` events
- Whether liveness remained available
- Whether all instances or only one instance were affected
- Recent deployment or configuration-change identifiers
- PostgreSQL provider or local service health status
- Migration status without schema contents or connection details

Never collect request bodies, cookies, authorization headers, JWTs, user data, financial values, or raw environment-variable values.

## Configuration checks

Confirm that `APP_URL`, `DATABASE_URL`, and `JWT_SECRET` are defined in the intended runtime environment without printing their values. Confirm that `JWT_SECRET` meets the documented minimum length. Review recent configuration changes through the environment's access-controlled audit mechanism.

If `checks.configuration.status` is `fail`, the database check is intentionally skipped. Correct the missing or invalid configuration through the normal environment-management process, restart or redeploy the affected instance if required, and rerun readiness.

## PostgreSQL checks

When configuration passes and the database check fails:

1. Confirm the PostgreSQL service is running through the approved service manager or provider dashboard.
2. Confirm DNS, network policy, TLS requirements, and connection limits from the application environment.
3. Run `npm run db:deploy` only in the intended environment and only when the normal deployment process authorizes migration status checks.
4. Inspect provider-side connection and resource health without exposing connection strings.
5. Distinguish `DATABASE_TIMEOUT` from `DATABASE_UNAVAILABLE` using the sanitized response and correlated logs.

The readiness query is `SELECT 1`; it does not read user data, mutate records, or execute migrations.

## Possible causes

- Missing or malformed required environment configuration
- PostgreSQL stopped, restarting, or unreachable
- DNS or network-policy failure
- Exhausted connection limit or database resource saturation
- Invalid credentials or rotated credentials not applied to the application
- Database schema unavailable after an incomplete deployment
- Readiness timeout set below the environment's normal connection latency

## Safe recovery steps

1. Restore the required configuration through the approved secret/configuration manager.
2. Restore PostgreSQL availability or network connectivity through the normal provider or local service controls.
3. Resolve connection-limit or resource-pressure conditions using approved operational procedures.
4. Confirm migrations are applied through the existing deployment process; do not edit migration history manually.
5. Restart only the affected application instance when configuration reload requires it.
6. Rerun readiness using a new request ID.
7. Execute one relevant authenticated smoke test after readiness recovers.

## Validation after recovery

1. `/api/health/live` returns HTTP `200`.
2. `/api/health/ready` returns HTTP `200` with configuration and database `pass`.
3. The response and completion log share the same request ID.
4. Database latency returns to the expected local or environment-specific range.
5. A representative database-backed application operation succeeds.
6. No new `health.check.failed` events appear for the recovered instance.

## Escalation

Escalate to the application owner when required configuration is unclear or application errors continue after database recovery. Escalate to the database or platform owner for provider incidents, network failures, connection exhaustion, or persistent latency. Include only the sanitized evidence listed above, the release identifier, timestamps, and request IDs.

## Actions that must not be taken

- Do not print, paste, or commit `DATABASE_URL`, `JWT_SECRET`, tokens, or cookies.
- Do not run destructive SQL, reset the database, or modify migration history.
- Do not run migrations automatically from a health endpoint.
- Do not disable readiness to hide the incident.
- Do not increase the timeout indefinitely without establishing the latency cause.
- Do not test failure procedures against shared, staging, or production systems without explicit authorization.

## Post-incident follow-up

Document the timeline, impact, root cause, recovery action, and request IDs. Identify whether a deployment guard, configuration validation, capacity change, external alert, or runbook improvement would have reduced detection or recovery time. Track that work separately from the incident response.
