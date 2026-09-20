#!/usr/bin/env bash
#
# Fails if any backend's bundled Prisma schema or migrations have drifted from
# shared/prisma, or if a backend is missing them entirely.
#
# This is the guard that would have caught 01-layered-ntier shipping without any
# migrations at all, which made every container start against an empty database.
#
#   ./scripts/check-prisma-sync.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE="$ROOT/shared/prisma"

failures=0
checked=0

fail() {
  echo "✗ $1" >&2
  failures=$((failures + 1))
}

for backend in "$ROOT"/backend/*/; do
  name="$(basename "${backend%/}")"
  target="$backend/prisma"
  checked=$((checked + 1))

  if [ ! -f "$target/schema.prisma" ]; then
    fail "$name: prisma/schema.prisma is missing"
    continue
  fi

  if ! diff -q "$SOURCE/schema.prisma" "$target/schema.prisma" > /dev/null; then
    fail "$name: prisma/schema.prisma differs from shared/prisma/schema.prisma"
  fi

  migrations="$(find "$target/migrations" -name '*.sql' 2>/dev/null | wc -l | tr -d ' ')"
  if [ "$migrations" -eq 0 ]; then
    fail "$name: prisma/migrations contains no .sql files — the container would start against an empty database"
    continue
  fi

  # Prisma's starter .gitignore excludes prisma/migrations. Here the migrations
  # MUST be versioned, because the container applies them on boot. An ignored
  # migrations directory cannot be committed, so fail on it explicitly.
  if git -C "$ROOT" check-ignore -q "$target/migrations/migration_lock.toml"; then
    fail "$name: prisma/migrations is ignored by a .gitignore — it can never be committed"
  fi

  if [ -d "$SOURCE/migrations" ]; then
    expected="$(find "$SOURCE/migrations" -name '*.sql' | wc -l | tr -d ' ')"
    if [ "$migrations" -ne "$expected" ]; then
      fail "$name: has $migrations migrations, shared/prisma has $expected"
    elif ! diff -rq "$SOURCE/migrations" "$target/migrations" > /dev/null; then
      fail "$name: prisma/migrations differs from shared/prisma/migrations"
    fi
  fi

  echo "✔ $name"
done

echo
if [ "$failures" -ne 0 ]; then
  echo "$failures of $checked backends are out of sync." >&2
  echo "Run ./scripts/sync-prisma-schema.sh to fix, then commit the result." >&2
  exit 1
fi

echo "All $checked backends match shared/prisma."