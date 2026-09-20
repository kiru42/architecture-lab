import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Every frontend talks to the backend through the same relative `/api` prefix.
// In dev, Vite proxies it; in Docker, nginx proxies it (see docker/nginx.conf).
const API_PROXY_TARGET = process.env.API_PROXY_TARGET ?? 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5001,
    proxy: {
      '/api': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // Socket.IO needs its own entry: `ws: true` is what upgrades the
      // connection, and the path is not under /api.
      '/socket.io': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
