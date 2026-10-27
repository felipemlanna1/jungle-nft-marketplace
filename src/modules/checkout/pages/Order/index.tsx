import { Link } from '@tanstack/react-router';
import { messageOf } from '../../../account/hooks/useAccount';
import { Summary } from '../../components/OrderSummary';
import { useOrder } from './useOrder';
export function OrderPage({ id }: { id: string }) {
  const { session, order } = useOrder(id);
  if (session.isPending || order.isPending)
    return (
      <section className="page-shell">
        <div className="empty-state" role="status">
          <h1>Buscando seu pedido…</h1>
          <p className="muted">Estamos verificando a confirmação do pagamento simulado.</p>
        </div>
      </section>
    );
  if (order.error || !order.data)
    return (
      <section className="page-shell">
        <section className="empty-state">
          <h1>Não foi possível carregar o pedido</h1>
          <p role="alert">{order.error ? messageOf(order.error) : 'Pedido não encontrado.'}</p>
          <button className="button" onClick={() => void order.refetch()}>
            Tentar novamente
          </button>
          <Link className="text-link" to="/cart">
            Voltar ao carrinho
          </Link>
        </section>
      </section>
    );
  const value = order.data;
  if (value.status === 'pending')
    return (
      <section className="page-shell">
        <section className="receipt-card form-card" aria-live="polite">
          <span className="eyebrow">Pedido {value.id}</span>
          <div className="pending-orb" aria-hidden="true">
            ◌
          </div>
          <h1>Seu pedido está em processamento</h1>
          <p>
            Aguarde a confirmação do pagamento simulado. Você pode atualizar esta página com
            segurança: isso não cria outra compra.
          </p>
          <p className="muted">
            {order.isFetching ? 'Verificando status…' : 'Aguardando atualização do pedido…'}
          </p>
          <Link className="text-link" to="/">
            Continuar explorando
          </Link>
        </section>
      </section>
    );
  if (value.status === 'refused')
    return (
      <section className="page-shell">
        <section className="receipt-card form-card" role="status">
          <span className="eyebrow">Pedido {value.id}</span>
          <h1>Pagamento recusado</h1>
          <p>O pagamento simulado não foi aprovado. Nenhum item foi removido do seu carrinho.</p>
          <Link className="button" to="/cart">
            Revisar carrinho e tentar novamente
          </Link>
        </section>
      </section>
    );
  return (
    <section className="page-shell">
      <section className="receipt-card form-card">
        <div className="success-mark" aria-hidden="true">
          ✓
        </div>
        <span className="eyebrow">Sua coleção ganhou uma nova história</span>
        <h1>Compra confirmada!</h1>
        <p className="muted">
          Seu pagamento simulado foi confirmado. Este recibo preserva os valores do momento da
          compra.
        </p>
        <dl className="receipt-meta">
          <div>
            <dt>Pedido</dt>
            <dd>{value.id}</dd>
          </div>
          <div>
            <dt>Data</dt>
            <dd>{new Date(value.createdAt).toLocaleString('pt-BR')}</dd>
          </div>
          <div>
            <dt>Rede</dt>
            <dd>{value.network}</dd>
          </div>
          <div>
            <dt>Transação simulada</dt>
            <dd className="transaction-id">{value.transactionId}</dd>
          </div>
        </dl>
        <div className="review-items">
          {value.items.map((item) => (
            <article className="cart-row compact" key={item.nftId}>
              <img src={item.image} alt={item.title} width="72" height="72" />
              <div>
                <h2>{item.title}</h2>
                <p className="muted">
                  {item.quantity} × {item.unitPrice} ETH
                </p>
              </div>
            </article>
          ))}
        </div>
        <Summary quote={value} />
        <p className="muted">
          <small>
            Este marketplace não realiza transações reais de blockchain ou de pagamento.
          </small>
        </p>
        <Link className="button" to="/">
          Explorar mais NFTs →
        </Link>
      </section>
    </section>
  );
}
