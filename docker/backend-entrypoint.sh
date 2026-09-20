#!/bin/sh
# Applies pending Prisma migrations, then hands control to the CMD.
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "▶ Applying Prisma migrations..."
  npx prisma migrate deploy --schema=./prisma/schema.prisma
else
  echo "⚠ DATABASE_URL is not set — skipping migrations."
fi

echo "▶ Starting TaskFlow backend..."
exec "$@"
