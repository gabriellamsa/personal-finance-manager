# INC-001: PostgreSQL Unavailable

## Incident record

| Field | Value |
|---|---|
| Incident ID | INC-001 |
| Exercise type | Controlled local incident simulation |
| Simulated severity | SEV-2 |
| Status | Resolved and validated |
| Environment | Isolated local application processes |
| Detection | Automated readiness drill |

The simulated severity represents the hypothetical loss of persisted finance operations if PostgreSQL were unavailable. This was not a production outage, did not affect customers, and did not exercise an SLA or paging process.

## Scope and symptoms

The drill started isolated application processes and directed only the incident process to an unused local PostgreSQL port. Liveness remained HTTP `200`; readiness returned HTTP `503`, `status: not_ready`, and the safe code `DATABASE_UNAVAILABLE`. Authentication and other database-backed operations would hypothetically be unavailable, while the HTTP process itself remained alive.

No shared database was stopped, no credentials changed, no data mutated, and no raw logs were persisted.

## Verified timeline

The automation records stage order rather than wall-clock timestamps, so no more precise timestamps are claimed.

1. Healthy baseline: liveness and readiness returned HTTP `200`.
2. Dependency failure introduced: an isolated process received an intentionally unavailable local database endpoint.
3. Detection: liveness returned `200`; readiness returned `503` with `DATABASE_UNAVAILABLE`.
4. Correlation: request ID `ops-drill-incident-ready` appeared in `health.check.failed` and `http.request.completed`.
5. Containment: the failure remained isolated to the drill process.
6. Recovery: a new isolated process used the valid local configuration.
7. Validation: readiness returned HTTP `200` and the drill reported `status: passed`.

## Evidence

- Request ID: `ops-drill-incident-ready`
- Events: `health.check.failed`, `http.request.completed`
- Baseline: liveness `200`, readiness `200`
- Incident: liveness `200`, readiness `503`
- Recovery: readiness `200`
- Sensitive-data check: database URL and password absent from captured output

## Root cause, containment, and recovery

The controlled root cause was an unreachable PostgreSQL network endpoint supplied only to the isolated incident process. The application correctly treated this as a dependency-readiness failure rather than a process failure. Isolation was the containment boundary. Restoring valid local database configuration and starting a recovered process restored readiness.

## Validation and follow-up

The drill validated safe response content, request correlation, bounded readiness behavior, and recovery. Follow-up actions are to retain the drill in CI, maintain the operational documents, and define environment-specific provider diagnostics, alerting, escalation, and backup validation before any production operation.

## Related documentation

- [Drill evidence](../incident-reports/postgresql-readiness-drill.md)
- [Postmortem](../postmortems/INC-001-postmortem.md)
- [Readiness runbook](../runbooks/readiness-check-failure.md)
- [Health-check QRG](../qrg/checking-application-health.md)
- [HTTP 503 knowledge-base article](../knowledge-base/readiness-returns-http-503.md)
