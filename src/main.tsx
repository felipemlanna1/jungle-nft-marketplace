import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { queryClient } from './lib/query';
import { router } from './router';
import './styles.css';
import { StyleguideProvider } from './styleguide';

async function bootstrap() {
  if (import.meta.env.VITE_MOCKS !== 'false') {
    const { startMocks } = await import('./mocks/browser');
    await startMocks();
  }
  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <StyleguideProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </StyleguideProvider>
    </React.StrictMode>,
  );
}
bootstrap().catch(() => {
  const root = document.getElementById('root');
  if (root)
    root.innerHTML =
      '<main style="padding:3rem;font-family:system-ui"><h1>Unable to start the demo</h1><p>Please reload this page. A service worker is required for the simulated API.</p><button onclick="location.reload()">Reload</button></main>';
});
