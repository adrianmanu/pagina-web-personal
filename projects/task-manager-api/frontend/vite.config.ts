import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5177,
    proxy: {
      '/api': 'http://localhost:4000',
      '/health': 'http://localhost:4000',
    },
  },
});
