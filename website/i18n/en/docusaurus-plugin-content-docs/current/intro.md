---
id: intro
title: Overview
slug: /intro
sidebar_position: 1
---

# VARHub

**VARHub** is a web-based marketing platform built for **VARLab** to showcase its projects, services and innovations through **augmented reality (AR)** experiences and visitor engagement tools.

It was my **capstone project** at **Conestoga College**. The system has two parts, in two repositories:

| Part | Repository | What it does |
|---|---|---|
| **Client** | [varhub-client](https://github.com/EttoreCSenatore/varhub-client) | React web app (PWA) with a gallery, QR code scanner and AR/VR viewers. |
| **Server** | [varhub-server](https://github.com/EttoreCSenatore/varhub-server) | Express API with PostgreSQL: accounts, projects, feedback, analytics and notifications. |

![VARHub home page](/img/screenshots/app-home.png)

## What it does

| Feature | Purpose |
|---|---|
| **Project gallery** | Lists VARLab projects and WebXR demos, for signed-in users only. |
| **QR code scanner** | Reads a QR code with the camera and opens the linked content: a video (with a 360° viewer) or an external link. |
| **AR/VR viewers** | 360° video (A-Frame), 3D models (Three.js) and WebXR demos in the browser. |
| **Accounts** | Sign-up and login with a password (bcrypt) and a 24-hour JWT. |
| **Feedback** | A 1 to 5 rating with a comment, tied to a project and to the user who sent it. |
| **PWA and offline** | Installable, with a service worker (Workbox) and cached images and models. |
| **Push notifications** | Firebase Cloud Messaging, sent by the server. |
| **Analytics** | Records views and feedback (`engagement_logs`), readable only by authenticated users. |

## Technology

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, Bootstrap, Three.js, React Three Fiber, A-Frame, WebXR |
| QR code | `html5-qrcode` and `jsQR` |
| Backend | Node.js, Express 4, `pg`, `jose`, `bcryptjs`, Helmet, `express-rate-limit` |
| Database | PostgreSQL (Neon Serverless) |
| Notifications | Firebase Cloud Messaging and Firebase Admin |
| Hosting | Vercel (client) and Railway (server); 360° videos on AWS S3 |

## Where to go next

- [Architecture](tecnico/arquitetura): how the pieces connect.
- [AR and QR code](tecnico/ar-e-qr): how immersive content is opened.
- [API](tecnico/api): routes, authentication and errors.
- [Security](tecnico/seguranca): what is protected and what is still missing.
- [Development](tecnico/desenvolvimento): how to run everything locally.
- [Roadmap](roadmap): what shipped and what stayed planned.
