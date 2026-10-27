import { Link } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';
import { QuantityInput } from '../../../../styleguide';
import { multiplyEth } from '../../../../domain/money';
import type { CartItemRowProps } from '../../shared-types';

export function CartItemRow({ item, disabled, onQuantityChange, onRemove }: CartItemRowProps) {
  return (
    <article className="commerce-cart-row">
      <div className="commerce-cart-item">
        <Link to="/nft/$id" params={{ id: item.nftId }} className="commerce-cart-image">
          <img src={item.nft.image} alt={item.nft.title} width="70" height="70" />
        </Link>
        <div>
          <h2>
            <Link to="/nft/$id" params={{ id: item.nftId }}>
              {item.nft.title}
            </Link>
          </h2>
          {item.nft.tokenId && <p className="cart-token-id">ID do token: #{item.nft.tokenId}</p>}
          <p className="cart-edition-label">
            {item.editionLabel ? `Edição: ${item.editionLabel}` : `Coleção: ${item.nft.collection}`}
          </p>
          {item.nft.available === 0 && <span className="field-error">Indisponível no momento</span>}
        </div>
      </div>
      <span className="commerce-cart-unit-price">
        <span className="sr-only">Preço unitário: </span>
        {item.nft.price} ETH
      </span>
      <div className="commerce-cart-quantity">
        <QuantityInput
          value={item.quantity}
          min={1}
          max={Math.max(1, item.nft.available)}
          onValueChange={onQuantityChange}
          label={`Edições de ${item.nft.title}${item.editionLabel ? `, ${item.editionLabel}` : ''}`}
          disabled={disabled || item.nft.available === 0}
        />
      </div>
      <strong className="commerce-cart-item-total">
        <span className="sr-only">Total do item: </span>
        {multiplyEth(item.nft.price, item.quantity)} ETH
      </strong>
      <button
        className="commerce-cart-remove"
        type="button"
        disabled={disabled}
        onClick={onRemove}
        aria-label={`Remover ${item.nft.title}${item.editionLabel ? `, ${item.editionLabel}` : ''}`}
      >
        <Trash2 size={22} strokeWidth={1.4} aria-hidden="true" />
      </button>
    </article>
  );
}
