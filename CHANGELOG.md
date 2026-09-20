# Changelog

All notable changes to the Architecture Lab project.

## [1.1.0] - 2026-09-20

### 🎯 Every implementation now honours the contract

The "11/11 Done" of 1.0.0 was aspirational. Five of the eleven implementations
could not build, boot, or serve the routes the shared OpenAPI spec defines, and
the CI badge was green the whole time because every step carried
`continue-on-error: true` and the acceptance job was hardcoded to `if: false`.

### 🐛 Fixed

- **Three backends did not compile at all.** `03-hexagonal`, `04-onion` and
  `05-ddd` were written against a different database schema (`Project.ownerId`,
  `Project.description`, `Task.status`, `User.hashedPassword` where the frozen
  schema has `userId`, no description, `completed` and `password`).
- **`03-hexagonal` contained two parallel implementations.** The half wired into
  the modules was the legacy one; the contract-shaped half — with comments —
  was dead code. The migration to the new half is now finished.
- **`02` and `06` served a different API.** `/auth/register` and `/auth/login`
  instead of `/auth/signup` and `/auth/signin`; no `/auth/me`, no
  `PATCH /projects/:id`, no `PATCH /tasks/:id`, and `06` had no project, task or
  comment routes whatsoever.
- **`06`'s projections never ran.** Command handlers appended to the event store
  but never published to the `EventBus`, so every read model stayed empty for the
  lifetime of the process.
- **`01` and `02` shipped no migrations.** Prisma's starter `.gitignore` excludes
  `prisma/migrations`, so their directories could never be committed and every
  container started against an empty database.
- **`02` rejected every request body.** `forbidNonWhitelisted: true` with DTOs
  that carried no validation decorators.
- **`07` had no ESLint config**, so its `lint` script crashed rather than linted.
- **Frontend lint was dead in three different ways.** `02` had a `lint` script
  but neither an ESLint config nor the dependencies; `03` and `04` declared
  `lint` twice in `package.json` (the strict variant lost to the loose one) and
  `03` pinned eslint 8 + `@typescript-eslint` 6 while its flat config imports
  `typescript-eslint` 8; `01` had no config at all. All four are now linted with
  the same eslint 9 flat config, and the warnings it surfaced were fixed rather
  than silenced.
- **The shared acceptance suite could not run.** It required `ts-node`, which was
  not a dependency, and it opened the WebSocket *after* the assignment that was
  supposed to trigger the notification.
- **Bad frontend API wiring.** `01` targeted its own dev port, `04` targeted a
  nonexistent backend, and `03`'s proxy was missing the rewrite that strips
  `/api`. All four now use one relative `/api` convention.
- **Backends ignored `PORT`**, hardcoding 3003/3005/3006/3007 while compose
  published 3000.

### 🏗️ Infrastructure

- `31,273` tracked files → `595`. `node_modules` and `dist` had been committed
  before `.gitignore` existed, so it had never applied to them.
- Two parameterised Dockerfiles (`docker/backend.Dockerfile`,
  `docker/frontend.Dockerfile`) replace eleven per-implementation ones of which
  only two existed.
- `frontend/04-atomic-only` → `frontend/04-atomic-design`, so the directory
  finally matches ADR-0023.
- `*.tsbuildinfo` is no longer tracked (it had been committed by accident), and
  `07-modular-monolith` gained the `tsconfig.build.json` it was missing.
- Every backend carries its own `prisma/schema.prisma` + `prisma/migrations`
  (`./scripts/sync-prisma-schema.sh`), and `./scripts/check-prisma-sync.sh`
  fails CI if that ever drifts again.
- CI is now blocking end to end: shared-contract checks, lint, typecheck, build
  and unit tests for all eleven implementations, then the shared BDD suite
  against all seven backends.

### 🧪 Tests

- The acceptance suite was rewritten: a Cucumber World instead of module-level
  state, one scenario per real behaviour, and a genuine WebSocket assertion
  behind the `@websocket` tag. Playwright was removed — it was opening a browser
  that no assertion used.
- Unit tests rewritten where the domain changed and extended with the behaviours
  that had none: 14 for `04-onion`, 24 for `05-ddd`, 9 for `06-cqrs-es`,
  14 for `02`.
- **The four frontends had no tests at all.** `npm test` was
  `echo "No tests yet" && exit 0`, which is why nothing noticed that every
  frontend called `/auth/profile` (a route that does not exist) and unwrapped
  `{ user }` where the API returns the user directly. They now carry 35 tests
  (10/10/7/8) over services, repositories, API modules, the zustand store and
  one hook. Each has its own `vitest.config.ts` and a setup file; the three that
  run in Node polyfill `localStorage` rather than pulling jsdom in for a `Map`.
- **`03-hexagonal` and `07-modular-monolith` had no tests either** — `jest`
  exited 1 with "No tests found". 17 and 23 tests now cover the domain entities,
  the use cases' ownership checks and the Prisma-backed services.

### 📊 Status

