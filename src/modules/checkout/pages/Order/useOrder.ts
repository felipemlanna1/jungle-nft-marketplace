import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { market } from '../../../../services/marketplace';
import { useAuthenticatedUser } from '../../../account/hooks/useAccount';
import { clearAttemptForOrder } from '../../attempt';
export function useOrder(id: string) {
  const session = useAuthenticatedUser();
  const navigate = useNavigate();
  const user = session.data;
  const client = useQueryClient();
  const order = useQuery({
    queryKey: ['order', user?.id, id],
    queryFn: () => market.getOrder(id),
    enabled: !!user,
    retry: false,
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? 1000 : false),
  });
  useEffect(() => {
    if (user && order.data && order.data.status !== 'pending') {
      clearAttemptForOrder(user.id, order.data.id);
      void client.invalidateQueries({ queryKey: ['cart', user.id] });
    }
  }, [user, order.data, client]);

  const close = () => void navigate({ to: '/' });
  return { session, order, close };
}
