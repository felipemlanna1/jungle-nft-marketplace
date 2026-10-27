import { delay, http, HttpResponse, ws } from 'msw';
import { toSocketIo } from '@mswjs/socket.io-binding';
import type { CatalogSearch, OrderInput, Scenario, Wallet } from '../contracts';
import { toWei, fromWei } from '../domain/money';
import {
  ApiError,
  buildQuote,
  cartResponse,
  createOrder,
  database,
  hash,
  initializeDatabase,
  nftById,
  ownerCart,
  publicUser,
  quantity,
  save,
  session,
  settleOrder,
  subscribeMockEvents,
  touchCart,
  walletValidation,
  emitMockEvent,
  transaction,
} from './database';

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
type HandlerArgs = {
  request: Request;
  params: Record<string, string | readonly string[] | undefined>;
};
let requestIndex = 0;
function route(handler: (args: HandlerArgs) => Promise<Response> | Response, control = false) {
  return async (args: HandlerArgs) => {
    try {
      if (!control) {
        const scenario = database().scenario;
        if (scenario === 'slow') await delay(1_200 + (requestIndex++ % 3) * 350);
        else await delay(80);
        if (scenario === 'offline') return HttpResponse.error();
        if (scenario === 'server-error')
          throw new ApiError(
            'The marketplace is temporarily unavailable. Please try again.',
            503,
            'TRANSIENT_ERROR',
          );
      }
      return await transaction(() => {
        const path = new URL(args.request.url).pathname;
        const sentGeneration = args.request.headers.get('X-Demo-Session');
        const publicRequest =
          path.startsWith('/api/nfts') ||
          path.startsWith('/api/demo/') ||
          path === '/api/session' ||
          path === '/api/session/login' ||
          path === '/api/session/register';
        if (
          !publicRequest &&
          sentGeneration !== null &&
          sentGeneration !== String(database().sessionGeneration ?? 1)
        ) {
          throw new ApiError(
            'Your account changed while this request was in flight. Please retry in the current session.',
            401,
            'STALE_SESSION',
          );
        }
        return handler(args);
      });
    } catch (error) {
      if (error instanceof ApiError)
        return HttpResponse.json(
          { message: error.message, code: error.code },
          { status: error.status },
        );
      return HttpResponse.json(
        { message: 'We could not process this request. Please try again.', code: 'INTERNAL_ERROR' },
        { status: 500 },
      );
    }
  };
}
async function body(request: Request): Promise<Record<string, unknown>> {
  try {
    const value = await request.json();
    if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  } catch {
    /* Reject malformed payloads below. */
  }
  throw new ApiError('A valid JSON object is required.');
}
function text(value: unknown, max = 200): string {
  if (typeof value !== 'string' || value.length > max)
    throw new ApiError('An input field is missing or too long.');
  return value.trim();
}
function password(value: unknown) {
  const str = typeof value === 'string' ? value : '';
  if (
    str.length < 8 ||
    str.length > 128 ||
    !/[a-z]/.test(str) ||
    !/[A-Z]/.test(str) ||
    !/\d/.test(str)
  )
    throw new ApiError('Use 8 a 128 characters with uppercase, lowercase and a number.');
  return str;
}
function email(value: unknown) {
  const str = text(value).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) throw new ApiError('Enter a valid email address.');
  return str;
}
type JsonValue = null | string | number | boolean | JsonValue[] | { [key: string]: JsonValue };
const json = (data: unknown) =>
  HttpResponse.json(data as JsonValue, {
    headers: { 'X-Demo-Session': String(database().sessionGeneration ?? 1) },
  });
const idParam = (params: HandlerArgs['params'], field = 'id') => String(params[field] ?? '');

