import { Link } from '@tanstack/react-router';
import type { Network } from '../../../../contracts';
import { messageOf } from '../../../account/hooks/useAccount';
import { Summary } from '../../components/OrderSummary';
import { useCheckout } from './useCheckout';

export function CheckoutPage() {
  const {
    user,
    cart,
    quote,
    wallets,
    collectorName,
    setCollectorName,
    collectorEmail,
    setCollectorEmail,
    walletId,
    setWalletId,
    network,
    setRede,
    connection,
    setConnection,
    review,
    setReview,
    error,
    pending,
    attempt,
    proceed,
    submitPurchase,
    recover,
  } = useCheckout();
  if (!user)
    return (
      <section className="page-shell">
        <p role="status">Carregando sua conta…</p>
      </section>
    );
  return (
    <section className="page-shell">
      <div className="flow-heading">
        <span className="eyebrow">O último passo</span>
        <h1>{review ? 'Revise sua compra' : 'Pagamento seguro'}</h1>
        <p className="muted">
          Carteiras e pagamentos simulados. Nenhum valor real será movimentado.
        </p>
      </div>
      {attempt && (
        <aside className="notice" role="status">
          <strong>Uma tentativa anterior de compra foi salva.</strong>
          <p>Recupere o status para evitar uma compra duplicada.</p>
          <button className="button" disabled={pending} onClick={() => void recover()}>
            {pending ? 'Recuperando…' : 'Recuperar compra anterior'}
          </button>
        </aside>
      )}
      {error && (
        <div className="notice field-error" role="alert">
          {error}
        </div>
      )}
      {cart.error && (
        <p role="alert">
          {messageOf(cart.error)}{' '}
          <button className="text-link" onClick={() => void cart.refetch()}>
            Tentar novamente
          </button>
        </p>
      )}
      {cart.data?.items.length === 0 && !attempt && (
        <section className="empty-state">
          <h2>Seu carrinho está vazio</h2>
          <Link className="button" to="/">
            Explorar marketplace
          </Link>
        </section>
      )}
      {!!cart.data?.items.length && (
        <div className="flow-grid">
          <section className="form-card">
            {!review ? (
              <form className="stack" onSubmit={proceed}>
                <h2>Dados do colecionador</h2>
                <label className="field">
                  Nome completo
                  <input
                    className="input"
                    required
                    maxLength={80}
                    autoComplete="name"
                    value={collectorName}
                    onChange={(e) => setCollectorName(e.target.value)}
                  />
                </label>
                <label className="field">
                  E-mail
                  <input
                    className="input"
                    type="email"
                    required
                    maxLength={160}
                    autoComplete="email"
                    value={collectorEmail}
                    onChange={(e) => setCollectorEmail(e.target.value)}
                  />
                </label>
                <h2>Escolha sua carteira</h2>
                {wallets.isPending && <p role="status">Carregando carteiras…</p>}
                {wallets.error && <p role="alert">{messageOf(wallets.error)}</p>}
                {wallets.data?.length === 0 ? (
                  <p>
                    Adicione uma carteira para continuar.{' '}
                    <Link to="/wallets">Gerenciar carteiras</Link>
                  </p>
                ) : (
                  <label className="field">
                    Carteira salva
                    <select
                      className="input"
                      value={walletId}
                      onChange={(e) => {
                        setWalletId(e.target.value);
                        const wallet = wallets.data?.find((w) => w.id === e.target.value);
                        if (wallet) setRede(wallet.network);
                        setConnection('idle');
                      }}
                    >
                      {wallets.data?.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.label} ({w.network})
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <label className="field">
                  Rede
                  <select
                    className="input"
                    value={network}
                    onChange={(e) => {
                      setRede(e.target.value as Network);
                      setConnection('idle');
                    }}
                  >
                    <option>Ethereum</option>
                    <option>Polygon</option>
                  </select>
                </label>
                <div className="wallet-connection" aria-live="polite">
                  {connection === 'connected' ? (
                    <>
                      <p className="notice">Carteira conectada (simulação).</p>
                      <button
                        className="button button-secondary"
                        type="button"
                        onClick={() => setConnection('idle')}
                      >
                        Desconectar carteira
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="button button-secondary"
                        disabled={!walletId}
                        onClick={() => setConnection('connected')}
                      >
                        Conectar carteira
                      </button>
                      <button
                        type="button"
                        className="text-link"
                        onClick={() => setConnection('declined')}
                      >
                        Simular recusa de conexão
                      </button>
                      {connection === 'declined' && (
                        <p role="alert">
                          Conexão recusada. Tente conectar novamente quando estiver pronto.
                        </p>
                      )}
                    </>
                  )}
                </div>
                <button
                  className="button"
                  disabled={!quote.data || !!quote.error || connection !== 'connected' || !!attempt}
                >
                  Revisar compra →
                </button>
              </form>
            ) : (
              <div className="stack">
                <h2>Está tudo certo?</h2>
                <p>
                  Colecionando como <strong>{collectorName}</strong>
                  <br />
                  <span className="muted">{collectorEmail}</span>
                </p>
                <p>
                  Carteira: <strong>{wallets.data?.find((w) => w.id === walletId)?.label}</strong> ·{' '}
                  {network}
                </p>
                <div className="review-items">
                  {review.items.map((item) => (
                    <div className="cart-row compact" key={item.nftId}>
                      <img src={item.image} width="64" height="64" alt="" />
                      <div>
                        <strong>{item.title}</strong>
                        <p className="muted">
                          {item.quantity} × {item.unitPrice} ETH
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {quote.data && quote.data.fingerprint !== review.fingerprint && (
                  <p className="notice" role="status">
                    A cotação mudou. Mostraremos o valor atualizado antes de solicitar outra
                    confirmação.
                  </p>
                )}
                <button
                  className="button"
                  disabled={pending || !!attempt}
                  onClick={() => void submitPurchase()}
                >
                  {pending ? 'Confirmando…' : 'Confirmar compra'}
                </button>
                <button
                  className="button button-secondary"
                  disabled={pending}
                  onClick={() => setReview(null)}
                >
                  Editar dados
                </button>
              </div>
            )}
          </section>
          <aside className="form-card summary-card">
            <h2>Resumo do pedido</h2>
            <Summary quote={review ?? quote.data} pending={quote.isPending} />
            {quote.error && (
              <p className="field-error" role="alert">
                {messageOf(quote.error)}
              </p>
            )}
            <p className="muted">
              O pedido só é concluído após a confirmação do pagamento simulado. Os preços são
              revalidados antes do envio.
            </p>
            <Link to="/cart" className="text-link">
              ← Voltar ao carrinho
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}
