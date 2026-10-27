// @vitest-environment jsdom
import { webcrypto } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
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
beforeEach(async () => {
  localStorage.clear();
  sessionStorage.clear();
  queryClient.clear();
  server.resetHandlers();
  await initializeDatabase(true);
});
describe('request-scoped account isolation', () => {
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
