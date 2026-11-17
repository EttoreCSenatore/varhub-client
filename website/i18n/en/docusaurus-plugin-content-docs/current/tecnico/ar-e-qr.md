---
id: ar-e-qr
title: AR and QR code
sidebar_position: 2
---

# AR and QR code

## A project's QR code

On the dashboard, each project has a **QR** button that downloads a PNG encoding `https://<site>/projects/<id>?src=qr`. Scanning it with **any** reader (including the phone's native camera) opens the project page, and the `src=qr` parameter makes the server count one scan.

## In-app scanner

The **Scan** page opens the rear camera and decodes downscaled frames (up to 640 px wide) with `jsQR`, about eight times per second. If the camera is denied or missing, the visitor can **choose a photo** of the QR code.

What happens after a scan:

| Content | Result |
|---|---|
| A `/projects/<id>` link of this app | Opens the project and counts a scan. |
| Any other `http(s)` address | Shows the full address and opens only on a tap, noting that VARHub did not create the link. |
| Any other text (including `javascript:` and `tel:`) | Shows the text; never becomes a link. |

## 3D models and AR

**3D / AR** projects use Google's `<model-viewer>` component:

- In every browser: rotate, zoom and inspect the model (`.glb`).
- Android: a **View in your space (AR)** button using WebXR or Scene Viewer.
- iPhone: Quick Look. Without a `.usdz` file, `<model-viewer>` generates one from the `.glb`.

The `ar_launch` event is recorded when the AR session starts.

## 360° video

**360° video** projects use a custom Three.js viewer: the equirectangular video is mapped onto the inside of a sphere. Drag to look around, use the mouse wheel to zoom or, on a phone, the **Use phone motion** button to turn with the device (on iPhone the system asks for motion permission).

:::warning
The video file must be served with **CORS** headers (`Access-Control-Allow-Origin`), otherwise the browser will not let it be used as a texture. On S3, configure the bucket's CORS for the app's origin.
:::

## WebXR demos

**WebXR demo** projects open an external page (for example the official [WebXR Samples](https://immersive-web.github.io/webxr-samples/)). They need Chrome on an ARCore Android device; the app warns when the device is not compatible.
