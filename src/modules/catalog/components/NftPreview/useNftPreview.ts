import { useQuery } from '@tanstack/react-query';
import { useSession } from '../../../account/hooks/useAccount';
import { useAddToCart } from '../../hooks/useAddToCart';
import { useNftPreviewStore } from '../../stores/useNftPreviewStore';
import { nftQueryOptions } from '../../queries';

export function useNftPreview(id: string) {
  const close = useNftPreviewStore((state) => state.closePreview);
  const nft = useQuery(nftQueryOptions(id));
  const session = useSession();
  const add = useAddToCart(session.data?.id ?? 'guest');
  const addToCart = () => {
    if (!nft.data || !nft.data.available || session.isPending || session.error) return;
    add.mutate({
      ownerId: session.data?.id ?? 'guest',
      nftId: id,
      quantity: 1,
      editionId: nft.data.defaultEditionId,
    });
  };
  return {
    canAdd: !session.isPending && !session.error && Boolean(nft.data?.available),
    nft,
    add,
    addToCart,
    close,
  };
}
