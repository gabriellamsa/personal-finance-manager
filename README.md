<h1 align="center">Personal Finance Manager</h1>

<p align="center">
  <strong>Full-stack personal finance application for authenticated accounts, transaction management, category-based reporting, and dashboard analytics.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-111111?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 16"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/PostgreSQL-17-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vitest-tested-6E9F18?style=flat-square&logo=vitest&logoColor=white" alt="Vitest"/>
  <img src="https://img.shields.io/badge/Playwright-E2E-2EAD33?style=flat-square&logo=playwright&logoColor=white" alt="Playwright"/>
  <img src="https://img.shields.io/badge/GitHub_Actions-CI-2088FF?style=flat-square&logo=githubactions&logoColor=white" alt="GitHub Actions"/>
</p>

---

## Overview

Personal Finance Manager is a portfolio project focused on application development, authenticated user flows, relational data modeling, API design, automated testing, and continuous integration.

The application allows users to manage income and expenses, organize transactions by category, and review financial data through a dashboard.

The core finance flow is implemented. Deployment hardening, observability, broader test coverage, and production operational documentation are still in progress.

---

## Features

### Account and session management

- User registration and login
- Credential-based authentication
- Argon2id password hashing
- Signed JWT sessions stored in HTTP-only cookies
- Logout and authenticated session lookup
- Password changes with session invalidation
- Profile editing
- Currency and time zone preferences
- In-memory throttling for sensitive authentication routes

### Transaction management

- Create, read, update, and delete transactions
- Income and expense classification
- Filtering by type, category, and date range
- Pagination for transaction history
- User-scoped authorization checks
- Loading, empty, success, and error states

### Category management

- Default income and expense categories
- Custom category creation
- Custom category editing
- Protected category deletion
- Validation for category-related requests

### Dashboard

- Current balance
- Total income
- Total expenses
- Recent transactions
- Category reporting chart
- Monthly summary chart

---

## Technology Stack

| Area | Technologies |
|---|---|
| Application | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| API layer | Next.js Route Handlers |
| Database | PostgreSQL, Prisma |
| Validation | Zod, React Hook Form |
| Authentication | Custom JWT sessions, HTTP-only cookies |
| Data visualization | Recharts |
| Unit testing | Vitest |
| End-to-end testing | Playwright |
| Continuous integration | GitHub Actions |

---

## Architecture

The application keeps the frontend, backend, authentication, and data access in one cohesive Next.js codebase.

### Application boundary

Next.js Route Handlers provide the API boundary for authentication, profile, categories, and transactions without introducing a separate Node.js service.

### Data access

Prisma provides typed database access and migrations for PostgreSQL.

### Authentication

The project uses email/password authentication with:

- Argon2id password hashing
- JWT session tokens
- HTTP-only cookies
- Server-side authentication guards
- Protected route handling through `proxy.ts`
- User-scoped authorization checks

### Validation

Zod schemas validate data at the API boundary before requests reach application services or database operations.

---

## Data Model

| Entity | Purpose |
|---|---|
| User | Stores account and profile information |
| Category | Stores system-defined and user-defined categories |
| Transaction | Stores income and expense records linked to a user and category |

Domain rules include:

- Money is stored as integer cents.
- Every transaction belongs to one user and one category.
- Categories can be system-defined or user-defined.
- Dashboard totals are derived from persisted transaction data.
- Users can only access their own protected data.

---

## Project Structure

```text
app/
├── (public)/
├── (auth)/
├── (app)/
└── api/

components/
features/
├── auth/
├── categories/
├── dashboard/
└── transactions/

lib/
├── auth/
├── constants/
├── crypto/
├── db/
├── env/
├── formatters/
├── http/
└── utils/

prisma/
e2e/
tests/mocks/
.github/workflows/
```

---

## Main Routes

### Public pages

```text
/
/sign-in
/sign-up
```

### Protected pages

```text
/dashboard
/transactions
/categories
/settings
```

### API routes

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/change-password
GET    /api/auth/session

PATCH  /api/profile

GET    /api/categories
POST   /api/categories
PATCH  /api/categories/[categoryId]
DELETE /api/categories/[categoryId]

GET    /api/transactions
POST   /api/transactions
PATCH  /api/transactions/[transactionId]
DELETE /api/transactions/[transactionId]
```

---

## Local Setup

### Requirements

- Node.js 20+
- npm
- PostgreSQL

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file based on `.env.example`.

Required variables:

```env
DATABASE_URL=
APP_URL=
JWT_SECRET=
```

`JWT_SECRET` should be a long, random secret with at least 32 characters.

### 3. Generate the Prisma client

```bash
npm run db:generate
```

### 4. Run database migrations

```bash
npm run db:migrate
```

### 5. Seed default categories

```bash
npm run db:seed
```

### 6. Start the development server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

---

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run test:watch
npm run test:e2e
npm run db:generate
npm run db:migrate
npm run db:deploy
npm run db:seed
```

---

## Quality Assurance

The project includes automated checks for the main application flows.

### Unit tests

Vitest covers critical service and route-handler behaviour for:

- Authentication
- Profile updates
- Category management
- Transaction management

### End-to-end tests

Playwright covers critical browser flows including:

- User registration
- Sign-in and logout
- Profile updates
- Password changes
- Category management
- Transaction CRUD operations

### Continuous integration

GitHub Actions runs:

- Database migrations
- Linting
- Unit tests
- End-to-end tests
- Production build validation

The workflow runs on pushes to `main` and on pull requests.

---

## Security Notes

- Passwords are hashed with Argon2id before persistence.
- Sessions are stored in HTTP-only cookies.
- Password changes invalidate previously issued sessions.
- Sensitive authentication routes use in-memory throttling.
- API input is validated with Zod.
- Protected routes use server-side authentication guards.
- Authorization checks scope access by authenticated user ID.
- No credentials or environment secrets are committed to the repository.

---

## Current Limitations

This project is not presented as a production deployment.

Current limitations include:

- No hosting provider integration is hardcoded.
- Deployment hardening is not complete.
- Observability and operational monitoring are not implemented.
- Broader test coverage is still being expanded.
- Accessibility and UX refinement remain ongoing.
- A production runbook has not yet been completed.

---

## Roadmap

- Expand automated test coverage
- Add dashboard period filters
- Improve reporting capabilities
- Complete custom category management
- Perform a deeper accessibility review
- Add deployment hardening
- Document a production runbook
- Add observability and operational readiness checks

---

## Engineering Goals

- Maintain strong type safety from UI to database access.
- Keep clear boundaries between pages, services, schemas, and infrastructure.
- Use explicit relational data modeling.
- Provide consistent API success and error responses.
- Treat loading, empty, success, and error states as part of the product experience.
- Validate changes through automated tests and continuous integration.
- Keep the project technically honest about its current maturity.
