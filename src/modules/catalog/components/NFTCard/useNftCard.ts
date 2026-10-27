import { useId } from 'react';
import type { NFT } from '../../shared-types';
import { useSession } from '../../../account/hooks/useAccount';
import { useAddToCart } from '../../hooks/useAddToCart';
import { useNftPreviewStore } from '../../stores/useNftPreviewStore';

export function useNftCard(nft: NFT) {
  const session = useSession();
  const statusId = useId();
  const add = useAddToCart(session.data?.id ?? 'guest');
  const openPreview = useNftPreviewStore((state) => state.openPreview);
  const addToCart = () => {
    if (session.isPending || session.error || !nft.available) return;
    add.mutate({
      ownerId: session.data?.id ?? 'guest',
      nftId: nft.id,
      quantity: 1,
      editionId: nft.defaultEditionId,
    });
  };
  return {
    canAdd: !session.isPending && !session.error && nft.available > 0,
    added: add.isSuccess,
    add,
    statusId,
    addToCart,
    preview: () => openPreview(nft.id),
  };
}
