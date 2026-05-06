# ADR-0001: Reference Application Domain

## Status
Accepted — Foundation for all implementations

## Context
To compare architectural patterns meaningfully, we need a reference application that:
- Is small enough to implement 8+ times without burnout
- Is complex enough to expose real architectural trade-offs
- Has a frozen feature set so every implementation solves the same problem
- Includes at least one challenging cross-cutting concern (real-time notifications)

## Decision
**TaskFlow** — a task-management product with:
- 4 core entities: User, Project, Task, Comment
- 5 frozen acceptance scenarios (BDD/E2E)
- Real-time WebSocket notifications on task assignment
- REST API + WebSocket, PostgreSQL + Prisma

The feature set is **frozen**. No implementation may change the OpenAPI spec, Prisma schema, or BDD scenarios to make its life easier. If an architecture struggles with the contract, that's documented in its ADR as an observed limitation.

## Consequences
- **Pro:** Fair comparison — same problem, same constraints
- **Pro:** Real-time concern forces architectures to show how they handle side effects
- **Con:** Some architectures may feel over-engineered for this small domain (that's the point)

## When this would change
Never during this lab. The frozen contract is the control variable.
