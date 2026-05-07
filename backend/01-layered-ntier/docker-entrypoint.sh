#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy --schema=../shared/prisma/schema.prisma

echo "Starting application..."
exec node dist/main
