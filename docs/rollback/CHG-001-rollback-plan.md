# CHG-001 Rollback Plan

## Triggers

Suspend the integration if authorization boundaries fail, duplicate transactions are created, conflicts mutate original data, or the change regresses existing finance flows.

## Safe rollback sequence

1. Stop or disable the external pipeline apply workflow.
2. Roll back application code to a version that does not expose the import Route Handler.
3. Validate liveness, readiness, authentication, manual transaction creation, and transaction history.
4. Keep the additive `transaction_imports` table and its records in place.
5. Diagnose and prepare a forward fix using preserved idempotency evidence.

## Migration compatibility and data preservation

The migration is additive. Older application code does not query the new table, so application rollback does not require schema rollback. Do not drop the table, delete import history, or delete linked transactions automatically. Any future cleanup requires explicit data ownership review, a verified backup/restore plan, and a separately authorized change.

## Recovery forward

Apply the corrected application version, run migrations idempotently, repeat route and cross-repository validation with synthetic records, and resume the pipeline only after first import, identical replay, and conflict behavior are correct.
