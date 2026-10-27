import { http } from 'msw';
import type { Scenario } from '../../contracts';
import { toWei, fromWei } from '../../domain/money';
import { ensureEditions } from '../../domain/editions';
import { ApiError, database, initializeDatabase, nftById, save, emitMockEvent } from '../database';
import { route, body, text, json } from './network';

const scenarios = new Set<Scenario>([
  'default',
  'slow',
  'empty',
  'offline',
  'server-error',
  'expired',
  'payment-refused',
  'order-timeout',
]);

export const demoHandlers = [
  http.post(
    '/api/demo/scenario',
    route(async ({ request }) => {
      const input = await body(request);
      const scenario = input.scenario as Scenario;
      if (!scenarios.has(scenario)) throw new ApiError('Unknown demo scenario.');
      const db = database();
      db.scenario = scenario;
      save(db);
      return json({ scenario });
    }, true),
  ),
  http.post(
    '/api/demo/reset',
    route(async () => {
      await initializeDatabase(true);
      return json({ ok: true });
    }, true),
  ),
  http.post(
    '/api/demo/nft-update',
    route(async ({ request }) => {
      const input = await body(request);
      const db = database();
      const nft = nftById(db, text(input.id));
      if (input.soldOut === true) nft.available = 0;
      else nft.price = fromWei(toWei(nft.price) + toWei('0.01'));
      ensureEditions(nft);
      nft.version++;
      save(db);
      emitMockEvent('nft.updated', {
        eventId: `${nft.id}:${nft.version}`,
        nft,
        version: nft.version,
      });
      return json(nft);
    }, true),
  ),
  http.post(
    '/api/demo/nft-replay',
    route(async ({ request }) => {
      const input = await body(request);
      const nft = nftById(database(), text(input.id));
      const current = {
        eventId: `${nft.id}:${nft.version}`,
        nft: structuredClone(nft),
        version: nft.version,
      };
      emitMockEvent('nft.updated', current);
      emitMockEvent('nft.updated', current);
      const previous = {
        ...nft,
        version: Math.max(1, nft.version - 1),
        price: fromWei(toWei(nft.price) >= toWei('0.01') ? toWei(nft.price) - toWei('0.01') : 0n),
      };
      emitMockEvent('nft.updated', {
        eventId: `${nft.id}:${previous.version}:replayed`,
        nft: previous,
        version: previous.version,
      });
      return json({ sent: 3, currentVersion: nft.version });
    }, true),
  ),
];
