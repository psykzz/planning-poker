import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const deployTarget = process.env.DEPLOY_TARGET?.trim();
const deployBasePath = deployTarget ? `/${deployTarget}/` : '/';

// Vite configuration for alternative development (optional)
// Next.js is the primary framework, but this provides Vite as an option
export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'static',
  base: deployBasePath,
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
