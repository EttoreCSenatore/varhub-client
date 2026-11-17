---
id: adaptar
title: Adapt it to your business
sidebar_position: 3
---

# Adapt it to your business

VARHub is a **reusable template** for any organization that wants to show VR and AR experiences without asking the audience to install an app. VARLab was the original use case; nothing in the code is specific to it.

## Who can use it

| Type | Example use |
|---|---|
| **Schools and universities** | 3D models of anatomy, machines or artworks; a 360° campus tour; project fairs with one QR code per student project. |
| **Companies and industry** | An AR product catalogue on the customer's desk; training with 360° video of a plant; demos at trade-show booths. |
| **Museums, real estate and tourism** | Objects and properties in 3D, 360° visits and QR-code trails on site. |
| **XR labs and studios** | A living portfolio of WebXR demos, with feedback and metrics per project. |

## What you change

| What | How |
|---|---|
| Name, organization and tagline | `VITE_BRAND_NAME`, `VITE_ORG_NAME` and `VITE_TAGLINE` in the client's `.env`. They also feed the page title and the PWA manifest. |
| Logo and icons | Replace `public/logo192.png` and `public/logo512.png` (and `public/icons/apple-touch-icon.png`). |
| Colours | Variables at the top of `src/styles.css` (`--vh-primary`, `--vh-accent`). |
| Content | From the **dashboard**: title, description, type (3D/AR, 360° video, WebXR demo or link), thumbnail and media URL. Nothing is hardcoded. |
| QR codes | Each project's **QR** button on the dashboard, ready to print. |
| Language | The app is in English; the texts live in the components and can be translated. |

## What you need to host

1. A **PostgreSQL database** (Neon, Supabase, RDS or your own).
2. The **API** (`varhub-server`) on any Node host: Railway, Render, Fly.io or a VM.
3. The **client** (`varhub-client`) as a static site: Vercel, Netlify, GitHub Pages with a fallback route, or the same server.
4. **Media files** (`.glb`, `.usdz`, `.mp4`) on storage with **CORS** enabled: S3, Cloudflare R2 or similar.

Set `VITE_API_URL` in the client and `ALLOWED_ORIGINS` in the API. The local walkthrough is in [Development](tecnico/desenvolvimento).

## Preparing media

- **3D models**: a light `.glb` (ideally under 10 MB). For better AR on iPhone, also add a `.usdz`.
- **360° video**: equirectangular MP4 (2:1 ratio), H.264, preferably up to 4K at a moderate bitrate so it loads on a phone.
- **WebXR demos**: any public WebXR page; the app only opens the address.

## Before you publish

- If you **host a modified version**, the AGPL requires offering the source code to its users: point the footer's **Source** link at your repository (see [License](licenca)).
- Replace the logo and texts. The names and logos of VARLab and Conestoga College are **not** licensed for third-party use (see [License](licenca)).
- Generate a strong `JWT_SECRET` and promote only the admin accounts you need.
- Review [Security](tecnico/seguranca): sign-up without email verification and unmoderated comments may need changes in your context.
- If you collect personal data, check the privacy laws that apply to you (for example LGPD, GDPR or PIPEDA). Anonymous feedback stores no name or IP, but accounts store an email.
