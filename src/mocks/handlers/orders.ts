import { delay, http } from 'msw';
import type { OrderInput } from '../../contracts';
import { ApiError, createOrder, database, session, settleOrder } from '../database';
import { route, body, json, idParam } from './network';

export const ordersHandlers = [
  http.post(
    '/api/orders',
    route(async ({ request }) => {
      const input = await body(request);
      const db = database();
      const result = await createOrder(db, input as unknown as OrderInput);
      if (db.scenario === 'order-timeout') {
        await delay(5_500);
      }
      return json(result);
    }),
  ),
  http.get(
    '/api/orders/attempt/:key',
    route(({ params }) => {
      const db = database();
      const user = session(db)!;
      const id = db.attempts[`${user.id}:${idParam(params, 'key')}`];
      if (!id) return json(null);
      settleOrder(id);
      return json(database().orders[id].order);
    }),
  ),
  http.get(
    '/api/orders/:id',
    route(({ params }) => {
      const db = database();
      const user = session(db)!;
      const id = idParam(params);
      const stored = db.orders[id];
      if (!stored || stored.userId !== user.id)
        throw new ApiError('This order could not be found.', 404, 'NOT_FOUND');
      settleOrder(id);
      return json(database().orders[id].order);
    }),
  ),
];
