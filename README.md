# Architecture Lab — TaskFlow Reference Application

[![CI](https://github.com/kiru42/architecture-lab/actions/workflows/ci.yml/badge.svg)](https://github.com/kiru42/architecture-lab/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue?logo=typescript)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/Backend-NestJS-ea2845?logo=nestjs)](https://nestjs.com/)
[![React](https://img.shields.io/badge/Frontend-React_18-61dafb?logo=react)](https://react.dev/)
[![Implementations](https://img.shields.io/badge/Implementations-11%2F11-success)](docs/comparison-matrix.md)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> A hands-on comparison of 8+ architectural styles applied to the same reference application.

## What is this?

This repository contains **11 complete implementations** of **TaskFlow**, a task-management application, built using different architectural patterns. Every implementation solves exactly the same problem against a frozen feature set, shared API contract, and shared acceptance tests.

**Goal:** Learn architectural trade-offs by contrast, not theory.

### What You'll Learn

By exploring this lab, you'll understand:

1. **Trade-offs are real:** Every architecture has costs and benefits. The "best" choice depends on your constraints (team size, time, domain complexity).

2. **Verbosity vs. Maintainability:** Clean/Hexagonal/Onion are 67% more verbose than Layered, but 10x easier to test and refactor.

3. **Naming matters less than structure:** Clean ≈ Hexagonal ≈ Onion produce identical dependency graphs. Pick the vocabulary your team prefers.

4. **Frontend != Backend patterns:** What works server-side (DDD, CQRS) often doesn't translate well to frontend (use FSD or Atomic instead).

5. **Context is king:** Layered is perfect for simple CRUD. DDD is perfect for complex domains. CQRS+ES is perfect for audit trails. There's no universal winner.

6. **LOC/Feature is a key metric:** The difference between 100 LOC/feature (Layered) vs 300 LOC/feature (CQRS+ES) compounds over 50+ features.

### The TaskFlow Application

**TaskFlow** is a simplified Asana/Trello clone with:

- **Authentication:** Sign up, sign in, JWT tokens
- **Projects:** Create, list, archive projects
- **Tasks:** Create, toggle completion, assign due dates
- **Comments:** Add/delete comments on tasks
- **Real-time updates:** WebSocket for live task updates (selected backends)

**Why this app?** Complex enough to reveal architectural differences (3 aggregates, relationships, state transitions) but simple enough to compare side-by-side (~1-2 hours to implement per pattern).

---

## Repository Structure

```
architecture-lab/
├── shared/              # Frozen contracts shared by all implementations
│   ├── openapi.yaml     # API spec (REST + WebSocket)
│   ├── prisma/          # Database schema
│   └── acceptance/      # BDD scenarios (Cucumber.js)
├── backend/             # Backend implementations
│   ├── 01-layered-ntier/
│   ├── 02-clean-architecture/
│   ├── 03-hexagonal/
│   ├── 04-onion/
│   ├── 05-ddd/
│   ├── 06-cqrs-es/
│   └── 07-modular-monolith/
├── frontend/            # Frontend implementations
│   ├── 01-component-layered/
│   ├── 02-clean-architecture/
│   ├── 03-feature-sliced-design/
│   └── 04-atomic-design/
├── docs/
│   ├── adrs/            # Architecture Decision Records
│   └── comparison-matrix.md
├── docker/              # Generic Dockerfiles shared by all implementations
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   ├── backend-entrypoint.sh
│   └── nginx.conf
├── scripts/
│   ├── sync-prisma-schema.sh      # Push shared/prisma into every backend
│   ├── check-prisma-sync.sh       # Fail if a backend copy drifts from shared/prisma
│   ├── validate-docker-builds.sh  # Build every image, print a pass/fail matrix
│   ├── validate-acceptance.sh     # Run the shared BDD suite against every backend
│   └── validate-all.sh            # lint + typecheck + build + unit tests, x11
└── docker-compose.yml   # Boot any backend+frontend pair
```

---

## Quick Start

### Prerequisites

```bash
# Install dependencies
node -v  # v18+ required
docker --version  # Docker required for PostgreSQL

# Clone the repo
git clone https://github.com/kiru42/architecture-lab.git
cd architecture-lab
```

### Running Any Backend

```bash
# Example: Layered architecture backend
cd backend/01-layered-ntier
npm install
docker compose up -d postgres   # Start PostgreSQL (or any local instance)
cp .env.example .env            # then set DATABASE_URL  (see note below)
npm run prisma:generate         # Generate the Prisma client
npm run prisma:migrate          # Apply migrations from ./prisma
npm run start:dev               # Start NestJS

# API available at http://localhost:3000
```

Every backend ships its own `prisma/schema.prisma` + `prisma/migrations`, copied
from `shared/prisma` by `./scripts/sync-prisma-schema.sh`. That directory
contains the **frozen** schema — never edit a backend copy by hand, edit
`shared/prisma` and re-run the sync script.

To run a second implementation at the same time, point it somewhere else with
`PORT=3010 npm run start:dev` — all backends read `PORT` and default to `3000`.

### Running Any Frontend

```bash
# Example: Clean Architecture frontend
cd frontend/02-clean-architecture
npm install
npm run dev  # Starts on http://localhost:5002
```

Every frontend calls the API through a single relative `/api` prefix. Vite
proxies it in development (to `API_PROXY_TARGET`, `http://localhost:3000` by
default) and nginx proxies it in Docker — there is no per-frontend URL to
configure. Unit tests are run with Vitest (`npm test`).

### Full Stack (Docker Compose)

```bash
# Boot any backend+frontend pair
BACKEND=01-layered-ntier FRONTEND=01-component-layered docker compose up --build

# Frontend  → http://localhost:5173   (nginx, proxies /api to the backend)
# Backend   → http://localhost:3000
# Postgres  → localhost:5432 (taskflow / taskflow / taskflow)

# Available combinations:
# BACKEND: 01-layered-ntier, 02-clean-architecture, 03-hexagonal,
#          04-onion, 05-ddd, 06-cqrs-es, 07-modular-monolith
# FRONTEND: 01-component-layered, 02-clean-architecture,
#           03-feature-sliced-design, 04-atomic-design
```

Both Dockerfiles are generic and parameterised (`BACKEND_DIR` / `FRONTEND_DIR`),
so there is exactly one backend image recipe and one frontend image recipe for
all eleven implementations. Every frontend reaches the API through the same
relative `/api` prefix — Vite proxies it in dev, nginx proxies it in Docker.

To check that every image still builds:

```bash
./scripts/validate-docker-builds.sh          # all 11
./scripts/validate-docker-builds.sh backend  # backends only
```

### Running Tests

```bash
# Backend unit tests (any backend) -- Jest, 129 tests across the seven backends
cd backend/02-clean-architecture
npm test

# Frontend unit tests (any frontend) -- Vitest, 35 tests across the four frontends
cd frontend/03-feature-sliced-design
npm test

# E2E acceptance tests (against any running backend)
cd shared/acceptance
npm install
BACKEND_URL=http://localhost:3000 npm test

# ...or let Docker orchestrate backend + Postgres + acceptance runner:
BACKEND=02-clean-architecture docker compose -f docker-compose.test.yml \
  up --build --abort-on-container-exit --exit-code-from acceptance
```

---

## Verification

Everything below is enforced by CI on every push. Run it locally with the same
commands:

```bash
./scripts/check-prisma-sync.sh        # each backend ships the frozen schema + migrations
./scripts/validate-docker-builds.sh   # all 11 images build
./scripts/validate-acceptance.sh      # the shared BDD suite against all 7 backends
```

`validate-acceptance.sh` takes an exclusive lock and waits for port 3000 to be
released between backends, so a run always talks to the implementation it just
started. It exits non-zero as soon as one backend fails.

The acceptance suite lives in `shared/acceptance`. It is the executable form of
`shared/openapi.yaml`, and **every** backend must pass it:

```bash
BACKEND=05-ddd docker compose -f docker-compose.test.yml \
  up --build --abort-on-container-exit --exit-code-from acceptance
```

Scenarios tagged `@websocket` (real-time delivery) need a gateway and are
excluded from the default run — `npm run test:websocket` runs just those.

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
| 07 | Modular Monolith | ✅ Done | [ADR-0016](docs/adrs/0016-backend-modular-monolith.md) | **Modules > Layers**. Best of monolith (simple ops) + microservices (clear boundaries). Easy migration path. |

### Frontend

| # | Architecture | Status | ADR | Key Insight |
|---|---|---|---|---|
| 01 | Component-Layered | ✅ Done | [ADR-0020](docs/adrs/0020-frontend-component-layered.md) | **Baseline: hooks + services pattern**. Simplest structure, fast to build, scales poorly. |
| 02 | Clean Architecture | ✅ Done | [ADR-0021](docs/adrs/0021-frontend-clean-architecture.md) | **Domain → Application → Infrastructure → Presentation**. Business logic independent of React. High testability but verbose. |
| 03 | Feature-Sliced Design | ✅ Done | [ADR-0022](docs/adrs/0022-frontend-feature-sliced-design.md) | **6 layers (app → pages → widgets → features → entities → shared)**. Excellent scalability, strict import rules. Zustand for state. |
| 04 | Atomic Design | ✅ Done | [ADR-0023](docs/adrs/0023-frontend-atomic-design.md) | **Atoms → Molecules → Organisms → Templates → Pages**. Design system focus. Great for UI libraries, less for business logic. |

---

## Project Statistics

### Implementation Summary

Measured from the tree, not estimated:

| Category | Complete | Source files | Source LOC | Test files | Test LOC |
|----------|----------|--------------|------------|------------|----------|
| **Backends** | 7/7 | 349 | ~10,282 | 29 | ~2,342 |
| **Frontends** | 4/4 | 122 | ~5,166 | 8 | ~585 |
| **ADRs** | 13/13 | — | — | — | — |
| **Total** | **11/11** | **471** | **~15,448** | **37** | **~2,927** |

### Backend Implementations (Detailed)

| # | Architecture | Source files | Source LOC | Unit tests | Layers |
|---|--------------|--------------|------------|------------|--------|
| 01 | Layered N-Tier | 26 | ~882 | 28 | 3 (Controller → Service → Repository) |
| 02 | Clean Architecture | 53 | ~1,496 | 14 | 4 (Presentation → Application → Domain → Infrastructure) |
| 03 | Hexagonal | 61 | ~1,524 | 17 | 3 (Adapters IN → Core → Adapters OUT) |
| 04 | Onion | 39 | ~1,255 | 14 | 4 (API → Application → Domain → Infrastructure) |
| 05 | DDD | 78 | ~2,194 | 24 | Bounded Contexts (Projects, Tasks, Users) |
| 06 | CQRS + Event Sourcing | 60 | ~2,224 | 9 | Commands, Events, Queries, Projections |
| 07 | Modular Monolith | 32 | ~707 | 23 | Modules (Projects, Tasks, Auth, Shared) |

### Frontend Implementations (Detailed)

| # | Architecture | Source files | Source LOC | Unit tests | Layers | State Management |
|---|--------------|--------------|------------|------------|--------|------------------|
| 01 | Component-Layered | 25 | ~1,418 | 10 | 2 (components/, hooks/) | React Context |
| 02 | Clean Architecture | 30 | ~1,110 | 10 | 4 (domain/ → application/ → infrastructure/ → presentation/) | Manual DI Container |
| 03 | Feature-Sliced Design | 36 | ~1,536 | 7 | 6 (app → pages → widgets → features → entities → shared) | Zustand (4 stores) |
| 04 | Atomic Design | 31 | ~1,102 | 8 | 5 (atoms → molecules → organisms → templates → pages) | React Context |

### Key Metrics

- **Average Backend Size:** ~1,469 LOC, 50 files
- **Average Frontend Size:** ~1,292 LOC, 30.5 files
- **Largest Backend:** DDD (78 files, 2,194 LOC)
- **Smallest Backend:** Modular Monolith (32 files, 707 LOC)
- **Largest Frontend:** Feature-Sliced Design (36 files, 1,536 LOC)
- **Smallest Frontend:** Atomic Design (31 files, 1,102 LOC)
- **Unit tests:** 164 in total (129 backend, 35 frontend), all blocking in CI

---

## Tech Stack (Fixed)

- **Language:** TypeScript (strict mode, no `any`)
- **Backend:** NestJS + Prisma + PostgreSQL
- **Frontend:** React 18 + Vite + Tailwind CSS (React Router v7 in frontends 01/04, v6 in 02/03)
- **API:** REST (OpenAPI) + WebSocket
- **Tests:** Jest (backend), Vitest (frontend), Cucumber.js (BDD)
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

### Backend Architectures (05-07)

**Domain-Driven Design (DDD):**
- ✅ **Bounded Contexts > Layers** (Projects, Tasks, Users modules)
- ✅ Value Objects enforce validation at type level (no invalid state possible)
- ✅ Aggregates protect invariants (e.g., can't complete task if project archived)
- ✅ Domain Events decouple modules (TaskCompleted → notify users)
- ❌ 2.5x more code than Layered (~250 LOC/feature vs ~100)
- **Use when:** Complex domain logic, team > 5 devs, long-term evolution

**CQRS + Event Sourcing:**
- ✅ **Events = source of truth** (append-only event store)
- ✅ Complete audit trail (who did what when, replay state at any point)
- ✅ Temporal queries ("show me state as of yesterday 3pm")
- ✅ Optimized read models (separate DB for queries, blazing fast)
- ❌ Very high complexity (event versioning, projection rebuilds, eventual consistency)
- ❌ 3x more code than Layered (~300 LOC/feature)
- **Use when:** Audit-critical domains (finance, healthcare), temporal analytics needed

**Modular Monolith:**
- ✅ **Modules > Layers** (feature-based boundaries, not technical)
- ✅ Best of both worlds: monolith simplicity + microservices boundaries
- ✅ Each module can use different patterns (Projects = DDD, Auth = Layered)
- ✅ Easy migration path to microservices (extract module → deploy separately)
- ✅ Moderate complexity (~130 LOC/feature)
- **Use when:** Growing team, anticipating microservices later, pragmatic approach

### Frontend Architectures

**Component-Layered (Baseline):**
- ✅ Simplest structure (hooks/ + components/ + services/)
- ✅ Fast to build (~225 LOC/page, no ceremony)
- ❌ Scales poorly (everything in one folder after 20+ components)
- ❌ Hard to enforce boundaries (any component can import any service)
- **Use when:** Prototypes, solo devs, <10 pages, speed > structure

**Clean Architecture (Frontend):**
- ✅ **Domain layer independent of React** (pure TS business logic)
- ✅ Excellent testability (test use cases without mounting components)
- ✅ Easy to swap React → Vue/Svelte (only presentation layer changes)
- ❌ Verbose (~275 LOC/page, lots of folders)
- ❌ Manual DI container (no framework support)
- **Use when:** Complex frontend logic, framework independence matters, long-term maintainability

**Feature-Sliced Design (FSD):**
- ✅ **Best scalability** (6 layers with strict import rules)
- ✅ Feature isolation (projects/ folder contains everything about projects)
- ✅ Public API contract (`index.ts` exports, internals private)
- ✅ Zustand stores per entity (lightweight, no boilerplate)
- ⚠️ Learning curve (layer rules take time to internalize)
- **Use when:** Large teams (5+ devs), 20+ pages, feature-rich apps

**Atomic Design:**
- ✅ **Design system focus** (reusable atoms → molecules → organisms)
- ✅ Great for UI libraries (Storybook integration, component catalog)
- ✅ Clear component hierarchy (Button → FormField → SignInForm)
- ❌ Less effective for business logic (where do hooks go? what layer?)
- ❌ Debate about atom granularity (is Label an atom or molecule?)
- **Use when:** Building design systems, component libraries, Storybook-driven dev

---

## Comparison Matrix

See [docs/comparison-matrix.md](docs/comparison-matrix.md) for a comprehensive side-by-side analysis of:
- LOC per use case
- Files touched per feature
- Test mocking surface
- Refactor cost (estimated time to change a core entity)
- Onboarding time (junior dev productivity)
- Real-time integration fit (WebSocket complexity)
- Team size sweet spot (1 dev vs 10+ devs)
- Migration paths (monolith → microservices)

---

## Repository Timeline

This lab was built iteratively following TDD discipline:

- **May 2025:** Backends #1-4 (Layered, Clean, Hexagonal, Onion) — Discovered Clean/Hexagonal/Onion are structurally identical
- **May 2025:** Backend #5 (DDD) — Value Objects, Aggregates, Domain Events
- **May 2025:** Backend #6 (CQRS+ES) — Event sourcing, projections, temporal queries
- **May 2025:** Backend #7 (Modular Monolith) — Module boundaries, migration paths
- **May 2025:** Frontends #2-3 (Clean, FSD) — Domain-centric frontend, Zustand stores
- **May 2025:** Frontends #1, #4 (Component-Layered, Atomic) — Baseline + Design System patterns
- **May 2025:** Documentation — 13 ADRs, comparison matrix, complete README
- **September 2026:** Audit and repair — five implementations were broken behind
  a green badge. The contract was made executable (acceptance suite run against
  every backend, blocking CI), the broken implementations were fixed, and unit
  tests were added where there were none: the four frontends and backends
  `03` and `07`.

**Total build time:** ~60 hours to write, plus a full audit and repair pass

---

## Known Gaps

Honest list of what this lab does **not** yet cover:

1. **Integration tests.** Backends are covered by unit tests and by the shared
   acceptance suite, but there is no layer of repository/adapter integration
   tests against a real database.
2. **`06-cqrs-es` is not durable.** Its event store and read models are
   in-memory, so state is lost on restart. That is a decision about the event
   store, not about the API contract it already honours.
3. **Real-time is implemented once.** Only `01-layered-ntier` exposes a WebSocket
   gateway, so `@websocket` acceptance scenarios only run against it.
4. **Component-level frontend tests.** The frontends are covered at the service,
   repository and store level, plus one hook under `renderHook`; there is no
   rendered-component test and no end-to-end browser test.
5. **Enhancements not attempted:** mock API servers, bundle-size analysis,
   performance benchmarks, deployment examples, observability, and the
   microservice extraction from `07-modular-monolith`.

---

## Contributing

This is a **solo learning lab** built by [@kiru42](https://github.com/kiru42). Each implementation follows TDD discipline, with git history showing red → green → refactor cycles.

Not accepting PRs, but feel free to fork and adapt for your own learning!

---

## Useful Resources

### Backend Architectures
- **Clean Architecture:** [Uncle Bob's Blog](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- **Hexagonal:** [Alistair Cockburn](https://alistair.cockburn.us/hexagonal-architecture/)
- **DDD:** [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- **CQRS+ES:** [Martin Fowler's CQRS](https://martinfowler.com/bliki/CQRS.html), [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- **Modular Monolith:** [Simon Brown's C4 Model](https://c4model.com/)

### Frontend Architectures
- **Feature-Sliced Design:** [Official Docs](https://feature-sliced.design/)
- **Atomic Design:** [Brad Frost's Book](https://atomicdesign.bradfrost.com/)
- **Clean Architecture (Frontend):** [Advanced React Patterns](https://advanced-react-patterns.com/)

---

## License

MIT — Educational purposes.
