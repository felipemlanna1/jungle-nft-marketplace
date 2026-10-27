import { Link } from '@tanstack/react-router';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { ArrowLeft, Wallet } from 'lucide-react';
import { Button, Notice } from '../../../../styleguide';
import { multiplyEth } from '../../../../domain/money';
import { messageOf } from '../../../account/hooks/useAccount';
import { CollectorForm } from '../../components/CollectorForm';
import { Summary } from '../../components/OrderSummary';
import { useCheckout } from './useCheckout';

export function CheckoutPage() {
  const checkout = useCheckout();
  const {
    user,
    fields,
    setField,
    selectedWallet,
    mixedNetworks,
    connect,
    cart,
    quote,
    wallets,
    collectorName,
    setCollectorName,
    collectorEmail,
    setCollectorEmail,
    walletId,
    changeWallet,
    network,
    changeNetwork,
    connection,
    changeProvider,
    disconnect,
    declineConnection,
    review,
    editReview,
    error,
    pending,
    attempt,
    proceed,
    submitPurchase,
    recover,
  } = checkout;
  if (!user)
    return (
      <section className="page-shell">
        <p role="status">Carregando sua conta…</p>
      </section>
    );
  return (
    <section className="page-shell checkout-page commerce-page">
      <nav className="breadcrumbs" aria-label="Caminho da página">
        <Link to="/">Início</Link>
        <span>/</span>
        <Link to="/cart">Mercado</Link>
        <span>/</span>
        <span>Pagamento</span>
      </nav>
      <h1 className="sr-only">{review ? 'Revise sua compra' : 'Pagamento seguro'}</h1>
      {attempt && (
        <Notice>
          <strong>Uma tentativa anterior de compra foi salva.</strong>
          <p>Recupere o resultado antes de iniciar outro pedido.</p>
          <Button disabled={pending} onClick={() => void recover()}>
            {pending ? 'Recuperando…' : 'Recuperar compra anterior'}
          </Button>
        </Notice>
      )}
      {error && <Notice tone="error">{error}</Notice>}
      {mixedNetworks && (
        <Notice tone="error">
          O carrinho contém NFTs de redes diferentes. <Link to="/cart">Revise os itens.</Link>
        </Notice>
      )}
      {cart.error && (
        <Notice tone="error">
          {messageOf(cart.error)}{' '}
          <Button variant="ghost" onClick={() => void cart.refetch()}>
            Tentar novamente
          </Button>
        </Notice>
      )}
      {cart.data?.items.length === 0 && !attempt && (
        <div className="empty-state">
          <h2>Seu carrinho está vazio</h2>
          <Link to="/">Explorar marketplace</Link>
        </div>
      )}
      {!!cart.data?.items.length && (
        <div className="checkout-layout">
          <CollectorForm
            name={collectorName}
            email={collectorEmail}
            network={network}
            wallets={wallets.data ?? []}
            walletId={walletId}
            fields={fields}
            address={selectedWallet?.address ?? ''}
            disabled={pending || Boolean(attempt) || Boolean(review)}
            onName={setCollectorName}
            onEmail={setCollectorEmail}
            onNetwork={changeNetwork}
            onWallet={changeWallet}
            onField={setField}
            onSubmit={proceed}
          />
          <aside className="checkout-summary">
            <h2>Seus NFTs</h2>
            <div className="checkout-items-heading">
              <span>NFTs</span>
              <span>Subtotal</span>
            </div>
            <div className="checkout-items">
              {cart.data.items.map((item) => (
                <article key={item.id ?? item.nftId}>
                  <img src={item.nft.image} width="70" height="70" alt="" />
                  <div>
                    <strong>{item.nft.title}</strong>
                    <small>ID do token: {item.nft.tokenId ?? item.nftId}</small>
                    <span>
                      {item.editionLabel} (x {item.quantity})
                    </span>
                  </div>
                  <strong>{multiplyEth(item.nft.price, item.quantity)} ETH</strong>
                </article>
              ))}
            </div>
            <Link className="checkout-coupon-link" to="/cart">
              Tem um código promocional? Aplique aqui
            </Link>
            <Summary quote={review ?? quote.data} pending={quote.isPending} />
            {quote.error && <Notice tone="error">{messageOf(quote.error)}</Notice>}
            <fieldset
              className="checkout-providers"
              disabled={pending || Boolean(attempt) || Boolean(review)}
            >
              <legend>Carteira e rede</legend>
              <RadioGroup.Root
                aria-label="Provedor da carteira"
                value={fields.walletType}
                onValueChange={changeProvider}
              >
                {(['WalletConnect', 'MetaMask', 'Coinbase'] as const).map((provider) => (
                  <label key={provider}>
                    <RadioGroup.Item value={provider} aria-label={provider}>
                      <RadioGroup.Indicator />
                    </RadioGroup.Item>
                    <Wallet size={17} aria-hidden="true" />
                    <span>{provider === 'Coinbase' ? 'Coinbase Wallet' : provider}</span>
                  </label>
                ))}
              </RadioGroup.Root>
            </fieldset>
            <div className="wallet-connection" aria-live="polite">
              {connection === 'connected' ? (
                <>
                  <p>Carteira conectada (simulação).</p>
                  <button className="text-link" type="button" onClick={disconnect}>
                    Desconectar carteira
                  </button>
                </>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    type="button"
                    disabled={pending || mixedNetworks || (!walletId && !fields.manualWallet)}
                    onClick={() => void connect()}
                  >
                    Conectar carteira
                  </Button>
                  <button type="button" className="text-link" onClick={declineConnection}>
                    Simular recusa de conexão
                  </button>
                  {connection === 'declined' && (
                    <p role="alert">Conexão recusada. Você pode tentar novamente.</p>
                  )}
                </>
              )}
            </div>
            {review ? (
              <div className="checkout-review" role="region" aria-label="Revisão do pedido">
                <h2>Revise sua compra</h2>
                <p>{collectorName}</p>
                <p>{collectorEmail}</p>
                <p>
                  {selectedWallet?.label} · {network}
                </p>
                {quote.data?.fingerprint !== review.fingerprint && (
                  <Notice>A cotação mudou. Confirme novamente o valor atualizado.</Notice>
                )}
                <Button
                  disabled={pending || Boolean(attempt)}
                  onClick={() => void submitPurchase()}
                >
                  {pending ? 'Confirmando…' : 'Confirmar compra'}
                </Button>
                <Button variant="ghost" disabled={pending} onClick={editReview}>
                  Editar dados
                </Button>
              </div>
            ) : (
              <Button
                type="submit"
                form="collector-form"
                disabled={
                  !quote.data ||
                  Boolean(quote.error) ||
                  connection !== 'connected' ||
                  mixedNetworks ||
                  Boolean(attempt)
                }
              >
                Revisar compra
              </Button>
            )}
            <Link to="/cart" className="back-link">
              <ArrowLeft size={14} /> Voltar ao carrinho
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}