const origin = typeof location !== 'undefined' ? location.origin : 'http://localhost:5173';
const socketUrl = origin.replace(/^http/, 'ws') + '/marketplace-events/';
const channel = ws.link(socketUrl);
const socketHandler = channel.addEventListener('connection', (connection) => {
  const io = toSocketIo(connection);
  const socketUser = new URL(connection.client.url).searchParams.get('userId');
  const remove = subscribeMockEvents((type, data, userId) => {
    const current = session(database(), false);
    if (socketUser && current?.id !== socketUser) return;
    if (userId && (!socketUser || socketUser !== userId)) return;
    io.client.emit(type, data);
  });
  connection.client.addEventListener('close', remove);
  connection.client.addEventListener('message', (event) => {
    // Engine.IO heartbeat is maintained in the network mock, not in application components.
    if (event.data === '2') connection.client.send('3');
  });
});

export const handlers = [
  socketHandler,
  http.get(
    '/api/nfts',
    route(({ request }) => {
      const db = database();
      const url = new URL(request.url);
      const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();
      const category = url.searchParams.get('category') ?? '';
      const sort = (url.searchParams.get('sort') ?? 'newest') as CatalogSearch['sort'];
      const page = Math.max(
        1,
        Math.min(100, Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1),
      );
      let items =
        db.scenario === 'empty'
          ? []
          : db.nfts.filter(
              (nft) =>
                (!q || `${nft.title} ${nft.creator}`.toLowerCase().includes(q)) &&
                (!category ||
                  category === 'all' ||
                  category === 'All' ||
                  nft.category.toLowerCase() === category.toLowerCase()),
            );
      if (sort === 'price-asc' || sort === 'price-desc')
        items = [...items].sort((a, b) => {
          const result =
            toWei(a.price) < toWei(b.price) ? -1 : toWei(a.price) > toWei(b.price) ? 1 : 0;
          return sort === 'price-asc' ? result : -result;
        });
      return json({
        items: items.slice((page - 1) * 9, page * 9),
        total: items.length,
        page,
        pageSize: 9,
      });
    }),
  ),
  http.get(
    '/api/nfts/:id',
    route(({ params }) => json(nftById(database(), idParam(params)))),
  ),
  http.get(
    '/api/session',
    route(() => {
      const user = session(database(), false);
      return json(user ? publicUser(user) : null);
    }),
  ),
  http.post(
    '/api/session/login',
    route(async ({ request }) => {
      const input = await body(request);
      const db = database();
      const inputEmail = email(input.email);
      const inputPassword = text(input.password, 128);
      const user = db.users.find((candidate) => candidate.email === inputEmail);
      if (!user || user.passwordHash !== (await hash(inputPassword)))
        throw new ApiError('Email or password is incorrect.', 401, 'INVALID_CREDENTIALS');
      db.currentUserId = user.id;
      db.expiresAt = Date.now() + 60 * 60_000;
      db.sessionGeneration = (db.sessionGeneration ?? 1) + 1;
      if (db.scenario === 'expired') db.scenario = 'default';
      for (const [nftId, amount] of Object.entries(db.guestCart)) {
        const merged = Math.min((user.cart[nftId] ?? 0) + amount, nftById(db, nftId).available);
        if (merged > 0) user.cart[nftId] = merged;
        else delete user.cart[nftId];
      }
      db.guestCart = {};
      user.cartVersion++;
      save(db);
      return json(publicUser(user));
    }),
  ),
  http.post(
    '/api/session/register',
    route(async ({ request }) => {
      const input = await body(request);
      const db = database();
      const name = text(input.name, 80);
      const inputEmail = email(input.email);
      const inputPassword = password(input.password);
      if (!name) throw new ApiError('Your name is required.');
      if (db.users.some((user) => user.email === inputEmail))
        throw new ApiError('An account already exists with this email.', 409, 'ACCOUNT_CONFLICT');
      const user = {
        id: `user-${++db.sequence}`,
        name,
        email: inputEmail,
        passwordHash: await hash(inputPassword),
        favorites: [],
        cart: { ...db.guestCart },
        cartVersion: 1,
        wallets: [],
      };
      db.users.push(user);
      db.currentUserId = user.id;
      db.expiresAt = Date.now() + 60 * 60_000;
      db.sessionGeneration = (db.sessionGeneration ?? 1) + 1;
      db.guestCart = {};
      save(db);
      return json(publicUser(user));
    }),
  ),
  http.post(
    '/api/session/logout',
    route(() => {
      const db = database();
      db.currentUserId = null;
      db.expiresAt = 0;
      db.sessionGeneration = (db.sessionGeneration ?? 1) + 1;
      save(db);
      return json({ ok: true });
    }),
  ),
  http.get(
    '/api/favorites',
    route(() => json(session(database())!.favorites)),
  ),
  http.post(
    '/api/favorites',
    route(async ({ request }) => {
      const input = await body(request);
      const db = database();
      const user = session(db)!;
      const id = text(input.id);
      nftById(db, id);
      if (typeof input.active !== 'boolean')
        throw new ApiError('A boolean favorite state is required.');
      user.favorites = input.active
        ? [...new Set([...user.favorites, id])]
        : user.favorites.filter((item) => item !== id);
      save(db);
      return json(user.favorites);
    }),
  ),
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
      const nft = nftById(db, text(input.nftId));
      const amount = quantity(input.quantity);
      const next = (cart.items[nft.id] ?? 0) + amount;
      if (next > nft.available)
        throw new ApiError('This quantity is no longer available.', 409, 'AVAILABILITY_CHANGED');
      cart.items[nft.id] = next;
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
      const nft = nftById(db, idParam(params));
      const amount = quantity(input.quantity);
      if (!cart.items[nft.id])
        throw new ApiError('This item is not in your cart.', 404, 'NOT_FOUND');
      if (amount > nft.available)
        throw new ApiError('This quantity is no longer available.', 409, 'AVAILABILITY_CHANGED');
      cart.items[nft.id] = amount;
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
  http.get(
    '/api/profile',
    route(() => json(publicUser(session(database())!))),
  ),
  http.patch(
    '/api/profile',
    route(async ({ request }) => {
      const input = await body(request);
      const db = database();
      const user = session(db)!;
      const name = text(input.name, 80);
      if (!name) throw new ApiError('Your name is required.');
      user.name = name;
      if (input.avatar !== undefined) {
        const avatar = text(input.avatar, 500_000);
        if (avatar && !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(avatar))
          throw new ApiError('Choose a PNG, JPEG or WebP image under 350 KB.');
        user.avatar = avatar;
      }
      save(db);
      return json(publicUser(user));
    }),
  ),
  http.post(
    '/api/profile/password',
    route(async ({ request }) => {
      const input = await body(request);
      const db = database();
      const user = session(db)!;
      if (user.passwordHash !== (await hash(text(input.currentPassword, 128))))
        throw new ApiError('Your current password is incorrect.', 422, 'INVALID_PASSWORD');
      user.passwordHash = await hash(password(input.password));
      save(db);
      return json({ ok: true });
    }),
  ),
  http.get(
    '/api/wallets',
    route(() => json(session(database())!.wallets)),
  ),
  http.post(
    '/api/wallets',
    route(async ({ request }) => {
      const input = await body(request);
      const db = database();
      const user = session(db)!;
      const wallet = input as Partial<Wallet>;
      walletValidation(wallet);
      if (wallet.id && !user.wallets.some((item) => item.id === wallet.id))
        throw new ApiError('This wallet could not be found.', 404, 'NOT_FOUND');
      const value: Wallet = {
        id: wallet.id ?? `wallet-${++db.sequence}`,
        label: wallet.label!.trim(),
        address: wallet.address!,
        network: wallet.network!,
        primary: wallet.primary ?? user.wallets.length === 0,
      };
      if (value.primary) user.wallets = user.wallets.map((item) => ({ ...item, primary: false }));
      user.wallets = [...user.wallets.filter((item) => item.id !== value.id), value];
      save(db);
      return json(user.wallets);
    }),
  ),
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
