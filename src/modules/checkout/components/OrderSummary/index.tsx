import type { OrderSummaryProps } from '../../shared-types';
export function Summary({ quote, pending = false, estimatedFee = false }: OrderSummaryProps) {
  if (pending)
    return (
      <div className="summary-skeleton" role="status" aria-label="Updating your total">
        <div />
        <div />
        <div />
      </div>
    );
  if (!quote) return null;
  return (
    <dl className="order-summary">
      <div className="price-line">
        <dt>Subtotal</dt>
        <dd>{quote.subtotal} ETH</dd>
      </div>
      <div className="price-line">
        <dt>Desconto</dt>
        <dd>−{quote.discount} ETH</dd>
      </div>
      <div className="price-line">
        <dt>Taxa de rede</dt>
        <dd className={estimatedFee ? 'estimated-network-fee' : undefined}>
          <span>{quote.networkFee} ETH</span>
          {estimatedFee && <small>Taxa estimada</small>}
        </dd>
      </div>
      <div className="price-line total">
        <dt>Total</dt>
        <dd>{quote.total} ETH</dd>
      </div>
    </dl>
  );
}
