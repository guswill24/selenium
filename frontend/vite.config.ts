import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

// The dev server does not serve index.html for folders in public/: /presentacion/ would fall back to the
// SPA (404 page). Point it to the deck's index.html, as Vercel and `vite preview` already do.
const presentationIndex: Plugin = {
  name: 'presentation-index',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === '/presentacion' || req.url === '/presentacion/' || req.url?.startsWith('/presentacion/?')) {
        req.url = '/presentacion/index.html' + (req.url.split('?')[1] ? `?${req.url.split('?')[1]}` : '');
      }
      next();
    });
  },
};

// The /api proxy only exists for local development. In production (Vercel)
// the frontend and the API share the same origin, so relative /api paths work as-is.
const apiPort = process.env.PORT ?? '3001';

export default defineConfig({
  plugins: [react(), tailwindcss(), presentationIndex],
  // Read VITE_* variables from the repository root .env (single source for the monorepo).
  envDir: '..',
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': `http://localhost:${apiPort}`,
    },
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});
