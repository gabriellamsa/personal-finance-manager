# Preventive Maintenance Checklist

- [ ] Run `npm run audit:critical` and record unresolved advisories without unsafe automatic upgrades.
- [ ] Confirm migration status with `npm run db:deploy` in the intended environment.
- [ ] Call liveness and readiness and retain only sanitized results and request IDs.
- [ ] Confirm the environment owner has defined backup and restore responsibility; this repository does not configure backups.
- [ ] Validate registration, login, logout, session invalidation, and unauthenticated API rejection.
- [ ] Review structured events for safe error codes and correlation. Record API error rates only when a real aggregation source exists.
- [ ] Run lint, typecheck, unit tests, E2E tests, build, and the operational drill.
- [ ] Import one synthetic sample through the integration endpoint.
- [ ] Repeat the same source record and confirm `already_imported` with no new transaction.
- [ ] Change the normalized payload and confirm `SOURCE_RECORD_CONFLICT`.
- [ ] Review incident, runbook, QRG, KB, change, validation, and rollback links.
