import { http } from 'msw';
import { ApiError, database, hash, publicUser, resolveCartItem, save, session } from '../database';
import { route, body, text, password, email, json } from './network';

export const sessionHandlers = [
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
      for (const [cartKey, amount] of Object.entries(db.guestCart)) {
        const { edition, key } = resolveCartItem(db, cartKey);
        const merged = Math.min((user.cart[key] ?? 0) + amount, edition.available);
        if (merged > 0) user.cart[key] = merged;
        else delete user.cart[key];
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
        username: `collector.${db.sequence}`,
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
];
