# ADR-0002: Shared Tech Stack

## Status
Accepted — Foundation for all implementations

## Context
To isolate architectural differences from tech-stack differences, the programming language, frameworks, database, and tooling must be identical across all implementations.

## Decision

| Layer | Choice | Rationale |
|---|---|---|
| Language | TypeScript (strict mode) | Type safety + widely adopted |
| Backend | NestJS | Mature, DI-native, supports multiple patterns |
| Frontend | React + React Router + Vite | Industry standard, data router patterns |
| Database | PostgreSQL via Prisma | Relational constraints + migration stability |
| API | REST (OpenAPI) + WebSocket | Simple contract, testable, real-time support |
| Tests | Jest (BE), Vitest (FE), Cucumber.js (BDD) | Comprehensive coverage |
| Lint/Format | ESLint (strict) + Prettier | Consistent code style |
| Infra | Docker Compose | One-command boot for any pair |

**Frozen constraint:** Every backend implementation uses the same `shared/openapi.yaml` and `shared/prisma/schema.prisma`. Every frontend implementation consumes the same API contract.

## Consequences
- **Pro:** Architectural differences are clearly visible (not hidden by framework differences)
- **Pro:** Acceptance tests can run against any implementation unchanged
- **Con:** Some architectures may feel more natural in other frameworks (e.g., Hexagonal in Java/Spring)
- **Con:** NestJS's DI and decorators may bias certain patterns

## Trade-offs Accepted
We accept NestJS's opinionated structure because:
1. It supports DI (needed for Clean/Hexagonal/DDD)
2. It's TypeScript-native
3. It has WebSocket support built-in

If an architecture struggles with NestJS conventions, that struggle is **documented**, not worked around.

## When this would change
Never during this lab. The shared stack is the control variable.
