# Shared acceptance suite

One BDD suite, run against every backend implementation. It is the executable
form of `shared/openapi.yaml`: if an implementation cannot pass this, it has
drifted from the contract.

```bash
npm install

# against any running backend (default http://localhost:3000)
BACKEND_URL=http://localhost:3000 npm test

# real-time notifications (only implementations with a WebSocket gateway)
BACKEND_URL=http://localhost:3000 npm run test:websocket
```

Or let Docker bring the stack up for you, from the repository root:

```bash
BACKEND=02-clean-architecture docker compose -f docker-compose.test.yml \
  up --build --abort-on-container-exit --exit-code-from acceptance
```

## Layout

- `features/support/world.ts` — the `TaskFlowWorld`: per-scenario HTTP state and
  a small API client. Scenarios cannot leak state into each other.
- `features/step_definitions/` — step implementations, grouped by feature.
- `features/*.feature` — the scenarios themselves, tagged:
  - default run: everything except `@websocket`
  - `@websocket`: real-time delivery, needs a gateway (see ADR-0015)

## Notes

- Assertions use Node's built-in `fetch`, so no browser is required.
- `@websocket` scenarios are excluded from the default run because only some
  implementations (starting with `01-layered-ntier`) expose a gateway.
