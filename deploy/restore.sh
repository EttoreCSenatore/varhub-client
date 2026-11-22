#!/usr/bin/env bash
# Restores a backup over the CURRENT database (replaces its data).
# Usage: deploy/restore.sh /var/backups/varhub/varhub-YYYYmmdd-HHMMSS.dump --yes
set -euo pipefail
. "$(dirname "${BASH_SOURCE[0]}")/common.sh"

FILE="${1:-}"
[ -f "$FILE" ] || { echo "Usage: $0 <backup.dump> --yes" >&2; exit 1; }
[ "${2:-}" = "--yes" ] || { echo "This replaces the current database with $FILE. Run again with --yes to confirm." >&2; exit 1; }

# With the Compose stack, keep the API away from the database while it is replaced.
[ -z "${VARHUB_DB_EXEC:-}" ] && "${COMPOSE[@]}" stop api
db_exec pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner < "$FILE"
[ -z "${VARHUB_DB_EXEC:-}" ] && "${COMPOSE[@]}" start api
echo "Restored $FILE"
