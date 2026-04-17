Object.assign(process.env, {
  APP_URL: process.env.APP_URL ?? "http://localhost:3000",
  DATABASE_URL:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/personal_finance_manager?schema=public",
  JWT_SECRET:
    process.env.JWT_SECRET ??
    "test-jwt-secret-with-at-least-thirty-two-characters",
  NODE_ENV: "test",
});
