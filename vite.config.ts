import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
export default defineConfig({
  plugins: [react(), tailwind()],
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      ignored: [
        '**/reports/**',
        '**/test-results*/**',
        '**/playwright-report/**',
        '**/*.tsbuildinfo',
      ],
    },
  },
  preview: { port: 4173, strictPort: true },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/\/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react-runtime';
          if (id.includes('/node_modules/@tanstack/')) return 'tanstack';
        },
      },
    },
  },
});
