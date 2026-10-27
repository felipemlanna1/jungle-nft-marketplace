import * as Dialog from '@radix-ui/react-dialog';
import { Link } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { figmaAssets } from '../../../../assets/figma';
import { useOrderReceipt } from './useOrderReceipt';
import { Summary } from '../OrderSummary';
import type { OrderReceiptProps } from '../../shared-types';

export function OrderReceipt({ order, onClose }: OrderReceiptProps) {
  const { contentRef, focusReceipt, changeOpen, transactionLabel, dateLabel, hasDiscount, items } =
    useOrderReceipt({ order, onClose });
  return (
    <Dialog.Root open onOpenChange={changeOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="commerce-order-overlay" />
        <Dialog.Content
          ref={contentRef}
          onOpenAutoFocus={focusReceipt}
          className="commerce-order-dialog"
          aria-describedby="receipt-description"
        >
          <header className="commerce-receipt-header">
            <img src={figmaAssets.order.imgGroup} width="65" height="80" alt="" />
            <Dialog.Title asChild>
              <h1>Compra confirmada!</h1>
            </Dialog.Title>
          </header>
          <dl className="commerce-receipt-meta">
            <div>
              <dt>ID da transação</dt>
              <dd title={order.transactionId}>{transactionLabel}</dd>
            </div>
            <div>
              <dt>Data</dt>
              <dd>{dateLabel}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>{order.total} ETH</dd>
            </div>
            <div>
              <dt>Carteira</dt>
              <dd title={order.walletId}>{order.walletId}</dd>
            </div>
          </dl>
          <div className="commerce-receipt-body">
            <h2>Detalhes da transação</h2>
            <div className="commerce-receipt-table-heading" aria-hidden="true">
              <span>NFTs</span>
              <span>Edições</span>
              <span>Subtotal</span>
            </div>
            <div className="commerce-receipt-items">
              {items.map((item) => (
                <article className="commerce-receipt-item" key={item.key}>
                  <img src={item.image} alt={item.title} width="70" height="70" />
                  <div className="commerce-receipt-item-name">
                    <h3>{item.title}</h3>
                    {item.tokenId && (
                      <p className="receipt-token-id">ID do token: #{item.tokenId}</p>
                    )}
                    {item.editionLabel && (
                      <p className="receipt-edition-label">Edição: {item.editionLabel}</p>
                    )}
                  </div>
                  <span className="commerce-receipt-quantity">(x {item.quantity})</span>
                  <strong>{item.total} ETH</strong>
                </article>
              ))}
            </div>
            <div className={`commerce-receipt-totals ${hasDiscount ? '' : 'has-no-discount'}`}>
              <Summary quote={order} />
            </div>
            <Dialog.Description id="receipt-description" className="commerce-receipt-description">
              Compra simulada na rede {order.network}. Este comprovante preserva os valores da
              compra. Nenhuma transação real foi enviada à blockchain.
            </Dialog.Description>
            <Link className="button commerce-receipt-explore" to="/">
              Explorar mais NFTs
            </Link>
            <p className="commerce-receipt-order-id sr-only">Pedido {order.id}</p>
          </div>
          <Dialog.Close className="commerce-receipt-close" aria-label="Fechar comprovante">
            <X size={18} strokeWidth={1.4} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
