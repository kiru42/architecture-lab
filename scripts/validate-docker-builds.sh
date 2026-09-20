#!/usr/bin/env bash
# Build every backend + frontend image with the generic Dockerfiles and report
# a pass/fail matrix. Useful as a local pre-flight before pushing.
#
#   ./scripts/validate-docker-builds.sh            # all implementations
#   ./scripts/validate-docker-builds.sh backend    # backends only
#   ./scripts/validate-docker-builds.sh frontend   # frontends only

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${OUT_DIR:-/tmp/architecture-lab-builds}"
SCOPE="${1:-all}"

mkdir -p "$OUT"
: > "$OUT/RESULTS.txt"

build() {
  local kind="$1" dir="$2" dockerfile="$3" arg="$4" tag="$5"
  local log="$OUT/$kind-$dir.log"
  if docker build -f "$dockerfile" --build-arg "$arg=$dir" -t "$tag" "$ROOT" > "$log" 2>&1; then
    echo "PASS  $kind  $dir"
    echo "PASS  $kind/$dir" >> "$OUT/RESULTS.txt"
  else
    echo "FAIL  $kind  $dir   (see $log)"
    echo "FAIL  $kind/$dir" >> "$OUT/RESULTS.txt"
  fi
}

if [ "$SCOPE" = "all" ] || [ "$SCOPE" = "backend" ]; then
  for d in "$ROOT"/backend/*/; do
    n="$(basename "${d%/}")"
    build backend "$n" "docker/backend.Dockerfile" BACKEND_DIR "architecture-lab-backend:$n"
  done
fi

if [ "$SCOPE" = "all" ] || [ "$SCOPE" = "frontend" ]; then
  for d in "$ROOT"/frontend/*/; do
    n="$(basename "${d%/}")"
    build frontend "$n" "docker/frontend.Dockerfile" FRONTEND_DIR "architecture-lab-frontend:$n"
  done
fi

echo
echo "----------------------------------------"
sort "$OUT/RESULTS.txt"
echo "----------------------------------------"
echo "Logs: $OUT"
