import { useEffect } from 'react';
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { market } from '../../../services/marketplace';
import type { User } from '../../../contracts';

export function messageOf(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (typeof error.response?.data?.message === 'string') return error.response.data.message;
    if (!error.response)
      return 'The connection was interrupted. Your changes were not confirmed. Please try again.';
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
export { safeRedirect } from '../../../lib/returnTo';
export function useSession() {
  return useQuery<User | null>({
    queryKey: ['session'],
    queryFn: ({ signal }) => market.session(signal),
    staleTime: 30_000,
    retry: false,
  });
}
export function useAuthenticatedUser() {
  const session = useSession();
  const navigate = useNavigate();
  useEffect(() => {
    if (session.isFetched && !session.data && !session.error) {
      void navigate({
        to: '/login',
        search: { redirect: window.location.pathname + window.location.search },
      });
    }
  }, [session.isFetched, session.data, session.error, navigate]);
  return session;
}
export function useAcceptSession() {
  const client = useQueryClient();
  return async (user: User) => {
    await client.cancelQueries();
    client.clear();
    client.setQueryData(['session'], user);
  };
}
export const passwordValid = (value: string) =>
  value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value);

export function assertSessionOwner(client: QueryClient, owner: string) {
  if (!owner || client.getQueryData<User | null>(['session'])?.id !== owner)
    throw new Error('A sessão mudou. Entre novamente antes de salvar.');
}
