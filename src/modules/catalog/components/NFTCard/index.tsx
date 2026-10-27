import { Link } from '@tanstack/react-router';
import { ArrowRight, Check, Heart } from 'lucide-react';
import type { NFTCardProps } from '../../shared-types';
export function NFTCard({ nft, favorite, onFavorite, busy }: NFTCardProps) {
  return (
    <article className="nft-card">
      <div className="nft-card-image">
        <Link to="/nft/$id" params={{ id: nft.id }} aria-label={`Ver ${nft.title}`}>
          <img
            src={nft.image}
            alt={nft.title}
            width="480"
            height="480"
            loading="lazy"
            decoding="async"
          />
        </Link>
        <button
          type="button"
          className={`favorite-button ${favorite ? 'is-favorite' : ''}`}
          aria-label={`${favorite ? 'Remover' : 'Adicionar'} ${nft.title} ${favorite ? 'dos' : 'aos'} favoritos`}
          aria-pressed={favorite}
          onClick={onFavorite}
          disabled={busy}
        >
          <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
        </button>
        <span className="edition-badge">
          {nft.available > 0 ? `${nft.available} disponíveis` : 'Esgotado'}
        </span>
      </div>
      <div className="nft-card-copy">
        <div className="nft-card-top">
          <Link to="/nft/$id" params={{ id: nft.id }}>
            <h3>{nft.title}</h3>
          </Link>
          <span className="verified" title="Coleção verificada">
            <Check size={10} strokeWidth={3} />
          </span>
        </div>
        <p className="creator-label">
          por <span>{nft.creator}</span>
        </p>
        <div className="nft-card-bottom">
          <div>
            <span className="overline">Preço atual</span>
            <strong className="eth-price">
              {nft.price} <span>ETH</span>
            </strong>
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
