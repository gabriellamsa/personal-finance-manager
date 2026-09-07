# Knowledge Base: Readiness Returns HTTP 503

## Symptom and meaning

`GET /api/health/ready` returns HTTP `503` with `status: not_ready`. The application process may still answer `/api/health/live` with HTTP `200`. Liveness proves that the process can respond; readiness additionally checks required configuration and read-only PostgreSQL connectivity.

## Likely causes

- Missing or invalid required runtime configuration
- PostgreSQL stopped, restarting, unreachable, or timing out
- DNS, TLS, network-policy, credential-rotation, or connection-limit problems
- An incomplete environment change affecting schema availability

## Evidence to collect

Record UTC time, release, `X-Request-Id`, HTTP status, safe component code, liveness result, and correlated `health.check.failed` and `http.request.completed` events. Never collect raw cookies, authorization headers, JWTs, finance payloads, passwords, or connection strings.

## Safe diagnostics

```bash
curl -i http://localhost:3000/api/health/live
curl -i -H 'X-Request-Id: readiness-kb-001' http://localhost:3000/api/health/ready
rg '"requestId":"readiness-kb-001"' application.log
```

Known safe codes are `CONFIGURATION_INVALID`, `DATABASE_TIMEOUT`, and `DATABASE_UNAVAILABLE`. Internal driver details and connection strings are intentionally withheld.

## Resolution and validation

Restore the intended configuration, PostgreSQL service, capacity, or network path through approved controls. Do not reset data or edit migration history. After recovery, confirm liveness `200`, readiness `200`, correlated completion logs, and one authorized authenticated database-backed operation.

## Escalation

Escalate to the application owner when configuration ownership is unclear or application failures continue after dependency recovery. Escalate to the database or platform owner for provider incidents, persistent network failure, connection exhaustion, or abnormal latency. Include only sanitized evidence.

## Related documentation

- [Readiness failure runbook](../runbooks/readiness-check-failure.md)
- [Health-check QRG](../qrg/checking-application-health.md)
- [INC-001 report](../incidents/INC-001-postgresql-unavailable.md)
- [INC-001 postmortem](../postmortems/INC-001-postmortem.md)
