import { Link } from '@tanstack/react-router';
import { messageOf } from '../../../account/hooks/useAccount';
import { storeCoupon } from '../../hooks/useCart';
import { Summary } from '../../components/OrderSummary';
import { useCartPage } from './useCartPage';

export function CartPage() {
  const { cart, mutation, owner, coupon, setCoupon, draft, setDraft, quote, apply } = useCartPage();
  return (
    <section className="page-shell">
      <div className="flow-heading">
        <span className="eyebrow">Sua próxima coleção</span>
        <h1>Seu carrinho</h1>
        <p className="muted">Arte que merece um lugar na sua coleção.</p>
      </div>
      {cart.isPending && <p role="status">Carregando seu carrinho…</p>}
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
          <h2>Sua coleção está esperando</h2>
          <p>Descubra uma obra que fala com você.</p>
          <Link className="button" to="/">
            Explorar marketplace →
          </Link>
        </section>
      )}
      {!!cart.data?.items.length && (
        <div className="flow-grid">
          <section className="stack" aria-label="Itens no seu carrinho">
            {cart.data.items.map((item) => (
              <article className="cart-row form-card" key={item.nftId}>
                <Link to="/nft/$id" params={{ id: item.nftId }}>
                  <img src={item.nft.image} alt={item.nft.title} width="112" height="112" />
                </Link>
                <div className="cart-item-info">
                  <span className="eyebrow">{item.nft.collection}</span>
                  <h2>
                    <Link to="/nft/$id" params={{ id: item.nftId }}>
                      {item.nft.title}
                    </Link>
                  </h2>
                  <span className="muted">by {item.nft.creator}</span>
                  <strong className="price">{item.nft.price} ETH</strong>
                  <small className="muted">
                    {item.nft.available
                      ? `${item.nft.available} editions available`
                      : 'Indisponível no momento'}
                  </small>
                </div>
                <div className="cart-item-actions">
                  <label className="field">
                    Quantity for {item.nft.title}
                    <input
                      className="input quantity-input"
                      aria-label={`Quantity for ${item.nft.title}`}
                      type="number"
                      min={1}
                      max={Math.max(1, item.nft.available)}
                      value={item.quantity}
                      disabled={mutation.isPending}
                      onChange={(e) => {
                        const quantity = Number(e.target.value);
                        if (
                          Number.isInteger(quantity) &&
                          quantity >= 1 &&
                          quantity <= item.nft.available
                        )
                          mutation.mutate({ id: item.nftId, quantity });
                      }}
                    />
                  </label>
                  <button
                    className="button button-secondary"
                    disabled={mutation.isPending}
                    onClick={() => mutation.mutate({ id: item.nftId, quantity: 0 })}
                    aria-label={`Remover ${item.nft.title}`}
                  >
                    Remover
                  </button>
                </div>
              </article>
            ))}
            {mutation.error && (
              <p className="field-error" role="alert">
                {messageOf(mutation.error)}
              </p>
            )}
            <Link to="/" className="text-link">
              ← Continuar explorando
            </Link>
          </section>
          <aside className="summary-card form-card">
            <h2>Resumo do pedido</h2>
            <form className="coupon-form" onSubmit={apply}>
              <label className="field">
                Cupom de desconto
                <input
                  className="input"
                  placeholder="Experimente JUNGLE10"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={30}
                />
              </label>
              <button className="button button-secondary">Aplicar</button>
            </form>
            {coupon && (
              <button
                className="text-link"
                onClick={() => {
                  setCoupon('');
                  setDraft('');
                  storeCoupon(owner, '');
                }}
              >
                Remover cupom {coupon}
              </button>
            )}
            {quote.error && (
              <div role="alert" className="field-error">
                {messageOf(quote.error)}{' '}
                <button className="text-link" onClick={() => void quote.refetch()}>
                  Tentar novamente
                </button>
              </div>
            )}
            <div aria-live="polite">
              <Summary quote={quote.data} pending={quote.isFetching} />
            </div>
            {quote.data && !quote.error && (
              <Link className="button" to="/checkout">
                Continuar para pagamento →
              </Link>
            )}
            <p className="muted">
              <small>
                Preços e disponibilidade são conferidos antes da compra. Este marketplace é
                simulado.
              </small>
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}
