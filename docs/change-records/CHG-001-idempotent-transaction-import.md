# CHG-001: Idempotent Transaction Import

## Change record

| Field | Value |
|---|---|
| Change ID | CHG-001 |
| Purpose | Add a safe API boundary for the synthetic Python ETL portfolio case study |
| Exercise window | Local implementation and validation on 2026-08-31 |
| Risk | Medium: authenticated write path plus additive schema metadata |

## Context and affected components

The change connects the existing finance application to a separate Python CLI without granting direct database access. It affects the Prisma schema and migration history, transaction integration service, authenticated Route Handler, tests, operational documentation, and API route inventory. Manual transaction behavior remains unchanged.

## Data model and API contract

The additive `transaction_imports` table records `userId`, unique `transactionId`, `sourceSystem`, `sourceRecordId`, a server-computed SHA-256 payload hash, and creation time. The unique key `(userId, sourceSystem, sourceRecordId)` makes idempotency destination-owned.

`POST /api/integrations/transactions/import` accepts integer cents, a destination category ID, normalized transaction data, source system, and source record ID. It never accepts `userId`; ownership comes from the existing HTTP-only session cookie. Creation returns HTTP `201`, an identical replay returns HTTP `200`, and a changed payload for the same key returns HTTP `409` with `SOURCE_RECORD_CONFLICT`.

## Security considerations

The route reuses session authentication, validates a strict body, verifies category access and type, and uses the existing request-correlation and sanitized logging layer. No global API key is added. The local pipeline must use a dedicated synthetic account. A production integration should separately evaluate revocable service credentials, OAuth, or service accounts.

## Migration and implementation plan

1. Apply the additive migration.
2. Deploy code that understands the new table and endpoint.
3. Validate unauthenticated rejection, first import, replay, conflict, and concurrency behavior.
4. Enable only the dedicated local integration workflow.

The transaction and metadata are created in one nested Prisma write. A concurrent unique-key loser re-reads the winning metadata and returns replay or conflict without creating a duplicate.

## Test plan and success criteria

Run lint, typecheck, Vitest, Playwright, build, migration checks, the operational drill, dependency audit, and the cross-repository scenarios. Success requires no regression to manual transactions, no duplicate imports, explicit conflict, preserved `X-Request-Id`, and no sensitive log content.

## Rollback trigger and validation

Rollback is triggered by incorrect authorization, duplicate creation, unhandled migration incompatibility, or regression in existing finance flows. Suspend the client and roll back application code first; preserve additive metadata. See the [rollback plan](../rollback/CHG-001-rollback-plan.md) and [release validation](../release-validation/CHG-001-release-validation.md).
