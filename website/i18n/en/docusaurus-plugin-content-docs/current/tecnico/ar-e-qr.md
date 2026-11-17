---
id: ar-e-qr
title: AR and QR code
sidebar_position: 2
---

# AR and QR code

## Reading the QR code

The `QRScanner` component asks for camera access and first tries the `html5-qrcode` library. If it fails to start, it falls back to manual scanning: each video frame is drawn on a `canvas` and decoded with `jsQR`.

The QR content is treated as text, then as a URL:

| Detected content | What happens |
|---|---|
| Video URL (`.mp4`, `.webm`, `.ogg`, `.mov`, `.avi`, YouTube, Vimeo and similar) | Opens in the `react-player` player, with a 360° viewer option (A-Frame `a-videosphere`). |
| Any other URL | Shows the address and offers to open it in another tab (`noopener,noreferrer`). |
| Text that is not a URL | Shows the text that was read. |

## 360° videos and CORS

The 360° videos live on **AWS S3**. For the browser to use them as a WebGL texture, the bucket must send CORS headers. Because the bucket configuration was not available, the client uses public CORS proxies (`src/utils/cors-proxy.js`) for S3 URLs, trying the next one in the list when one fails.

:::warning
Public proxies see the video URL and can go down at any time. The lasting fix is to configure CORS on the bucket (see [Roadmap](../roadmap)).
:::

## 3D model viewer

The `ARViewer` component loads a `.glb` model with Three.js's `GLTFLoader`, centers and scales it, and, on WebXR devices, uses an AR session with **hit-test** and a reticle to place the model in the room. The projects page navigates to `/ar-viewer?model=...`, but that route is not registered yet (see [Roadmap](../roadmap)).

## WebXR experiences

The projects page lists demos that point to the official [WebXR Samples](https://immersive-web.github.io/webxr-samples/): immersive AR, VR, input tracking, hit-test, anchors, hands, 360° photos and stereo video. They need a browser and a device with WebXR (for example Chrome on Android for AR).

The `webxr-polyfill` package covers browsers without native support, with limited features.
