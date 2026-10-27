import { http } from '../http';
import type { CatalogSearch, OrderInput, Scenario, Wallet } from '../../contracts';
import { z } from 'zod';
import {
  cartSchema,
  catalogSchema,
  favoritesSchema,
  nftSchema,
  orderSchema,
  quoteSchema,
  recoverOrderSchema,
  sessionSchema,
  userSchema,
  walletsSchema,
  parseResponse,
} from '../../domain/schemas';
const get = async <T>(
  schema: z.ZodType<T>,
  url: string,
  params?: unknown,
  signal?: AbortSignal,
): Promise<T> => parseResponse(schema, (await http.get<unknown>(url, { params, signal })).data);
const post = async <T>(schema: z.ZodType<T>, url: string, data?: unknown): Promise<T> =>
  parseResponse(schema, (await http.post<unknown>(url, data)).data);
const okSchema = z.object({ ok: z.boolean() });
export const market = {
  catalog: (search: CatalogSearch = {}, signal?: AbortSignal) =>
    get(catalogSchema, '/nfts', search, signal),
  nft: (id: string, signal?: AbortSignal) =>
    get(nftSchema, `/nfts/${encodeURIComponent(id)}`, undefined, signal),
  session: (signal?: AbortSignal) => get(sessionSchema, '/session', undefined, signal),
  login: (email: string, password: string) =>
    post(userSchema, '/session/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    post(userSchema, '/session/register', { name, email, password }),
  logout: () => post(okSchema, '/session/logout'),
  favorites: () => get(favoritesSchema, '/favorites'),
  toggleFavorite: (id: string, active: boolean) =>
    post(favoritesSchema, '/favorites', { id, active }),
  cart: () => get(cartSchema, '/cart'),
  addItem: (nftId: string, quantity: number) =>
    post(cartSchema, '/cart/items', { nftId, quantity }),
  updateItem: async (nftId: string, quantity: number) =>
    parseResponse(
      cartSchema,
      (await http.patch<unknown>(`/cart/items/${encodeURIComponent(nftId)}`, { quantity })).data,
    ),
  removeItem: async (nftId: string) =>
    parseResponse(
      cartSchema,
      (await http.delete<unknown>(`/cart/items/${encodeURIComponent(nftId)}`)).data,
    ),
  quote: (coupon?: string) => post(quoteSchema, '/quote', { coupon }),
  order: (input: OrderInput) => post(orderSchema, '/orders', input),
  getOrder: (id: string) => get(orderSchema, `/orders/${encodeURIComponent(id)}`),
  findOrderByAttempt: (key: string) =>
    get(recoverOrderSchema, `/orders/attempt/${encodeURIComponent(key)}`),
  profile: () => get(userSchema, '/profile'),
  updateProfile: async (profile: { name: string; avatar?: string }) =>
    parseResponse(userSchema, (await http.patch<unknown>('/profile', profile)).data),
  changePassword: (currentPassword: string, password: string) =>
    post(okSchema, '/profile/password', { currentPassword, password }),
  wallets: () => get(walletsSchema, '/wallets'),
  saveWallet: (wallet: Partial<Wallet>) => post(walletsSchema, '/wallets', wallet),
  setScenario: (scenario: Scenario) =>
    post(
      z.object({
        scenario: z.enum([
          'default',
          'slow',
          'empty',
          'offline',
          'server-error',
          'expired',
          'payment-refused',
          'order-timeout',
        ]),
      }),
      '/demo/scenario',
      { scenario },
    ),
  reset: () => post(okSchema, '/demo/reset'),
  simulateNftUpdate: (id: string, soldOut = false) =>
    post(nftSchema, '/demo/nft-update', { id, soldOut }),
  replayNftEvents: (id: string) =>
    post(
      z.object({
        sent: z.number().int().nonnegative(),
        currentVersion: z.number().int().positive(),
      }),
      '/demo/nft-replay',
      { id },
    ),
};

export { http, errorMessage } from '../http';
