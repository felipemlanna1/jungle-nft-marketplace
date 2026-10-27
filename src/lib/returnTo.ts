const INTERNAL_ORIGIN = 'https://kurio.invalid';
const allowedDestinations = /^\/(?:nft\/[^/]+|cart|checkout|profile|wallets|orders\/[^/]+)$/;

export function safeRedirect(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\u0000-\u001f\u007f]/.test(value)
  )
    return '/';
  try {
    const url = new URL(value, INTERNAL_ORIGIN);
    if (
      url.origin !== INTERNAL_ORIGIN ||
      (url.pathname !== '/' && !allowedDestinations.test(url.pathname))
    )
      return '/';
    return url.pathname + url.search + url.hash;
  } catch {
    return '/';
  }
}
