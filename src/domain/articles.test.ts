// @vitest-environment jsdom
import { webcrypto } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers';
import { database, initializeDatabase, save } from '../mocks/database';
import { articleSchema, articlesSchema } from './schemas';

vi.stubGlobal('crypto', webcrypto);
const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
beforeEach(async () => {
  localStorage.clear();
  await initializeDatabase(true);
});

describe('read-only illustrative journal API', () => {
  it('returns the four template previews and catalogue artwork without article bodies', async () => {
    const response = await fetch(`${location.origin}/api/articles`);
    expect(response.status).toBe(200);
    const raw = await response.json();
    const previews = articlesSchema.parse(raw);
    expect(previews.map((article) => article.title)).toEqual([
      'Como funciona a propriedade de NFTs',
      '10 artistas digitais para acompanhar',
      'Raridade, atributos e procedência',
      'Como proteger sua carteira',
    ]);
    expect(previews.map((article) => article.image)).toEqual(
      [2, 0, 1, 6].map((index) => database().nfts[index].image),
    );
    expect(previews.map((article) => article.readMinutes)).toEqual([6, 2, 3, 2]);
    expect(previews.every((article) => article.simulated)).toBe(true);
    expect(raw.every((article: Record<string, unknown>) => !('paragraphs' in article))).toBe(true);
    expect(database().currentUserId).toBeNull();
  });
  it('loads an explicitly illustrative article without inventing ten real artists', async () => {
    const response = await fetch(`${location.origin}/api/articles/digital-artists`);
    expect(response.status).toBe(200);
    const article = articleSchema.parse(await response.json());
    expect(article.id).toBe('digital-artists');
    expect(article.paragraphs.join(' ')).toContain('exemplo de conteúdo editorial');
    expect(article.paragraphs.join(' ')).toContain('Não se trata de uma lista publicada');
    expect(article.simulated).toBe(true);
  });
  it('returns a structured404 for an unknown article', async () => {
    const response = await fetch(`${location.origin}/api/articles/not-a-real-article`);
    expect(response.status).toBe(404);
    expect((await response.json()).code).toBe('NOT_FOUND');
  });
  it('uses the catalogue empty scenario rather than fabricating preview cards', async () => {
    const db = database();
    db.scenario = 'empty';
    save(db);
    expect(
      articlesSchema.parse(await (await fetch(`${location.origin}/api/articles`)).json()),
    ).toEqual([]);
  });
  it('rejects malformed dates or content claiming to be an actual publication', () => {
    const preview = {
      id: 'sample',
      title: 'Exemplo',
      excerpt: 'Exemplo do template',
      image: '/art/example.webp',
      publishedAt: '2026-09-12T00:00:00.000Z',
      readMinutes: 2,
      simulated: true,
      paragraphs: ['Conteúdo ilustrativo.'],
    };
    expect(articleSchema.safeParse(preview).success).toBe(true);
    expect(articleSchema.safeParse({ ...preview, publishedAt: 'not-a-date' }).success).toBe(false);
    expect(articleSchema.safeParse({ ...preview, simulated: false }).success).toBe(false);
  });
});
