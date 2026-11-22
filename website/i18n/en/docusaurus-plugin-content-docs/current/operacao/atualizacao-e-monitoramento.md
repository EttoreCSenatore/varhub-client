---
id: atualizacao-e-monitoramento
title: Upgrade and monitoring
sidebar_position: 3
---

# Upgrade and monitoring

## Upgrading

Set `VARHUB_VERSION` in `deploy/.env` (for example `2.1.0`, or `latest` to follow `main`) and run:

```bash
cd /opt/varhub
deploy/backup.sh                                  # always before upgrading
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml pull
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml up -d
```

The API applies database migrations on start. If a migration fails, the new container **does not start** and the site has no API until you go back to the previous version (below); that is why the backup comes first.

### Going back to an earlier version

Put the previous version in `VARHUB_VERSION` and run `up -d` again. **Migrations are not undone.** So, for changes that drop or rename columns, first release a version compatible with both the old and the new schema, and only then remove what is left. If the new schema is incompatible, restore the backup taken before the upgrade.

## Is it up?

`GET /api/version` answers without login with the installed version, and `GET /health` also reports the database state (status 503 if it does not answer):

```bash
curl https://your-domain/api/version
# {"version":"2.0.0"}
```

The site footer shows the app and API versions.

## Alerts

Use any uptime monitor (UptimeRobot, Uptime Kuma, Healthchecks.io) pointing at `/health`. For the backup, create a "push" check on Healthchecks.io and put its address in `MONITOR_BACKUP_URL`: the script pings on every successful backup and on failure, and the service alerts you if the ping does not arrive in time.

## Logs

```bash
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml logs -f api web
```

The API logs only internal errors and startup; it does not log IP addresses or request contents.
