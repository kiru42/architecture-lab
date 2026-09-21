#!/usr/bin/env bash
#
# Runs the shared end-to-end suite against every frontend implementation.
#
#   ./scripts/validate-e2e.sh                        # all four frontends
#   ./scripts/validate-e2e.sh 01-component-layered
#
# Each frontend is served by its own Vite dev server on $E2E_PORT and talks to
# one backend through the real proxy, so the browser exercises the same
# /api and /socket.io paths a developer uses. The backend defaults to
# 01-layered-ntier because it is the only implementation with a WebSocket
# gateway, which the notification scenario needs.
#
# Prerequisites: npm ci in the frontend under test and in shared/e2e, plus
# `npx playwright install chromium` once.
#
# Concurrency-safe: one exclusive lock, so two runs never fight over the port,
# the compose project or the log directory.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_PORT="${API_PORT:-3000}"
E2E_PORT="${E2E_PORT:-5199}"
BACKEND="${E2E_BACKEND:-01-layered-ntier}"
OUT_DIR="${RESULTS_DIR:-/tmp/architecture-lab-e2e}"
RESULTS="$OUT_DIR/RESULTS.txt"
LOCKFILE="$OUT_DIR/.lock"

mkdir -p "$OUT_DIR"

exec 9>"$LOCKFILE"
if ! flock -n 9; then
  echo "Another e2e run is already in progress ($LOCKFILE). Aborting."
  exit 2
fi

: > "$RESULTS"
VITE_PID=""

wait_for_url() {
  local url="$1" attempts="$2"
  for _ in $(seq 1 "$attempts"); do
    if curl -s -o /dev/null --max-time 2 "$url"; then
      return 0
    fi
    sleep 1
  done
  return 1
}

cleanup() {
  stop_frontend
  BACKEND="$BACKEND" docker compose -f "$ROOT/docker-compose.yml" \
    down -v --remove-orphans > /dev/null 2>&1 || true
}

# `npx vite` runs as a child of the shell that launched it, so killing that shell
# leaves Vite holding the port. Kill the whole process group, then make sure the
# port is actually free before anyone else tries to bind it.
stop_frontend() {
  if [ -n "$VITE_PID" ]; then
    kill -- "-$VITE_PID" 2>/dev/null || kill "$VITE_PID" 2>/dev/null || true
    wait "$VITE_PID" 2>/dev/null || true
    VITE_PID=""
  fi
  pkill -f "vite --port $E2E_PORT" 2>/dev/null || true
  for _ in $(seq 1 20); do
    is_port_serving "$E2E_PORT" || return 0
    sleep 0.5
  done
  return 1
}

is_port_serving() {
  curl -s -o /dev/null --max-time 1 "http://localhost:$1"
}
trap cleanup EXIT

if [ "$#" -gt 0 ]; then
  FRONTENDS=("$@")
else
  FRONTENDS=()
  for d in "$ROOT"/frontend/*/; do
    FRONTENDS+=("$(basename "${d%/}")")
  done
fi

echo "Backend: $BACKEND   frontend port: $E2E_PORT"

for impl in "${FRONTENDS[@]}"; do
  echo "▶ $impl"

  cleanup

  if ! BACKEND="$BACKEND" docker compose -f "$ROOT/docker-compose.yml" \
      up -d --build --force-recreate --remove-orphans postgres backend \
      > "$OUT_DIR/$impl.compose.log" 2>&1; then
    echo "FAIL  $impl  (stack did not start — see $OUT_DIR/$impl.compose.log)"
    echo "FAIL  $impl" >> "$RESULTS"
    continue
  fi

  if ! wait_for_url "http://localhost:$API_PORT/projects" 60; then
    echo "FAIL  $impl  (backend never became reachable)"
    echo "FAIL  $impl" >> "$RESULTS"
    docker logs "architecture-lab-backend-1" > "$OUT_DIR/$impl.log" 2>&1 || true
    continue
  fi

  # If something already answers on this port it is *not* the frontend under
  # test: testing against it would report on the wrong application, which is how
  # a frontend with no testids at all can look green.
  if is_port_serving "$E2E_PORT"; then
    echo "FAIL  $impl  (port $E2E_PORT already in use — refusing to test a foreign server)"
    echo "FAIL  $impl" >> "$RESULTS"
    continue
  fi

  setsid bash -c "cd '$ROOT/frontend/$impl' && exec env API_PROXY_TARGET='http://localhost:$API_PORT' npx vite --port '$E2E_PORT' --strictPort" \
    > "$OUT_DIR/$impl.vite.log" 2>&1 &
  VITE_PID=$!

  if ! wait_for_url "http://localhost:$E2E_PORT" 45; then
    echo "FAIL  $impl  (frontend never became reachable — see $OUT_DIR/$impl.vite.log)"
    echo "FAIL  $impl" >> "$RESULTS"
    continue
  fi

  if ( cd "$ROOT/shared/e2e" \
        && FRONTEND_URL="http://localhost:$E2E_PORT" \
           API_URL="http://localhost:$API_PORT" \
           npx playwright test ) > "$OUT_DIR/$impl.log" 2>&1; then
    echo "PASS  $impl"
    echo "PASS  $impl" >> "$RESULTS"
  else
    echo "FAIL  $impl  (see $OUT_DIR/$impl.log)"
    echo "FAIL  $impl" >> "$RESULTS"
  fi
done

cleanup

echo
echo "----------------------------------------"
sort "$RESULTS"
echo "----------------------------------------"
echo "Logs: $OUT_DIR"

grep -q '^FAIL' "$RESULTS" && exit 1
exit 0
