import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { market } from '../../../../services/marketplace';
import { useAuthenticatedUser } from '../../../account/hooks/useAccount';
import { clearAttempt } from '../../attempt';
export function useOrder(id: string) {
  const session = useAuthenticatedUser();
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
      clearAttempt(user.id);
      void client.invalidateQueries({ queryKey: ['cart', user.id] });
    }
  }, [user, order.data, client]);

  return { session, order };
}
