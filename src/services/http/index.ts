import axios from 'axios';
import { clearPrivateCache, keys, queryClient } from '../../lib/query';
import type { User } from '../../contracts';
import { readGenerationSnapshot, rememberGeneration } from './generation';
export const http = axios.create({
  baseURL: '/api',
  timeout: 5_000,
  headers: { 'Content-Type': 'application/json' },
});
const requestEpochs = new WeakMap<object, number>();
http.interceptors.request.use(
  (config) => {
    const { generation, epoch } = readGenerationSnapshot();
    requestEpochs.set(config, epoch);
    if (generation) config.headers.set('X-Demo-Session', generation);
    return config;
  },
  undefined,
  { synchronous: true },
);
http.interceptors.response.use(
  (response) => {
    if (
      response.config.url === '/session' ||
      response.config.url?.startsWith('/session/') ||
      response.config.url === '/demo/reset'
    ) {
      const generation = response.headers['x-demo-session'];
      const current = readGenerationSnapshot();
      // A reset can reuse a numeric generation; only the request's current local epoch may rebase it.
      if (requestEpochs.get(response.config) !== current.epoch)
        throw new axios.CanceledError('Discarded an outdated session response.', response.config);
      rememberGeneration(generation, response.config.url !== '/session');
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
    const current = readGenerationSnapshot();
    const capturedEpoch = error.config ? requestEpochs.get(error.config) : undefined;
    const outdatedRequest =
      (capturedEpoch !== undefined && capturedEpoch !== current.epoch) ||
      (error.response?.data?.code === 'STALE_SESSION' &&
        String(
          error.config?.headers?.get?.('X-Demo-Session') ??
            error.config?.headers?.['X-Demo-Session'] ??
            '',
        ) !== current.generation);
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
