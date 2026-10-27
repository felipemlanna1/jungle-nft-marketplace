// @vitest-environment jsdom
import { createElement, type ReactNode } from 'react';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Cart } from '../../../contracts';
import { market } from '../../../services/marketplace';
import { useCart } from './useCart';

const { first } = vi.hoisted(() => ({
  first: { id: 'first', name: 'First Collector', email: 'first@example.test' },
}));
vi.mock('../../../services/marketplace', () => ({
  market: { cart: vi.fn(), updateItem: vi.fn(), removeItem: vi.fn() },
}));
vi.mock('../../account/hooks/useAccount', () => ({
  useSession: () => ({ data: first, isPending: false }),
}));
const second = { id: 'second', name: 'Second Collector', email: 'second@example.test' };
let client: QueryClient;
function setup() {
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return renderHook(() => useCart(), { wrapper });
}
beforeEach(() => {
  vi.clearAllMocks();
  client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false }, mutations: { retry: false } },
  });
  client.setQueryData(['session'], first);
  client.setQueryData(['cart', first.id], { items: [], version: 1 });
});
afterEach(() => {
  cleanup();
  client.clear();
  vi.restoreAllMocks();
});

describe('cart mutation ownership', () => {
  it('blocks an old removal before HTTP dispatch after switching collectors', async () => {
    const { result } = setup();
    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current.mutation
        .mutateAsync({ ownerId: first.id, id: 'nft-1', quantity: 0 })
        .catch((error) => error);
      client.setQueryData(['session'], second);
    });
    await act(async () => {
      await pending;
    });
    expect(market.removeItem).not.toHaveBeenCalled();
    expect(market.updateItem).not.toHaveBeenCalled();
  });
  it('does not invalidate the next collector cart or quote after a late success', async () => {
    let resolve!: (cart: Cart) => void;
    vi.mocked(market.updateItem).mockReturnValue(
      new Promise((accept) => {
        resolve = accept;
      }),
    );
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    const { result } = setup();
    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current.mutation.mutateAsync({
        ownerId: first.id,
        id: 'nft-1',
        quantity: 2,
      });
    });
    await waitFor(() => expect(market.updateItem).toHaveBeenCalledTimes(1));
    act(() => {
      client.setQueryData(['session'], second);
      client.setQueryData(['cart', second.id], { items: [], version: 9 });
    });
    await act(async () => {
      resolve({ items: [], version: 2 });
      await pending;
    });
    expect(invalidate).not.toHaveBeenCalled();
    expect(client.getQueryData(['cart', second.id])).toEqual({ items: [], version: 9 });
  });
});
