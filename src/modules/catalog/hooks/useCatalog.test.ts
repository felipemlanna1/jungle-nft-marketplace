// @vitest-environment jsdom
import { createElement, type ReactNode } from 'react';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '../../../contracts';
import { market } from '../../../services/marketplace';
import { useFavorite } from './useCatalog';

vi.mock('../../../services/marketplace', () => ({
  market: { favorites: vi.fn(), toggleFavorite: vi.fn() },
}));
const first: User = { id: 'first', name: 'First Collector', email: 'first@example.test' };
const second: User = { id: 'second', name: 'Second Collector', email: 'second@example.test' };
const variables = { id: 'nft-new', active: true, ownerId: first.id };
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((accept, refuse) => {
    resolve = accept;
    reject = refuse;
  });
  return { promise, resolve, reject };
}
let client: QueryClient;
function setup() {
  client.setQueryData(['session'], first);
  client.setQueryData(['favorites', first.id], ['nft-private-first']);
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return renderHook(({ user }: { user: User | null }) => useFavorite(user), {
    wrapper,
    initialProps: { user: first as User | null },
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false }, mutations: { retry: false } },
  });
  vi.mocked(market.favorites).mockResolvedValue([]);
  vi.spyOn(client, 'invalidateQueries').mockResolvedValue();
});
afterEach(() => {
  cleanup();
  client.clear();
  vi.restoreAllMocks();
});

describe('favorite mutation ownership', () => {
  it('does not restore private cache after logout when a pending response fails', async () => {
    const response = deferred<string[]>();
    vi.mocked(market.toggleFavorite).mockReturnValue(response.promise);
    const { result, rerender } = setup();
    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current.mutation.mutateAsync(variables).catch((error) => error);
    });
    await waitFor(() => expect(market.toggleFavorite).toHaveBeenCalledTimes(1));
    act(() => {
      client.clear();
      client.setQueryData(['session'], null);
    });
    rerender({ user: null });
    await act(async () => {
      response.reject(new Error('Session ended'));
      await pending;
    });
    expect(client.getQueryData(['favorites', first.id])).toBeUndefined();
    expect(client.getQueryData(['favorites', undefined])).toBeUndefined();
  });
  it('does not roll back the next collector to the previous collector favorites', async () => {
    const response = deferred<string[]>();
    vi.mocked(market.toggleFavorite).mockReturnValue(response.promise);
    const { result, rerender } = setup();
    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current.mutation.mutateAsync(variables).catch((error) => error);
    });
    await waitFor(() => expect(market.toggleFavorite).toHaveBeenCalledTimes(1));
    act(() => {
      client.clear();
      client.setQueryData(['session'], second);
      client.setQueryData(['favorites', second.id], ['nft-private-second']);
    });
    rerender({ user: second });
    await act(async () => {
      response.reject(new Error('Old session response'));
      await pending;
    });
    expect(client.getQueryData(['favorites', second.id])).toEqual(['nft-private-second']);
    expect(client.getQueryData(['favorites', first.id])).toBeUndefined();
  });
  it('does not dispatch an old action under a new transport session after an asynchronous gap', async () => {
    const gate = deferred<void>();
    vi.spyOn(client, 'cancelQueries').mockReturnValueOnce(gate.promise);
    const { result, rerender } = setup();
    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current.mutation.mutateAsync(variables).catch((error) => error);
    });
    await waitFor(() => expect(client.cancelQueries).toHaveBeenCalledTimes(1));
    act(() => {
      client.clear();
      client.setQueryData(['session'], second);
      client.setQueryData(['favorites', second.id], ['nft-private-second']);
    });
    rerender({ user: second });
    await act(async () => {
      gate.resolve();
      await pending;
    });
    expect(market.toggleFavorite).not.toHaveBeenCalled();
    expect(client.getQueryData(['favorites', second.id])).toEqual(['nft-private-second']);
  });
  it('restores the same collector optimistic state on an ordinary request failure', async () => {
    vi.mocked(market.toggleFavorite).mockRejectedValue(new Error('Temporary failure'));
    const { result } = setup();
    await act(async () => {
      await result.current.mutation.mutateAsync(variables).catch(() => undefined);
    });
    expect(client.getQueryData(['favorites', first.id])).toEqual(['nft-private-first']);
  });
});
