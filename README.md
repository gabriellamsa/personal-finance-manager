# Personal Finance Management System

A portfolio-grade full-stack web application for managing personal finances with secure authentication, transaction tracking, category-based reporting, and a professional financial dashboard.

## Overview

This project is being built with a production-oriented engineering mindset to demonstrate real-world full-stack capabilities, including authentication, database modeling, API design, validation, data visualization, and scalable application structure.

The product goal is to allow users to:

- Register and sign in securely
- Track income and expenses
- Organize transactions by category
- Monitor balance and financial trends
- Filter historical data by date, type, and category
- Analyze spending behavior through charts and summaries

## Planned Core Features

### Authentication

- User registration
- User login and logout
- Protected application routes
- Secure session handling

### Dashboard

- Total balance overview
- Total income and total expenses cards
- Recent transactions feed
- Monthly financial summary
- Category-based charts and indicators

### Transactions

- Create, edit, and delete transactions
- Transaction listing with clean organization
- Filters by date range, transaction type, and category
- Pagination-ready structure

### Categories

- Default system categories
- Custom user-defined categories
- Category-based reporting

### UX and Product Quality

- Responsive application layout
- Loading, empty, success, and error states
- Accessible forms with validation feedback
- Professional UI suitable for a production-style portfolio project

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma
- PostgreSQL
- Custom JWT auth with HTTP-only cookies
- Zod
- React Hook Form
- Recharts

## Engineering Goals

- Strong type safety across frontend and backend
- Clean, scalable folder structure
- Reusable UI and domain abstractions
- Standardized API error handling
- Secure password hashing and auth protection
- Clear separation of concerns
- Deployment-ready foundation

## Project Status

The repository is currently in the foundation phase.

Completed so far:

- Clean Next.js base setup
- Initial project architecture definition
- Engineering contract and implementation guidelines
- Prisma data model for users, categories, and transactions
- Secure credential-based authentication foundation
- Public, auth, and protected application route groups

Planned next steps:

1. Define the application folder structure by feature
2. Model the database schema and domain entities
3. Implement authentication
4. Build transactions, categories, and dashboard flows
5. Refine UX, validations, and deployment readiness

## Local Development

### Requirements

- Node.js 20+
- npm
- PostgreSQL

### Run the project

```bash
npm install
npm run db:generate
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Notes

This project is intentionally being built as a professional portfolio piece, prioritizing maintainability, clarity, security, and realistic product architecture over tutorial-style shortcuts.
