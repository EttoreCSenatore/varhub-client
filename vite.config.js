/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { VitePWA } from 'vite-plugin-pwa';

// `npm run dev:phone` serves over HTTPS on your LAN: phones only allow the camera (QR scanner) and WebXR on secure pages.
const phone = process.env.VITE_HTTPS === '1';
const apiTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:5000';

export default defineConfig({
  plugins: [
    react(),
    ...(phone ? [basicSsl()] : []),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png', 'images/*.svg'],
      workbox: {
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          // Project data keeps working offline with the last copy the visitor saw.
          { urlPattern: ({ url }) => url.pathname === '/api/projects' || /^\/api\/projects\/\d+$/.test(url.pathname),
            handler: 'StaleWhileRevalidate', options: { cacheName: 'varhub-projects' } },
          { urlPattern: /\.(?:png|jpg|jpeg|webp|svg|glb|usdz)$/i,
            handler: 'CacheFirst', options: { cacheName: 'varhub-media', expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 }, cacheableResponse: { statuses: [0, 200] } } },
        ],
      },
      manifest: {
        name: 'VARHub',
        short_name: 'VARHub',
        description: 'Scan a QR code and explore VARLab projects in AR and 360°.',
        theme_color: '#6d28d9',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'logo192.png', sizes: '192x192', type: 'image/png' },
          { src: 'logo512.png', sizes: '512x512', type: 'image/png' },
          { src: 'logo512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  server: {
    proxy: { '/api': { target: apiTarget, changeOrigin: true } },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
  },
});
