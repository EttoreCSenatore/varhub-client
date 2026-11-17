---
id: roadmap
title: Roadmap
sidebar_position: 3
---

# Roadmap

This page separates what **works today** from what stayed **planned**.

## Delivered

- Public project gallery with search and type filter.
- Project page with a 3D and AR viewer (`<model-viewer>`), 360° video and WebXR demos.
- QR scanner (camera or photo) that opens the project inside the app, and `?src=qr` links counted as scans.
- Anonymous or signed-in feedback, with a public summary that hides the author.
- JWT accounts with roles (visitor and admin).
- Admin dashboard: metrics, create, edit and publish projects, and download each project's QR code.
- PWA with offline cache of the project list and media.
- API with migrations, PostgreSQL integration tests and CI.
- Security hardening (see [Security](tecnico/seguranca)).

## Planned

- Push notifications: the server already sends them (admin route), but the client still has to register the device and store the token.
- 2D campus map with **ARWay** integration (proof of concept).
- Uploading models and videos from the dashboard (today it takes the file's URL).
- Comment moderation.
- Google login.
- Replace the `localStorage` token with an `HttpOnly` cookie.
- End-to-end tests (Playwright) on a real or emulated phone.

## Things to know

- 360° videos need hosting with CORS headers (for example a configured S3 bucket). Without them the browser blocks the texture.
- The camera and WebXR require **HTTPS**. In development use `npm run dev:phone`.
- The backend previously hosted on Railway no longer exists; the API has to be redeployed and `VITE_API_URL` pointed at it.
