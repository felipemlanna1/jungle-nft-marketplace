import { Link } from '@tanstack/react-router';
import { Button, Modal, Notice, Skeleton } from '../../../../styleguide';
import { errorMessage } from '../../../../services/marketplace';
import { useNftPreview } from './useNftPreview';

export function NftPreview({ id }: { id: string }) {
  const { canAdd, nft, add, addToCart, close } = useNftPreview(id);
  return (
    <Modal
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
      title={nft.data?.title ?? 'Prévia da obra'}
      description="Veja a obra em detalhes."
    >
      {nft.isPending ? (
        <Skeleton className="nft-preview-skeleton" />
      ) : nft.error ? (
        <Notice tone="error">
          {errorMessage(nft.error)}{' '}
          <Button onClick={() => void nft.refetch()}>Tentar novamente</Button>
        </Notice>
      ) : (
        nft.data && (
          <div className="nft-preview-content">
            <img src={nft.data.image} alt={nft.data.title} width="900" height="900" />
            <strong>{nft.data.price} ETH</strong>
            <div>
              <Button disabled={add.isPending || !canAdd} onClick={addToCart}>
                Adicionar ao carrinho
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/nft/$id" params={{ id }} onClick={close}>
                  Ver detalhes
                </Link>
              </Button>
            </div>
            {add.isSuccess && <Notice tone="success">Obra adicionada ao carrinho.</Notice>}
            {add.error && <Notice tone="error">{errorMessage(add.error)}</Notice>}
          </div>
        )
      )}
    </Modal>
  );
}
