#!/usr/bin/env bash
#
# Regenerates the numbers in the README's statistics tables.
#
#   ./scripts/measure-stats.sh
#
# If a number in README.md disagrees with this script, the README is wrong.
#
# Definitions, so the numbers mean something:
#   source files  backend  : *.ts under <impl>/src, minus *.spec.ts and *.d.ts
#   source files  frontend : *.ts / *.tsx under <impl>/src, minus *.test.*
#   test files             : *.spec.ts (backend), *.test.ts(x) (frontend)
#   LOC                    : raw line count of the files above (`wc -l`), so
#                            comments and blanks are included

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

count() { # count <files...>
  printf '%s' "$#" > /dev/null
  local n
  n=$(printf '%s\n' "$@" | grep -c . || true)
  printf '%s' "$n"
}

loc() { # loc <files...>
  [ "$#" -eq 0 ] && { printf '0'; return; }
  printf '%s\n' "$@" | xargs cat | wc -l | tr -d ' '
}

backend_sources() {
  find "backend/$1/src" -name '*.ts' ! -name '*.spec.ts' ! -name '*.d.ts' 2>/dev/null | sort
}
backend_tests() {
  find "backend/$1/src" -name '*.spec.ts' 2>/dev/null | sort
}
frontend_sources() {
  find "frontend/$1/src" \( -name '*.ts' -o -name '*.tsx' \) ! -name '*.test.*' 2>/dev/null | sort
}
frontend_tests() {
  find "frontend/$1/src" \( -name '*.test.ts' -o -name '*.test.tsx' \) 2>/dev/null | sort
}

echo "BACKENDS"
printf '%-30s %6s %8s %6s %8s\n' NAME FILES LOC TESTS TEST_LOC
for d in backend/*/; do
  name="$(basename "${d%/}")"
  mapfile -t src < <(backend_sources "$name")
  mapfile -t tst < <(backend_tests "$name")
  printf '%-30s %6s %8s %6s %8s\n' "$name" "$(count "${src[@]}")" "$(loc "${src[@]}")" \
    "$(count "${tst[@]}")" "$(loc "${tst[@]}")"
done

echo
echo "FRONTENDS"
printf '%-30s %6s %8s %6s %8s\n' NAME FILES LOC TESTS TEST_LOC
for d in frontend/*/; do
  name="$(basename "${d%/}")"
  mapfile -t src < <(frontend_sources "$name")
  mapfile -t tst < <(frontend_tests "$name")
  printf '%-30s %6s %8s %6s %8s\n' "$name" "$(count "${src[@]}")" "$(loc "${src[@]}")" \
    "$(count "${tst[@]}")" "$(loc "${tst[@]}")"
done

mapfile -t bs < <(find backend/*/src -name '*.ts' ! -name '*.spec.ts' ! -name '*.d.ts' | sort)
mapfile -t bt < <(find backend/*/src -name '*.spec.ts' | sort)
mapfile -t fs < <(find frontend/*/src \( -name '*.ts' -o -name '*.tsx' \) ! -name '*.test.*' | sort)
mapfile -t ft < <(find frontend/*/src \( -name '*.test.ts' -o -name '*.test.tsx' \) | sort)

echo
echo "TOTAL"
printf 'backends : %s files, %s LOC, %s test files, %s test LOC\n' \
  "$(count "${bs[@]}")" "$(loc "${bs[@]}")" "$(count "${bt[@]}")" "$(loc "${bt[@]}")"
printf 'frontends: %s files, %s LOC, %s test files, %s test LOC\n' \
  "$(count "${fs[@]}")" "$(loc "${fs[@]}")" "$(count "${ft[@]}")" "$(loc "${ft[@]}")"
