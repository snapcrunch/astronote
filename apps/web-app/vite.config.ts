import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: ['astronote.snapcrunch.io'],
    proxy: {
      '/api': {
        target: 'http://localhost:3009',
        changeOrigin: true,
      },
      '/docs/api': {
        target: 'http://localhost:3009',
        changeOrigin: true,
      },
    },
  },
});
