#!/bin/sh
set -e

echo "==> Waiting for PostgreSQL at ${PGHOST:-postgres}:${PGPORT:-5432}..."
until pg_isready -h "${PGHOST:-postgres}" -p "${PGPORT:-5432}" -U "${PGUSER:-logistics}" 2>/dev/null; do
  sleep 1
done
echo "==> PostgreSQL is ready."

echo "==> Pushing database schema..."
pnpm --filter @workspace/db run push-force
echo "==> Schema synced."

echo "==> Seeding sample data..."
pnpm --filter @workspace/db run seed
echo "==> Seed complete."

echo "==> Starting LOGI.AI API Server on port ${PORT:-8080}..."
exec pnpm --filter @workspace/api-server run dev
