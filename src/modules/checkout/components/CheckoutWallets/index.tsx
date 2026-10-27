import { Link } from '@tanstack/react-router';
import * as RadioGroup from '@radix-ui/react-radio-group';
import type { CheckoutWalletsProps } from '../../shared-types';
import { Button, Notice } from '../../../../styleguide';

export function CheckoutWallets({
  wallets,
  selectedId,
  connected,
  disabled,
  pending,
  error,
  onRetry,
  onSelect,
}: CheckoutWalletsProps) {
  return (
    <section className="checkout-wallets" aria-labelledby="checkout-wallets-title">
      <div className="checkout-wallets-heading">
        <h2 id="checkout-wallets-title">{connected ? 'Carteira conectada' : 'Suas carteiras'}</h2>
        <Link to="/wallets">Trocar carteira</Link>
      </div>
      {pending ? (
        <p role="status">Carregando carteiras…</p>
      ) : error ? (
        <Notice tone="error">
          {error}
          <Button variant="ghost" onClick={onRetry}>
            Tentar novamente
          </Button>
        </Notice>
      ) : wallets.length ? (
        <RadioGroup.Root
          aria-label="Carteira da compra"
          value={selectedId}
          onValueChange={onSelect}
          disabled={disabled}
        >
          {wallets.map((wallet) => (
            <label className="checkout-wallet-option" key={wallet.id}>
              <RadioGroup.Item value={wallet.id} aria-label={wallet.label}>
                <RadioGroup.Indicator />
              </RadioGroup.Item>
              <span>
                <strong>{wallet.label}</strong>
                <span>
                  {wallet.ens || `${wallet.address.slice(0, 6)}…${wallet.address.slice(-4)}`}
                </span>
                <span>
                  {wallet.network === 'Ethereum' ? 'Rede principal Ethereum' : 'Rede Polygon'}
                </span>
              </span>
            </label>
          ))}
        </RadioGroup.Root>
      ) : (
        <Link className="checkout-wallet-option" to="/wallets">
          Adicionar carteira
        </Link>
      )}
    </section>
  );
}