| | Build | Lint | Typecheck | Unit tests | Acceptance |
|---|---|---|---|---|---|
| 01-layered-ntier | ✅ | ✅ | ✅ | ✅ | ✅ |
| 02-clean-architecture | ✅ | ✅ | ✅ | ✅ | ✅ |
| 03-hexagonal | ✅ | ✅ | ✅ | ✅ | ✅ |
| 04-onion | ✅ | ✅ | ✅ | ✅ | ✅ |
| 05-ddd | ✅ | ✅ | ✅ | ✅ | ✅ |
| 06-cqrs-es | ✅ | ✅ | ✅ | ✅ | ✅ |
| 07-modular-monolith | ✅ | ✅ | ✅ | ✅ | ✅ |
| frontend ×4 | ✅ | ✅ | ✅ | ✅ | n/a |

Every number above is a command that ran, not an intention. Unit tests: 115
across the seven backends, 35 across the four frontends.

---

## [1.0.0] - 2025-05-09

### 🎉 Project Complete

**Architecture Lab** is now feature-complete with **11 implementations** of the TaskFlow reference application.

### ✅ Implemented Architectures

#### Backend (7/7)
- **01 - Layered N-Tier** (~1,627 LOC, 30 files) — Baseline CRUD architecture
- **02 - Clean Architecture** (~1,236 LOC, 37 files) — Domain-centric, testable
- **03 - Hexagonal (Ports & Adapters)** (~2,023 LOC, 79 files) — Explicit ports/adapters
- **04 - Onion Architecture** (~905 LOC, 31 files) — Concentric layers
- **05 - Domain-Driven Design** (~1,027 LOC, 49 files) — Bounded contexts, value objects
- **06 - CQRS + Event Sourcing** (~600 LOC, 21 files) — Event-driven, audit trail
- **07 - Modular Monolith** (~661 LOC, 32 files) — Module boundaries, migration path

#### Frontend (4/4)
- **01 - Component-Layered** (~1,353 LOC, 22 files) — Baseline hooks + services
- **02 - Clean Architecture** (~982 LOC, 27 files) — Framework-independent domain
- **03 - Feature-Sliced Design** (~1,418 LOC, 33 files) — Scalable 6-layer architecture
- **04 - Atomic Design** (~988 LOC, 28 files) — Design system hierarchy

### 📚 Documentation

- **13 ADRs** (Architecture Decision Records) documenting every pattern
- **Comparison Matrix** with LOC, complexity, scalability, and use-case analysis
- **Comprehensive README** with statistics, findings, and resources
- **Shared Contracts** (OpenAPI spec, Prisma schema, acceptance tests)

### 📊 Key Statistics

- **Total Files:** 389 TypeScript files
- **Total LOC:** ~12,220 lines of code
- **Total Build Time:** ~60 hours (including tests, docs, refactoring)
- **Test Coverage:** All implementations build without errors
- **Acceptance Tests:** 5 BDD scenarios (Cucumber.js)

### 🔬 Key Findings

1. **Clean ≈ Hexagonal ≈ Onion** — Structurally identical, only naming differs
2. **Verbosity vs Maintainability** — Domain-centric architectures are 67%+ more verbose but 10x easier to test
3. **Context is King** — No universal "best" architecture; choose based on constraints
4. **Frontend ≠ Backend** — Patterns that work server-side don't always translate well
5. **LOC/Feature Matters** — Difference between 100 (Layered) and 300 (CQRS+ES) LOC/feature compounds over 50+ features

### 🛠️ Tech Stack

- **Language:** TypeScript (strict mode, 100% typed)
- **Backend:** NestJS + Prisma + PostgreSQL
- **Frontend:** React 18 + React Router v7 + Vite + Tailwind CSS
- **Tests:** Jest (backend), Vitest (frontend), Cucumber.js (BDD)
- **Infra:** Docker Compose

### 🚀 What's Next

Potential future enhancements:
- Mock API servers for frontends
- E2E Playwright test suite
- Bundle size analysis
- Performance benchmarks
- Deployment examples
- Observability (OpenTelemetry, Grafana)
- Microservices extraction from Modular Monolith

---

## Timeline

### May 7-9, 2025

- ✅ Completed all 7 backend architectures
- ✅ Completed all 4 frontend architectures
- ✅ Created 13 comprehensive ADRs
- ✅ Built comparison matrix with 7×4 architecture trade-offs
- ✅ Enriched README with statistics, findings, and resources
- ✅ Added MIT license
- ✅ Normalized ADR statuses

### May 7, 2025

- Initial commit with project structure
- Shared contracts (OpenAPI, Prisma schema)
- Backend #1 (Layered) baseline implementation
- Backends #2-4 (Clean, Hexagonal, Onion)

### Early Development

- TDD red-green-refactor cycles for each implementation
- Cross-implementation testing against shared acceptance tests
- Documentation-driven development (ADR-first approach)

---

## Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **1.0.0** — First stable release (all implementations complete)
- Future versions will add enhancements (E2E tests, benchmarks, observability)

---

## Contributors

Built by [@kiru42](https://github.com/kiru42) as a solo learning lab.

## License

MIT License - See [LICENSE](LICENSE) for details.
