import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '../../account/hooks/useAccount';
import { market } from '../../../services/marketplace';
import type { User } from '../../../contracts';
import type { CartChange } from '../shared-types';
export function useCart() {
  const session = useSession();
  const owner = session.data?.id ?? 'guest';
  const cart = useQuery({
    queryKey: ['cart', owner],
    queryFn: () => market.cart(),
    enabled: !session.isPending,
  });
  const client = useQueryClient();
  const ownsSession = (ownerId: string) =>
    (client.getQueryData<User | null>(['session'])?.id ?? 'guest') === ownerId;
  const mutation = useMutation({
    mutationKey: ['cart-change', owner],
    mutationFn: ({ ownerId, id, quantity }: CartChange) => {
      if (!ownsSession(ownerId))
        throw new Error('A sessão mudou. Atualize o carrinho antes de continuar.');
      return quantity === 0 ? market.removeItem(id) : market.updateItem(id, quantity);
    },
    onSuccess: (_data, variables) => {
      if (!ownsSession(variables.ownerId)) return;
      void client.invalidateQueries({ queryKey: ['cart', variables.ownerId] });
      void client.invalidateQueries({ queryKey: ['quote', variables.ownerId] });
    },
  });
  return { cart, mutation, user: session.data, owner };
}
export function readCoupon(owner: string): string {
  try {
    return sessionStorage.getItem(`kurio:coupon:${owner}`) ?? '';
  } catch {
    return '';
  }
}
export function storeCoupon(owner: string, coupon: string) {
  try {
    sessionStorage.setItem(`kurio:coupon:${owner}`, coupon);
  } catch {
    // The active form retains the coupon even when optional persistence is blocked.
  }
}
