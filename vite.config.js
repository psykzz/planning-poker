import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Vite configuration for alternative development (optional)
// Next.js is the primary framework, but this provides Vite as an option
export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'static',
  base: '/planning-poker/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'vite-index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 3001,
    open: true,
  },
});
