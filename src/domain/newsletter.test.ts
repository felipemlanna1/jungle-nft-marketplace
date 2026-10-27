// @vitest-environment jsdom
import { webcrypto } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers';
import { database, initializeDatabase, save } from '../mocks/database';
import { newsletterSubscriptionSchema } from './schemas';

vi.stubGlobal('crypto', webcrypto);
const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
beforeEach(async () => {
  localStorage.clear();
  await initializeDatabase(true);
});
const subscribe = (email: unknown) =>
  fetch(`${location.origin}/api/newsletter/subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

describe('local simulated newsletter subscription', () => {
  it('normalizes an anonymous subscription and returns explicit simulation metadata', async () => {
    const response = await subscribe('  Reader@Example.test  ');
    expect(response.status).toBe(200);
    const result = newsletterSubscriptionSchema.parse(await response.json());
    expect(result).toMatchObject({
      email: 'reader@example.test',
      simulated: true,
      alreadySubscribed: false,
    });
    expect(result.id).toMatch(/^newsletter-/);
    expect(result.createdAt).toBeGreaterThan(0);
    expect(database().currentUserId).toBeNull();
    expect(Object.keys(database().newsletterSubscriptions ?? {})).toEqual(['reader@example.test']);
  });
  it('deduplicates case and surrounding whitespace with the same identifier and creation time', async () => {
    const first = newsletterSubscriptionSchema.parse(
      await (await subscribe('reader@example.test')).json(),
    );
    const duplicate = newsletterSubscriptionSchema.parse(
      await (await subscribe(' READER@example.test ')).json(),
    );
    expect(duplicate).toEqual({ ...first, alreadySubscribed: true });
    expect(Object.keys(database().newsletterSubscriptions ?? {})).toHaveLength(1);
  });
  it('retains the subscription across initialization and removes it on explicit demo reset', async () => {
    const first = newsletterSubscriptionSchema.parse(
      await (await subscribe('reader@example.test')).json(),
    );
    await initializeDatabase();
    const repeat = newsletterSubscriptionSchema.parse(
      await (await subscribe('reader@example.test')).json(),
    );
    expect(repeat.id).toBe(first.id);
    expect(repeat.alreadySubscribed).toBe(true);
    const reset = await fetch(`${location.origin}/api/demo/reset`, { method: 'POST' });
    expect(reset.status).toBe(200);
    expect(database().newsletterSubscriptions).toEqual({});
    const fresh = newsletterSubscriptionSchema.parse(
      await (await subscribe('reader@example.test')).json(),
    );
    expect(fresh.alreadySubscribed).toBe(false);
  });
  it.each([
    undefined,
    null,
    [],
    42,
    '',
    'not-an-email',
    'a..b@example.test',
    'a@b',
    'a'.repeat(150) + '@example.test',
  ])('rejects an invalid or overlong email %j before storing it', async (email) => {
    const response = await subscribe(email);
    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe('VALIDATION_ERROR');
    expect(database().newsletterSubscriptions).toEqual({});
  });
  it('uses the scenario wrapper and does not store a subscription on server failure', async () => {
    const db = database();
    db.scenario = 'server-error';
    save(db);
    const response = await subscribe('reader@example.test');
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe('TRANSIENT_ERROR');
    expect(database().newsletterSubscriptions).toEqual({});
  });
  it('rejects a simulated offline request without storing a subscription', async () => {
    const db = database();
    db.scenario = 'offline';
    save(db);
    await expect(subscribe('reader@example.test')).rejects.toThrow();
    expect(database().newsletterSubscriptions).toEqual({});
  });
});
