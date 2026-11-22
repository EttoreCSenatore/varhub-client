#!/usr/bin/env bash
# Proves backups work: builds a throwaway database with data, backs it up with backup.sh, restores into a second
# throwaway database with restore.sh, and compares row counts. Touches nothing else.
# Usage: deploy/test_backup.sh [--server-dir ../varhub-server | --server-image IMAGE]
set -euo pipefail
START_DIR="$PWD"
cd "$(dirname "${BASH_SOURCE[0]}")"

SERVER_IMAGE="ghcr.io/ettorecsenatore/varhub-server:latest"
while [ $# -gt 0 ]; do
  case "$1" in
    --server-dir) docker build -q -t varhub-server:backup-test "$(cd "$START_DIR" && cd "$2" && pwd)" >/dev/null; SERVER_IMAGE=varhub-server:backup-test; shift 2 ;;
    --server-image) SERVER_IMAGE="$2"; shift 2 ;;
    *) echo "Unknown option $1" >&2; exit 1 ;;
  esac
done

PG_IMAGE="$(grep -m1 'image: postgres@' docker-compose.prod.yml | sed 's/.*image: *//')"
SUFFIX="$$"
NET="vh-bk-net-$SUFFIX"; A="vh-bk-a-$SUFFIX"; B="vh-bk-b-$SUFFIX"
WORK="$(mktemp -d)"
cleanup() { docker rm -f "$A" "$B" >/dev/null 2>&1 || true; docker network rm "$NET" >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT

docker network create "$NET" >/dev/null
start_db() { docker run -d --name "$1" --network "$NET" -e POSTGRES_PASSWORD=test -e POSTGRES_USER=varhub -e POSTGRES_DB=varhub "$PG_IMAGE" >/dev/null
  # The image starts a temporary server to initialise, stops it, then starts the real one: it is ready only
  # after the "ready to accept connections" message appears the second time.
  for _ in $(seq 1 60); do
    [ "$(docker logs "$1" 2>&1 | grep -c 'ready to accept connections')" -ge 2 ] && docker exec "$1" pg_isready -U varhub -d varhub >/dev/null 2>&1 && return 0
    sleep 1
  done
  echo "Database $1 did not start" >&2; exit 1; }
count() { docker exec "$1" psql -U varhub -d varhub -tA -c "SELECT (SELECT COUNT(*) FROM projects) || '/' || (SELECT COUNT(*) FROM users) || '/' || (SELECT COUNT(*) FROM feedback) || '/' || (SELECT COUNT(*) FROM schema_migrations)"; }

echo "1/4 Database A with data"
start_db "$A"
docker run --rm --network "$NET" -e DB_HOST="$A" -e DB_USER=varhub -e DB_PASSWORD=test -e DB_NAME=varhub -e DB_SSL=false -e JWT_SECRET=test-test-test-test \
  "$SERVER_IMAGE" node scripts/migrate.js --seed >/dev/null
docker exec "$A" psql -U varhub -d varhub -q -c "INSERT INTO users (email, password_hash, name) VALUES ('t@example.com', 'x', 'Test'); INSERT INTO feedback (project_id, rating, comment) VALUES (1, 5, 'backup test')"
BEFORE="$(count "$A")"

echo "2/4 Backup"
VARHUB_DB_EXEC="docker exec -i $A" BACKUP_DIR="$WORK" ./backup.sh >/dev/null
DUMP="$(ls "$WORK"/varhub-*.dump)"

echo "3/4 Restore into database B"
start_db "$B"
VARHUB_DB_EXEC="docker exec -i $B" ./restore.sh "$DUMP" --yes >/dev/null
AFTER="$(count "$B")"

echo "4/4 Compare (projects/users/feedback/migrations): A=$BEFORE B=$AFTER"
[ "$BEFORE" = "$AFTER" ] && [ "$BEFORE" != "0/0/0/0" ] || { echo "Restore does not match the backup" >&2; exit 1; }
echo "OK: the backup restores to an identical database"
