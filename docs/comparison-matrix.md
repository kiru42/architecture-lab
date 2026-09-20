# Architecture Comparison Matrix

**Last Updated:** 2025-05-09  
**Status:** In Progress (7/7 backends ✅ | 2/4 frontends ✅)

## Overview

This matrix compares **7 backend** and **4 frontend** architectural patterns applied to the same TaskFlow reference application. All implementations solve identical problems using a frozen API contract and shared Prisma schema.

---

## Backend Architectures

| # | Architecture | Files | Layers | Key Principle | Complexity | Testability | When to Use |
|---|--------------|-------|--------|---------------|------------|-------------|-------------|
| **01** | **Layered N-Tier** | 30 | 3 | Technical separation (Controller→Service→Repo) | ⭐ Low | ⭐⭐ Medium | Small teams, simple CRUD, speed matters |
| **02** | **Clean Architecture** | 37 | 4 | Dependency inversion (Domain at center) | ⭐⭐⭐ High | ⭐⭐⭐⭐ Excellent | Complex business logic, long-term projects |
| **03** | **Hexagonal (Ports & Adapters)** | 79 | 4 | Explicit ports (IN/OUT interfaces) | ⭐⭐⭐ High | ⭐⭐⭐⭐ Excellent | Same as Clean, explicit adapter contracts |
| **04** | **Onion** | 31 | 4 | Concentric layers metaphor | ⭐⭐⭐ High | ⭐⭐⭐⭐ Excellent | Same as Clean/Hexagonal, prefer visual model |
| **05** | **DDD (Domain-Driven Design)** | 49 | N/A | Bounded contexts + Value Objects | ⭐⭐⭐⭐ Very High | ⭐⭐⭐⭐⭐ Excellent | Complex domains, ubiquitous language needed |
| **06** | **CQRS + Event Sourcing** | 21 | N/A | Commands/Queries separation + Event store | ⭐⭐⭐⭐⭐ Extreme | ⭐⭐⭐⭐ Excellent | Audit-critical systems, temporal queries |
| **07** | **Modular Monolith** | 32 | N/A | Module boundaries (not layers) | ⭐⭐ Medium | ⭐⭐⭐ Good | Grow to microservices, pragmatic teams |

### Backend Complexity Comparison

```
Layered (100 LOC/feature) ───────────────────────────┐
Clean/Hexagonal/Onion (167 LOC/feature) ─────────────┤ +67%
DDD (250 LOC/feature) ───────────────────────────────┤ +150%
CQRS+ES (300+ LOC/feature) ──────────────────────────┤ +200%
Modular Monolith (130 LOC/feature) ──────────────────┘ +30%
```

### Backend Trade-offs

| Pattern | ✅ Advantages | ⚠️ Trade-offs |
|---------|--------------|---------------|
| **Layered** | Fast to write, easy to understand | Coupled to Prisma, hard to test in isolation |
| **Clean** | Excellent testability, framework-independent | +67% LOC, manual DI, learning curve |
| **Hexagonal** | Same as Clean, explicit adapter contracts | Same as Clean, port/adapter terminology overhead |
| **Onion** | Same as Clean/Hexagonal | Same as Clean, concentric metaphor not for everyone |
| **DDD** | Type-safe domain, enforced invariants | 2.5x LOC, high upfront cost, overkill for CRUD |
| **CQRS+ES** | Complete audit trail, temporal queries | 3x LOC, eventual consistency, event store complexity |
| **Modular Monolith** | Simple ops, clear boundaries, migration path | Coarse-grained scaling, shared database |

---

## Frontend Architectures

| # | Architecture | Files | Layers | Key Principle | Complexity | Scalability | When to Use |
|---|--------------|-------|--------|---------------|------------|-------------|-------------|
| **01** | **Component-Layered** | 22 ✅ | 2 | Hooks + Services (simple folders) | ⭐ Low | ⭐ Poor | Prototypes, solo devs, <10 pages |
| **02** | **Clean Architecture** | 27 ✅ | 4 | Domain → Application → Infra → Presentation | ⭐⭐⭐ High | ⭐⭐⭐⭐ Excellent | Framework independence, complex logic |
| **03** | **Feature-Sliced Design** | 33 ✅ | 6 | app → pages → widgets → features → entities → shared | ⭐⭐⭐ Medium | ⭐⭐⭐⭐⭐ Excellent | Large teams, feature-rich apps, 20+ pages |
| **04** | **Atomic Design** | 28 ✅ | 5 | Atoms → Molecules → Organisms → Templates → Pages | ⭐⭐ Medium | ⭐⭐ Medium | Design systems, UI libraries, Storybook |

### Frontend Folder Depth Comparison

```
Component-Layered:     src/hooks/useProjects.ts            (2 levels)
Clean Architecture:    src/application/use-cases/...       (4 levels)
Feature-Sliced Design: src/entities/project/model/...     (6 levels)
Atomic Design:         src/components/atoms/Button/...    (5 levels)
```

### Frontend State Management

