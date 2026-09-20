# Shared Contracts

This directory contains the frozen contracts that all implementations must conform to.

**DO NOT modify these files to accommodate a specific implementation.** If an architecture struggles with the spec, document that in its ADR — the constraint is the point.

## Contents

- **`openapi.yaml`** — REST API contract + WebSocket events
- **`prisma/schema.prisma`** — Database schema (PostgreSQL)
- **`acceptance/`** — BDD scenarios (Cucumber.js, HTTP only)

## Acceptance Tests (6 scenarios)

Every backend must pass all six:

1. ✅ `auth` — A new user signs up and sees an empty dashboard.
2. ✅ `auth` — Signing in with wrong credentials is refused.
3. ✅ `projects` — A user creates a project, adds three tasks and marks one complete.
4. ✅ `comments` — The project owner comments on a task and reads it back.
5. ✅ `comments` — Someone who does not own the project is denied access.
6. ✅ `notifications` — An assigned task is persisted for the assignee.
7. 🏷️ `notifications` — *tagged `@websocket`* — The assignee receives a real-time
   notification. Excluded from the default run because only `01-layered-ntier`
   exposes a gateway; run it with `npm run test:websocket`.

## Running Acceptance Tests

```bash
cd acceptance
npm install
BACKEND_URL=http://localhost:3000 npm test
```

The same suite runs against every backend implementation — `./scripts/validate-acceptance.sh`
boots each one through Docker Compose and runs it, and CI does the same per backend.
