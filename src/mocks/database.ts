import type {
  CollectorDetails,
  NFT,
  NewsletterSubscription,
  Order,
  OrderInput,
  Quote,
  Scenario,
  User,
  Wallet,
} from '../contracts';
import { fromWei, toWei } from '../domain/money';
import {
  editionCartKey,
  ensureEditions,
  selectEdition,
  setEditionAvailability,
} from '../domain/editions';
import { createNfts, DEMO_LOGIN } from './fixtures';
import { CATALOG_REVISION, migrateCatalog } from './migrations/catalog';

interface StoredUser extends User {
  passwordHash: string;
  favorites: string[];
  cart: Record<string, number>;
  cartVersion: number;
  wallets: Wallet[];
}
interface StoredOrder {
  userId: string;
  order: Order;
  signature: string;
  dueAt: number;
  refusal: boolean;
}
interface Database {
  schema: 1;
  catalogRevision?: number;
  nfts: NFT[];
  users: StoredUser[];
  currentUserId: string | null;
  expiresAt: number;
  guestCart: Record<string, number>;
  guestVersion: number;
  orders: Record<string, StoredOrder>;
  attempts: Record<string, string>;
  quotes: Record<string, Quote>;
  scenario: Scenario;
  sequence: number;
  sessionGeneration: number;
  newsletterSubscriptions?: Record<
    string,
    Omit<NewsletterSubscription, 'simulated' | 'alreadySubscribed'>
  >;
}
const STORAGE_KEY = 'jungle.demo.database.v1';
let memory: Database | undefined;
let transactionQueue: Promise<unknown> = Promise.resolve();
export function transaction<T>(operation: () => T | Promise<T>): Promise<T> {
  const result = transactionQueue.then(operation, operation);
  transactionQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}
