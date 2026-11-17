---
id: roadmap
title: Roadmap
sidebar_position: 3
---

# Roadmap

The project was delivered as a capstone. This page separates what **works today** from what stayed **planned**.

## Delivered

- Project gallery protected by login.
- Sign-up and login with JWT.
- QR code scanner (camera) that opens videos in the player, with a 360° viewer, and external links.
- WebXR demos in the gallery (AR, VR, hit-test, anchors, hands, 360° photos and videos) and a 3D model viewer component with hit-test.
- Feedback form with a 1 to 5 rating.
- PWA with offline cache and push notifications (FCM).
- API with projects, feedback, analytics and notifications, and a versioned SQL schema.
- Server security hardening (see [Security](tecnico/seguranca)).

## Planned

- 2D campus map with **ARWay** integration (proof of concept).
- Analytics dashboard with engagement charts and feedback trends.
- Offline downloads (brochures, videos and AR markers).
- An admin area to manage projects and AR content (today the data goes straight into the database).
- User roles (admin and visitor) to restrict analytics and notifications.
- Automated tests for client and server.
- Replace the public CORS proxies with a CORS configuration on the S3 bucket.

## Known issues

- The 3D model viewer (`ARViewer`) exists but is not wired to any route: the projects page navigates to `/ar-viewer`, which is not registered in `App.jsx`.
- The "Login with Google" button is only a placeholder: Google login is not implemented yet.
- The client uses the server's own login (JWT), not the Firebase Authentication described in the original README.
- A-Frame's dependencies include a package fetched straight from GitHub (`three-bmfont-text`), so `npm ci` must allow git dependencies.
