import { http } from 'msw';
import type { Wallet } from '../../contracts';
import {
  ApiError,
  database,
  hash,
  isEnsName,
  nftById,
  publicUser,
  save,
  session,
  walletValidation,
} from '../database';
import { route, body, text, password, email, json } from './network';

export const accountHandlers = [
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
      const changes: Partial<typeof user> = { name };
      if (input.email !== undefined) {
        const nextEmail = email(input.email);
        if (db.users.some((candidate) => candidate.id !== user.id && candidate.email === nextEmail))
          throw new ApiError(
            'This email already belongs to another account.',
            409,
            'ACCOUNT_CONFLICT',
          );
        changes.email = nextEmail;
      }
      if (input.username !== undefined) {
        const username = text(input.username, 40);
        if (!/^[a-zA-Z0-9._-]{3,40}$/.test(username))
          throw new ApiError(
            'Use 3–40 letters, numbers, dots, underscores or hyphens for the username.',
          );
        if (
          db.users.some(
            (candidate) =>
              candidate.id !== user.id &&
              candidate.username?.toLowerCase() === username.toLowerCase(),
          )
        )
          throw new ApiError(
            'This username already belongs to another account.',
            409,
            'ACCOUNT_CONFLICT',
          );
        changes.username = username;
      }
      if (input.ens !== undefined) {
        const ens = text(input.ens, 100).toLowerCase();
        if (ens && !isEnsName(ens)) throw new ApiError('Enter a valid .eth name.');
        changes.ens = ens;
      }
      if (input.walletNickname !== undefined)
        changes.walletNickname = text(input.walletNickname, 60);
      if (input.avatar !== undefined) {
        const avatar = text(input.avatar, 500_000);
        if (avatar && !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(avatar))
          throw new ApiError('Choose a PNG, JPEG or WebP image under 350 KB.');
        changes.avatar = avatar;
      }
      Object.assign(user, changes);
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
      const previous = user.wallets.find((item) => item.id === wallet.id);
      const value: Wallet = {
        ...previous,
        id: wallet.id ?? `wallet-${++db.sequence}`,
        label: wallet.label!.trim(),
        address: wallet.address!,
        network: wallet.network!,
        primary: wallet.primary ?? user.wallets.length === 0,
      };
      for (const field of [
        'displayName',
        'profileName',
        'secondaryAddress',
        'walletType',
        'referralCode',
        'email',
        'ens',
      ] as const)
        if (wallet[field] !== undefined) Object.assign(value, { [field]: wallet[field]!.trim() });
      if (value.primary) user.wallets = user.wallets.map((item) => ({ ...item, primary: false }));
      user.wallets = [...user.wallets.filter((item) => item.id !== value.id), value];
      save(db);
      return json(user.wallets);
    }),
  ),
];
