#!/usr/bin/env bash
#
# Runs the shared BDD acceptance suite against every backend implementation.
#
#   ./scripts/validate-acceptance.sh                 # all backends
#   ./scripts/validate-acceptance.sh 01-layered-ntier 05-ddd
#
# Each implementation gets a throwaway PostgreSQL and a published 3000, so the
# suite can run from the host (no rebuild of the acceptance deps per iteration).
#
# The script is concurrency-safe: it takes an exclusive lock, so two runs never
# fight over port 3000, the compose project name or the log directory.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_PORT="${API_PORT:-3000}"
OUT_DIR="${RESULTS_DIR:-/tmp/architecture-lab-acceptance}"
RESULTS="$OUT_DIR/RESULTS.txt"
LOCKFILE="$OUT_DIR/.lock"

mkdir -p "$OUT_DIR"

# --- concurrency guard -------------------------------------------------------
exec 9>"$LOCKFILE"
if ! flock -n 9; then
  echo "Another acceptance run is already in progress ($LOCKFILE). Aborting."
  exit 2
fi

: > "$RESULTS"
: "${CURRENT_BACKEND:=}"

# Wait until nothing is listening on $API_PORT, so the next backend always talks
# to *its own* container instead of a previous one still shutting down.
wait_for_port_free() {
  for _ in $(seq 1 30); do
    if ! curl -s -o /dev/null --max-time 1 "http://localhost:$API_PORT/projects"; then
      return 0
    fi
    sleep 1
  done
  return 1
}

cleanup() {
  if [ -n "$CURRENT_BACKEND" ]; then
    BACKEND="$CURRENT_BACKEND" docker compose -f "$ROOT/docker-compose.yml" \
      down -v --remove-orphans > /dev/null 2>&1 || true
  fi
  wait_for_port_free || true
}
trap cleanup EXIT

if [ "$#" -gt 0 ]; then
  BACKENDS=("$@")
else
  BACKENDS=()
  for d in "$ROOT"/backend/*/; do
    BACKENDS+=("$(basename "${d%/}")")
  done
fi

for impl in "${BACKENDS[@]}"; do
  CURRENT_BACKEND="$impl"
  echo "▶ $impl"

  cleanup

  if ! BACKEND="$impl" docker compose -f "$ROOT/docker-compose.yml" \
      up -d --build --force-recreate --remove-orphans postgres backend \
      > "$OUT_DIR/$impl.compose.log" 2>&1; then
    echo "FAIL  $impl  (stack did not start — see $OUT_DIR/$impl.compose.log)"
    echo "FAIL  $impl" >> "$RESULTS"
    continue
  fi

  # wait for the API to answer (any HTTP status means the app is up)
  ready=0
  for _ in $(seq 1 60); do
    if curl -s -o /dev/null --max-time 2 "http://localhost:$API_PORT/projects"; then
      ready=1
      break
    fi
    sleep 2
  done

  if [ "$ready" -ne 1 ]; then
    echo "FAIL  $impl  (API never became reachable)"
    echo "FAIL  $impl" >> "$RESULTS"
    docker logs "architecture-lab-backend-1" > "$OUT_DIR/$impl.log" 2>&1 || true
    continue
  fi

  if (cd "$ROOT/shared/acceptance" && BACKEND_URL="http://localhost:$API_PORT" npm test) \
      > "$OUT_DIR/$impl.log" 2>&1; then
    echo "PASS  $impl"
    echo "PASS  $impl" >> "$RESULTS"
  else
    echo "FAIL  $impl  (see $OUT_DIR/$impl.log)"
    echo "FAIL  $impl" >> "$RESULTS"
    docker logs "architecture-lab-backend-1" >> "$OUT_DIR/$impl.log" 2>&1 || true
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
