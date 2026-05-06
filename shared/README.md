# Shared Contracts

This directory contains the frozen contracts that all implementations must conform to.

**DO NOT modify these files to accommodate a specific implementation.** If an architecture struggles with the spec, document that in its ADR — the constraint is the point.

## Contents

- **`openapi.yaml`** — REST API contract + WebSocket events
- **`prisma/schema.prisma`** — Database schema (PostgreSQL)
- **`acceptance/`** — BDD scenarios (Cucumber.js + Playwright)

## Acceptance Tests (5 scenarios)

Every implementation must pass all five:

1. ✅ A new user can sign up, sign in, and see an empty dashboard.
2. ✅ A user can create a project, add three tasks to it, and mark one complete.
3. ✅ A user can assign a task to another user and that user receives a real-time notification.
4. ✅ A user can comment on a task and another viewer sees the comment after refresh.
5. ✅ A user signing in with wrong credentials gets a clear error and is not authenticated.

## Running Acceptance Tests

```bash
cd acceptance
npm install
BACKEND_URL=http://localhost:3000 npm test
```

The same test suite runs against every backend implementation.
