---
id: decisoes
title: Decision log
sidebar_position: 1
---

# Decision log

Each row is a decision, with date and reason. If a decision changes, the old row is marked **superseded** and a new one is added, preserving the history. The decisions come from the choices made along the project; see also the [Roadmap](../roadmap).

| # | Date | Decision | Reason | Status |
|---|---|---|---|---|
| 001 | 2026-11-17 | Keep **two repositories** (`varhub-client` and `varhub-server`); docs live in the client and cover both | Each has its own deploy, history and public links; merging would break those with no gain | Accepted |
| 002 | 2026-11-17 | Documentation in **Docusaurus**, Portuguese by default plus English, same standard as the other projects | A standard already used elsewhere; a Brazilian and an international audience | Accepted |
| 003 | 2026-11-17 | License **AGPL-3.0-or-later** (code) and **CC BY-SA 4.0** (docs), replacing MIT | Free software with network copyleft, like the other projects; whoever hosts a modified version shares the code | Accepted (supersedes MIT) |
| 004 | 2026-11-17 | Gallery and project pages are **public**; an account is optional | A QR code at an event cannot require sign-up; it was the app's biggest obstacle | Accepted |
| 005 | 2026-11-17 | **Anonymous** feedback, rate-limited, with a public summary that hides the author | Less friction and better privacy; the limit contains abuse | Accepted |
| 006 | 2026-11-17 | Usage events through `POST /api/events` with a fixed list of actions, instead of logging on `GET` | A `GET` that writes is easy to inflate and track; the fixed list avoids arbitrary data | Accepted |
| 007 | 2026-11-17 | **Visitor** and **admin** roles; the role is checked in the database; promotion only by script | A demoted admin loses access at once; no public route creates admins | Accepted |
| 008 | 2026-11-17 | JWT with `jose` and passwords with `bcryptjs` (cost 12) | `jsonwebtoken` was not declared and native `bcrypt` does not build on recent Node | Accepted |
| 009 | 2026-11-17 | PostgreSQL with plain **SQL migrations**, no ORM | The schema is small; explicit SQL is auditable and migrations are safe to run twice | Accepted |
| 010 | 2026-11-17 | `<model-viewer>` for 3D and AR, instead of the custom WebXR viewer | Works on Android and iPhone (Quick Look); the custom viewer only ran on Chrome for Android | Accepted |
| 011 | 2026-11-17 | Own 360° video viewer in Three.js, and A-Frame removed | A-Frame weighed about 1 MB and brought a dependency fetched from GitHub | Accepted |
| 012 | 2026-11-17 | QR scanner with `jsQR` and a photo fallback; `html5-qrcode` removed | One lighter library, and it works without a camera | Accepted |
| 013 | 2026-11-17 | **PWA**, not a native app | Opens straight from the QR code with nothing to install; one codebase for every device | Accepted |
| 014 | 2026-11-17 | Remove the Firebase client; push will come through Web Push (R5) | The code never ran and left keys in the repository; Web Push has no vendor | Accepted |
| 015 | 2026-11-17 | In development Vite forwards `/api` to the server; in production `VITE_API_URL` or Caddy does | Same origin avoids CORS and mixed content on a phone | Accepted |
| 016 | 2026-11-17 | Brand configurable through build-time environment variables (`VITE_BRAND_NAME` and others) | Any organization adapts without editing code; a dashboard screen comes in R4 | Accepted (interim) |
| 017 | 2026-11-17 | Rewrite both repositories' history to GitHub's noreply email | The personal email was in public commits; the rewrite was done with a backup | Accepted (done) |
| 018 | 2026-11-17 | Integration tests against a real PostgreSQL (`node:test`) | Catches SQL and permission bugs a mocked database hides | Accepted |
| 019 | 2026-11-17 | `npm audit` and a license audit (AGPL-compatible) in CI | High-severity dependencies had already shown up; the license has to stay valid | Accepted |
| 020 | 2026-11-21 | Compare with Kaladrius and follow a roadmap R1 to R7 | It is much more mature in operations, security and releases; we copy what fits and leave the rest | Accepted |
| 021 | 2026-11-21 | Do not copy `.deb`/`.rpm` packages, self-update with rollback, a native app or mandatory 2FA | Too heavy or excessive for an AR showcase | Accepted |
| 022 | 2026-11-21 | **One installation per organization** | Simpler; it is what Kaladrius does. Several organizations in one installation can wait for demand | Accepted |
| 023 | 2026-11-22 | Production with **Docker Compose and Caddy**; database with no published port; images on GHCR pinned by digest | Same environment locally and in production, automatic HTTPS and a minimal attack surface | Accepted |
| 024 | 2026-11-22 | Backup with a verified `pg_dump`, 30-day retention and a **restore test in CI** | A backup that was never restored is not a backup | Accepted |
| 025 | 2026-11-22 | The demo reset only runs with `DEMO_MODE=1` | It wipes the database; it has to be impossible to run by mistake on a real installation | Accepted |
| 026 | 2026-11-22 | Actions pinned by commit and plain `docker` commands in CI | A moved tag cannot change what runs with the repository's credentials; fewer third-party actions | Accepted |
| 027 | 2026-11-22 | SemVer and `releases.yaml` as the single source; CI creates the tag and the Release | Nobody has to remember to publish; the history shows up in the app and on GitHub | Accepted |
