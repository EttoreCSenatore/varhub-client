---
id: desenvolvimento
title: Development
sidebar_position: 5
---

# Development

## Requirements

- Node.js 20 or newer and npm.
- PostgreSQL 15+ (easiest with Docker) or a [Neon](https://neon.tech/) account.

## 1. Database and server

```bash
docker run -d --name varhub-pg -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=varhub \
  -p 127.0.0.1:5433:5432 postgres:17-alpine

git clone https://github.com/EttoreCSenatore/varhub-server
cd varhub-server
npm install
cp .env.example .env     # fill in JWT_SECRET, DB_PORT=5433, DB_PASSWORD=dev, DB_SSL=false
npm run db:seed          # creates the tables and demo projects
npm run dev
```

Environment variables (`.env.example`):

| Variable | Purpose |
|---|---|
| `PORT` | Server port (default 5000). |
| `ALLOWED_ORIGINS` | CORS origins, comma-separated. |
| `JWT_SECRET` | Long random secret (`openssl rand -hex 32`). |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL connection. |
| `DB_SSL` | `false` for a local database; TLS is used by default outside localhost. |
| `FIREBASE_SERVICE_ACCOUNT` | Only for the admin push route. |

### Create an admin

Sign up in the app, then promote the account:

```bash
npm run admin:promote -- you@example.com
```

### Tests

```bash
docker exec varhub-pg psql -U postgres -c "CREATE DATABASE varhub_test"
npm test                 # integration tests against PostgreSQL
```

## 2. Client

```bash
git clone https://github.com/EttoreCSenatore/varhub-client
cd varhub-client
npm ci
npm run dev              # http://localhost:5173 (Vite forwards /api to the server)
```

Other commands: `npm test`, `npm run lint`, `npm run build`.

## 3. Test on your phone

The camera (QR codes) and AR only work on **HTTPS** pages. With the phone on the **same Wi-Fi network**:

```bash
npm run dev:phone        # HTTPS on the local network, development certificate
```

Open `https://<computer-IP>:5173` on the phone and accept the development certificate warning. The API goes through the same address, so nothing else needs changing. Check:

1. **Scan**: point at the QR code downloaded from the dashboard and see the project open.
2. **3D/AR**: open the astronaut project and tap **View in your space**.
3. **360°**: tap Play, drag, and try **Use phone motion**.
4. **Install**: browser menu, "Add to home screen", and open it offline.

If the phone cannot open the address, the computer's firewall is probably blocking the port (for example `sudo ufw allow from 192.168.0.0/16 to any port 5173 proto tcp`, adjusting the subnet), or the Wi-Fi isolates devices from each other (guest networks). Alternatives: a temporary HTTPS tunnel (`cloudflared tunnel --url https://localhost:5173 --no-tls-verify`, starting Vite with `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS=.trycloudflare.com`; it exposes the development server to the internet while open) or, on Android with USB debugging, `adb reverse tcp:5173 tcp:5173` and open `https://localhost:5173`.

## 4. This documentation

```bash
cd website
npm ci
npm start                # development server
npm run build            # builds both languages
```

The documentation is bilingual: Portuguese lives in `website/docs/` and English in `website/i18n/en/docusaurus-plugin-content-docs/current/`. The `scripts/checar-traducao.py` script fails CI if the two versions do not have the same structure.
