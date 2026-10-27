import { http } from 'msw';
import {
  ApiError,
  buildQuote,
  cartResponse,
  database,
  ownerCart,
  resolveCartItem,
  selectedCartItem,
  quantity,
  touchCart,
} from '../database';
import { route, body, text, json, idParam } from './network';

export const cartHandlers = [
  http.get(
    '/api/cart',
    route(() => json(cartResponse(database()))),
  ),
  http.post(
    '/api/cart/items',
    route(async ({ request }) => {
      const input = await body(request);
      const db = database();
      const cart = ownerCart(db);
      const { edition, key } = selectedCartItem(
        db,
        text(input.nftId),
        input.editionId as string | undefined,
      );
      const amount = quantity(input.quantity);
      const next = (cart.items[key] ?? 0) + amount;
      if (next > edition.available)
        throw new ApiError('This quantity is no longer available.', 409, 'AVAILABILITY_CHANGED');
      cart.items[key] = next;
      touchCart(db);
      return json(cartResponse(db));
    }),
  ),
  http.patch(
    '/api/cart/items/:id',
    route(async ({ request, params }) => {
      const input = await body(request);
      const db = database();
      const cart = ownerCart(db);
      const { edition, key } = resolveCartItem(db, idParam(params));
      const amount = quantity(input.quantity);
      if (!cart.items[key]) throw new ApiError('This item is not in your cart.', 404, 'NOT_FOUND');
      if (amount > edition.available)
        throw new ApiError('This quantity is no longer available.', 409, 'AVAILABILITY_CHANGED');
      cart.items[key] = amount;
      touchCart(db);
      return json(cartResponse(db));
    }),
  ),
  http.delete(
    '/api/cart/items/:id',
    route(({ params }) => {
      const db = database();
      delete ownerCart(db).items[idParam(params)];
      touchCart(db);
      return json(cartResponse(db));
    }),
  ),
  http.post(
    '/api/quote',
    route(async ({ request }) => {
      const input = await body(request);
      return json(await buildQuote(database(), input.coupon ? text(input.coupon, 32) : ''));
    }),
  ),
];
