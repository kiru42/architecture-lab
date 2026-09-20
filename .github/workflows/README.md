# CI/CD Workflows

Everything in `.github/workflows/ci.yml` is blocking. If a step can fail without
failing the build, it is not a check — and that is exactly how three broken
implementations sat behind a green badge for months.

## Jobs

### `hygiene` — Shared contracts

`./scripts/check-prisma-sync.sh` fails if any backend's bundled
`prisma/schema.prisma` or `prisma/migrations` has drifted from `shared/prisma`.

### `build-and-test` — matrix over all eleven implementations

One job per implementation, in parallel, `fail-fast: false` so every
implementation reports in a single run:

| Step | Command |
|---|---|
| Install | `npm ci` |
| Prisma client | `npm run prisma:generate` (backends only) |
| Lint | `npm run lint` — skipped with a notice only if the implementation has no ESLint config |
| Type check | `npm run typecheck` |
| Build | `npm run build` |
| Unit tests | `npm test` |

Components covered:

**Backends:** `01-layered-ntier`, `02-clean-architecture`, `03-hexagonal`,
`04-onion`, `05-ddd`, `06-cqrs-es`, `07-modular-monolith`

**Frontends:** `01-component-layered`, `02-clean-architecture`,
`03-feature-sliced-design`, `04-atomic-design`

### `acceptance` — the real gate

One job per backend, against a `postgres:16-alpine` service container. Each job
installs the backend, generates the Prisma client, builds, applies migrations,
boots `node dist/main`, waits for it to answer, then runs the shared BDD suite
from `shared/acceptance` against it with `BACKEND_URL=http://localhost:3000`.

This is what proves the implementations agree with each other and with
`shared/openapi.yaml`. There is no `continue-on-error` left anywhere.

Locally, `./scripts/validate-acceptance.sh` does the same thing through Docker
Compose for all seven backends, with an exclusive lock and a non-zero exit code
on any failure:

```bash
./scripts/validate-acceptance.sh                        # all backends
./scripts/validate-acceptance.sh 04-onion 05-ddd        # a subset
```

Scenarios tagged `@websocket` need a gateway and are excluded from the default
run; only `01-layered-ntier` exposes one, so `npm run test:websocket` inside
`shared/acceptance` runs just those against it.

## Adding a New Implementation

1. Add the path to the `matrix.component` list in `.github/workflows/ci.yml`
   (and to `matrix.backend` if it is a backend that must pass acceptance).
2. Make sure `package.json` provides `lint`, `typecheck`, `build` and `test`.
   `test` must actually run something: `jest` and `vitest` exit non-zero when
   they find no test file, which is the desired behaviour here.
3. If it is a backend, copy the frozen schema with
   `./scripts/sync-prisma-schema.sh` and commit the result.

## Toolchain

`.nvmrc` is the single source of truth for the Node version, and CI reads it
with `node-version-file` — no version is hardcoded in the workflow. The same
version is used by `docker/*.Dockerfile` and `docker-compose.test.yml`.

It is pinned to **22.22.2** and not something looser on purpose: `jsdom@30`,
which `frontend/01-component-layered` needs for its `environment: 'jsdom'`
tests, declares `engines.node = "^22.22.2 || ^24.15.0 || >=26.0.0"`, and the
`undici@8` it pulls in wants `>=22.19.0`. On Node 20, `undici` calls
`webidl.util.markAsUncloneable`, which Node 20's `util` does not expose, so
loading jsdom throws and every vitest worker dies before running a single test.
Lint, typecheck and build all pass on Node 20 — only the tests break, which is
the kind of failure that looks like a flaky test suite until you read the stack
trace.

## Running the same checks locally

```bash
cd backend/02-clean-architecture   # or any frontend
npm run lint && npm run typecheck && npm run build && npm test
```

Or run the whole matrix at once — the same four steps, for all eleven
implementations:

```bash
./scripts/validate-all.sh             # lint + typecheck + build + unit tests, x11
./scripts/check-prisma-sync.sh        # frozen schema/migrations in every backend
./scripts/validate-docker-builds.sh   # all 11 images build
./scripts/validate-acceptance.sh      # the shared BDD suite against all 7 backends
```

## Not attempted yet

- Bundle-size tracking (size-limit)
- Performance benchmarks (autocannon, Lighthouse)
- Deploy previews
- Visual regression testing
- Dependency security scanning
