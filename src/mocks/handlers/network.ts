import { delay, HttpResponse } from 'msw';
import { ApiError, database, transaction } from '../database';

export type HandlerArgs = {
  request: Request;
  params: Record<string, string | readonly string[] | undefined>;
};

let requestIndex = 0;

export function route(
  handler: (args: HandlerArgs) => Promise<Response> | Response,
  control = false,
) {
  return async (args: HandlerArgs) => {
    try {
      if (!control) {
        const scenario = database().scenario;
        if (scenario === 'slow') await delay(1_200 + (requestIndex++ % 3) * 350);
        else await delay(80);
        if (scenario === 'offline') return HttpResponse.error();
        if (scenario === 'server-error')
          throw new ApiError(
            'O marketplace está temporariamente indisponível. Tente novamente.',
            503,
            'TRANSIENT_ERROR',
          );
      }
      return await transaction(() => {
        const path = new URL(args.request.url).pathname;
        const sentGeneration = args.request.headers.get('X-Demo-Session');
        const publicRequest =
          path.startsWith('/api/nfts') ||
          path === '/api/recommendations' ||
          path === '/api/newsletter/subscriptions' ||
          path === '/api/articles' ||
          path.startsWith('/api/articles/') ||
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

export async function body(request: Request): Promise<Record<string, unknown>> {
  try {
    const value = await request.json();
    if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  } catch {
    /* Reject malformed payloads below. */
  }
  throw new ApiError('A valid JSON object is required.');
}

export function text(value: unknown, max = 200): string {
  if (typeof value !== 'string' || value.length > max)
    throw new ApiError('An input field is missing or too long.');
  return value.trim();
}

export function password(value: unknown) {
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

export function email(value: unknown) {
  const str = text(value).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) throw new ApiError('Enter a valid email address.');
  return str;
}

type JsonValue = null | string | number | boolean | JsonValue[] | { [key: string]: JsonValue };

export const json = (data: unknown) =>
  HttpResponse.json(data as JsonValue, {
    headers: { 'X-Demo-Session': String(database().sessionGeneration ?? 1) },
  });

export const idParam = (params: HandlerArgs['params'], field = 'id') => String(params[field] ?? '');
