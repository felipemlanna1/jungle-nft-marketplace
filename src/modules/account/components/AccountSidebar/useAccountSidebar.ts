import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { market } from '../../../../services/marketplace';
import { messageOf } from '../../hooks/useAccount';
export function useAccountSidebar() {
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const client = useQueryClient();
  const navigate = useNavigate();
  async function logout() {
    if (pending) return;
    setPending(true);
    setError('');
    try {
      await market.logout();
      await client.cancelQueries();
      client.clear();
      await navigate({ to: '/' });
    } catch (error) {
      setError(messageOf(error));
    } finally {
      setPending(false);
    }
  }
  return { logout, error, pending };
}
