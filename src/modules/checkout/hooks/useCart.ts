import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '../../account/hooks/useAccount';
import { market } from '../../../services/marketplace';
export function useCart() {
  const session = useSession();
  const owner = session.data?.id ?? 'guest';
  const cart = useQuery({
    queryKey: ['cart', owner],
    queryFn: () => market.cart(),
    enabled: !session.isPending,
  });
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      quantity === 0 ? market.removeItem(id) : market.updateItem(id, quantity),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['cart'] });
      void client.invalidateQueries({ queryKey: ['quote'] });
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
    /* storage can be unavailable in private contexts */
  }
}
