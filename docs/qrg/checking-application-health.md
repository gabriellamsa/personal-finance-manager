# QRG: Checking Application Health

Use only against the intended local or authorized environment. Never print environment variables, cookies, tokens, or connection strings.

1. Check process liveness:
   ```bash
   curl -i http://localhost:3000/api/health/live
   ```
2. Check dependency readiness with a safe correlation ID:
   ```bash
   curl -i -H 'X-Request-Id: health-check-001' http://localhost:3000/api/health/ready
   ```
3. Interpret `200` as healthy for that probe and `503` readiness as configuration or PostgreSQL failure. Liveness `200` plus readiness `503` means the process is alive but not ready.
4. Record the `X-Request-Id` response header.
5. Search an approved local log capture:
   ```bash
   rg '"requestId":"health-check-001"' application.log
   ```
6. Distinguish `CONFIGURATION_INVALID`, `DATABASE_TIMEOUT`, and `DATABASE_UNAVAILABLE` using only the sanitized response and events.
7. Confirm PostgreSQL service and network state through the approved local service manager or provider interface. Do not echo `DATABASE_URL`.
8. Restore configuration, connectivity, or the database service through the normal environment process.
9. Repeat readiness with a new request ID.
10. Run one authorized authenticated smoke test, such as loading categories.
11. Record timestamps, request IDs, result codes, recovery action, and validation outcome in the incident record.

For a safe local rehearsal, run `npm run build && npm run ops:drill`. See the [full runbook](../runbooks/readiness-check-failure.md).
