---
id: intro
title: Overview
slug: /intro
sidebar_position: 1
---

# VARHub

**VARHub** is a concept platform for **publishing VR and AR projects** for **companies and schools**: the audience scans a QR code and explores **3D models in augmented reality** and **360° video** right in the phone's browser, with nothing to install. It is **free software** (AGPL-3.0-or-later) and designed to be **adapted by any business or educational institution**: change the name, logo and colours, add your projects and print your QR codes. See [Adapt it to your business](adaptar).

It started as my **capstone project** at **Conestoga College**, with **VARLab** as the original use case. The system has two parts, in two repositories:

| Part | Repository | What it does |
|---|---|---|
| **Client** | [varhub-client](https://github.com/EttoreCSenatore/varhub-client) | React web app (PWA), designed phone-first. |
| **Server** | [varhub-server](https://github.com/EttoreCSenatore/varhub-server) | Express API with PostgreSQL: projects, feedback, usage events, accounts and dashboard. |

![VARHub home page on a phone](/img/screenshots/app-home.png)

## How a visitor uses it

1. **Scans** one of the organization's QR codes (with the in-app scanner or the phone's own camera) and lands on the project page.
2. **Explores**: spins a 3D model and places it in the room with AR, or looks around in a 360° video.
3. **Rates**: gives 1 to 5 stars and an optional comment, no account needed.

## What the organization's staff do

Sign in with an admin account and, on the **dashboard**, see scans, AR launches and ratings for the last 14 days, create and publish projects, and **download the QR code** of each one to print.

![Project list on a phone](/img/screenshots/app-projects.png)

## Features

| Feature | Purpose |
|---|---|
| **Public gallery** | Search and filter by type (3D/AR, 360° video, WebXR demo, link). No login. |
| **QR code scanner** | Live camera or a photo of the code; opens the project inside the app. |
| **AR for 3D models** | `<model-viewer>`: AR on Android (WebXR or Scene Viewer) and iPhone (Quick Look). |
| **360° video** | Drag to look around, or use the phone's motion. |
| **Feedback** | Rating and comment, anonymous or tied to an account; public summary with no author data. |
| **PWA and offline** | Installable; the project list and media are cached. |
| **Admin dashboard** | Metrics, project management and printable QR codes. |

## Technology

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, Bootstrap, `@google/model-viewer`, Three.js, `jsQR`, `qrcode` |
| Backend | Node.js, Express, `pg`, `jose` (JWT), `bcryptjs`, Helmet, `express-rate-limit` |
| Database | PostgreSQL (Neon Serverless) |
| Tests | Vitest and Testing Library (client); `node:test` with real PostgreSQL (server) |
| Hosting | Vercel (client) and Railway (server); docs on GitHub Pages |

## Where to go next

- [Architecture](tecnico/arquitetura): how the pieces connect.
- [AR and QR code](tecnico/ar-e-qr): how immersive content opens on a phone.
- [API](tecnico/api): routes, authentication and errors.
- [Security](tecnico/seguranca): what is protected and what is still missing.
- [Development](tecnico/desenvolvimento): how to run everything and test on a phone.
- [Adapt it to your business](adaptar): branding, hosting and use cases.
- [Roadmap](roadmap): what shipped and what stayed planned.
