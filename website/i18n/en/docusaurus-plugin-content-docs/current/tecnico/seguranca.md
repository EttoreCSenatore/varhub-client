---
id: seguranca
title: Security
sidebar_position: 4
---

# Security

What the application protects today, what was fixed in the post-graduation review, and what is still missing.

## Current protections

- **Passwords** hashed with `bcryptjs` (cost 12), 8 to 128 characters; login compares in constant time even for unknown emails.
- **JWT** HS256 valid for 24 hours (`jose`), with a `JWT_SECRET` of at least 16 characters (the server will not start in production without it).
- **Roles**: admin routes check the role **in the database**, so a demoted admin loses access immediately.
- **Anonymous, but limited**: feedback and events accept visitors without an account, with per-IP rate limits and a fixed list of actions.
- **Feedback privacy**: the public summary never shows who wrote it.
- **Validation**: rating 1 to 5, maximum lengths, type and status from a list, and `http(s)`-only URLs (prevents `javascript:` in links).
- **Helmet**, JSON body limited to 100 KB, **CORS** only for `ALLOWED_ORIGINS` and **database TLS verified** outside localhost.
- **Parameterized SQL** in every query.
- **Third-party QR codes**: the scanner never opens a link by itself; it shows the address and asks for a tap.
- No runtime dependencies loaded from a CDN.
- `npm audit` runs in the server CI and fails on high-severity vulnerabilities.

## What was fixed in the review

| Problem found | Fix |
|---|---|
| `jsonwebtoken` used but missing from `package.json`; native `bcrypt` failed on recent Node | `jose` and `bcryptjs`, declared. |
| `/api/analytics` and `/api/notifications` were open | Admins only. |
| Feedback wrote to the wrong column and trusted the body's `userId` | Column fixed; the user comes from the token. |
| Every view was counted as user 1 | Explicit events, anonymous or the token's user. |
| Database TLS was not verified | Verification on by default. |
| API projects showed up blank (different field names) | One normalized shape. |
| `webxr-polyfill@latest` script loaded from a CDN with no pinned version | Removed. |
| Firebase keys in code and push code that never ran | Removed from the client. |
| Server dependencies with high-severity vulnerabilities | `npm audit fix`; audit in CI. |
| Personal email in old commits | History rewritten to GitHub's noreply email. |

## What is still missing

- **Token in `localStorage`**: exposed to XSS. An `HttpOnly` cookie would be safer.
- **Public comments without moderation**: React escapes the text, but there is no way to hide abuse.
- **Sign-up without email verification**.
- **Promotion to admin** is script-only (`npm run admin:promote`), on purpose.
- **A strict CSP header**: `<model-viewer>` and Three.js need careful tuning.
- **End-to-end browser tests**.

## Reporting a vulnerability

Use GitHub's [private vulnerability reporting](https://github.com/EttoreCSenatore/varhub-client/security/advisories/new). Please do not open a public issue with details.
