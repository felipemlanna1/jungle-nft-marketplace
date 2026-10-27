import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { messageOf } from '../../../account/hooks/useAccount';
import { RelatedNfts } from '../../../catalog/components/RelatedNfts';
import { CartItemRow } from '../../components/CartItemRow';
import { CartSummary } from '../../components/CartSummary';
import { useCartPage } from './useCartPage';

export function CartPage() {
  const {
    cart,
    mutation,
    coupon,
    draft,
    setDraft,
    quote,
    apply,
    removeCoupon,
    updateQuantity,
    removeItem,
    excludedIds,
  } = useCartPage();
  return (
    <>
      <section className="page-shell commerce-cart-page" aria-labelledby="cart-title">
        <nav className="commerce-cart-breadcrumb" aria-label="Localização">
          <Link to="/" aria-label="Voltar ao mercado">
            <ArrowLeft className="cart-mobile-back" size={20} aria-hidden="true" />
            <span className="cart-desktop-crumb">Início / Mercado / Carrinho</span>
          </Link>
          <span className="cart-mobile-title" aria-hidden="true">
            Carrinho de NFTs
          </span>
        </nav>
        <h1 className="sr-only" id="cart-title">
          Seu carrinho
        </h1>
        {cart.isPending && (
          <div className="commerce-cart-loading" role="status">
            Carregando seu carrinho…
          </div>
        )}
        {cart.error && (
          <div className="notice" role="alert">
            {messageOf(cart.error)}{' '}
            <button className="button button-secondary" onClick={() => void cart.refetch()}>
              Tentar novamente
            </button>
          </div>
        )}
        {cart.data?.items.length === 0 && (
          <section className="empty-state">
            <h2>Seu carrinho está vazio</h2>
            <p>Escolha uma obra para começar sua coleção.</p>
            <Link className="button" to="/">
              Explorar marketplace
            </Link>
          </section>
        )}
        {!!cart.data?.items.length && (
          <div className="commerce-cart-layout">
            <section className="commerce-cart-table" aria-label="Itens no seu carrinho">
              <div className="commerce-cart-table-heading" aria-hidden="true">
                <span>NFTs</span>
                <span>Preço</span>
                <span>Edições</span>
                <span>Total</span>
                <span />
              </div>
              <div className="commerce-cart-items">
                {cart.data.items.map((item) => (
                  <CartItemRow
                    key={item.id ?? item.nftId}
                    item={item}
                    disabled={mutation.isPending}
                    onQuantityChange={(quantity) => updateQuantity(item, quantity)}
                    onRemove={() => removeItem(item)}
                  />
                ))}
              </div>
              {mutation.error && (
                <p className="field-error" role="alert">
                  {messageOf(mutation.error)}
                </p>
              )}
            </section>
            <CartSummary
              coupon={coupon}
              draft={draft}
              onDraftChange={setDraft}
              onApply={apply}
              onRemoveCoupon={removeCoupon}
              quote={quote.data}
              pending={quote.isFetching}
              error={quote.error ? messageOf(quote.error) : undefined}
              onRetry={() => void quote.refetch()}
            />
          </div>
        )}
      </section>
      <div className="page-shell commerce-cart-related">
        <RelatedNfts title="Colecionadores também viram" excludeIds={excludedIds} />
      </div>
    </>
  );
}
