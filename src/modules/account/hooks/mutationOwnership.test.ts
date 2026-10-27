// @vitest-environment jsdom
import { createElement, type ReactNode } from 'react';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '../../../contracts';
import type { ProfileFormValues } from '../shared-types';
import { market } from '../../../services/marketplace';
import { useProfile } from '../pages/Profile/useProfile';
import { useWallets } from '../pages/Wallets/useWallets';
import { usePasswordForm } from '../components/PasswordForm/usePasswordForm';

const { first } = vi.hoisted(() => ({
  first: {
    id: 'first',
    name: 'First Collector',
    email: 'first@example.test',
    username: 'first.collector',
  },
}));
vi.mock('../../../services/marketplace', () => ({
  market: {
    updateProfile: vi.fn(),
    saveWallet: vi.fn(),
    changePassword: vi.fn(),
    wallets: vi.fn(),
  },
}));
vi.mock('./useAccount', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./useAccount')>()),
  useSession: () => ({ data: first }),
  useAuthenticatedUser: () => ({ data: first }),
}));
const second: User = { id: 'second', name: 'Second Collector', email: 'second@example.test' };
const values: ProfileFormValues = {
  name: 'First snapshot',
  email: first.email,
  username: first.username,
  ens: '',
  walletNickname: '',
  avatar: '',
};
let client: QueryClient;
function setup() {
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
  return renderHook(
    () => ({ profile: useProfile(), wallet: useWallets(), password: usePasswordForm() }),
    { wrapper },
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity }, mutations: { retry: false } },
  });
  client.setQueryData(['session'], first);
  client.setQueryData(['wallets', first.id], []);
  vi.mocked(market.wallets).mockResolvedValue([]);
});
afterEach(() => {
  cleanup();
  client.clear();
});
describe('account mutation request ownership', () => {
  it.each(['profile', 'wallet', 'password'] as const)(
    'blocks a queued %s request after switching collectors',
    async (kind) => {
      const { result } = setup();
      let pending!: Promise<unknown>;
      act(() => {
        if (kind === 'profile')
          pending = result.current.profile.save
            .mutateAsync({ owner: first.id, values })
            .catch((error) => error);
        if (kind === 'wallet')
          pending = result.current.wallet.save
            .mutateAsync({
              owner: first.id,
              wallet: {
                label: 'First wallet',
                address: `0x${'1'.repeat(40)}`,
                network: 'Ethereum',
              },
            })
            .catch((error) => error);
        if (kind === 'password')
          pending = result.current.password.mutation
            .mutateAsync({ owner: first.id, current: 'Collect0r!Demo', password: 'Changed0nly!' })
            .catch((error) => error);
        client.setQueryData(['session'], second);
      });
      await act(async () => {
        await pending;
      });
      expect(market.updateProfile).not.toHaveBeenCalled();
      expect(market.saveWallet).not.toHaveBeenCalled();
      expect(market.changePassword).not.toHaveBeenCalled();
      expect(client.getQueryData(['session'])).toEqual(second);
    },
  );
  it('does not replace the next collector with a late profile response', async () => {
    let resolve!: (user: User) => void;
    vi.mocked(market.updateProfile).mockReturnValue(
      new Promise((accept) => {
        resolve = accept;
      }),
    );
    const { result } = setup();
    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current.profile.save.mutateAsync({ owner: first.id, values });
    });
    await waitFor(() => expect(market.updateProfile).toHaveBeenCalledTimes(1));
    act(() => {
      client.setQueryData(['session'], second);
    });
    await act(async () => {
      resolve(first);
      await pending;
    });
    expect(client.getQueryData(['session'])).toEqual(second);
  });
  it('initializes wallets before accepting edits and then preserves an unsaved secondary draft', async () => {
    let resolve!: (wallets: import('../../../contracts').Wallet[]) => void;
    vi.mocked(market.wallets).mockReturnValue(
      new Promise((accept) => {
        resolve = accept;
      }),
    );
    client.removeQueries({ queryKey: ['wallets', first.id] });
    const { result } = setup();
    expect(result.current.wallet.ready).toBe(false);
    act(() => {
      result.current.wallet.add(false);
      result.current.wallet.setField('label', 'Too early');
    });
    expect(result.current.wallet.values.label).toBe('');
    const primary = {
      id: 'wallet-first',
      label: 'Primary wallet',
      address: `0x${'1'.repeat(40)}`,
      network: 'Ethereum' as const,
      primary: true,
    };
    await act(async () => {
      resolve([primary]);
    });
    await waitFor(() => expect(result.current.wallet.ready).toBe(true));
    act(() => {
      result.current.wallet.add(false);
    });
    act(() => {
      result.current.wallet.setField('label', 'Unsaved secondary');
    });
    act(() => {
      client.setQueryData(['wallets', first.id], [{ ...primary, label: 'Remote primary update' }]);
    });
    expect(result.current.wallet.editor.primary).toBe(false);
    expect(result.current.wallet.values.label).toBe('Unsaved secondary');
  });
});
