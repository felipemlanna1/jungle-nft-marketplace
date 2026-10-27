import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { market } from '../../../../services/marketplace';
import { useFavorite } from '../../hooks/useCatalog';
import { useAddToCart } from '../../hooks/useAddToCart';
import { nftQueryOptions } from '../../queries';

export function useNftDetails(id: string) {
  const [quantity, setQuantity] = useState(1);
  const [editionId, setEditionId] = useState('');
  const nft = useQuery(nftQueryOptions(id));
  const session = useQuery({
    queryKey: ['session'],
    queryFn: ({ signal }) => market.session(signal),
    retry: false,
  });
  const { favorites, mutation: favorite } = useFavorite(session.data);
  const edition = nft.data?.editions?.find(
    (item) => item.id === (editionId || nft.data?.defaultEditionId),
  );
  const available = edition?.available ?? nft.data?.available ?? 0;
  const price = edition?.price ?? nft.data?.price ?? '0';
  const add = useAddToCart(session.data?.id ?? 'guest');
  const addToCart = () => {
    if (session.isPending || session.error || !nft.data || quantity > available) return;
    add.mutate({
      ownerId: session.data?.id ?? 'guest',
      nftId: id,
      quantity,
      editionId: edition?.id,
    });
  };
  const changeQuantity = (value: number) => {
    if (Number.isInteger(value) && value >= 1 && value <= available) {
      setQuantity(value);
      add.reset();
    }
  };
  const selectEdition = (value: string) => {
    setEditionId(value);
    setQuantity(1);
    add.reset();
  };
  const toggleFavorite = () => {
    if (session.data)
      favorite.mutate({ id, active: !favorites.includes(id), ownerId: session.data.id });
  };
  return {
    canAdd: !session.isPending && !session.error && available > 0 && quantity <= available,
    nft,
    session,
    favorite,
    quantity,
    available,
    price,
    edition,
    selectEdition,
    changeQuantity,
    isFavorite: favorites.includes(id),
    toggleFavorite,
    add,
    addToCart,
    added: add.isSuccess,
  };
}
