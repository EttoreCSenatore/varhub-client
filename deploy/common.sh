#!/usr/bin/env bash
# Shared helpers for the deploy scripts. Source it; do not run it.
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${ENV_FILE:-$DEPLOY_DIR/.env}"

# VARHUB_DB_EXEC overrides how commands reach the database container (used by test_backup.sh, e.g.
# "docker exec -i throwaway-db"). Normally the Compose stack is used.
if [ -z "${VARHUB_DB_EXEC:-}" ]; then
  [ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE (copy deploy/.env.example and fill it in)" >&2; exit 1; }
  set -a; . "$ENV_FILE"; set +a
  COMPOSE=(docker compose --env-file "$ENV_FILE" -f "$DEPLOY_DIR/docker-compose.prod.yml")
  db_exec() { "${COMPOSE[@]}" exec -T db "$@"; }
else
  # shellcheck disable=SC2086
  db_exec() { $VARHUB_DB_EXEC "$@"; }
fi

POSTGRES_USER="${POSTGRES_USER:-varhub}"
POSTGRES_DB="${POSTGRES_DB:-varhub}"

# Pings a monitoring URL (Healthchecks.io style); a failure to ping never fails the script.
ping_monitor() {
  local url="${1:-}" suffix="${2:-}"
  [ -n "$url" ] || return 0
  curl -fsS -m 10 --retry 2 "${url}${suffix}" >/dev/null 2>&1 || true
}
