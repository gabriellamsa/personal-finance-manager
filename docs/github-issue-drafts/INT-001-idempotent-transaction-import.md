# INT-001: Add an idempotent transaction import integration

## Context and problem

A separate Python ETL client needs a narrow authenticated API. The generic transaction endpoint has no source metadata or destination-enforced idempotency.

## Scope and non-goals

Add an additive metadata model, strict integer-cents contract, session-derived ownership, category authorization/type validation, server-computed SHA-256 hash, atomic creation, replay/conflict behavior, race handling, tests, and change/rollback documentation. Do not add a global API key, direct database access, service-token platform, scheduler, or queue.

## Acceptance, security, and validation

- First import returns `201 created`; identical replay returns `200 already_imported`; changed replay returns `409 SOURCE_RECORD_CONFLICT`.
- No client `userId` or hash is accepted.
- Concurrent duplicates cannot create two transactions.
- Logs expose no financial payload or credential data.
- Clean/existing migrations, full quality gate, manual regression, and cross-repository scenarios pass.