const listeners = new Set<(type: string, data: unknown, userId?: string) => void>();
export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
    public code = 'VALIDATION_ERROR',
  ) {
    super(message);
  }
}
export async function hash(value: string) {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
function persist(db: Database) {
  memory = db;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* Browsers blocking storage retain the current tab's in-memory scenario. */
  }
}
function read(): Database | undefined {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value) {
      const parsed = JSON.parse(value);
      if (parsed.schema === 1 && Array.isArray(parsed.users) && Array.isArray(parsed.nfts))
        return parsed as Database;
    }
  } catch {
    /* Corrupt demo storage resets to deterministic fixtures instead of crashing. */
  }
  return memory;
}
export async function initializeDatabase(force = false) {
  if (force) {
    for (const timer of scheduled.values()) clearTimeout(timer);
    scheduled.clear();
  }
  const existing = !force && read();
  if (existing) {
    let migrated = false;
    if (existing.newsletterSubscriptions === undefined) {
      existing.newsletterSubscriptions = {};
      migrated = true;
    }
    if ((existing.catalogRevision ?? 0) < CATALOG_REVISION) {
      existing.nfts = migrateCatalog(existing.nfts, createNfts());
      existing.catalogRevision = CATALOG_REVISION;
      existing.quotes = {};
      existing.guestVersion++;
      for (const user of existing.users) user.cartVersion++;
      migrated = true;
    }
    const fixtures = new Map(createNfts().map((nft) => [nft.id, nft]));
    existing.nfts = existing.nfts.map((nft) => {
      if (!nft.editions?.length) migrated = true;
      ensureEditions(nft);
      const fixture = fixtures.get(nft.id);
      if (!fixture) return nft;
      if (nft.network !== undefined && nft.releasedAt !== undefined && nft.popularity !== undefined)
        return nft;
      migrated = true;
      return {
        ...nft,
        network: nft.network ?? fixture.network,
        releasedAt: nft.releasedAt ?? fixture.releasedAt,
        popularity: nft.popularity ?? fixture.popularity,
      };
    });
    for (const user of existing.users) {
      if (user.username === undefined) {
        user.username =
          user.id === 'user-1'
            ? 'alex.collector'
            : user.id === 'user-2'
              ? 'taylor.collector'
              : `collector.${user.id.replace(/[^a-z0-9]/gi, '')}`;
        migrated = true;
      }
      for (const wallet of user.wallets)
        if (wallet.walletType === undefined) {
          wallet.walletType = 'MetaMask';
          migrated = true;
        }
    }
    memory = existing;
    if (migrated) persist(existing);
    scheduleOrders(existing);
    return existing;
  }
  const passwordHash = await hash(DEMO_LOGIN.password);
  const users: StoredUser[] = ['collector', 'second'].map((name, index) => ({
    id: `user-${index + 1}`,
    email: index ? `${name}@example.test` : DEMO_LOGIN.email,
    name: index ? 'Taylor Collector' : 'Alex Collector',
    username: index ? 'taylor.collector' : 'alex.collector',
    passwordHash,
    favorites: [],
    cart: {},
    cartVersion: 1,
    wallets: [
      {
        id: `wallet-${index + 1}`,
        label: 'My collection wallet',
        address: `0x${String(index + 1).repeat(40)}`,
        network: 'Ethereum',
        primary: true,
        walletType: 'MetaMask',
      },
    ],
  }));
  const db: Database = {
    schema: 1,
    catalogRevision: CATALOG_REVISION,
    nfts: createNfts().map((nft) => {
      ensureEditions(nft);
      return nft;
    }),
    users,
    currentUserId: null,
    expiresAt: 0,
    guestCart: {},
    guestVersion: 1,
    orders: {},
    attempts: {},
    quotes: {},
    scenario: 'default',
    sequence: 1000,
    sessionGeneration: 1,
    newsletterSubscriptions: {},
  };
  persist(db);
  return db;
}
export function database() {
  const db = read();
  if (!db) throw new ApiError('The demo is initializing. Please try again.', 503, 'INITIALIZING');
  memory = db;
  return db;
}
export function save(db: Database) {
  persist(db);
}
export function publicUser(user: StoredUser): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    ens: user.ens,
    walletNickname: user.walletNickname,
    ...(user.avatar ? { avatar: user.avatar } : {}),
  };
}
export function session(db: Database, required = true): StoredUser | null {
  const user = db.users.find((candidate) => candidate.id === db.currentUserId);
  if (!user || db.expiresAt <= Date.now() || db.scenario === 'expired') {
    if (db.currentUserId) {
      db.currentUserId = null;
      db.expiresAt = 0;
      db.sessionGeneration = (db.sessionGeneration ?? 1) + 1;
      persist(db);
    }
    if (required)
      throw new ApiError(
        'Your session expired. Sign in to continue where you left off.',
        401,
        'SESSION_EXPIRED',
      );
    return null;
  }
  return user;
}
export function ownerCart(db: Database) {
  const user = session(db, false);
  return {
    user,
    items: user ? user.cart : db.guestCart,
    version: user ? user.cartVersion : db.guestVersion,
  };
}
export function cartResponse(db: Database) {
  const cart = ownerCart(db);
  return {
    items: Object.entries(cart.items).map(([id, quantity]) => {
      const { nft, edition } = resolveCartItem(db, id);
      return {
        id,
        nftId: nft.id,
        editionId: edition.id,
        editionLabel: edition.label,
        quantity,
        nft: { ...nft, price: edition.price, available: edition.available },
      };
    }),
    version: cart.version,
  };
}
export function touchCart(db: Database) {
  const user = session(db, false);
  if (user) user.cartVersion++;
  else db.guestVersion++;
  persist(db);
}
export function nftById(db: Database, id: string) {
  const nft = db.nfts.find((item) => item.id === id);
  if (!nft) throw new ApiError('This collectible could not be found.', 404, 'NOT_FOUND');
  ensureEditions(nft);
  return nft;
}
export function resolveCartItem(db: Database, key: string) {
  const [nftId, editionId, ...extra] = key.split('::');
  if (!nftId || extra.length) throw new ApiError('The cart item is invalid.');
  const nft = nftById(db, nftId);
  try {
    const edition = selectEdition(nft, editionId);
    return { nft, edition, key: editionCartKey(nft, edition.id) };
  } catch {
    throw new ApiError('This edition could not be found.', 404, 'EDITION_NOT_FOUND');
  }
}
export function selectedCartItem(db: Database, nftId: string, editionId?: string) {
  if (
    editionId !== undefined &&
    (typeof editionId !== 'string' || !editionId || editionId.includes('::'))
  )
    throw new ApiError('Choose a valid edition.');
  return resolveCartItem(db, editionId ? `${nftId}::${editionId}` : nftId);
}
export function quantity(value: unknown) {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1 || value > 99)
    throw new ApiError('Choose a whole quantity between 1 and 99.');
  return value;
}
export function walletValidation(input: Partial<Wallet>) {
  if (typeof input.label !== 'string' || !input.label.trim() || input.label.length > 60)
    throw new ApiError('A wallet label of 1 a 60 characters is required.');
  if (!/^0x[a-fA-F0-9]{40}$/.test(input.address ?? ''))
    throw new ApiError('Enter a valid 0x wallet address (40 hexadecimal characters).');
  if (!['Ethereum', 'Polygon'].includes(input.network ?? ''))
    throw new ApiError('Select Ethereum or Polygon.');
  if (input.primary !== undefined && typeof input.primary !== 'boolean')
    throw new ApiError('The primary wallet flag must be a boolean.');
  if (
    input.walletType !== undefined &&
    !['MetaMask', 'Coinbase', 'WalletConnect'].includes(input.walletType)
  )
    throw new ApiError('Choose a supported wallet type.');
  for (const [field, maximum] of [
    ['displayName', 120],
    ['profileName', 120],
    ['secondaryAddress', 100],
    ['referralCode', 80],
    ['email', 200],
    ['ens', 100],
  ] as const) {
    const value = input[field];
    if (value !== undefined && (typeof value !== 'string' || value.length > maximum))
      throw new ApiError(`The wallet ${field} is too long or invalid.`);
  }
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email))
    throw new ApiError('Enter a valid wallet email address.');
  if (input.ens && !isEnsName(input.ens)) throw new ApiError('Enter a valid .eth name.');
  if (
    input.secondaryAddress &&
    !/^0x[a-fA-F0-9]{40}$/.test(input.secondaryAddress) &&
    !isEnsName(input.secondaryAddress)
  )
    throw new ApiError('Use a 0x wallet address or a .eth name as the secondary address.');
}
export function isEnsName(value: string) {
  return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+eth$/i.test(value);
}
export async function buildQuote(db: Database, coupon = '', persistQuote = true): Promise<Quote> {
  const user = session(db, false);
  const cart = ownerCart(db);
  const items = Object.entries(cart.items).map(([id, amount]) => {
    const { nft, edition } = resolveCartItem(db, id);
    quantity(amount);
    if (edition.available < amount)
      throw new ApiError(
        `${nft.title} availability changed. Update the quantity in your cart.`,
        409,
        'AVAILABILITY_CHANGED',
      );
    return {
      nftId: nft.id,
      cartItemId: id,
      editionId: edition.id,
      editionLabel: edition.label,
      ...(nft.tokenId ? { tokenId: nft.tokenId } : {}),
      title: nft.title,
      image: nft.image,
      unitPrice: edition.price,
      quantity: amount,
    };
  });
  if (!items.length)
    throw new ApiError('Your cart is empty. Discover a collectible first.', 400, 'EMPTY_CART');
  const code = coupon.trim().toUpperCase();
  if (code && code !== 'JUNGLE10')
    throw new ApiError(
      code === 'EXPIRED' ? 'This coupon has expired.' : 'This coupon is not valid. Try JUNGLE10.',
      422,
      'INVALID_COUPON',
    );
  const subtotal = items.reduce(
    (sum, item) => sum + toWei(item.unitPrice) * BigInt(item.quantity),
    0n,
  );
  const discount = code ? subtotal / 10n : 0n;
  const networkFee = toWei('0.016');
  const fingerprint = await hash(
    JSON.stringify({
      user: user?.id ?? 'guest',
      version: cart.version,
      items: items.map((item) => ({
        ...item,
        version: nftById(db, item.nftId).version,
        network: nftById(db, item.nftId).network,
      })),
      code,
      pricing: {
        subtotal: fromWei(subtotal),
        discount: fromWei(discount),
        networkFee: fromWei(networkFee),
        total: fromWei(subtotal - discount + networkFee),
      },
    }),
  );
  const quote: Quote = {
    fingerprint,
    items,
    subtotal: fromWei(subtotal),
    discount: fromWei(discount),
    networkFee: fromWei(networkFee),
    total: fromWei(subtotal - discount + networkFee),
    expiresAt: Date.now() + 5 * 60_000,
  };
  if (persistQuote) {
    db.quotes[`${user?.id ?? 'guest'}:${fingerprint}`] = quote;
    persist(db);
  }
  return quote;
}
export function subscribeMockEvents(
  listener: (type: string, data: unknown, userId?: string) => void,
) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function emitMockEvent(type: string, data: unknown, userId?: string) {
  for (const listener of listeners) listener(type, data, userId);
}
function emitNft(nft: NFT) {
  emitMockEvent('nft.updated', { eventId: `${nft.id}:${nft.version}`, nft, version: nft.version });
}
const scheduled = new Map<string, ReturnType<typeof setTimeout>>();
function scheduleOrders(db: Database) {
  for (const [id, stored] of Object.entries(db.orders)) {
    if (stored.order.status !== 'pending' || scheduled.has(id)) continue;
    const timer = setTimeout(
      () => {
        scheduled.delete(id);
        void transaction(() => settleOrder(id));
      },
      Math.max(1, stored.dueAt - Date.now()),
    );
    scheduled.set(id, timer);
  }
}
export function settleOrder(id: string) {
  const db = database();
  const stored = db.orders[id];
  if (!stored || stored.order.status !== 'pending' || stored.dueAt > Date.now()) return;
  stored.order.status = stored.refusal ? 'refused' : 'confirmed';
  stored.order.version++;
  const user = db.users.find((item) => item.id === stored.userId)!;
  if (stored.refusal) {
    for (const item of stored.order.items) {
      const nft = nftById(db, item.nftId);
      const edition = selectEdition(nft, item.editionId);
      setEditionAvailability(nft, item.editionId, edition.available + item.quantity);
      nft.version++;
      emitNft(nft);
    }
  } else {
    for (const item of stored.order.items) {
      const key = item.cartItemId ?? editionCartKey(nftById(db, item.nftId), item.editionId);
      const remaining = (user.cart[key] ?? 0) - item.quantity;
      if (remaining > 0) user.cart[key] = remaining;
      else delete user.cart[key];
    }
    user.cartVersion++;
  }
  persist(db);
  emitMockEvent(
    'order.updated',
    {
      eventId: `${id}:${stored.order.version}`,
      order: stored.order,
      version: stored.order.version,
      userId: stored.userId,
    },
    stored.userId,
  );
}
function normalizeOrderInput(input: OrderInput): OrderInput {
  if (!input || typeof input !== 'object') throw new ApiError('A valid order is required.');
  for (const field of [
    'quoteFingerprint',
    'idempotencyKey',
    'walletId',
    'collectorName',
    'collectorEmail',
  ] as const) {
    if (typeof input[field] !== 'string' || input[field].length > 200)
      throw new ApiError('An order field is missing or invalid.');
  }
  if (
    !/^[a-f0-9]{64}$/.test(input.quoteFingerprint) ||
    !/^[A-Za-z0-9_-]{8,128}$/.test(input.idempotencyKey)
  )
    throw new ApiError('A valid quote and attempt key are required.');
  if (!['Ethereum', 'Polygon'].includes(input.network))
    throw new ApiError('Select a supported network.');
  if (input.coupon !== undefined && (typeof input.coupon !== 'string' || input.coupon.length > 32))
    throw new ApiError('Invalid coupon.');
  if (
    input.provider !== undefined &&
    !['MetaMask', 'Coinbase', 'WalletConnect'].includes(input.provider)
  )
    throw new ApiError('Choose a supported wallet provider.');
  let collectorDetails: CollectorDetails | undefined;
  if (input.collectorDetails !== undefined) {
    if (
      !input.collectorDetails ||
      typeof input.collectorDetails !== 'object' ||
      Array.isArray(input.collectorDetails)
    )
      throw new ApiError('Collector details must be an object.');
    collectorDetails = {};
    for (const [field, maximum] of [
      ['username', 40],
      ['profileName', 120],
      ['ens', 100],
      ['referralCode', 80],
      ['notes', 1000],
    ] as const) {
      const value = input.collectorDetails[field];
      if (value === undefined) continue;
      if (typeof value !== 'string' || value.length > maximum)
        throw new ApiError(`The collector ${field} is too long or invalid.`);
      const normalized = value.trim();
      if (!normalized) continue;
      if (field === 'username' && !/^[a-zA-Z0-9._-]{3,40}$/.test(normalized))
        throw new ApiError('Use a valid collector username.');
      if (field === 'ens' && !isEnsName(normalized)) throw new ApiError('Enter a valid .eth name.');
      collectorDetails[field] = field === 'ens' ? normalized.toLowerCase() : normalized;
    }
  }
  return {
    quoteFingerprint: input.quoteFingerprint,
    idempotencyKey: input.idempotencyKey,
    walletId: input.walletId,
    network: input.network,
    collectorName: input.collectorName.trim(),
    collectorEmail: input.collectorEmail.trim().toLowerCase(),
    ...(input.coupon ? { coupon: input.coupon.trim().toUpperCase() } : {}),
    ...(collectorDetails && Object.keys(collectorDetails).length ? { collectorDetails } : {}),
    ...(input.provider ? { provider: input.provider } : {}),
  };
}
export async function createOrder(db: Database, input: OrderInput) {
  const user = session(db)!;
  input = normalizeOrderInput(input);
  if (!input.idempotencyKey || input.idempotencyKey.length < 8 || input.idempotencyKey.length > 128)
    throw new ApiError('A valid attempt key is required.');
  const signature = await hash(JSON.stringify(input));
  const attempt = `${user.id}:${input.idempotencyKey}`;
  const previous = db.attempts[attempt];
  if (previous) {
    if (db.orders[previous].signature !== signature)
      throw new ApiError(
        'This attempt key was already used for a different order.',
        409,
        'IDEMPOTENCY_CONFLICT',
      );
    return db.orders[previous].order;
  }
  if (
    !input.collectorName?.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.collectorEmail ?? '')
  )
    throw new ApiError('Enter a collector name and valid email address.');
  const wallet = user.wallets.find((item) => item.id === input.walletId);
  if (!wallet || wallet.network !== input.network)
    throw new ApiError('Select a registered wallet and its matching network.');
  const savedQuote = db.quotes[`${user.id}:${input.quoteFingerprint}`];
  if (!savedQuote || savedQuote.expiresAt <= Date.now())
    throw new ApiError(
      'Your quote expired. Review the updated total before confirming.',
      409,
      'QUOTE_CHANGED',
    );
  const current = await buildQuote(db, input.coupon, false);
  if (
    current.fingerprint !== input.quoteFingerprint ||
    current.subtotal !== savedQuote.subtotal ||
    current.discount !== savedQuote.discount ||
    current.networkFee !== savedQuote.networkFee ||
    current.total !== savedQuote.total
  )
    throw new ApiError(
      'Prices or availability changed. Review the updated quote and confirm again.',
      409,
      'QUOTE_CHANGED',
    );
  const networks = new Set(current.items.map((item) => nftById(db, item.nftId).network));
  if (networks.size !== 1)
    throw new ApiError(
      'Purchase collectibles from one network at a time. Remove items from other networks.',
      409,
      'MIXED_NETWORKS',
    );
  if (!networks.has(input.network))
    throw new ApiError(
      'Select a saved wallet on the same network as the collectibles in your cart.',
      409,
      'NETWORK_MISMATCH',
    );
  const id = `order-${++db.sequence}`;
  const order: Order = {
    ...structuredClone(savedQuote),
    id,
    status: 'pending',
    version: 1,
    createdAt: Date.now(),
    transactionId: `0x${id.replace('order-', '').padStart(64, '0')}`,
    walletId: wallet.id,
    network: wallet.network,
    collector: {
      name: input.collectorName,
      email: input.collectorEmail,
      ...input.collectorDetails,
    },
    wallet: {
      label: wallet.label,
      address: wallet.address,
      network: wallet.network,
      ...((input.provider ?? wallet.walletType)
        ? { provider: input.provider ?? wallet.walletType }
        : {}),
    },
  };
  db.orders[id] = {
    userId: user.id,
    order,
    signature,
    dueAt: Date.now() + 2_000,
    refusal: db.scenario === 'payment-refused',
  };
  db.attempts[attempt] = id;
  for (const item of order.items) {
    const nft = nftById(db, item.nftId);
    const edition = selectEdition(nft, item.editionId);
    setEditionAvailability(nft, item.editionId, edition.available - item.quantity);
    nft.version++;
    emitNft(nft);
  }
  persist(db);
  scheduleOrders(db);
  return order;
}
