#!/usr/bin/env bash
#
# Runs the shared BDD acceptance suite against every backend implementation.
#
#   ./scripts/validate-acceptance.sh                 # all backends
#   ./scripts/validate-acceptance.sh 01-layered-ntier 05-ddd
#
# Each implementation gets a throwaway PostgreSQL and a published 3000, so the
# suite can run from the host (no rebuild of the acceptance deps per iteration).

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_PORT="${API_PORT:-3000}"
RESULTS="${RESULTS:-/tmp/architecture-lab-acceptance}/RESULTS.txt"
OUT_DIR="$(dirname "$RESULTS")"

mkdir -p "$OUT_DIR"
: > "$RESULTS"

cleanup() {
  BACKEND="${CURRENT_BACKEND:-01-layered-ntier}" docker compose -f "$ROOT/docker-compose.yml" \
    down -v --remove-orphans > /dev/null 2>&1 || true
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
      up -d --build postgres backend > "$OUT_DIR/$impl.compose.log" 2>&1; then
    echo "FAIL  $impl  (stack did not start — see $OUT_DIR/$impl.compose.log)"
    echo "FAIL  $impl" >> "$RESULTS"
    continue
  fi

  # wait for the API to answer (any HTTP status means the app is up)
  ready=0
  for _ in $(seq 1 40); do
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
  fi
done

cleanup

echo
echo "----------------------------------------"
sort "$RESULTS"
echo "----------------------------------------"
echo "Logs: $OUT_DIR"