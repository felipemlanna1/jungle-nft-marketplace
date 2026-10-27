import { useRef } from 'react';
import { multiplyEth, toWei } from '../../../../domain/money';
import type { OrderReceiptProps } from '../../shared-types';

export function useOrderReceipt({ order, onClose }: OrderReceiptProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const focusReceipt = (event: Event) => {
    event.preventDefault();
    contentRef.current?.focus();
  };
  const changeOpen = (open: boolean) => {
    if (!open) onClose();
  };
  const transactionLabel =
    order.transactionId.length > 15
      ? `${order.transactionId.slice(0, 6)}...${order.transactionId.slice(-4)}`
      : order.transactionId;
  const dateLabel = new Date(order.createdAt).toLocaleDateString('pt-BR');
  const hasDiscount = toWei(order.discount) > 0n;
  const items = order.items.map((item) => ({
    ...item,
    key: item.cartItemId ?? `${item.nftId}:${item.editionId ?? ''}`,
    total: multiplyEth(item.unitPrice, item.quantity),
  }));
  return { contentRef, focusReceipt, changeOpen, transactionLabel, dateLabel, hasDiscount, items };
}
