// @vitest-environment jsdom
import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Cart, User } from '../../../../contracts';
import { createNfts } from '../../../../mocks/fixtures';
import { useNftDetails } from './useNftDetails';
import { useNftCard } from '../../components/NFTCard/useNftCard';
import { useNftPreview } from '../../components/NftPreview/useNftPreview';

const api = vi.hoisted(() => ({
  nft: vi.fn(),
  session: vi.fn(),
  favorites: vi.fn(),
  toggleFavorite: vi.fn(),
  addItem: vi.fn(),
}));
vi.mock('../../../../services/marketplace', () => ({ market: api }));
const first: User = { id: 'user-1', name: 'Alex Collector', email: 'collector@example.test' };
const second: User = { id: 'user-2', name: 'Taylor Collector', email: 'second@example.test' };
const nft = createNfts()[0];
const addedCart: Cart = { items: [{ nftId: nft.id, quantity: 1, nft }], version: 2 };
let client: QueryClient;
beforeEach(() => {
  vi.clearAllMocks();
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity }, mutations: { retry: false } },
  });
  client.setQueryData(['nft', nft.id], nft);
  api.nft.mockResolvedValue(nft);
  api.favorites.mockResolvedValue([]);
  api.toggleFavorite.mockResolvedValue([]);
  api.addItem.mockResolvedValue(addedCart);
});
afterEach(() => {
  cleanup();
  client.clear();
});
function mount(user: User | null) {
  client.setQueryData(['session'], user);
  api.session.mockResolvedValue(user);
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return renderHook(() => useNftDetails(nft.id), { wrapper });
}

describe('detail cart request ownership', () => {
  it.each(['useCard', 'useDetail', 'usePreview'] as const)(
    'removes completed addition feedback from the %s when the account changes',
    async (consumer) => {
      client.setQueryData(['session'], first);
      api.session.mockResolvedValue(first);
      const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client }, children);
      const hooks = {
        useCard: () => useNftCard(nft),
        useDetail: () => useNftDetails(nft.id),
        usePreview: () => useNftPreview(nft.id),
      };
      const { result } = renderHook(() => hooks[consumer](), { wrapper });
      act(() => result.current.addToCart());
      await waitFor(() => expect(result.current.add.isSuccess).toBe(true));
      act(() => client.setQueryData(['session'], second));
      await waitFor(() => expect(result.current.add.isSuccess).toBe(false));
      expect(api.addItem).toHaveBeenCalledTimes(1);
    },
  );
  it('blocks an old account handler before it can add items to a new account', async () => {
    const { result } = mount(first);
    const staleAdd = result.current.addToCart;
    act(() => client.setQueryData(['session'], second));
    act(() => staleAdd());
    await waitFor(() => expect(result.current.add.isPending).toBe(false));
    expect(api.addItem).not.toHaveBeenCalled();
    expect(client.getQueryData<User>(['session'])?.id).toBe(second.id);
  });
  it('blocks a captured guest handler after login instead of silently adding to the account', async () => {
    const { result } = mount(null);
    const staleGuestAdd = result.current.addToCart;
    act(() => client.setQueryData(['session'], first));
    act(() => staleGuestAdd());
    await waitFor(() => expect(result.current.add.isPending).toBe(false));
    expect(api.addItem).not.toHaveBeenCalled();
  });
  it('still permits a normal guest cart addition', async () => {
    const { result } = mount(null);
    act(() => result.current.addToCart());
    await waitFor(() => expect(api.addItem).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(result.current.added).toBe(true));
  });
  it('ignores a late successful addition from the previous account', async () => {
    let complete!: (cart: Cart) => void;
    const pending = new Promise<Cart>((resolve) => {
      complete = resolve;
    });
    api.addItem.mockReturnValueOnce(pending);
    const { result } = mount(first);
    act(() => result.current.addToCart());
    await waitFor(() => expect(api.addItem).toHaveBeenCalledTimes(1));
    const untouched: Cart = { items: [], version: 7 };
    act(() => {
      client.setQueryData(['session'], second);
      client.setQueryData(['cart', second.id], untouched);
    });
    await act(async () => {
      complete(addedCart);
      await pending;
    });
    await waitFor(() => expect(result.current.add.isPending).toBe(false));
    expect(result.current.added).toBe(false);
    expect(client.getQueryData(['cart', second.id])).toEqual(untouched);
    expect(client.getQueryState(['cart', second.id])?.isInvalidated).toBe(false);
  });
});
