// @vitest-environment jsdom
import { webcrypto } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers';
import { database, initializeDatabase, save } from '../mocks/database';
import { catalogSchema, recommendationsSchema } from './schemas';
import { recommendNfts } from './recommendations';

vi.stubGlobal('crypto', webcrypto);
const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
beforeEach(async () => {
  localStorage.clear();
  await initializeDatabase(true);
});
const request = (query = '') => fetch(`${location.origin}/api/recommendations${query}`);

describe('explicitly simulated recommendation API', () => {
  it('returns public recommendations with honest provenance and a stable fixture ranking', async () => {
    const response = await request();
    expect(response.status).toBe(200);
    const result = recommendationsSchema.parse(await response.json());
    expect(result).toMatchObject({
      simulated: true,
      criterion: 'simulated-popularity',
      label: 'Seleção demonstrativa por popularidade fictícia',
    });
    expect(result.items).toHaveLength(8);
    expect(result.items.map((item) => item.id)).toEqual([
      'nft-10',
      'nft-1',
      'nft-11',
      'nft-2',
      'nft-14',
      'nft-3',
      'nft-12',
      'nft-4',
    ]);
    expect(database().currentUserId).toBeNull();
  });
  it('combines exclusions and limit instead of returning hardcoded UI suggestions', async () => {
    const excluded = database()
      .nfts.slice(0, 9)
      .map((nft) => nft.id);
    const response = await request(`?exclude=${excluded.join(',')}&limit=4`);
    const result = recommendationsSchema.parse(await response.json());
    expect(result.items).toHaveLength(4);
    expect(result.items.every((nft) => !excluded.includes(nft.id))).toBe(true);
    expect(result.items.map((nft) => nft.id)).toEqual(['nft-10', 'nft-11', 'nft-14', 'nft-12']);
  });
  it('uses an explicit deterministic tie break without mutating the catalogue', () => {
    const first = { ...database().nfts[0], id: 'nft-b', popularity: 50 };
    const second = { ...first, id: 'nft-a' };
    const source = [first, second];
    expect(recommendNfts(source).items.map((nft) => nft.id)).toEqual(['nft-a', 'nft-b']);
    expect(source.map((nft) => nft.id)).toEqual(['nft-b', 'nft-a']);
  });
  it('returns an actual empty result when every item is excluded', async () => {
    const excluded = database().nfts.map((nft) => nft.id);
    const result = recommendationsSchema.parse(
      await (await request(`?exclude=${excluded.join(',')}`)).json(),
    );
    expect(result.items).toEqual([]);
  });
  it('respects the same empty scenario as the catalogue', async () => {
    const db = database();
    db.scenario = 'empty';
    save(db);
    const result = recommendationsSchema.parse(await (await request()).json());
    expect(result.items).toEqual([]);
    expect(result.simulated).toBe(true);
  });
  it.each([
    '?limit=0',
    '?limit=13',
    '?limit=1.5',
    '?limit=nope',
    '?limit=1&limit=2',
    '?exclude=',
    '?exclude=nft-1%20bad',
    '?exclude=nft-1&exclude=nft-2',
    '?exclude=' + Array.from({ length: 31 }, (_, index) => `nft-${index + 1}`).join(','),
    '?analytics=true',
  ])('rejects malformed or unsupported selection input %s', async (query) => {
    const response = await request(query);
    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe('VALIDATION_ERROR');
  });
  it('does not accept a payload claiming these selections are real analytics', () => {
    expect(
      recommendationsSchema.safeParse({
        ...recommendNfts(database().nfts),
        simulated: false,
      }).success,
    ).toBe(false);
  });
  it('serves six distinct new images on page two and the inexpensive rare item through real filters', async () => {
    const secondPage = catalogSchema.parse(
      await (await fetch(`${location.origin}/api/nfts?page=2`)).json(),
    );
    const additions = secondPage.items.slice(0, 6);
    expect(new Set(additions.map((item) => item.image)).size).toBe(6);
    expect(additions.every((item) => item.image.startsWith('/art/apes/'))).toBe(true);
    const affordable = catalogSchema.parse(
      await (await fetch(`${location.origin}/api/nfts?maxPrice=0.28`)).json(),
    );
    expect(affordable.items).toEqual([
      expect.objectContaining({
        id: 'nft-14',
        title: 'Ivory Listener #204',
        price: '0.28',
        rarity: 'Rare',
      }),
    ]);
  });
});
