import { defineConfig } from 'vite';  
import react from '@vitejs/plugin-react';  
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({  
  plugins: [  
    react(),  
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [  
          {  
            urlPattern: /\.(?:png|jpg|jpeg|svg|glb)$/,  
            handler: 'CacheFirst',  
          },  
          {  
            urlPattern: /\.(?:pdf|json)$/,  
            handler: 'NetworkFirst',  
          },  
        ],
      },
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'VARhub Application',
        short_name: 'VARhub',
        description: 'VARhub - AR experiences for education',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),  
  ],  
});