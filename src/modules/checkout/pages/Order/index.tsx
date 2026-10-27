import { Link } from '@tanstack/react-router';
import { LoaderCircle, XCircle } from 'lucide-react';
import { messageOf } from '../../../account/hooks/useAccount';
import { OrderReceipt } from '../../components/OrderReceipt';
import type { OrderPageProps } from '../../shared-types';
import { useOrder } from './useOrder';

export function OrderPage({ id }: OrderPageProps) {
  const { session, order, close } = useOrder(id);
  if (session.isPending || order.isPending)
    return (
      <section className="commerce-order-state page-shell" role="status">
        <LoaderCircle size={38} aria-hidden="true" />
        <h1>Buscando seu pedido…</h1>
        <p>Estamos verificando a confirmação do pagamento simulado.</p>
      </section>
    );
  if (order.error || !order.data)
    return (
      <section className="commerce-order-state page-shell">
        <h1>Não foi possível carregar o pedido</h1>
        <p role="alert">{order.error ? messageOf(order.error) : 'Pedido não encontrado.'}</p>
        <button className="button" onClick={() => void order.refetch()}>
          Tentar novamente
        </button>
        <Link className="text-link" to="/cart">
          Voltar ao carrinho
        </Link>
      </section>
    );
  if (order.data.status === 'pending')
    return (
      <section className="commerce-order-state page-shell" aria-live="polite">
        <LoaderCircle size={38} aria-hidden="true" />
        <span className="eyebrow">Pedido {order.data.id}</span>
        <h1>Seu pedido está em processamento</h1>
        <p>
          Aguarde a confirmação do pagamento simulado. Atualizar esta página não cria outra compra.
        </p>
        <p>{order.isFetching ? 'Verificando status…' : 'Aguardando atualização do pedido…'}</p>
        <Link className="text-link" to="/">
          Continuar explorando
        </Link>
      </section>
    );
  if (order.data.status === 'refused')
    return (
      <section className="commerce-order-state page-shell" role="status">
        <XCircle size={38} aria-hidden="true" />
        <span className="eyebrow">Pedido {order.data.id}</span>
        <h1>Pagamento recusado</h1>
        <p>O pagamento simulado não foi aprovado. Nenhum item foi removido do seu carrinho.</p>
        <Link className="button" to="/cart">
          Revisar carrinho e tentar novamente
        </Link>
      </section>
    );
  return <OrderReceipt order={order.data} onClose={close} />;
}
