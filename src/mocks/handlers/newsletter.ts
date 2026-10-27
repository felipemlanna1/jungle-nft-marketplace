import { http } from 'msw';
import { newsletterEmailSchema } from '../../domain/schemas';
import { ApiError, database, save } from '../database';
import { body, json, route, text } from './network';

export const newsletterHandlers = [
  http.post(
    '/api/newsletter/subscriptions',
    route(async ({ request }) => {
      const input = await body(request);
      if (typeof input.email !== 'string' || input.email.length > 160)
        throw new ApiError('Informe um e-mail válido com até 160 caracteres.');
      const parsed = newsletterEmailSchema.safeParse(text(input.email, 160).toLowerCase());
      if (!parsed.success) throw new ApiError('Informe um endereço de e-mail válido.');
      const normalizedEmail = parsed.data;
      const db = database();
      const subscriptions = (db.newsletterSubscriptions ??= {});
      const existing = subscriptions[normalizedEmail];
      if (existing) return json({ ...existing, simulated: true, alreadySubscribed: true });
      const subscription = {
        id: `newsletter-${++db.sequence}`,
        email: normalizedEmail,
        createdAt: Date.now(),
      };
      subscriptions[normalizedEmail] = subscription;
      save(db);
      return json({ ...subscription, simulated: true, alreadySubscribed: false });
    }),
  ),
];
