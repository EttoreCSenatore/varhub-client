#!/usr/bin/env bash
# Daily database backup: pg_dump (custom format), verified, kept for KEEP_DAYS days.
# Usage: deploy/backup.sh            (BACKUP_DIR default /var/backups/varhub, KEEP_DAYS default 30)
set -euo pipefail
. "$(dirname "${BASH_SOURCE[0]}")/common.sh"

BACKUP_DIR="${BACKUP_DIR:-/var/backups/varhub}"
KEEP_DAYS="${KEEP_DAYS:-30}"
fail() { echo "Backup failed: $1" >&2; ping_monitor "${MONITOR_BACKUP_URL:-}" /fail; exit 1; }

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
FILE="$BACKUP_DIR/varhub-$(date -u +%Y%m%d-%H%M%S).dump"
TMP="$FILE.partial"

db_exec pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB" > "$TMP" || { rm -f "$TMP"; fail "pg_dump"; }
[ -s "$TMP" ] || { rm -f "$TMP"; fail "empty dump"; }
# A dump that cannot be listed is not a backup.
db_exec pg_restore --list < "$TMP" >/dev/null || { rm -f "$TMP"; fail "dump is not readable"; }
chmod 600 "$TMP"
mv "$TMP" "$FILE"

find "$BACKUP_DIR" -maxdepth 1 -name 'varhub-*.dump' -mtime "+$KEEP_DAYS" -delete
echo "Backup written: $FILE ($(du -h "$FILE" | cut -f1))"
ping_monitor "${MONITOR_BACKUP_URL:-}"
