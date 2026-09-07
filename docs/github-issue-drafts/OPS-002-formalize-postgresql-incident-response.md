# OPS-002: Formalize PostgreSQL readiness drill as an incident response case

## Context and problem

The repository has a safe readiness drill and evidence report but needs distinct incident, postmortem, quick-reference, and knowledge-base artifacts without implying a production incident or staffed support organization.

## Scope and non-goals

Create INC-001, a postmortem, health QRG, HTTP 503 KB article, cross-links, and honest terminology. Do not replace the drill, add external telemetry, or claim real customer impact, SLA, paging, or production history.

## Acceptance, security, and validation

- All documents identify the exercise as a controlled local simulation.
- Timeline and request IDs come from executed drill evidence.
- Commands do not expose credentials or connection strings.
- `npm run ops:drill` passes and related links resolve.
