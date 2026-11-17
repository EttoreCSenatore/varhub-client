---
id: desenvolvimento
title: Development
sidebar_position: 5
---

# Development

## Requirements

- Node.js 20 or newer and npm.
- Local PostgreSQL or a [Neon](https://neon.tech/) account.
- A Firebase project (only for push notifications).

## Server

```bash
git clone https://github.com/EttoreCSenatore/varhub-server
cd varhub-server
npm install
cp .env.example .env   # fill in JWT_SECRET and the database details
```

Create the tables and start the server:

```bash
psql "postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require" -f db/schema.sql
npm start
```

Environment variables (`.env.example`):

| Variable | Purpose |
|---|---|
| `PORT` | Server port (default 5000). |
| `ALLOWED_ORIGINS` | CORS origins, comma-separated. |
| `JWT_SECRET` | Long random secret used to sign tokens. |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL connection. |
| `DB_SSL_REJECT_UNAUTHORIZED` | `true` (default) verifies the database certificate. |
| `FIREBASE_SERVICE_ACCOUNT` | Service-account JSON on one line (or a `serviceAccountKey.json` file). |

Without `FIREBASE_SERVICE_ACCOUNT`, only notifications fail; everything else works. The server starts even without a database, and `/health` reports `database: "disconnected"`.

## Client

```bash
git clone https://github.com/EttoreCSenatore/varhub-client
cd varhub-client
npm ci --allow-git=all   # A-Frame brings a dependency fetched from GitHub
cp .env.example .env     # VITE_API_URL=http://localhost:5000
npm run dev
```

Open `http://localhost:5173`. The camera and WebXR need **HTTPS** or `localhost`.

Other commands: `npm run build`, `npm run preview`, `npm run lint`.

## This documentation

```bash
cd website
npm ci --allow-git=all
npm start            # development server
npm run build        # builds both languages
npm run typecheck
```

The documentation is bilingual: Portuguese lives in `website/docs/` and English in `website/i18n/en/docusaurus-plugin-content-docs/current/`. The `scripts/checar-traducao.py` script fails CI if the two versions do not have the same structure.
