import { describe, expect, it } from 'vitest';
import { validateCatalogSearch, validateRedirectSearch } from './search';
import { safeRedirect } from '../../lib/returnTo';

describe('route search contracts', () => {
  it('normalizes invalid catalog input while preserving supported combined filters', () => {
    expect(
      validateCatalogSearch({
        q: 'x'.repeat(200),
        category: 'unknown',
        sort: 'execute',
        page: 'Infinity',
      }),
    ).toEqual({ q: 'x'.repeat(100), category: 'all', sort: 'newest', page: 1, tab: 'all' });
    expect(
      validateCatalogSearch({ q: 'Marco', category: 'Art', sort: 'price-asc', page: '2.9' }),
    ).toEqual({ q: 'Marco', category: 'Art', sort: 'price-asc', page: 2, tab: 'all' });
  });
  it('preserves exact decimal filters and rejects float coercion or unsupported metadata', () => {
    expect(
      validateCatalogSearch({
        minPrice: '0.000000000000000001',
        maxPrice: '12.300',
        network: 'Solana',
        tab: 'trending',
        category: 'Gaming',
      }),
    ).toMatchObject({
      minPrice: '0.000000000000000001',
      maxPrice: '12.300',
      network: 'Solana',
      tab: 'trending',
      category: 'Gaming',
    });
    const invalid = validateCatalogSearch({
      minPrice: 0.1,
      maxPrice: '0.1234567890123456789',
      network: 'Unknown',
      tab: 'injected',
    });
    expect(invalid.minPrice).toBeUndefined();
    expect(invalid.maxPrice).toBeUndefined();
    expect(invalid.network).toBeUndefined();
    expect(invalid.tab).toBe('all');
    expect(validateCatalogSearch({ minPrice: '10', maxPrice: '1' })).toMatchObject({
      minPrice: '10',
      maxPrice: '1',
    });
  });
  it.each([
    'https://outside.example',
    '//outside.example',
    '/\\outside.example',
    '/profile\n',
    'javascript:alert(1)',
    '/orders/../../external',
    '/%2f%2foutside.example',
  ])('rejects an unsafe or unrelated return destination: %s', (value) => {
    expect(safeRedirect(value)).toBe('/');
    expect(validateRedirectSearch({ redirect: value })).toEqual({ redirect: '/' });
  });
  it('preserves internal catalog query, checkout state and receipt fragments', () => {
    expect(safeRedirect('/?q=Marco&category=Art')).toBe('/?q=Marco&category=Art');
    expect(safeRedirect('/checkout?coupon=JUNGLE10')).toBe('/checkout?coupon=JUNGLE10');
    expect(safeRedirect('/orders/order-demo#receipt')).toBe('/orders/order-demo#receipt');
  });
  it('normalizes dot segments without allowing another route or origin', () => {
    expect(safeRedirect('/cart/../profile')).toBe('/profile');
    expect(safeRedirect('/cart/../external')).toBe('/');
    expect(safeRedirect(undefined)).toBe('/');
  });
  it('preserves a favorite intent together with its internal catalog destination', () => {
    expect(
      validateRedirectSearch({
        redirect: '/?q=Sage&tab=trending#marketplace',
        favorite: 'nft-2',
      }),
    ).toEqual({ redirect: '/?q=Sage&tab=trending#marketplace', favorite: 'nft-2' });
  });
  it.each(['../nft-1', 'https://outside.example', '', 'n'.repeat(81)])(
    'rejects a malformed favorite intent: %s',
    (favorite) => {
      expect(validateRedirectSearch({ favorite })).toEqual({ redirect: '/' });
    },
  );
});
