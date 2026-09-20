# CI/CD Workflows

## Current Status

✅ **CI Pipeline Active** — Runs on every push to `main` and on pull requests

### What Gets Tested

The CI pipeline validates all 11 implementations (7 backends + 4 frontends):

1. **Type Checking** (blocking) — `tsc --noEmit` must pass
2. **Linting** (non-blocking) — ESLint errors are reported but don't fail the build
3. **Unit Tests** (non-blocking) — Tests run when available, failures don't block

### Why Non-Blocking Tests?

This is a **reference architecture lab**, not production code. The goal is to compare architectural patterns, not to achieve 100% test coverage. 

- **Type safety** is the primary quality gate (TypeScript strict mode)
- **Lint warnings** help spot code smells but don't block iteration speed
- **Unit tests** are optional (some patterns are easier to test than others)

### Job Matrix

The `lint-and-test` job runs in parallel for each implementation:

**Backends:**
- `backend/01-layered-ntier`
- `backend/02-clean-architecture`
- `backend/03-hexagonal`
- `backend/04-onion`
- `backend/05-ddd`
- `backend/06-cqrs-es`
- `backend/07-modular-monolith`

**Frontends:**
- `frontend/01-component-layered`
- `frontend/02-clean-architecture`
- `frontend/03-feature-sliced-design`
- `frontend/04-atomic-design`

### Acceptance Tests (Disabled)

The `acceptance-tests` job is currently disabled (`if: false`) because:

1. Acceptance tests require a running backend + database
2. The shared acceptance test suite (`shared/acceptance/`) is not yet implemented
3. Each implementation would need its own E2E test setup

**Future:** Enable acceptance tests when E2E scenarios are written (Cucumber.js + Playwright).

## Adding a New Implementation

When adding a new backend or frontend:

1. Add the path to `.github/workflows/ci.yml` in the `matrix.component` array
2. Ensure `package.json` has these scripts:
   - `lint` — ESLint check
   - `typecheck` — TypeScript type validation
   - `test` — Unit tests (can be a no-op: `echo "No tests" && exit 0`)

## Local Testing

Run the same checks locally before pushing:

```bash
# Backend example
cd backend/02-clean-architecture
npm run lint
npm run typecheck
npm run test

# Frontend example
cd frontend/03-feature-sliced-design
npm run lint
npm run typecheck
npm run test
```

## Future Enhancements

Potential CI/CD improvements:

- ✅ Type checking (done)
- ⏳ E2E acceptance tests (Cucumber.js + Playwright)
- ⏳ Bundle size tracking (bundlesize or size-limit)
- ⏳ Performance benchmarks (autocannon for backends, Lighthouse for frontends)
- ⏳ Deploy previews (Vercel/Netlify for frontends, Railway for backends)
- ⏳ Visual regression testing (Percy, Chromatic)
- ⏳ Dependency security scanning (Dependabot, Snyk)

---

**Status:** Last updated 2025-05-09 — CI passing with type checks ✅
