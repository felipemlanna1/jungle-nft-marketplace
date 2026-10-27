import type { Network } from '../../../../contracts';
import { messageOf } from '../../hooks/useAccount';
import { useWallets } from './useWallets';
export function WalletsPage() {
  const {
    user,
    wallets,
    editing,
    setEditing,
    label,
    setLabel,
    address,
    setAddress,
    network,
    setRede,
    primary,
    setPrincipal,
    error,
    save,
    edit,
    submit,
  } = useWallets();
  if (!user)
    return (
      <section className="page-shell">
        <p role="status">Carregando sua conta…</p>
      </section>
    );
  return (
    <section className="page-shell">
      <div className="flow-heading">
        <span className="eyebrow">Sua coleção, conectada</span>
        <h1>Minhas carteiras</h1>
        <p className="muted">
          Conexões são simuladas. Nunca informe uma frase de recuperação real.
        </p>
      </div>
      <div className="flow-grid">
        <section className="stack" aria-label="Carteiras salvas">
          {wallets.isPending && <p role="status">Carregando carteiras…</p>}
          {wallets.error && (
            <p role="alert">
              {messageOf(wallets.error)}{' '}
              <button className="button button-secondary" onClick={() => void wallets.refetch()}>
                Tentar novamente
              </button>
            </p>
          )}
          {wallets.data?.map((wallet) => (
            <article className="wallet-card form-card" key={wallet.id}>
              <span className="eyebrow">
                {wallet.network} {wallet.primary && '· Principal'}
              </span>
              <h2>{wallet.label}</h2>
              <p className="wallet-address">{wallet.address}</p>
              <button className="button button-secondary" onClick={() => edit(wallet)}>
                Edit {wallet.label}
              </button>
            </article>
          ))}
          {wallets.data?.length === 0 && (
            <div className="empty-state">Você ainda não tem carteiras salvas.</div>
          )}
        </section>
        <section className="form-card">
          <h2>{editing ? 'Editar carteira' : 'Adicionar carteira'}</h2>
          <form className="stack" onSubmit={submit}>
            <label className="field">
              Nome da carteira
              <input
                className="input"
                required
                maxLength={60}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </label>
            <label className="field">
              Endereço da carteira
              <input
                className="input"
                required
                placeholder="0x…"
                aria-label="Endereço da carteira"
                spellCheck={false}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                aria-describedby="wallet-help"
              />
              <small id="wallet-help" className="muted">
                Use um endereço fictício compatível com Ethereum.
              </small>
            </label>
            <label className="field">
              Rede
              <select
                className="input"
                value={network}
                onChange={(e) => setRede(e.target.value as Network)}
              >
                <option>Ethereum</option>
                <option>Polygon</option>
              </select>
            </label>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={primary}
                onChange={(e) => setPrincipal(e.target.checked)}
              />{' '}
              Usar como minha carteira principal
            </label>
            {(error || save.error) && (
              <p role="alert" className="field-error">
                {error || messageOf(save.error)}
              </p>
            )}
            {save.isSuccess && (
              <p role="status" className="notice">
                Carteira salva.
              </p>
            )}
            <button className="button" disabled={save.isPending}>
              {save.isPending ? 'Salvando…' : editing ? 'Salvar carteira' : 'Adicionar carteira'}
            </button>
            {editing && (
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  setEditing(null);
                  setLabel('');
                  setAddress('');
                }}
              >
                Cancelar edição
              </button>
            )}
          </form>
        </section>
      </div>
    </section>
  );
}
