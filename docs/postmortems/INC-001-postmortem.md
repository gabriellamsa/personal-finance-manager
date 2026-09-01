# INC-001 Postmortem: PostgreSQL Unavailable

## Executive summary

A controlled local incident simulation verified that Personal Finance Manager detects an unavailable PostgreSQL dependency without misclassifying the application process as dead. The incident-stage readiness probe returned HTTP `503`, emitted correlated structured events, withheld sensitive configuration, and recovered after valid local configuration was restored.

This document describes a portfolio exercise. It is not evidence of a production incident, real customer impact, a staffed support team, a contracted SLA, or historical MTTR.

## What happened and what was expected

The operational drill launched an isolated application process with its database URL pointed to an unused local port. The expected behavior was liveness HTTP `200`, readiness HTTP `503`, a stable public dependency code, safe structured logging, and readiness HTTP `200` after recovery. Every expected contract was observed.

## Detection and impact boundary

Detection came from the explicit readiness probe. The controlled scope was one isolated process; the configured local PostgreSQL service was not interrupted. Had this condition occurred in a real environment, database-backed authentication and finance operations could have failed while liveness remained healthy. No actual users or financial records were affected.

## Timeline

The automated evidence records ordered stages, not exact wall-clock timestamps: healthy baseline, isolated dependency failure, readiness detection, request-ID correlation, configuration restoration, and recovered readiness. See the [incident report](../incidents/INC-001-postgresql-unavailable.md) for the verified results.

## Root cause and contributing factors

The direct cause was an unreachable endpoint deliberately supplied to the incident process. The exercise also demonstrated why liveness alone is insufficient: it cannot establish dependency availability. Environment-specific provider monitoring and alerts do not exist in this repository, so the exercise relies on an explicit probe.

## Resolution and recovery validation

The invalid endpoint was removed by terminating the isolated incident process. A recovered process started with valid local configuration, readiness returned HTTP `200`, and the drill completed with `status: passed`. No data repair or schema change was required.

## What worked well

- Separate liveness and readiness contracts exposed the correct failure boundary.
- Bounded PostgreSQL checking prevented an unbounded readiness response.
- `X-Request-Id` correlated the probe and structured events.
- Log sanitization and the drill's explicit leak check protected credentials.
- The rehearsal did not disrupt the shared local PostgreSQL service.

## What did not exist before the operational foundation

The application previously lacked explicit dependency readiness, request-correlated structured events, a safe automated failure rehearsal, and a recovery runbook. This postmortem formalizes the already-implemented controls rather than claiming a new production response capability.

## Actions

| Action | Owner role | Status | Type |
|---|---|---|---|
| Keep the readiness drill in the main CI gate | Repository maintainer | Complete | Preventive |
| Maintain linked incident, QRG, KB, and runbook artifacts | Application owner | Complete | Corrective |
| Select external telemetry and alerting only with environment approval | Engineering follow-up | Not started | Preventive |
| Define provider-specific escalation and backup validation | Application support workflow | Not started | Preventive |

## Lessons learned

Process health and service readiness answer different operational questions. Recovery evidence is stronger when it includes both a dependency probe and one representative authenticated operation. Operational documentation must distinguish repository-owned controls from environment responsibilities and must not imply production history that does not exist.
