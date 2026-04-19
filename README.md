# Personal Finance Management System

A portfolio-grade full-stack finance application for secure account management, transaction tracking, category-based reporting, and dashboard analytics.

## Product Scope

The product is designed as a production-minded personal finance system where users can:

- Create an account and sign in securely
- Record income and expenses
- Organize transactions by default or custom categories
- Filter historical data by type, category, and date range
- Review totals, recent activity, and reporting charts in a dashboard

## Current Status

The project is actively implemented and already includes the core finance flow.

### Implemented

- Credential-based authentication with Argon2id password hashing
- Signed JWT session cookies stored as HTTP-only cookies
- Protected route handling in both server-side data access and `proxy.ts`
- User registration, login, logout, and authenticated session lookup
- Prisma schema for users, categories, and transactions
- Default seeded categories for income and expenses
- Custom category creation
- Transaction create, read, update, and delete flows
- Transaction filters by type, category, date range, and page
- Dashboard balance, total income, total expenses, recent transactions, category chart, and monthly summary chart
- Standardized API success and error envelopes
- Loading, empty, success, and error states across the main product flows
- Profile editing with persisted currency and time zone preferences
- Strategic automated tests for core services and route handlers with Vitest
- Basic CI workflow for lint, test, and production build validation

### In Progress

- Additional UX polish and deeper product refinement
- README deployment examples for specific providers once a hosting target is chosen
- Broader test coverage for more feature surfaces

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma
- PostgreSQL
- Zod
- React Hook Form
- Recharts
- Custom JWT auth with HTTP-only cookies

## Architecture Decisions

### Why Next.js Route Handlers

The application keeps frontend, backend, and authentication in a single cohesive codebase. Route Handlers provide a clean API boundary without introducing a second Node service prematurely.

### Why Custom JWT Cookies

The project currently uses email/password authentication only. A custom JWT session layer keeps the authentication flow explicit and predictable while avoiding unnecessary library complexity for this scope.

### Why Prisma + PostgreSQL

This stack gives strong type safety, explicit relational modeling, and a realistic migration workflow suitable for a production-style portfolio project.

### Domain Rules

- Money is stored as integer cents, not floating-point decimals.
- Every transaction belongs to one user and one category.
- Categories can be system-defined or user-defined.
- Dashboard totals are always derived from persisted transaction data.

## Folder Structure

```text
app/
  (public)/
  (auth)/
  (app)/
  api/
components/
  shared/
  ui/
features/
  auth/
  categories/
  dashboard/
  transactions/
lib/
  auth/
  constants/
  crypto/
  db/
  env/
  formatters/
  http/
  utils/
prisma/
```

## Main Routes

### Public

- `/`
- `/sign-in`
- `/sign-up`

### Protected

- `/dashboard`
- `/transactions`
- `/categories`
- `/settings`

### API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `PATCH /api/profile`
- `GET /api/categories`
- `POST /api/categories`
- `GET /api/transactions`
- `POST /api/transactions`
- `PATCH /api/transactions/[transactionId]`
- `DELETE /api/transactions/[transactionId]`

## Environment Variables

Create a `.env` file based on `.env.example`.

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/personal_finance_manager?schema=public"
APP_URL="http://localhost:3000"
JWT_SECRET="replace-with-a-long-random-secret-at-least-32-characters"
```

### Variable Notes

- `DATABASE_URL`: PostgreSQL connection string used by Prisma
- `APP_URL`: Base application URL for local execution
- `JWT_SECRET`: Secret used to sign and verify session tokens

## Local Setup

### Requirements

- Node.js 20+
- npm
- PostgreSQL

### Install dependencies

```bash
npm install
```

### Run database migrations

```bash
npm run db:migrate
```

### Seed default categories

```bash
npm run db:seed
```

### Start the development server

```bash
npm run dev
```

The application will run at [http://localhost:3000](http://localhost:3000).

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:watch
npm run db:generate
npm run db:migrate
npm run db:deploy
npm run db:seed
```

## Quality Assurance

- Vitest covers critical service and route-handler behavior for authentication and transaction flows
- GitHub Actions runs lint, test, and build on every push to `main` and on pull requests

## Security Notes

- Passwords are hashed with Argon2id before persistence
- Sessions are stored in HTTP-only cookies
- Sensitive routes are protected in both `proxy.ts` and server-side auth guards
- Validation is enforced with Zod at the API boundary
- Authorization checks always scope access by authenticated user id

## Deployment Notes

The codebase is deployment-ready, but no hosting provider integration is hardcoded yet.

To deploy this project, you will need:

- A Node-compatible hosting platform for the Next.js application
- A PostgreSQL database for production
- Production environment variables for `DATABASE_URL`, `APP_URL`, and `JWT_SECRET`
- A strong random JWT secret and secure database credentials

### Recommended deployment sequence

1. Provision a production PostgreSQL database.
2. Configure production environment variables.
3. Run `npm run db:deploy` during the deployment pipeline.
4. Start the application with `npm run build` and `npm run start`, or use your platform's standard Next.js deployment flow.

## Engineering Goals

- Strong type safety from UI to database access
- Clear separation of concerns between pages, services, schemas, and infrastructure
- Reusable UI primitives and domain services
- Professional UX with deliberate loading, empty, success, and error states
- Production-style project quality suitable for portfolio presentation
