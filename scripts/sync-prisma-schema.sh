#!/usr/bin/env bash
#
# shared/prisma is the single source of truth for the database schema.
# Every backend needs the schema (and its migrations) locally so that
# `npm run prisma:generate` / `prisma migrate deploy` work from the backend
# directory — both on a dev machine and inside the Docker build.
#
# Run this after editing shared/prisma/schema.prisma or adding a migration.
#
#   ./scripts/sync-prisma-schema.sh          # sync all backends
#   ./scripts/sync-prisma-schema.sh 05-ddd   # sync one backend

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE="$ROOT/shared/prisma"

if [ ! -f "$SOURCE/schema.prisma" ]; then
  echo "✗ $SOURCE/schema.prisma not found" >&2
  exit 1
fi

if [ "$#" -gt 0 ]; then
  TARGETS=()
  for name in "$@"; do
    TARGETS+=("$ROOT/backend/$name")
  done
else
  TARGETS=("$ROOT"/backend/*/)
fi

for target in "${TARGETS[@]}"; do
  [ -d "$target" ] || { echo "✗ not a backend directory: $target" >&2; exit 1; }

  mkdir -p "$target/prisma"
  cp "$SOURCE/schema.prisma" "$target/prisma/schema.prisma"

  if [ -d "$SOURCE/migrations" ]; then
    rm -rf "$target/prisma/migrations"
    cp -R "$SOURCE/migrations" "$target/prisma/migrations"
  fi

  echo "✔ $(basename "${target%/}")"
done

echo "Done. Commit the synced schema so CI and Docker builds stay reproducible."
