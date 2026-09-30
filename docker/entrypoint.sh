#!/bin/sh
set -e

echo "Waiting for MySQL..."
sleep 3

if [ "${NODE_ENV:-production}" = "production" ]; then
  case "${NEXTAUTH_SECRET:-}" in
    ""|"change-me-in-production"|"replace-with-a-long-random-string")
      echo "ERROR: Set a strong NEXTAUTH_SECRET before starting in production." >&2
      exit 1
      ;;
  esac
  if [ "${#NEXTAUTH_SECRET}" -lt 16 ]; then
    echo "ERROR: NEXTAUTH_SECRET must be at least 16 characters." >&2
    exit 1
  fi
fi

BASELINE_MIGRATION="${PRISMA_BASELINE_MIGRATION:-20250922000000_init}"

echo "Applying migrations..."
set +e
MIGRATE_OUT=$(npx prisma migrate deploy 2>&1)
MIGRATE_CODE=$?
set -e
echo "$MIGRATE_OUT"

if [ "$MIGRATE_CODE" -ne 0 ]; then
  if echo "$MIGRATE_OUT" | grep -q "P3005"; then
    echo "Existing schema detected (pre-migration / db push). Baselining ${BASELINE_MIGRATION}..."
    npx prisma migrate resolve --applied "$BASELINE_MIGRATION"
    npx prisma migrate deploy
  else
    exit "$MIGRATE_CODE"
  fi
fi

# Fresh installs only: set RUN_SEED=true (and optionally SEED_MODE=fresh).
# Default is off so upgrades never wipe CMS data.
if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "Seeding (SEED_MODE=${SEED_MODE:-safe})..."
  SEED_MODE="${SEED_MODE:-safe}" node prisma/seed.mjs || true
fi

exec "$@"
