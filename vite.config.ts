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
  build: { sourcemap: false },
});
