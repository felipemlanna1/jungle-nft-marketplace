import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { market } from '../../../../services/marketplace';
import { useFavorite } from '../../hooks/useCatalog';
export function useNftDetails(id: string) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const client = useQueryClient();
  const nft = useQuery({
    queryKey: ['nft', id],
    queryFn: ({ signal }) => market.nft(id, signal),
    retry: false,
  });
  const session = useQuery({
    queryKey: ['session'],
    queryFn: ({ signal }) => market.session(signal),
    retry: false,
  });
  const { favorites, mutation: favorite } = useFavorite(session.data);
  const add = useMutation({
    mutationFn: () => market.addItem(id, quantity),
    onSuccess: async () => {
      setAdded(true);
      await client.invalidateQueries({ queryKey: ['cart'] });
    },
  });
  const available = nft.data?.available ?? 0;
  const validQuantity = Math.max(1, Math.min(quantity, available));
  const isFavorite = favorites.includes(id);
  function changeQuantity(value: number) {
    setQuantity(Math.max(1, Math.min(available, Math.floor(value) || 1)));
    setAdded(false);
  }
  function decrease() {
    changeQuantity(quantity - 1);
  }
  function increase() {
    changeQuantity(quantity + 1);
  }
  return {
    nft,
    session,
    favorite,
    quantity,
    validQuantity,
    isFavorite,
    add,
    added,
    decrease,
    increase,
    changeQuantity,
  };
}
