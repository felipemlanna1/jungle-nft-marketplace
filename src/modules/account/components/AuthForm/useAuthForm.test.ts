// @vitest-environment jsdom
import { webcrypto } from 'node:crypto';
import { createElement, type ReactNode } from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { http as mockHttp, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { handlers } from '../../../../mocks/handlers';
import { database, initializeDatabase } from '../../../../mocks/database';
import { market } from '../../../../services/marketplace';
import { http } from '../../../../services/http';
import { keys, queryClient } from '../../../../lib/query';
import { DEMO_LOGIN } from '../../../../config/demo';
import { useAuthForm } from './useAuthForm';
import type { AuthSearch } from '../../shared-types';
import type { User } from '../../../../contracts';

const route = vi.hoisted(() => ({ navigate: vi.fn(), search: {} as AuthSearch }));
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => route.navigate,
  useSearch: () => route.search,
}));
vi.stubGlobal('crypto', webcrypto);
const server = setupServer(...handlers);
const originalBaseURL = http.defaults.baseURL;
beforeAll(() => {
  http.defaults.baseURL = `${location.origin}/api`;
  server.listen({ onUnhandledRequest: 'error' });
});
afterAll(() => {
  http.defaults.baseURL = originalBaseURL;
  server.close();
});
beforeEach(async () => {
  localStorage.clear();
  sessionStorage.clear();
  queryClient.clear();
  server.resetHandlers();
  vi.clearAllMocks();
  route.search = { redirect: '/' };
  await initializeDatabase(true);
  sessionStorage.setItem('jungle:transport-generation', '17');
});
afterEach(() => {
  cleanup();
  queryClient.clear();
});
const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(QueryClientProvider, { client: queryClient }, children);

function gate() {
  let resolve!: () => void;
  const promise = new Promise<void>((complete) => {
    resolve = complete;
  });
  return { promise, resolve };
}

describe('authentication session handshake', () => {
  it.each([false, true])(
    'deduplicates bootstrap before the real authentication POST (register=%s)',
    async (register) => {
      const entered = gate();
      const releaseSession = gate();
      const releaseAuthentication = gate();
      let sessionRequests = 0;
      let postRequests = 0;
      let authenticationGeneration: string | null = null;
      server.use(
        mockHttp.get(`${location.origin}/api/session`, async () => {
          sessionRequests++;
          entered.resolve();
          await releaseSession.promise;
          return HttpResponse.json(null, { headers: { 'X-Demo-Session': '1' } });
        }),
        mockHttp.post(
          `${location.origin}/api/session/${register ? 'register' : 'login'}`,
          async ({ request }) => {
            postRequests++;
            authenticationGeneration = request.headers.get('X-Demo-Session');
            await releaseAuthentication.promise;
            return undefined;
          },
        ),
      );
      const bootstrap = queryClient.fetchQuery({
        queryKey: keys.session,
        queryFn: ({ signal }) => market.session(signal),
        retry: false,
      });
      await entered.promise;
      const { result } = renderHook(() => useAuthForm(register), { wrapper });
      act(() => {
        if (register) {
          result.current.setName('New collector');
          result.current.setEmail('new.collector@example.test');
          result.current.setPassword('Collect0r!New');
        } else result.current.fillDemoLogin();
      });
      let submitted!: Promise<User | Error>;
      await act(async () => {
        submitted = result.current.mutation.mutateAsync().catch((error: Error) => error);
      });
      releaseSession.resolve();
      await bootstrap;
      releaseAuthentication.resolve();
      let user!: User | Error;
      await act(async () => {
        user = await submitted;
      });
      expect(user).toMatchObject({
        email: register ? 'new.collector@example.test' : DEMO_LOGIN.email,
      });
      expect(sessionRequests).toBe(1);
      expect(postRequests).toBe(1);
      expect(authenticationGeneration).toBe('1');
      expect(database().currentUserId).toBe((user as User).id);
      expect(queryClient.getQueryData<User>(keys.session)?.id).toBe((user as User).id);
      expect(sessionStorage.getItem('jungle:transport-generation')).toBe('2');
      expect(route.navigate).toHaveBeenCalledWith({ to: '/' });
    },
  );

  it('saves the selected favorite only after the normal authenticated session is accepted', async () => {
    route.search = { redirect: '/?q=Sage&tab=trending', favorite: 'nft-2' };
    let favoriteRequests = 0;
    server.use(
      mockHttp.post(`${location.origin}/api/favorites`, () => {
        favoriteRequests++;
        return undefined;
      }),
    );
    const { result } = renderHook(() => useAuthForm(false), { wrapper });
    act(() => result.current.fillDemoLogin());
    expect(database().currentUserId).toBeNull();
    expect(favoriteRequests).toBe(0);
    await act(async () => {
      await result.current.mutation.mutateAsync();
    });
    expect(database().currentUserId).toBe('user-1');
    expect(database().users[0].favorites).toContain('nft-2');
    expect(queryClient.getQueryData(['favorites', 'user-1'])).toEqual(['nft-2']);
    expect(favoriteRequests).toBe(1);
    expect(route.navigate).toHaveBeenCalledWith({ to: '/?q=Sage&tab=trending' });
  });

  it('demo prefill does not reset a password changed through the API', async () => {
    await market.session();
    await market.login(DEMO_LOGIN.email, DEMO_LOGIN.password);
    const changedPassword = 'Changed0nly!Demo';
    await market.changePassword(DEMO_LOGIN.password, changedPassword);
    await market.logout();
    queryClient.clear();
    const digest = database().users[0].passwordHash;
    const { result } = renderHook(() => useAuthForm(false), { wrapper });
    act(() => result.current.fillDemoLogin());
    let denied: unknown;
    await act(async () => {
      denied = await result.current.mutation.mutateAsync().catch((error: unknown) => error);
    });
    expect(denied).toMatchObject({
      response: { status: 401, data: { code: 'INVALID_CREDENTIALS' } },
    });
    expect(database().users[0].passwordHash).toBe(digest);
    expect(database().currentUserId).toBeNull();
    act(() => result.current.setPassword(changedPassword));
    await act(async () => {
      await result.current.mutation.mutateAsync();
    });
    expect(database().currentUserId).toBe('user-1');
    expect(database().users[0].passwordHash).toBe(digest);
  });

  it('does not send credentials when the authoritative session handshake fails', async () => {
    let sessionRequests = 0;
    let loginRequests = 0;
    server.use(
      mockHttp.get(`${location.origin}/api/session`, () => {
        sessionRequests++;
        return HttpResponse.json({ message: 'Session unavailable' }, { status: 503 });
      }),
      mockHttp.post(`${location.origin}/api/session/login`, () => {
        loginRequests++;
        return undefined;
      }),
    );
    const { result } = renderHook(() => useAuthForm(false), { wrapper });
    act(() => result.current.fillDemoLogin());
    let denied: unknown;
    await act(async () => {
      denied = await result.current.mutation.mutateAsync().catch((error: unknown) => error);
    });
    expect(denied).toMatchObject({ response: { status: 503 } });
    expect(sessionRequests).toBe(1);
    expect(loginRequests).toBe(0);
    expect(route.navigate).not.toHaveBeenCalled();
    expect(result.current.email).toBe(DEMO_LOGIN.email);
    expect(result.current.password).toBe(DEMO_LOGIN.password);
    expect(database().currentUserId).toBeNull();
  });
});
