import axios from 'axios';
import { clearPrivateCache, keys, queryClient } from '../../lib/query';
import type { User } from '../../contracts';
export const http = axios.create({
  baseURL: '/api',
  timeout: 5_000,
  headers: { 'Content-Type': 'application/json' },
});
const GENERATION_KEY = 'jungle:transport-generation';
http.interceptors.request.use((config) => {
  try {
    const generation = sessionStorage.getItem(GENERATION_KEY);
    if (generation) config.headers.set('X-Demo-Session', generation);
  } catch {
    /* Private mode still receives cache isolation. */
  }
  return config;
});
http.interceptors.response.use(
  (response) => {
    if (
      response.config.url === '/session' ||
      response.config.url?.startsWith('/session/') ||
      response.config.url === '/demo/reset'
    ) {
      const generation = response.headers['x-demo-session'];
      let olderGeneration = false;
      try {
        const current = Number(sessionStorage.getItem(GENERATION_KEY) ?? '0');
        const incoming = Number(generation);
        olderGeneration =
          response.config.url !== '/demo/reset' &&
          Number.isSafeInteger(incoming) &&
          incoming > 0 &&
          incoming < current;
      } catch {
        /* Continue with cancellation and cache guards when storage is blocked. */
      }
      if (olderGeneration)
        throw new axios.CanceledError('Discarded an outdated session response.', response.config);
      if (generation) {
        try {
          sessionStorage.setItem(GENERATION_KEY, String(generation));
        } catch {
          /* Optional persistence. */
        }
      }
    }
    if (
      response.config.url === '/session' &&
      response.data === null &&
      queryClient.getQueryData<User | null>(keys.session)
    ) {
      queryClient.setQueryData(keys.session, null);
      void clearPrivateCache();
    }
    return response;
  },
  async (error) => {
    let outdatedRequest = false;
    try {
      outdatedRequest =
        error.response?.data?.code === 'STALE_SESSION' &&
        String(
          error.config?.headers?.get?.('X-Demo-Session') ??
            error.config?.headers?.['X-Demo-Session'] ??
            '',
        ) !== sessionStorage.getItem(GENERATION_KEY);
    } catch {
      /* Use conservative expiry handling if storage is unavailable. */
    }
    if (
      error.response?.status === 401 &&
      !outdatedRequest &&
      !error.config?.url?.includes('/session/login')
    ) {
      queryClient.setQueryData(keys.session, null);
      await clearPrivateCache();
    }
    return Promise.reject(error);
  },
);

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error))
    return (
      error.response?.data?.message ??
      (error.code === 'ECONNABORTED'
        ? 'The request timed out. Your progress is preserved. Please retry.'
        : 'Connection interrupted. Please try again.')
    );
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
