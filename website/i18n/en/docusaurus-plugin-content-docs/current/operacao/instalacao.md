---
id: instalacao
title: Installing on a server
sidebar_position: 1
---

# Installing on a server

The recommended way to run VARHub is **Docker Compose**: PostgreSQL, the API and the site (served by Caddy, which gets and renews the HTTPS certificate by itself). One installation serves **one organization**.

## Requirements

- A Linux server with Docker and Docker Compose v2 (1 GB of RAM is enough to start).
- A **domain** pointing at the server and ports **80 and 443** open.
- Internet access to pull the images from `ghcr.io`.

## Step by step

```bash
git clone https://github.com/EttoreCSenatore/varhub-client /opt/varhub
cd /opt/varhub
cp deploy/.env.example deploy/.env      # fill in SITE_ADDRESS, POSTGRES_PASSWORD and JWT_SECRET
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml up -d
```

Generate the secrets with `openssl rand -hex 32`. The `deploy/.env` file stays on the server only and **never** goes to Git.

Once it is up:

1. Open `https://your-domain`: the site appears and the certificate is issued on the first visit.
2. Sign up in the app and promote your account to admin:

```bash
cd /opt/varhub
docker compose --env-file deploy/.env -f deploy/docker-compose.prod.yml exec api node scripts/make-admin.js you@example.com
```

3. Sign in to the dashboard (`/admin`), add your projects and download the QR codes.

## What runs

| Service | Image | Role |
|---|---|---|
| `db` | PostgreSQL 17 (pinned by digest) | Data. **No published port**: only the other containers reach it. |
| `api` | `ghcr.io/ettorecsenatore/varhub-server` | The API. Applies migrations on start. |
| `web` | `ghcr.io/ettorecsenatore/varhub-web` | The PWA served by Caddy, which also forwards `/api` to the API. |

Caddy already sends `Strict-Transport-Security`, `X-Content-Type-Options` and the permissions policy (the camera is allowed for the site itself only).

## Your own brand

The published images use the default name. For your brand, build your own web image with the build arguments (`VITE_BRAND_NAME`, `VITE_ORG_NAME`, `VITE_TAGLINE`, `VITE_SOURCE_URL`) and point Compose at it. See [Adapt it to your business](../adaptar). A settings screen in the dashboard, with no rebuild, is on the [Roadmap](../roadmap).

## Public demo (optional)

For a **demo-only** server, set `DEMO_ADMIN_PASSWORD` in `deploy/.env` and install the nightly reset: it wipes the data and recreates sample projects, weeks of simulated activity and the demo admin account. **Never do this on an installation with real data**; the script refuses to run without `DEMO_MODE=1`, which only the reset sets.

```bash
sudo cp deploy/systemd/varhub-demo-reset.* /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now varhub-demo-reset.timer
```

## Local development

To develop, see [Development](../tecnico/desenvolvimento).
