---
id: seguranca
title: Security
sidebar_position: 4
---

# Security

This page records what the API protects today, the fixes made in the post-graduation review, and what is still missing.

## Current protections

- **Passwords** hashed with `bcryptjs` (cost 10); minimum 8 characters.
- **JWT** HS256 valid for 24 hours, signed with `JWT_SECRET` (`jose` library).
- **Sensitive routes** (`/api/analytics`, `/api/feedback`, `/api/notifications/send-notification`) require a token.
- **Feedback `userId` comes from the token**, not the request body, so nobody can rate on behalf of someone else.
- **Validation** of the rating (1 to 5), `projectId` and comment length (2000 characters); JSON body limited to 100 KB.
- **Helmet** (security headers) and **rate limiting** on login and sign-up.
- **CORS** only for the origins in `ALLOWED_ORIGINS`.
- **Database TLS verified** by default (`DB_SSL_REJECT_UNAUTHORIZED=true`).
- Queries are always **parameterized** (no SQL concatenation).

## What was fixed

| Problem found | Fix |
|---|---|
| `jsonwebtoken` used in code but missing from `package.json` | Replaced by `jose`, declared as a dependency. |
| `/api/analytics` and `/api/notifications` were open | Now require a JWT. |
| Feedback wrote to a `comments` column that does not exist (`comment`) | Column fixed. |
| Feedback accepted `userId` from the body | `userId` comes from the token. |
| Project views always logged as user 1 | Uses the token's user or `NULL`. |
| `rejectUnauthorized: false` disabled TLS verification | Verification on by default. |
| Native `bcrypt` failed to build on recent Node versions | Replaced by `bcryptjs`. |

## What is still missing

- **User roles**: any authenticated account can read analytics and send pushes. An admin role is missing.
- **Firebase config in code**: `src/firebase.js` and `firebase-messaging-sw.js` contain the API key and the public VAPID key. They are public identifiers by design, but should be origin-restricted in the Firebase console.
- **Token in `localStorage`**: exposed to XSS. An `HttpOnly` cookie would be safer.
- **Public CORS proxies** for S3 videos (see [AR and QR code](ar-e-qr)).
- **Automated tests** for authorization.
- **Git history** containing the author's personal email in old commits.

## Reporting a vulnerability

Use GitHub's [private vulnerability reporting](https://github.com/EttoreCSenatore/varhub-client/security/advisories/new). Please do not open a public issue with details.
