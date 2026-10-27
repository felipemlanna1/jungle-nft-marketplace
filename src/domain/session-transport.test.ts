// @vitest-environment jsdom
import { webcrypto } from 'node:crypto';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { http as mockHttp, HttpResponse, delay } from 'msw';
import { http as axiosHttp } from '../services/http';
import { queryClient } from '../lib/query';
import { handlers } from '../mocks/handlers';
import { database, initializeDatabase, save } from '../mocks/database';
vi.stubGlobal('crypto', webcrypto);
const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => vi.restoreAllMocks());
beforeEach(async () => {
  localStorage.clear();
  sessionStorage.clear();
  queryClient.clear();
  server.resetHandlers();
  await initializeDatabase(true);
  await axiosHttp.post('/demo/reset', undefined, { baseURL: `${location.origin}/api` });
});
describe('request-scoped account isolation', () => {
  it.each(['session-first', 'login-first'] as const)(
    'accepts legitimate first sign-in during bootstrap in the %s response order',
    async (order) => {
      vi.resetModules();
      const { http: freshHttp } = await import('../services/http');
      const { queryClient: freshQueries } = await import('../lib/query');
      sessionStorage.clear();
      let enter!: () => void;
      let release!: () => void;
      const entered = new Promise<void>((resolve) => {
        enter = resolve;
      });
      const released = new Promise<void>((resolve) => {
        release = resolve;
      });
      server.use(
        mockHttp.get(`${location.origin}/api/session`, async () => {
          enter();
          await released;
          return HttpResponse.json(null, { headers: { 'X-Demo-Session': '1' } });
        }),
      );
      const initial = freshHttp
        .get('/session', { baseURL: `${location.origin}/api` })
        .catch((error) => error);
      await entered;
      const signingIn = freshHttp.post(
        '/session/login',
        {
          email: 'collector@example.test',
          password: 'Collect0r!Demo',
        },
        { baseURL: `${location.origin}/api` },
      );
      if (order === 'session-first') {
        release();
        expect((await initial).data).toBeNull();
      }
      const signedIn = await signingIn;
      expect(signedIn.data.id).toBe('user-1');
      freshQueries.setQueryData(['session'], signedIn.data);
      if (order === 'login-first') {
        release();
        expect((await initial).code).toBe('ERR_CANCELED');
      }
      expect(sessionStorage.getItem('jungle:transport-generation')).toBe('2');
      expect(database().currentUserId).toBe('user-1');
      expect(freshQueries.getQueryData<{ id: string }>(['session'])?.id).toBe('user-1');
      freshQueries.clear();
    },
  );
  it('accepts the current mock session and signs in after only the database storage was reset', async () => {
    sessionStorage.setItem('jungle:transport-generation', '17');
    localStorage.clear();
    await initializeDatabase(true);
    const session = await axiosHttp.get('/session', { baseURL: `${location.origin}/api` });
    expect(session.data).toBeNull();
    expect(sessionStorage.getItem('jungle:transport-generation')).toBe('1');
    const login = await axiosHttp.post(
      '/session/login',
      {
        email: 'collector@example.test',
        password: 'Collect0r!Demo',
      },
      { baseURL: `${location.origin}/api` },
    );
    expect(login.data.id).toBe('user-1');
    const profile = await axiosHttp.patch(
      '/profile',
      { name: 'Recovered demo collector' },
      {
        baseURL: `${location.origin}/api`,
      },
    );
    expect(profile.data.name).toBe('Recovered demo collector');
    expect(database().currentUserId).toBe('user-1');
    expect(sessionStorage.getItem('jungle:transport-generation')).toBe('2');
  });
  it.each([2, 17])(
    'discards an old account response after reset and a new login even when its generation is %i',
    async (oldGeneration) => {
      const db = database();
      db.currentUserId = 'user-1';
      db.expiresAt = Date.now() + 60_000;
      db.sessionGeneration = oldGeneration;
      save(db);
      sessionStorage.setItem('jungle:transport-generation', String(oldGeneration));
      server.use(
        mockHttp.get(`${location.origin}/api/session`, async () => {
          await delay(300);
          return HttpResponse.json(
            { id: 'user-1', name: 'Alex Collector', email: 'collector@example.test' },
            { headers: { 'X-Demo-Session': String(oldGeneration) } },
          );
        }),
      );
      const old = axiosHttp
        .get('/session', { baseURL: `${location.origin}/api` })
        .catch((error) => error);
      await new Promise((resolve) => setTimeout(resolve, 10));
      await axiosHttp.post('/demo/reset', undefined, { baseURL: `${location.origin}/api` });
      const next = await axiosHttp.post(
        '/session/login',
        {
          email: 'second@example.test',
          password: 'Collect0r!Demo',
        },
        { baseURL: `${location.origin}/api` },
      );
      queryClient.setQueryData(['session'], next.data);
      expect((await old).code).toBe('ERR_CANCELED');
      expect(sessionStorage.getItem('jungle:transport-generation')).toBe('2');
      expect(queryClient.getQueryData<{ id: string }>(['session'])?.id).toBe('user-2');
      expect(database().currentUserId).toBe('user-2');
    },
  );
  it('preserves the captured account and new session when browser storage is blocked', async () => {
    const first = database();
    first.currentUserId = first.users[0].id;
    first.expiresAt = Date.now() + 60_000;
    first.sessionGeneration = 2;
    save(first);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    await axiosHttp.get('/session', { baseURL: `${location.origin}/api` });
    const pending = axiosHttp
      .patch(`${location.origin}/api/profile`, { name: 'Previous account pending change' })
      .then(
        () => ({ allowed: true }),
        (error) => ({ status: error.response?.status, code: error.response?.data?.code }),
      );
    const second = database();
    second.currentUserId = second.users[1].id;
    second.sessionGeneration = 3;
    save(second);
    server.use(
      mockHttp.get(`${location.origin}/api/session`, () =>
        HttpResponse.json(
          { id: 'user-2', name: 'Taylor Collector', email: 'second@example.test' },
          { headers: { 'X-Demo-Session': '3' } },
        ),
      ),
    );
    const current = await axiosHttp.get('/session', { baseURL: `${location.origin}/api` });
    queryClient.setQueryData(['session'], current.data);
    expect(await pending).toEqual({ status: 401, code: 'STALE_SESSION' });
    expect(database().users[1].name).toBe('Taylor Collector');
    expect(queryClient.getQueryData<{ id: string }>(['session'])?.id).toBe('user-2');
  });
  it('discards an outdated successful session even when storage reads and writes fail', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    server.use(
      mockHttp.get(`${location.origin}/api/session`, async () => {
        await delay(80);
        return HttpResponse.json(null, { headers: { 'X-Demo-Session': '1' } });
      }),
      mockHttp.post(`${location.origin}/api/session/login`, () =>
        HttpResponse.json(
          { id: 'user-2', name: 'Taylor Collector', email: 'second@example.test' },
          { headers: { 'X-Demo-Session': '2' } },
        ),
      ),
    );
    const pending = axiosHttp
      .get('/session', { baseURL: `${location.origin}/api` })
      .catch((error) => error);
    const current = await axiosHttp.post('/session/login', undefined, {
      baseURL: `${location.origin}/api`,
    });
    queryClient.setQueryData(['session'], current.data);
    expect((await pending).code).toBe('ERR_CANCELED');
    expect(queryClient.getQueryData<{ id: string }>(['session'])?.id).toBe('user-2');
  });
  it('reconciles a generation received while storage writes were blocked when access returns', async () => {
    sessionStorage.setItem('jungle:transport-generation', '1');
    const blockedWrite = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    server.use(
      mockHttp.get(`${location.origin}/api/session`, () =>
        HttpResponse.json(null, { headers: { 'X-Demo-Session': '3' } }),
      ),
      mockHttp.get(`${location.origin}/api/profile`, ({ request }) =>
        HttpResponse.json({ generation: request.headers.get('X-Demo-Session') }),
      ),
    );
    await axiosHttp.get('/session', { baseURL: `${location.origin}/api` });
    blockedWrite.mockRestore();
    const profile = await axiosHttp.get('/profile', { baseURL: `${location.origin}/api` });
    expect(profile.data.generation).toBe('3');
    expect(sessionStorage.getItem('jungle:transport-generation')).toBe('3');
  });

  it('captures the actor generation synchronously before an immediate account transition', async () => {
    const initial = database();
    initial.currentUserId = initial.users[0].id;
    initial.expiresAt = Date.now() + 60_000;
    initial.sessionGeneration = 2;
    save(initial);
    sessionStorage.setItem('jungle:transport-generation', '2');
    const pending = axiosHttp
      .patch(`${location.origin}/api/profile`, { name: 'Stale account payload' })
      .then(
        () => ({ allowed: true }),
        (error) => ({ status: error.response?.status, code: error.response?.data?.code }),
      );
    const next = database();
    next.currentUserId = next.users[1].id;
    next.sessionGeneration = 3;
    save(next);
    sessionStorage.setItem('jungle:transport-generation', '3');
    queryClient.setQueryData(['session'], {
      id: 'user-2',
      name: 'Taylor Collector',
      email: 'second@example.test',
    });
    expect(await pending).toEqual({ status: 401, code: 'STALE_SESSION' });
    expect(database().users[1].name).toBe('Taylor Collector');
    expect(queryClient.getQueryData<{ id: string }>(['session'])?.id).toBe('user-2');
  });
  it('rejects a stale account mutation rather than applying it to a new user', async () => {
    const db = database();
    db.currentUserId = db.users[1].id;
    db.expiresAt = Date.now() + 60_000;
    db.sessionGeneration = 3;
    save(db);
    const response = await fetch(`${location.origin}/api/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-Demo-Session': '2' },
      body: JSON.stringify({ name: 'Old account pending update' }),
    });
    expect(response.status).toBe(401);
    expect((await response.json()).code).toBe('STALE_SESSION');
    expect(database().users[1].name).toBe('Taylor Collector');
  });
  it('accepts the active generation and exposes no password digest', async () => {
    const db = database();
    db.currentUserId = db.users[1].id;
    db.expiresAt = Date.now() + 60_000;
    db.sessionGeneration = 3;
    save(db);
    const response = await fetch(`${location.origin}/api/profile`, {
      headers: { 'X-Demo-Session': '3' },
    });
    expect(response.status).toBe(200);
    const profile = await response.json();
    expect(profile.id).toBe('user-2');
    expect(profile.passwordHash).toBeUndefined();
  });
  it('a stale response cannot clear a newer valid client account', async () => {
    const db = database();
    db.currentUserId = db.users[1].id;
    db.expiresAt = Date.now() + 60_000;
    db.sessionGeneration = 3;
    save(db);
    sessionStorage.setItem('jungle:transport-generation', '2');
    const request = axiosHttp.get(`${location.origin}/api/profile`).catch((error) => error);
    await new Promise((resolve) => setTimeout(resolve, 10));
    sessionStorage.setItem('jungle:transport-generation', '3');
    queryClient.setQueryData(['session'], {
      id: 'user-2',
      name: 'Taylor Collector',
      email: 'second@example.test',
    });
    const error = await request;
    expect(error.response.status).toBe(401);
    expect(queryClient.getQueryData<{ id: string }>(['session'])?.id).toBe('user-2');
  });
  it('an old successful null session cannot overwrite a newer login', async () => {
    server.use(
      mockHttp.get(`${location.origin}/api/session`, async () => {
        await delay(80);
        return HttpResponse.json(null, { headers: { 'X-Demo-Session': '1' } });
      }),
    );
    sessionStorage.setItem('jungle:transport-generation', '1');
    const request = axiosHttp
      .get('/session', { baseURL: `${location.origin}/api` })
      .catch((error) => error);
    await new Promise((resolve) => setTimeout(resolve, 10));
    sessionStorage.setItem('jungle:transport-generation', '2');
    queryClient.setQueryData(['session'], {
      id: 'user-2',
      name: 'Taylor Collector',
      email: 'second@example.test',
    });
    const error = await request;
    expect(error.code).toBe('ERR_CANCELED');
    expect(sessionStorage.getItem('jungle:transport-generation')).toBe('2');
    expect(queryClient.getQueryData<{ id: string }>(['session'])?.id).toBe('user-2');
  });
  it('a stale logout cannot terminate a newer account session', async () => {
    const db = database();
    db.currentUserId = db.users[1].id;
    db.expiresAt = Date.now() + 60_000;
    db.sessionGeneration = 3;
    save(db);
    const response = await fetch(`${location.origin}/api/session/logout`, {
      method: 'POST',
      headers: { 'X-Demo-Session': '2' },
    });
    expect(response.status).toBe(401);
    expect(database().currentUserId).toBe('user-2');
  });
});
