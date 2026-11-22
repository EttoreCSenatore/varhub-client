/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';

const { version: appVersion } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// `npm run dev:phone` serves over HTTPS on your LAN: phones only allow the camera (QR scanner) and WebXR on secure pages.
const phone = process.env.VITE_HTTPS === '1';
const apiTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:5000';

// The release history (releases.yaml) becomes the module 'virtual:releases' for the What's new page.
const releasesFile = new URL('./releases.yaml', import.meta.url);
const releasesPlugin = () => ({
  name: 'varhub-releases',
  resolveId: (id) => (id === 'virtual:releases' ? '\0virtual:releases' : null),
  load(id) {
    if (id !== '\0virtual:releases') return null;
    this.addWatchFile(releasesFile.pathname);
    return `export default ${JSON.stringify(parseYaml(readFileSync(releasesFile, 'utf8')))}`;
  },
});

// Brand text from .env goes into index.html and the PWA manifest at build time.
const brandFor = (mode) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    name: env.VITE_BRAND_NAME || 'VARHub',
    tagline: env.VITE_TAGLINE || 'Augmented and virtual reality experiences, right in your browser. No app to install.',
  };
};

export default defineConfig(({ mode }) => {
  const brand = brandFor(mode);
  return {
  define: { 'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion) },
  plugins: [
    react(),
    releasesPlugin(),
    { name: 'brand-html', transformIndexHtml: (html) => html.replaceAll('%BRAND_NAME%', brand.name).replaceAll('%TAGLINE%', brand.tagline) },
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
        name: brand.name,
        short_name: brand.name.slice(0, 12),
        description: brand.tagline,
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
  };
});
