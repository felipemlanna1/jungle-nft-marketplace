// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FormEvent, ReactNode } from 'react';
import type { NewsletterSubscription, User } from '../../../../../contracts';
import { useNewsletter } from './useNewsletter';

const { subscribeNewsletter } = vi.hoisted(() => ({ subscribeNewsletter: vi.fn() }));
vi.mock('../../../../../services/marketplace', () => ({
  market: { subscribeNewsletter, session: vi.fn() },
}));
const userA: User = { id: 'user-a', name: 'Collector A', email: 'a@example.test' };
const userB: User = { id: 'user-b', name: 'Collector B', email: 'b@example.test' };
const receipt: NewsletterSubscription = {
  id: 'newsletter-1',
  email: 'updates@example.test',
  createdAt: 1,
  simulated: true,
  alreadySubscribed: false,
};
const event = () => ({ preventDefault: vi.fn() }) as unknown as FormEvent<HTMLFormElement>;
function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  client.setQueryData(['session'], userA);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, ...renderHook(useNewsletter, { wrapper }) };
}
afterEach(cleanup);
beforeEach(() => {
  subscribeNewsletter.mockReset();
});

describe('newsletter identity and confirmation', () => {
  it('confirms only after the POST response and preserves drafts on a same-owner refresh', async () => {
    let resolve!: (value: NewsletterSubscription) => void;
    subscribeNewsletter.mockImplementation(
      () =>
        new Promise<NewsletterSubscription>((done) => {
          resolve = done;
        }),
    );
    const { client, result } = setup();
    act(() => result.current.setEmail('updates@example.test'));
    act(() => client.setQueryData(['session'], { ...userA, name: 'Updated name' }));
    expect(result.current.email).toBe('updates@example.test');
    act(() => result.current.submit(event()));
    await waitFor(() => expect(subscribeNewsletter).toHaveBeenCalledWith('updates@example.test'));
    expect(result.current.feedback).toBeNull();
    act(() => resolve(receipt));
    await waitFor(() => expect(result.current.feedback?.kind).toBe('success'));
    expect(result.current.feedback?.message).toContain('Nenhum e-mail real será enviado.');
    expect(result.current.email).toBe('');
  });

  it('clears the draft and ignores a late response after switching identities', async () => {
    let resolve!: (value: NewsletterSubscription) => void;
    subscribeNewsletter.mockImplementation(
      () =>
        new Promise<NewsletterSubscription>((done) => {
          resolve = done;
        }),
    );
    const { client, result } = setup();
    act(() => result.current.setEmail('updates@example.test'));
    act(() => result.current.submit(event()));
    await waitFor(() => expect(subscribeNewsletter).toHaveBeenCalledOnce());
    act(() => client.setQueryData(['session'], userB));
    await waitFor(() => expect(result.current.email).toBe(''));
    act(() => resolve(receipt));
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.feedback).toBeNull();
  });

  it('blocks a stale handler before HTTP when the cache owner already changed', async () => {
    const { client, result } = setup();
    act(() => result.current.setEmail('updates@example.test'));
    const staleSubmit = result.current.submit;
    act(() => {
      client.setQueryData(['session'], userB);
      staleSubmit(event());
    });
    await waitFor(() => expect(result.current.email).toBe(''));
    expect(subscribeNewsletter).not.toHaveBeenCalled();
    expect(result.current.feedback).toBeNull();
  });

  it('keeps the draft and shows no success when the POST fails', async () => {
    subscribeNewsletter.mockRejectedValue(new Error('Network unavailable'));
    const { result } = setup();
    act(() => result.current.setEmail('updates@example.test'));
    act(() => result.current.submit(event()));
    await waitFor(() => expect(result.current.feedback?.kind).toBe('error'));
    expect(result.current.feedback?.message).not.toContain('confirmada');
    expect(result.current.email).toBe('updates@example.test');
    expect(result.current.feedback?.invalidEmail).toBe(false);
  });

  it('validates email using the shared contract without sending malformed data', () => {
    const { result } = setup();
    act(() => result.current.setEmail('invalid'));
    act(() => result.current.submit(event()));
    expect(result.current.feedback?.kind).toBe('error');
    expect(result.current.feedback?.invalidEmail).toBe(true);
    expect(subscribeNewsletter).not.toHaveBeenCalled();
  });
});
