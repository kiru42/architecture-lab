# Architecture Lab — TaskFlow Reference Application

> A hands-on comparison of 8+ architectural styles applied to the same reference application.

## What is this?

This repository contains multiple implementations of **TaskFlow**, a simple task-management product, built using different architectural patterns. Every implementation solves exactly the same problem against a frozen feature set, shared API contract, and shared acceptance tests.

**Goal:** Learn architectural trade-offs by contrast, not theory.

---

## Repository Structure

```
architecture-lab/
├── shared/              # Frozen contracts shared by all implementations
│   ├── openapi.yaml     # API spec (REST + WebSocket)
│   ├── prisma/          # Database schema
│   └── acceptance/      # BDD scenarios (Cucumber + Playwright)
├── backend/             # Backend implementations
│   ├── 01-layered-ntier/
│   ├── 02-clean-architecture/
│   ├── 03-hexagonal/
│   ├── 04-onion/
│   ├── 05-ddd/
│   ├── 06-cqrs-event-sourcing/
│   └── 07-modular-monolith/
├── frontend/            # Frontend implementations
│   ├── 01-component-layered/
│   ├── 02-clean-architecture/
│   ├── 03-feature-sliced-design/
│   └── 04-atomic-only/
├── docs/
│   ├── adrs/            # Architecture Decision Records
│   └── comparison-matrix.md
└── docker-compose.yml   # Boot any backend+frontend pair
```

---

## Quick Start

```bash
# Boot the layered backend + component-layered frontend
BACKEND=01-layered-ntier FRONTEND=01-component-layered docker compose up

# Run acceptance tests against any implementation
cd shared/acceptance
BACKEND_URL=http://localhost:3000 npm test
```

---

## Implementations

### Backend

| # | Architecture | Status | ADR | Key Insight |
|---|---|---|---|---|
| 01 | Layered / N-tier | ✅ Done | [ADR-0010](docs/adrs/0010-backend-layered.md) | Simple but coupled to Prisma. Mock 20+ methods in tests. |
| 02 | Clean Architecture | ✅ Done | [ADR-0011](docs/adrs/0011-backend-clean-architecture.md) | Excellent testability (mock 4 methods). +67% LOC vs Layered. |
| 03 | Hexagonal (Ports & Adapters) | ✅ Done | [ADR-0012](docs/adrs/0012-backend-hexagonal.md) | **Same as Clean** with explicit "Ports IN/OUT" naming. |
| 04 | Onion | ✅ Done | [ADR-0013](docs/adrs/0013-backend-onion.md) | **Same as Clean/Hexagonal** with "concentric layers" metaphor. |
| 05 | DDD | ✅ Done | [ADR-0014](docs/adrs/0014-backend-ddd.md) | **Bounded Contexts > Layers**. Value Objects = type-safe + validation. 2.5x more code but worth it for complex domains. |
| 06 | CQRS + Event Sourcing | ✅ Done | [ADR-0015](docs/adrs/0015-backend-cqrs-es.md) | **Events = source of truth**. Complete audit trail + temporal queries. Very high complexity, worth it for audit-critical domains. |
| 07 | Modular Monolith | ⏳ Pending | — | — |

### Frontend

| # | Architecture | Status | ADR | Key Insight |
|---|---|---|---|---|
| 01 | Component-Layered | ⏳ Pending | — | Baseline |
| 02 | Clean Architecture | ⏳ Pending | — | — |
| 03 | Feature-Sliced Design | ⏳ Pending | — | — |
| 04 | Atomic-only | ⏳ Pending | — | — |

---

## Tech Stack (Fixed)

- **Language:** TypeScript (strict mode, no `any`)
- **Backend:** NestJS + Prisma + PostgreSQL
- **Frontend:** React + React Router v6 + Vite
- **API:** REST (OpenAPI) + WebSocket
- **Tests:** Jest (backend), Vitest (frontend), Cucumber.js (BDD), Playwright (E2E)
- **Infra:** Docker + Docker Compose + GitHub Actions

---

## Key Findings So Far

### Backend Architectures (01-04)

**Layered (Baseline):**
- ✅ Fast to implement (~100 LOC/feature, 1.5h first feature)
- ❌ Coupled to Prisma (hard to swap DB)
- ❌ Tests mock 20+ Prisma methods
- **Use when:** Small team, simple CRUD, speed matters

**Clean Architecture:**
- ✅ Excellent testability (mock only 4 repository methods)
- ✅ Business logic in entities (easy to find and test)
- ✅ Easy to swap Prisma → MongoDB (new adapter)
- ❌ +67% LOC vs Layered (~167 LOC/feature)
- ❌ +67% time first feature (2.5h vs 1.5h)
- **Use when:** Long-term maintainability > speed, complex business rules

**Hexagonal (Ports & Adapters):**
- ✅ Same benefits as Clean
- ✅ Explicit "Ports IN/OUT" vocabulary
- ⚠️ **Structurally identical to Clean** (just renamed layers)
- **Use when:** Team prefers Alistair Cockburn vocabulary over Uncle Bob

**Onion Architecture:**
- ✅ Same benefits as Clean/Hexagonal
- ✅ "Concentric layers" metaphor (domain at center)
- ⚠️ **Structurally identical to Clean/Hexagonal** (only naming differs)
- ❌ String-based DI tokens less type-safe than abstract classes
- **Use when:** Team prefers "layers" terminology over "circles" or "ports"

**Critical Finding:** Clean ≈ Hexagonal ≈ Onion (cosmetic differences only). All three produce identical dependency graphs with domain at center, application layer wrapping it, and infrastructure at edges. The real choice is **domain-centric** (Clean/Hexagonal/Onion) vs **data-centric** (Layered).

---

## Comparison Matrix

See [docs/comparison-matrix.md](docs/comparison-matrix.md) for a side-by-side analysis of:
- LOC per use case
- Files touched per feature
- Test mocking surface
- Refactor cost
- Onboarding time
- Real-time integration fit
- Team size sweet spot

---

## Contributing

This is a solo learning lab. Each implementation follows TDD discipline, with git history showing red → green → refactor cycles.

---

## License

MIT — Educational purposes.
