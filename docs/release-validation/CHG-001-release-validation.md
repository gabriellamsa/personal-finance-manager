# CHG-001 Release Validation

This record is intentionally updated only from executed evidence. It does not represent a deployment or production validation.

The original application release gates were re-run alongside the cross-repository
pipeline scenarios on 2026-09-02. The results below include the current local
test count and the additional synthetic integration cases.

| Gate | Result | Evidence |
|---|---|---|
| Dependency installation | Passed | `npm ci`; 492 packages installed, four known audit records reported |
| Prisma generation | Passed | Prisma Client 6.19.3 generated from the updated schema |
| Migration on clean database | Passed | All three migrations applied to `personal_finance_manager_clean_validation`; temporary database removed |
| Migration over previous schema | Passed | Additive migration applied to local `personal_finance_manager` |
| ESLint | Passed | `npm run lint` |
| TypeScript | Passed | `npm run typecheck` |
| Vitest | Passed | 20 files, 67 tests |
| Playwright | Passed | Six Chromium scenarios after installing the lockfile-compatible browser |
| Production build | Passed | Next.js 16.3.3 build executed by the Playwright web server |
| Operational drill | Passed | Baseline `200/200`, simulated dependency failure `200/503`, recovery readiness `200`, no sensitive data exposed |
| First import and identical replay | Passed | First apply created three; identical replay returned three `already_imported` |
| Import without notes | Passed | A synthetic row with an empty `notes` field was created and persisted with `notes = null` |
| Conflict and invalid category | Passed | Changed replay returned one `SOURCE_RECORD_CONFLICT`; authenticated inaccessible category returned HTTP `404` |
| Authentication boundaries | Passed | Unauthenticated import returned HTTP `401`; invalid synthetic credentials stopped the CLI with exit code `1` |
| Authentication failure report | Passed | Global authentication failure returned CLI exit code `1`, status `failed`, and generated `manifest.json`, `summary.json`, and `summary.md` |
| Retry exhaustion | Passed | A local destination returning HTTP `503` produced exit code `2`, three transient failures, and six retries with `PIPELINE_MAX_RETRIES=2` |
| Manual transaction regression | Passed | Existing create endpoint returned HTTP `201`; temporary manual check was deleted through the API |
| Security-focused changed-file review | Passed | Auth, schema, logging allowlist, generated-output ignores, samples, and repository file inventory reviewed |
| Critical dependency audit | Passed with documented non-critical findings | No critical advisory; one low and three high development-tooling records remain |
| Patch integrity | Passed | `git diff --check` |
