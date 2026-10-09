import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The /api proxy only exists for local development. In production (Vercel)
// the frontend and the API share the same origin, so relative /api paths work as-is.
const apiPort = process.env.PORT ?? '3001';

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
