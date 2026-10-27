import { Button } from '../../../../styleguide';
import { messageOf } from '../../hooks/useAccount';
import { AccountSidebar } from '../../components/AccountSidebar';
import { WalletFields } from '../../components/WalletFields';
import { useWallets } from './useWallets';
export function WalletsPage() {
  const {
    ready,
    user,
    wallets,
    editor,
    values,
    setField,
    error,
    save,
    edit,
    add,
    submit,
    primaryWallet,
    secondaryWallets,
    sameAsPrimary,
    copyPrimary,
  } = useWallets();
  if (!user)
    return (
      <section className="page-shell">
        <p role="status">Carregando sua conta…</p>
      </section>
    );
  return (
    <section className="page-shell collector-account">
      <AccountSidebar active="wallets" />
      <div className="collector-content collector-wallets">
        <div className="collector-title-row">
          <h1>{editor.primary ? 'Carteira principal' : 'Carteira secundária'}</h1>
          <button
            type="button"
            className="collector-text-action"
            disabled={save.isPending || !ready}
            onClick={() => add(editor.primary)}
          >
            Adicionar
          </button>
        </div>
        <p className="collector-help">
          Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
        </p>
        {wallets.isPending && <p role="status">Carregando carteiras…</p>}
        {wallets.error && (
          <p role="alert" className="field-error">
            {messageOf(wallets.error)}{' '}
            <button type="button" onClick={() => void wallets.refetch()}>
              Tentar novamente
            </button>
          </p>
        )}
        <form className="collector-wallet-form" onSubmit={submit}>
          <fieldset disabled={save.isPending || !ready} className="wallet-fields-lock">
            <WalletFields values={values} setField={setField} />
          </fieldset>
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
          <Button className="collector-save" disabled={save.isPending || !ready}>
            {save.isPending ? 'Salvando…' : 'Salvar carteira'}
          </Button>
        </form>
        <section className="secondary-wallet-section" aria-labelledby="secondary-wallet-title">
          <div className="collector-title-row">
            <h2 id="secondary-wallet-title">Carteira secundária</h2>
            <div className="secondary-wallet-actions">
              <label className="checkbox-field">
                <input
                  type="radio"
                  name="secondary-wallet-mode"
                  checked={sameAsPrimary}
                  onChange={copyPrimary}
                  disabled={!primaryWallet || save.isPending || !ready}
                />
                Igual à carteira principal
              </label>
              <button
                type="button"
                className="collector-text-action"
                disabled={save.isPending || !ready}
                onClick={() => add(false)}
              >
                Adicionar
              </button>
            </div>
          </div>
          {secondaryWallets.length === 0 ? (
            <p className="collector-help">
              {sameAsPrimary
                ? 'A carteira principal está selecionada para suas compras.'
                : 'Você ainda não adicionou uma carteira secundária.'}
            </p>
          ) : (
            secondaryWallets.map((wallet) => (
              <article className="saved-wallet-row" key={wallet.id}>
                <div>
                  <h3>{wallet.label}</h3>
                  <p>
                    {wallet.network} · {wallet.address.slice(0, 8)}…{wallet.address.slice(-5)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  type="button"
                  disabled={save.isPending || !ready}
                  onClick={() => edit(wallet)}
                >
                  Editar {wallet.label}
                </Button>
              </article>
            ))
          )}
        </section>
        {!editor.primary && primaryWallet && (
          <Button
            variant="ghost"
            type="button"
            className="return-primary"
            disabled={save.isPending || !ready}
            onClick={() => edit(primaryWallet)}
          >
            Voltar à carteira principal
          </Button>
        )}
      </div>
    </section>
  );
}
