import { Link } from '@tanstack/react-router';
import { Summary } from '../OrderSummary';
import type { CartSummaryProps } from '../../shared-types';

export function CartSummary({
  coupon,
  draft,
  onDraftChange,
  onApply,
  onRemoveCoupon,
  quote,
  pending,
  error,
  onRetry,
}: CartSummaryProps) {
  return (
    <aside className="commerce-cart-summary" aria-labelledby="cart-summary-title">
      <h2 id="cart-summary-title">Resumo da carteira</h2>
      <form className="commerce-coupon-form" onSubmit={onApply}>
        <label htmlFor="cart-coupon">Código promocional</label>
        <div>
          <input
            id="cart-coupon"
            aria-label="Cupom de desconto"
            placeholder="Digite o código promocional..."
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            maxLength={30}
            autoComplete="off"
          />
          <button type="submit" disabled={pending}>
            Aplicar
          </button>
        </div>
      </form>
      {coupon && (
        <button className="text-link" type="button" onClick={onRemoveCoupon}>
          Remover cupom {coupon}
        </button>
      )}
      {error && (
        <p role="alert" className="field-error">
          {error}{' '}
          <button className="text-link" type="button" onClick={onRetry}>
            Tentar novamente
          </button>
        </p>
      )}
      <div aria-live="polite">
        <Summary quote={quote} pending={pending} estimatedFee />
      </div>
      {quote && !error && (
        <Link
          className="button commerce-cart-checkout"
          to="/checkout"
          aria-disabled={pending}
          onClick={(event) => {
            if (pending) event.preventDefault();
          }}
        >
          Conectar e finalizar
        </Link>
      )}
      <Link to="/" className="commerce-cart-continue">
        Continuar explorando
      </Link>
      <p className="commerce-simulation-note sr-only">
        Compra simulada. Preços e disponibilidade serão conferidos ao finalizar.
      </p>
    </aside>
  );
}
