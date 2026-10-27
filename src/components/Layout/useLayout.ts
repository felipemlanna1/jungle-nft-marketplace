import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { market } from '../../services/marketplace';
import { useTheme } from '../../styleguide';
export const useLayout = () => {
  const { themeName } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [leaving, setLeaving] = useState(false);
  const session = useQuery({
    queryKey: ['session'],
    queryFn: ({ signal }) => market.session(signal),
    retry: false,
  });
  const cart = useQuery({
    queryKey: ['cart', session.data?.id ?? 'guest'],
    queryFn: market.cart,
    enabled: !session.isPending,
  });
  const count = cart.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const client = useQueryClient();
  const navigate = useNavigate();
  async function logout() {
    setLeaving(true);
    try {
      await market.logout();
      client.clear();
      await navigate({ to: '/' });
      setMenuOpen(false);
    } catch {
      setLogoutError('Não foi possível sair. Tente novamente.');
    } finally {
      setLeaving(false);
    }
  }

  return { themeName, menuOpen, setMenuOpen, logoutError, leaving, session, count, logout };
};
