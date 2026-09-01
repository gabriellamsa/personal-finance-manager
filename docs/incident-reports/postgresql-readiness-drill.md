# PostgreSQL Readiness Drill Report

## Executive summary

On 2026-08-30, the automated operational-readiness drill was executed against the local Personal Finance Manager build. The application correctly distinguished process health from dependency readiness, produced request-correlated structured events, withheld sensitive database configuration, and recovered after valid configuration was restored.

Result: **passed**.

## Scope and safety boundary

- Environment: isolated local application processes
- Database used for healthy checks: configured local development PostgreSQL
- Failure mechanism: unused local TCP port supplied only to the isolated incident process
- Database mutations: none
- PostgreSQL service interruption: none
- External services: none
- Raw logs persisted or committed: none

The drill did not stop PostgreSQL, change credentials, alter the schema, run destructive SQL, or affect a shared environment.

## Reproduction

```bash
npm run build
npm run ops:drill
```

The command requires valid local `DATABASE_URL` and `JWT_SECRET` values. It never prints their values.

## Verified timeline

| Stage | Liveness | Readiness | Operational result |
|---|---:|---:|---|
| Healthy baseline | `200` | `200` | Application and PostgreSQL ready |
| Simulated PostgreSQL outage | `200` | `503` | Process alive, dependency unavailable |
| Recovery | Not required | `200` | Valid database configuration restored |

During the incident stage, readiness returned the sanitized code `DATABASE_UNAVAILABLE`. The request ID `ops-drill-incident-ready` correlated the `health.check.failed` and `http.request.completed` events.

## Data-protection validation

The drill inspected captured stdout and stderr in memory and failed unless all of the following were true:

- the unavailable database URL was absent;
- no PostgreSQL connection string was present;
- the configured database password was absent;
- the public response exposed only the stable component code;
- no raw logs were written to the repository.

Verified result: `sensitiveDataExposed: false`.

## Root cause and recovery

The controlled root cause was an unreachable PostgreSQL network endpoint. No application-process failure occurred, so liveness correctly remained available. Restoring the valid runtime database configuration and starting a recovered application process returned readiness to HTTP `200`.

## Support conclusion

The exercise demonstrates that an application support workflow can distinguish an alive HTTP process from a database-ready application, correlate a failed probe with structured logs, communicate a stable public failure code, and verify recovery without exposing finance data or credentials.

Environment-specific alerting, provider diagnostics, capacity checks, and escalation remain outside this local drill and must be defined before production operation.
