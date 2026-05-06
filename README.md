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
| 01 | Layered / N-tier | 🔄 In Progress | [ADR-0010](docs/adrs/0010-backend-layered.md) | Baseline |
| 02 | Clean Architecture | ⏳ Pending | — | — |
| 03 | Hexagonal (Ports & Adapters) | ⏳ Pending | — | — |
| 04 | Onion | ⏳ Pending | — | — |
| 05 | DDD | ⏳ Pending | — | — |
| 06 | CQRS + Event Sourcing | ⏳ Pending | — | — |
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
