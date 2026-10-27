import { Link } from '@tanstack/react-router';
import * as Tabs from '@radix-ui/react-tabs';
import { ArrowLeft, ArrowRight, ChevronLeft, ShoppingCart, Star } from 'lucide-react';
import { errorMessage } from '../../../../services/marketplace';
import { Button, Notice, QuantityInput } from '../../../../styleguide';
import { NftDetailsSkeleton } from '../../components/NftDetailsSkeleton';
import { NftFavoriteAction } from '../../components/NftFavoriteAction';
import { NftGallery } from '../../components/NftGallery';
import { RelatedNfts } from '../../components/RelatedNfts';
import { useNftDetails } from './useNftDetails';

export function NFTDetailPage({ id }: { id: string }) {
  const {
    canAdd,
    nft,
    session,
    favorite,
    quantity,
    available,
    price,
    edition,
    selectEdition,
    changeQuantity,
    isFavorite,
    toggleFavorite,
    add,
    addToCart,
    added,
  } = useNftDetails(id);
  if (nft.isPending) return <NftDetailsSkeleton />;
  if (nft.isError)
    return (
      <section className="page-shell empty-state">
        <h1>Obra não encontrada</h1>
        <p>{errorMessage(nft.error)}</p>
        <Button asChild>
          <Link to="/">Voltar ao marketplace</Link>
        </Button>
      </section>
    );
  const item = nft.data;
  return (
    <section className="page-shell detail-page commerce-page">
      <div className="detail-mobile-toolbar">
        <Link to="/" aria-label="Voltar ao marketplace">
          <ChevronLeft size={18} aria-hidden="true" />
        </Link>
        <NftFavoriteAction
          nftId={id}
          authenticated={Boolean(session.data)}
          active={isFavorite}
          pending={favorite.isPending}
          onToggle={toggleFavorite}
          showLabel={false}
        />
      </div>
      <nav className="breadcrumbs" aria-label="Caminho da página">
        <Link to="/">Início</Link>
        <span>/</span>
        <Link to="/">Mercado</Link>
      </nav>
      <div className="detail-grid">
        <NftGallery image={item.image} title={item.title} />
        <div className="detail-copy">
          <div className="detail-title">
            <h1>{item.title}</h1>
            <div className="detail-price-row">
              <strong className="detail-price">{price} ETH</strong>
              {item.reviewCount !== undefined && (
                <span className="detail-rating">
                  <span role="img" aria-label={`${item.rating ?? 0} de 5 estrelas`}>
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        size={15}
                        fill={index < Math.floor(item.rating ?? 0) ? 'currentColor' : 'none'}
                        aria-hidden="true"
                      />
                    ))}
                  </span>
                  <span className="detail-rating-count">
                    {item.reviewCount} avaliações de colecionadores
                  </span>
                  <span className="detail-rating-compact">
                    <Star size={13} aria-hidden="true" /> {item.rating}({item.reviewCount})
                  </span>
                </span>
              )}
            </div>
          </div>
          <div className="detail-description">
            <h2>Sobre este NFT:</h2>
            <p>
              {item.description ??
                `Colecionável digital da coleção ${item.collection}. Obra demonstrativa, sem transferência de ativos reais.`}
            </p>
          </div>
          <fieldset className="edition-selector">
            <legend>Edição:</legend>
            <div>
              {item.editions?.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  aria-pressed={edition?.id === option.id}
                  onClick={() => selectEdition(option.id)}
                >
                  {option.id === 'open' ? 'ABERTA' : option.label}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="detail-buy-controls">
            <div className="detail-quantity-wrap">
              <span className="detail-mobile-quantity-label">Qtd.</span>
              <QuantityInput
                value={quantity}
                max={available}
                label="Quantidade"
                onValueChange={changeQuantity}
                disabled={add.isPending || !available}
              />
            </div>
            <strong className="detail-mobile-price">{price} ETH</strong>
            <div className="detail-actions">
              <Button
                aria-label="Comprar NFT"
                onClick={addToCart}
                disabled={add.isPending || !canAdd}
              >
                {add.isPending ? (
                  'ADICIONANDO…'
                ) : (
                  <>
                    <span className="kurio-desktop-copy">COMPRAR</span>
                    <span className="kurio-mobile-copy">Comprar NFT</span>
                  </>
                )}
              </Button>
              <NftFavoriteAction
                nftId={id}
                authenticated={Boolean(session.data)}
                active={isFavorite}
                pending={favorite.isPending}
                onToggle={toggleFavorite}
                className="detail-favorite-action"
              />
              <Button
                className="detail-add-icon"
                size="icon"
                aria-label="Adicionar ao carrinho"
                onClick={addToCart}
                disabled={add.isPending || !canAdd}
              >
                <ShoppingCart size={20} aria-hidden="true" />
              </Button>
            </div>
          </div>
          <dl className="nft-properties">
            <div>
              <dt>ID do token:</dt>
              <dd>{item.tokenId ?? item.title.split('#')[1] ?? item.id}</dd>
            </div>
            <div>
              <dt>Coleção:</dt>
              <dd>{item.collection}</dd>
            </div>
            <div>
              <dt>Atributos:</dt>
              <dd>{item.attributes?.join(', ') ?? `${item.category}, ${item.network}`}</dd>
            </div>
          </dl>
          {!available && (
            <Notice tone="error">Esta edição está esgotada. Selecione outra edição.</Notice>
          )}
          {add.isError && <Notice tone="error">{errorMessage(add.error)}</Notice>}
          {favorite.isError && (
            <Notice tone="error">
              {errorMessage(favorite.error)} O estado anterior foi restaurado.
            </Notice>
          )}
          {added && (
            <Notice tone="success">
              A obra está no seu carrinho.{' '}
              <Link to="/cart">
                Ver carrinho <ArrowRight size={14} />
              </Link>
            </Notice>
          )}
        </div>
      </div>
      <Tabs.Root className="nft-content-tabs" defaultValue="details">
        <Tabs.List aria-label="Informações da obra">
          <Tabs.Trigger value="details">Detalhes do NFT</Tabs.Trigger>
          <Tabs.Trigger value="collection">Informações da coleção</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="details">
          <p>
            {item.title} é uma obra da coleção {item.collection}. O preço e a disponibilidade desta
            edição são confirmados pela cotação antes da compra.
          </p>
          <p>
            Esta demonstração registra um recibo imutável de cada pedido confirmado. Carteiras e
            transações são simuladas, sem movimentação de ativos reais.
          </p>
          <dl className="nft-properties">
            <div>
              <dt>Rede:</dt>
              <dd>{item.network}</dd>
            </div>
            <div>
              <dt>Contrato:</dt>
              <dd>Ambiente demonstrativo. Nenhum contrato real é executado.</dd>
            </div>
          </dl>
        </Tabs.Content>
        <Tabs.Content value="collection">
          <p>
            {item.collection}, de {item.creator}. As imagens e os dados utilizados nesta
            demonstração estão documentados na entrega.
          </p>
          <Link to="/" search={{ category: item.category }}>
            Explorar esta categoria <ArrowRight size={14} />
          </Link>
        </Tabs.Content>
      </Tabs.Root>
      <RelatedNfts title="Mais desta coleção" excludeIds={[id]} />
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Continuar explorando
      </Link>
    </section>
  );
}
