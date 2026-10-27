import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
import { initializeDatabase } from './database';
export const worker = setupWorker(...handlers);
export async function startMocks() {
  await initializeDatabase();
  await worker.start({
    serviceWorker: { url: '/mockServiceWorker.js' },
    onUnhandledRequest: 'bypass',
    quiet: true,
  });
}
