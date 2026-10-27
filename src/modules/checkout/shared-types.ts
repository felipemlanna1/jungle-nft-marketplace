import type { FormEvent } from 'react';
import type { CartItem, Order, Quote, WalletType, Network, Wallet } from '../../contracts';
export type { CartItem, Order, OrderItem, Quote } from '../../contracts';

export interface CartItemRowProps {
  item: CartItem;
  disabled: boolean;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export interface CartSummaryProps {
  coupon: string;
  draft: string;
  onDraftChange: (value: string) => void;
  onApply: (event: FormEvent) => void;
  onRemoveCoupon: () => void;
  quote?: Quote;
  pending: boolean;
  error?: string;
  onRetry: () => void;
}

export interface OrderReceiptProps {
  order: Order;
  onClose: () => void;
}

export interface OrderPageProps {
  id: string;
}

export interface CheckoutFields {
  username: string;
  profileName: string;
  ens: string;
  referralCode: string;
  notes: string;
  manualWallet: boolean;
  address: string;
  secondaryAddress: string;
  walletType: WalletType;
}

export interface CheckoutWalletsProps {
  wallets: Wallet[];
  selectedId: string;
  connected: boolean;
  disabled: boolean;
  pending: boolean;
  error?: string;
  onRetry: () => void;
  onSelect: (id: string) => void;
}

export interface CollectorFormProps {
  name: string;
  email: string;
  network: Network;
  wallets: Wallet[];
  walletId: string;
  fields: CheckoutFields;
  address: string;
  disabled: boolean;
  onName: (value: string) => void;
  onEmail: (value: string) => void;
  onNetwork: (value: Network) => void;
  onWallet: (value: string) => void;
  onField: <K extends keyof CheckoutFields>(field: K, value: CheckoutFields[K]) => void;
  onSubmit: (event: FormEvent) => void;
}

export interface OrderSummaryProps {
  quote?: Quote;
  pending?: boolean;
  estimatedFee?: boolean;
}

export interface CartChange {
  id: string;
  quantity: number;
  ownerId: string;
}
