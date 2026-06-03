import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  const basePath = normalizeBasePath(process.env.VITE_BASE_PATH);

  return {
    base: basePath,
    plugins: [
      react(),
      VitePWA({
        injectRegister: false,
        registerType: 'prompt',
        includeAssets: [
          'icons/apple-touch-icon.png',
          'icons/favicon.svg',
          'icons/icon-192.png',
          'icons/icon-512.png'
        ],
        manifest: {
          name: 'FLOW',
          short_name: 'FLOW',
          description: 'FLOW est une application PWA locale et iPhone-first pour suivre son flux personnel.',
          theme_color: '#f3efe6',
          background_color: '#f8f5ee',
          display: 'standalone',
          orientation: 'portrait',
          scope: basePath,
          start_url: basePath,
          lang: 'fr',
          categories: ['productivity', 'health'],
          icons: [
            {
              src: `${basePath}icons/icon-192.png`,
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: `${basePath}icons/icon-512.png`,
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: `${basePath}icons/icon-512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        }
      })
    ],
    server: {
      host: '127.0.0.1',
      port: 5173
    },
    preview: {
      host: '127.0.0.1',
      port: 4173
    },
    test: {
      environment: 'jsdom',
      globals: true
    }
  };
});

function normalizeBasePath(value: string | undefined): string {
  if (!value || value.trim().length === 0 || value.trim() === '/') {
    return '/';
  }

  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}
