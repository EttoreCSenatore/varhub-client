#!/usr/bin/env bash
# PUBLIC DEMO ONLY: wipes the database and rebuilds the demo (sample projects, simulated activity, a demo admin).
# Needs DEMO_ADMIN_PASSWORD in deploy/.env. NEVER run on an installation with real data.
set -euo pipefail
. "$(dirname "${BASH_SOURCE[0]}")/common.sh"

[ -n "${DEMO_ADMIN_PASSWORD:-}" ] || { echo "Set DEMO_ADMIN_PASSWORD in $ENV_FILE (demo servers only)" >&2; ping_monitor "${MONITOR_DEMO_URL:-}" /fail; exit 1; }
"${COMPOSE[@]}" exec -T -e DEMO_MODE=1 -e DEMO_ADMIN_PASSWORD="$DEMO_ADMIN_PASSWORD" api node scripts/demo-reset.js \
  || { ping_monitor "${MONITOR_DEMO_URL:-}" /fail; exit 1; }
ping_monitor "${MONITOR_DEMO_URL:-}"
