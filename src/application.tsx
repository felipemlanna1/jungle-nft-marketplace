import React from 'react';
import type { Root } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { queryClient } from './lib/query';
import { router } from './router';
import { StyleguideProvider } from './styleguide';
export { prefetchPublicRoute } from './app/routing/preload';

/** Mount only after the simulated transport is ready to handle application requests. */
export function mountApplication(root: Root) {
  root.render(
    <React.StrictMode>
      <StyleguideProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </StyleguideProvider>
    </React.StrictMode>,
  );
}