| Pattern | State Approach | Global State | API Layer |
|---------|---------------|--------------|-----------|
| **Component-Layered** | React hooks (`useState`, `useEffect`) | Context API (optional) | Service functions (fetch) |
| **Clean Architecture** | Use cases (application layer) | DI container + Context | Repositories (infrastructure) |
| **Feature-Sliced Design** | Zustand stores (per entity) | Zustand (4 stores) | Entity APIs (entities/*/api/) |
| **Atomic Design** | React hooks (in organisms) | Context API (optional) | Service functions (fetch) |

### Frontend Trade-offs

| Pattern | ✅ Advantages | ⚠️ Trade-offs |
|---------|--------------|---------------|
| **Component-Layered** | Fast to write, minimal abstraction | Scales poorly, no enforced boundaries, inconsistent patterns |
| **Clean** | Testable use cases, framework-independent | High boilerplate, manual DI, deep folder nesting |
| **FSD** | Excellent scalability, strict import rules | Deep nesting (6 layers), learning curve, tooling needed |
| **Atomic** | Design system clarity, Storybook fit | Ambiguous boundaries, no place for business logic |

---

## Cross-Cutting Comparisons

### Code Volume (Backend)

Measured from the tree (source files only; tests counted separately):

| Pattern | LOC | Files | Unit tests |
|---------|-----|-------|------------|
| Layered | ~882 | 26 | 28 |
| Clean | ~1,496 | 53 | 14 |
| Hexagonal | ~1,524 | 61 | 17 |
| Onion | ~1,255 | 39 | 14 |
| DDD | ~2,194 | 78 | 24 |
| CQRS+ES | ~2,224 | 60 | 9 |
| Modular Monolith | ~707 | 32 | 23 |

### Code Volume (Frontend)

| Pattern | LOC | Files | Unit tests |
|---------|-----|-------|------------|
| Component-Layered | ~1,418 | 25 | 10 |
| Clean | ~1,110 | 30 | 10 |
| FSD | ~1,536 | 36 | 7 |
| Atomic | ~1,102 | 31 | 8 |

### Testing Strategy

Every backend ships Jest unit tests and passes the same Cucumber.js BDD suite
(`shared/acceptance`, run by CI against each backend, 34 steps per run).

| Pattern | Unit Tests | Integration Tests | BDD Acceptance |
|---------|-----------|-------------------|----------------|
| **Layered** | Mock Prisma (20+ methods) | Test HTTP endpoints | Shared suite |
| **Clean** | Mock repositories (4 methods) | Test use cases | Shared suite |
| **Hexagonal** | Mock ports (explicit interfaces) | Test adapters | Shared suite |
| **Onion** | Mock outer layer services | Test domain logic | Shared suite |
| **DDD** | Test value objects + aggregates | Test bounded contexts | Shared suite |
| **CQRS+ES** | Test command/query handlers | Test event store | Shared suite |
| **Modular Monolith** | Test module services | Test module integration | Shared suite |

### Team Size Recommendations

| Team Size | Backend Pattern | Frontend Pattern |
|-----------|----------------|------------------|
| **Solo (1 dev)** | Layered or Modular Monolith | Component-Layered |
| **Small (2-3 devs)** | Clean or Modular Monolith | FSD (if growing) or Component-Layered |
| **Medium (4-6 devs)** | Clean/Hexagonal/Onion or DDD | FSD |
| **Large (7+ devs)** | DDD or Modular Monolith (→ microservices) | FSD |
| **Enterprise (10+ devs)** | DDD + CQRS (if audit-critical) | FSD + Micro-frontends |

---

## Migration Paths

### Backend Evolution

```
Layered
  ↓ (extract repositories)
Clean/Hexagonal/Onion
  ↓ (add bounded contexts + value objects)
DDD
  ↓ (split to modules)
Modular Monolith
  ↓ (extract modules to services)
Microservices
```

### Frontend Evolution

```
Component-Layered
  ↓ (add use cases + DI)
Clean Architecture
  ↓ (group by features, add Zustand)
Feature-Sliced Design
  ↓ (extract features to micro-frontends)
Micro-Frontends
```

---

## Key Learnings

### Backend Insights

1. **Clean/Hexagonal/Onion are nearly identical** — Choose based on team terminology preference
2. **DDD is worth it for complex domains** — Value Objects prevent invalid state at compile-time
3. **CQRS+ES is extreme but powerful** — Only use when audit trail is mandatory
4. **Modular Monolith is underrated** — Best pragmatic choice for growing teams

### Frontend Insights

1. **Component-Layered works until it doesn't** — Refactor early (before 10 pages)
2. **Clean Architecture is overkill for most React apps** — React hooks are already a form of use cases
3. **FSD is the sweet spot for large apps** — Import rules prevent spaghetti code
4. **Atomic Design works for UI libraries** — Less useful for business-heavy apps

---

## Status Summary

| Category | Complete | In Progress | Not Started |
|----------|----------|-------------|-------------|
| **Backends** | 7/7 ✅ | — | — |
| **Frontends** | 4/4 ✅ | — | — |
| **ADRs** | 13/13 ✅ | — | — |
| **E2E Tests** | TBD | — | — |

---

## References

- [ADR-0001: Reference App Domain](./adrs/0001-reference-app-domain.md)
- [ADR-0002: Shared Tech Stack](./adrs/0002-shared-tech-stack.md)
- Backend ADRs: [0010](./adrs/0010-backend-layered.md) - [0016](./adrs/0016-backend-modular-monolith.md)
- Frontend ADRs: [0020](./adrs/0020-frontend-component-layered.md) - [0023](./adrs/0023-frontend-atomic-design.md)
