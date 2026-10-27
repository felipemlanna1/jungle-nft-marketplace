import { useEffect, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { market } from '../../../../services/marketplace';
import type { CartItem } from '../../shared-types';
import { readCoupon, storeCoupon, useCart } from '../../hooks/useCart';

export function useCartPage() {
  const { cart, mutation, owner } = useCart();
  const [coupon, setCoupon] = useState(() => readCoupon(owner));
  const [draft, setDraft] = useState(coupon);
  useEffect(() => {
    const value = readCoupon(owner);
    setCoupon(value);
    setDraft(value);
  }, [owner]);
  const quote = useQuery({
    queryKey: ['quote', owner, cart.data?.version, coupon],
    queryFn: () => market.quote(coupon || undefined),
    enabled: !!cart.data?.items.length,
    retry: false,
  });
  const apply = (event: FormEvent) => {
    event.preventDefault();
    setCoupon(draft.trim().toUpperCase());
    storeCoupon(owner, draft.trim().toUpperCase());
  };
  const removeCoupon = () => {
    setCoupon('');
    setDraft('');
    storeCoupon(owner, '');
  };
  const updateQuantity = (item: CartItem, quantity: number) => {
    if (Number.isSafeInteger(quantity) && quantity >= 1 && quantity <= item.nft.available)
      mutation.mutate({ id: item.id ?? item.nftId, quantity, ownerId: owner });
  };
  const removeItem = (item: CartItem) =>
    mutation.mutate({ id: item.id ?? item.nftId, quantity: 0, ownerId: owner });
  const excludedIds = [...new Set(cart.data?.items.map((item) => item.nftId) ?? [])];
  return {
    removeCoupon,
    updateQuantity,
    removeItem,
    excludedIds,
    cart,
    mutation,
    owner,
    coupon,
    setCoupon,
    draft,
    setDraft,
    quote,
    apply,
  };
}
