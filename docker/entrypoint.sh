#!/bin/sh
set -e

echo "Waiting for MySQL..."
sleep 3

npx prisma db push --skip-generate

if [ "${RUN_SEED:-true}" = "true" ]; then
  node prisma/seed.mjs || true
fi

exec "$@"
