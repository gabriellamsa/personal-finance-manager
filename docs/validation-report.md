# Validation and Release Readiness Report

## Current publication evidence

The original report below is a historical snapshot from 2026-08-30. The observability baseline was subsequently merged and passed [remote CI](https://github.com/gabriellamsa/personal-finance-manager/actions/runs/33320503475). See the [2026-09-07 portfolio validation](release-validation/portfolio-publication.md) for the current import integration and demonstration.

## Executive summary

On 2026-08-30, the uncommitted Application Support & Reliability implementation was validated locally against the repository's complete quality, browser, database, operational, and security gates.

Result: **passed with documented non-blocking dependency risk**.

The application is ready for branch publication and remote CI validation. This report does not claim that a deployment, production environment, external monitoring backend, or remote GitHub Actions run has been completed.

## Validated change scope

The validated working tree includes:

- the minimal visual redesign and responsive application navigation;
- authentication form and invalid-cookie redirect regression fixes;
- category color selection and chart legend improvements;
- preference and time-zone compatibility fixes;
- Next.js 16.3.3 and aligned build dependencies;
- expected client-disconnect classification;
- expanded Vitest and Playwright regression coverage;
- the existing health, structured logging, correlation, and operational-drill implementation.

## Validation matrix

| Gate | Result | Evidence |
|---|---|---|
| Clean dependency installation | Passed | `npm ci` installed the lockfile graph successfully with the required environment configured. |
| Database migrations | Passed | Two migrations were discovered and none were pending. |
| Patch integrity | Passed | `git diff --check` returned no whitespace errors. |
| ESLint | Passed | `npm run lint`. |
| TypeScript | Passed | `npm run typecheck`. |
| Unit and integration tests | Passed | 18 Vitest files and 53 tests passed. |
| Browser end-to-end tests | Passed | Six Playwright tests passed in Chromium. |
| Production build | Passed | Next.js 16.3.3 compiled, type-checked, and generated the expected route manifest. |
| Operational readiness drill | Passed | Healthy, dependency-failure, and recovery stages matched the documented contracts. |
| Security diff review | Passed | Complete review of 41 changed source/configuration files produced zero reportable findings. |
| Runtime HTTP smoke | Passed | Root, authentication redirect, protected API, health, request-ID, and readiness contracts passed. |
| Database cleanup | Passed | User, category, and transaction counts were unchanged after E2E execution. |

## Browser and product-flow coverage

Playwright validated:

- authentication uses POST bodies and does not place credentials in query strings;
- a stale invalid session cookie does not create a redirect loop;
- registration, logout, and sign-in;
- category creation and color persistence;
- transaction creation, filtering, editing, and deletion;
- profile currency and time-zone updates;
- password change and older-session invalidation;
- authenticated desktop and mobile navigation;
- absence of horizontal layout overflow;
- liveness and readiness response contracts.

Temporary test accounts and their dependent data were removed. The database returned to four users, fifteen categories, and twenty-five transactions.

## Runtime contract evidence

The final configured development runtime returned:

- `GET /` -> HTTP `200`;
- `GET /en` -> HTTP `404`, with no locale redirect;
- unauthenticated `GET /dashboard` -> HTTP `307` to the local sign-in route;
- unauthenticated `GET /api/transactions` -> HTTP `401` with the standard API error contract;
- `GET /api/health/live` -> HTTP `200`;
- `GET /api/health/ready` -> HTTP `200`, with configuration and PostgreSQL checks passing.

A valid `X-Request-Id` was preserved across response and logs. An invalid value containing spaces was replaced with a generated UUID. Health responses were uncached and request durations were exposed through `Server-Timing` and structured completion events.

Starting the application without required environment configuration produced liveness HTTP `200` and readiness HTTP `503`. This is the intended fail-closed behavior. After valid local configuration was restored, readiness returned HTTP `200`.

## Operational failure and recovery evidence

The automated drill verified:

1. healthy liveness and readiness return HTTP `200`;
2. an isolated process configured with an unavailable PostgreSQL endpoint remains live;
3. readiness returns HTTP `503` with `DATABASE_UNAVAILABLE`;
4. `health.check.failed` and `http.request.completed` share the incident request ID;
5. captured output contains no database URL or password;
6. a recovered process returns readiness HTTP `200`.

See the [PostgreSQL Readiness Drill Report](./incident-reports/postgresql-readiness-drill.md) for the sanitized incident record.

## Security assessment

The diff review covered session handling, redirects, financial-data isolation, input validation, structured-log redaction, request correlation, public health endpoints, dependency changes, and the responsive UI surface.

No reportable vulnerability was found. One candidate concerning broad classification of `ERR_STREAM_PREMATURE_CLOSE` was validated and rejected as a security finding because no attacker-controlled path to a security-relevant hidden failure was established. The behavior remains appropriate for suppressing expected framework noise from aborted browser navigation.

## Dependency risk

`npm audit` reports four residual advisory records:

- three high-severity records in one Prisma tooling chain: `prisma` -> `@prisma/config` -> `deepmerge-ts`;
- one low-severity `esbuild` advisory through development tooling.

There are no critical advisories. npm's automatic Prisma remediation proposes an incompatible downgrade, while overriding `deepmerge-ts` across a major version would bypass the dependency's supported range. Neither action was applied.

The CI pipeline now runs `npm run audit:critical` so a future critical advisory blocks validation without pretending that the documented high-severity tooling advisory has a safe automatic remediation.

## Known limitations

- At the time of this historical report, the branch had not been pushed. The merged observability baseline later passed remote CI as linked above.
- The local machine used Node.js 24, while CI is configured for Node.js 20.
- The project does not define a coverage-percentage threshold.
- Logs remain on stdout/stderr without repository-owned aggregation, retention, or alerting.
- Authentication throttling is process-local and is not a shared multi-instance control.
- Production ingress, TLS, secret storage, database privileges, backup validation, and deployment rollback remain environment responsibilities.
- No deployment or production smoke test is represented by this report.

## Reproduction

With PostgreSQL running and `.env` configured:

```bash
npm ci
npm run verify:full
```

The command applies pending migrations, runs lint, standalone type checking, Vitest, Playwright, the production build used by Playwright, the operational drill, and the critical dependency gate.
