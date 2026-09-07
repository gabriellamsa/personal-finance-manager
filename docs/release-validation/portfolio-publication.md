# Portfolio Publication Validation — 2026-09-07

## Scope and results

This is a controlled local demonstration with synthetic records. It is not a production deployment, customer incident, uptime measurement, or external monitoring service.

| Check | Executed result |
|---|---|
| Local migration status | Three migrations; none pending |
| ESLint / TypeScript | Passed after regenerating local Next.js output |
| Vitest | 20 files / 67 tests passed |
| Playwright / production build | Six Chromium scenarios passed; Next.js 16.3.3 build passed |
| Operational drill | Healthy 200/200 → isolated dependency failure 200/503 → recovery 200; correlated sanitized logs |
| Python quality | Ruff, formatting, mypy, 40 tests, 95.01% coverage, wheel and source build passed |
| First import | Three transactions created |
| Identical replay | Three already_imported; zero new transactions; persisted count remained three |
| Changed replay | One source conflict; persisted count remained three |
| Mixed dry run | Seven received, two valid, four validation rejections, one category rejection, zero database writes |
| Demonstration cleanup | Dedicated synthetic account and its dependent records removed |
| Critical dependency gate | Passed; five non-critical audit records remain (one low, one moderate, three high) |

The existing dependency findings include the Prisma tooling chain involving deepmerge-ts, development esbuild, and @humanfs/node. No forced dependency downgrade or unsupported major override was applied. The critical-only gate does not mean the dependency graph has zero advisories.

## Evidence

- [Machine-readable integration results](../evidence/integration-results.json)
- [Desktop dashboard](../evidence/dashboard.png)
- [Mobile dashboard](../evidence/dashboard-mobile.png)
- [Transactions](../evidence/transactions.png)
- [Categories](../evidence/categories.png)
- [Short product recording](../evidence/product-demo.webm)
- [GitHub Actions](https://github.com/gabriellamsa/personal-finance-manager/actions)

Screenshots and the silent recording show synthetic demonstration data only. The separate CLI result graphic is a visualization of executed aggregate results, not a terminal screenshot.

## Reproduce

With local PostgreSQL configured, run `npm run verify:full`. For the recorded integration, install the sibling Python project as documented in its README, start this application's development server with `APP_URL=http://localhost:3002 npx next dev --port 3002`, and run `node scripts/capture-portfolio-demo.mjs` in a second terminal from this repository.

The capture script refuses non-local application/database destinations, creates one temporary account, asserts CLI outcomes and persisted counts, and deletes that account in its cleanup block. It writes screenshots, a video, and allowlisted aggregate evidence to `docs/evidence/`. Intermediate recordings and Python job reports remain ignored.

Local HTTP integration uses the development server: the production build correctly sets Secure session cookies, which HTTPX will not resend over plain HTTP. Do not weaken production cookies to run the demo. Production deployments require HTTPS.

## Local generated-file repair

Conflicting duplicate files in `.next/types` caused TypeScript errors before validation. The previous generated directory was preserved outside the repository and rebuilt. No application type declarations were weakened or excluded to hide the failure.
