import { Link } from '@tanstack/react-router';
import { ArrowRight, Heart, ShoppingCart, Search, Check } from 'lucide-react';
import { useNftCard } from './useNftCard';
import type { NFTCardProps } from '../../shared-types';
import { responsiveArtwork } from '../../../../assets/figma/responsiveArtwork';
export function NFTCard({ nft, favorite, onFavorite, busy, priority = false }: NFTCardProps) {
  const { canAdd, add, added, statusId, addToCart, preview } = useNftCard(nft);
  const artwork = responsiveArtwork(nft.image);
  return (
    <article className="nft-card">
      <div className="nft-card-image">
        <Link to="/nft/$id" params={{ id: nft.id }} aria-label={`Ver ${nft.title}`}>
          <img
            src={nft.image}
            srcSet={artwork?.srcSet}
            sizes={artwork?.sizes}
            alt={nft.title}
            width="480"
            height="480"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
          />
        </Link>
        <div className="card-actions" role="group" aria-label={`Ações de ${nft.title}`}>
          <button
            type="button"
            className="card-action-add"
            aria-label={`Adicionar ${nft.title} ao carrinho`}
            aria-describedby={added ? statusId : undefined}
            disabled={add.isPending || !canAdd}
            onClick={addToCart}
            title={added ? 'Adicionado ao carrinho' : 'Adicionar ao carrinho'}
          >
            {added ? (
              <Check size={19} aria-hidden="true" />
            ) : (
              <ShoppingCart size={19} aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            className={`card-action-favorite${favorite ? ' is-favorite' : ''}`}
            aria-label={`${favorite ? 'Remover' : 'Adicionar'} ${nft.title} ${favorite ? 'dos' : 'aos'} favoritos`}
            aria-pressed={favorite}
            onClick={onFavorite}
            disabled={busy}
            title={favorite ? 'Remover dos favoritos' : 'Favoritar'}
          >
            <Heart size={19} fill={favorite ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="card-action-preview"
            aria-label={`Ampliar ${nft.title}`}
            onClick={preview}
            title="Ampliar obra"
          >
            <Search size={19} aria-hidden="true" />
          </button>
        </div>
        {added && (
          <span className="sr-only" role="status" id={statusId}>
            {nft.title} adicionado ao carrinho.
          </span>
        )}
        {add.error && (
          <span className="card-action-error" role="alert">
            Não foi possível adicionar. Tente novamente.
          </span>
        )}
        {nft.rarity === 'Rare' && <span className="rarity-badge">RARO</span>}
        <span className={`edition-badge ${nft.available === 0 ? 'is-sold-out' : ''}`}>
          {nft.available > 0 ? `${nft.available} disponíveis` : 'Esgotado'}
        </span>
      </div>
      <div className="nft-card-copy">
        <div className="nft-card-top">
          <Link to="/nft/$id" params={{ id: nft.id }}>
            <h3>{nft.title}</h3>
          </Link>
        </div>
        <p className="creator-label">
          por <span>{nft.creator}</span>
        </p>
        <div className="nft-card-bottom">
          <div className="nft-card-price-group">
            <span className="overline">Preço</span>
            <strong className="eth-price">
              {nft.price} <span>ETH</span>
            </strong>
            {nft.previousPrice && (
              <span
                className="previous-price"
                aria-label={`Preço anterior ${nft.previousPrice} ETH`}
              >
                {nft.previousPrice} ETH
              </span>
            )}
          </div>
          <Link
            to="/nft/$id"
            params={{ id: nft.id }}
            className="card-arrow"
            aria-label={`Explorar ${nft.title}`}
          >
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </article>
  );
}
