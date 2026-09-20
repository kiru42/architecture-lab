#!/usr/bin/env bash
# Full local matrix: lint, typecheck, build and unit tests for all 11 implementations.
set -uo pipefail
cd /tmp/al
FAIL=0
printf '%-42s %-6s %-6s %-6s %s\n' "IMPLEMENTATION" "LINT" "TYPES" "BUILD" "TESTS"
for d in backend/*/ frontend/*/; do
  name="${d%/}"
  row=""
  for step in lint typecheck build test; do
    if ! (cd "$name" && npm run "$step" > "/tmp/m-$(basename $name)-$step.log" 2>&1); then
      row="$row FAIL"
      FAIL=1
    else
      row="$row ok"
    fi
  done
  printf '%-42s %s\n' "$name" "$row"
done
echo
[ "$FAIL" -eq 0 ] && echo "MATRIX: all 11 implementations green" || echo "MATRIX: FAILURES ABOVE"
exit $FAIL
