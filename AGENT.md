# Personal Finance Management System

## Mission

Build a portfolio-grade full-stack product with production-oriented engineering quality, clear architecture, secure authentication, maintainable business rules, and professional UX.

## Communication and Language Rules

- Chat explanations for the user must be written in Portuguese (pt-BR).
- All project code, file names, folder names, routes, variables, functions, components, schemas, migrations, UI copy, commits, and technical documentation must be written in English (en-US).
- Never mix Portuguese into the codebase.

## Final Architecture

### Core Stack

- Framework: Next.js 16 App Router with TypeScript.
- Styling: Tailwind CSS 4.
- Backend: Next.js Route Handlers for the API layer.
- Database: PostgreSQL.
- ORM: Prisma.
- Authentication: Auth.js with Credentials Provider and JWT session strategy using secure HTTP-only cookies.
- Validation: Zod.
- Forms: React Hook Form with Zod resolver.
- Charts: Recharts.

### Why This Architecture

- A single Next.js codebase keeps frontend, backend, auth, and validation cohesive without introducing an unnecessary second service.
- Route Handlers provide a clean API boundary for business logic, form submissions, filters, and future third-party integrations.
- Server Components should be the default for dashboard and list views to reduce client bundle size and keep data fetching close to the server.
- Client Components should be used only where interactivity is required, such as forms, filters, dialogs, charts, and inline actions.
- Prisma with PostgreSQL provides strong typing, maintainable schema evolution, and a professional data model for a portfolio-ready application.
- Auth.js with credentials-based login avoids external auth dependencies for the initial build and keeps the app deployable with minimal infrastructure.

## Data and Domain Rules

- Store monetary values as integer cents, never floating-point decimals.
- Use explicit transaction types: `INCOME` and `EXPENSE`.
- Support both default categories and user-created categories.
- Every transaction must belong to exactly one user and one category.
- Dashboard calculations must always be derived from persisted transaction data, never cached in a way that can drift silently.

## Folder Structure Strategy

Use a feature-oriented structure with a thin shared core:

```text
app/
  (public)/
  (auth)/
  (app)/
  api/
components/
  ui/
  shared/
features/
  auth/
  dashboard/
  transactions/
  categories/
lib/
  auth/
  db/
  env/
  http/
  utils/
prisma/
```

### Structure Rules

- Keep business rules inside `features/*`, not inside page components.
- Keep persistence and infrastructure code inside `lib/*`.
- Keep API request/response schemas close to the relevant feature.
- Keep reusable visual primitives in `components/ui`.
- Keep route-level composition inside `app/*`.

## Security Baseline

- Hash passwords with a strong password hashing algorithm such as Argon2id.
- Validate every external input with Zod.
- Never trust client-side values for authorization-sensitive operations.
- Restrict every protected query and mutation by authenticated user id on the server.
- Use secure, HTTP-only, same-site cookies for session handling.
- Do not expose secrets, raw database errors, or internal stack traces to the client.
- Centralize environment variable parsing and fail fast on invalid configuration.

## API Design Rules

- Use a standardized response envelope for success and error cases.
- Return typed validation errors for form submissions.
- Keep route handlers thin and delegate logic to feature services.
- Normalize domain errors into predictable HTTP responses.
- Avoid duplicating business rules across route handlers and UI components.

## UX and Product Quality Rules

- Every async UI action must have loading, success, and error states.
- Empty states must be deliberate and informative.
- Filters should sync with URL search params where appropriate.
- Forms must provide field-level validation feedback and accessible labels.
- Responsive behavior is required from the start.
- Visual design should feel product-grade, not template-grade.

## Implementation Order

1. Define architecture and folder structure.
2. Model the database schema and domain entities.
3. Implement authentication and route protection.
4. Build transactions and categories APIs plus business rules.
5. Build dashboard aggregations and reporting endpoints.
6. Implement frontend screens and data integration.
7. Refine UX states, validation feedback, and responsive behavior.
8. Prepare a professional README and deployment instructions.

## External Services Policy

- Do not require external login-based services for the initial implementation when a local-first alternative is viable.
- Prefer local PostgreSQL for development.
- If any later step requires a third-party service, account, billing setup, OAuth credentials, API keys, or manual authorization, stop that specific integration and document the exact prerequisite before continuing.

## Engineering Standard

- Prioritize clarity, consistency, and maintainability over shortcuts.
- Avoid overengineering, but never accept brittle architecture.
- Favor reusable, typed, testable abstractions when they meaningfully reduce future complexity.
- Treat this codebase as a production-style portfolio project.
