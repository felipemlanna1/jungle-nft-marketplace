import type { Network } from '../../../../contracts';
import type { CheckoutFields, CollectorFormProps } from '../../shared-types';

export function CollectorForm(props: CollectorFormProps) {
  const { fields, onField } = props;
  return (
    <form id="collector-form" className="collector-form" onSubmit={props.onSubmit}>
      <fieldset disabled={props.disabled}>
        <legend>Perfil do colecionador</legend>
        <div className="collector-form-grid">
          <label className="field">
            Nome de exibição<span aria-hidden="true">*</span>
            <input
              className="input"
              aria-label="Nome completo"
              required
              maxLength={80}
              autoComplete="name"
              value={props.name}
              onChange={(event) => props.onName(event.target.value)}
            />
          </label>
          <label className="field">
            Nome de usuário<span aria-hidden="true">*</span>
            <input
              className="input"
              aria-label="Nome de usuário"
              required
              pattern="[A-Za-z0-9_.\-]{3,40}"
              value={fields.username}
              onChange={(event) => onField('username', event.target.value)}
            />
          </label>
          <label className="field">
            Rede<span aria-hidden="true">*</span>
            <select
              className="input"
              aria-label="Rede"
              value={props.network}
              onChange={(event) => props.onNetwork(event.target.value as Network)}
            >
              <option>Ethereum</option>
              <option>Polygon</option>
            </select>
          </label>
          <label className="field">
            Nome do perfil<span aria-hidden="true">*</span>
            <input
              className="input"
              aria-label="Nome do perfil"
              required
              maxLength={80}
              value={fields.profileName}
              onChange={(event) => onField('profileName', event.target.value)}
            />
          </label>
          <label className="field">
            Endereço da carteira<span aria-hidden="true">*</span>
            <input
              className="input"
              aria-label="Endereço da carteira da compra"
              required
              readOnly={!fields.manualWallet}
              pattern="0x[a-fA-F0-9]{40}"
              value={fields.manualWallet ? fields.address : props.address}
              onChange={(event) => onField('address', event.target.value)}
              placeholder="Endereço 0x da carteira"
            />
          </label>
          <label className="field">
            <span className="sr-only">Carteira secundária</span>
            <input
              className="input"
              aria-label="Carteira secundária"
              value={fields.secondaryAddress}
              onChange={(event) => onField('secondaryAddress', event.target.value)}
              placeholder="ENS ou carteira secundária (opcional)"
              maxLength={200}
            />
          </label>
          <label className="field">
            Tipo de carteira<span aria-hidden="true">*</span>
            <select
              className="input"
              value={fields.walletType}
              onChange={(event) =>
                onField('walletType', event.target.value as CheckoutFields['walletType'])
              }
            >
              <option>MetaMask</option>
              <option>WalletConnect</option>
              <option>Coinbase</option>
            </select>
          </label>
          <label className="field">
            Código de indicação
            <input
              className="input"
              aria-label="Código de indicação"
              value={fields.referralCode}
              onChange={(event) => onField('referralCode', event.target.value)}
              maxLength={40}
            />
          </label>
          <label className="field">
            E-mail<span aria-hidden="true">*</span>
            <input
              className="input"
              aria-label="E-mail"
              required
              type="email"
              maxLength={160}
              autoComplete="email"
              value={props.email}
              onChange={(event) => props.onEmail(event.target.value)}
            />
          </label>
          <label className="field">
            Nome ENS
            <input
              className="input"
              aria-label="Nome ENS da compra"
              placeholder="seunome.eth (opcional)"
              value={fields.ens}
              onChange={(event) => onField('ens', event.target.value)}
              maxLength={200}
            />
          </label>
        </div>
        <label className="manual-wallet-toggle">
          <input
            type="checkbox"
            checked={fields.manualWallet}
            onChange={(event) => onField('manualWallet', event.target.checked)}
          />{' '}
          Usar outra carteira?
        </label>
        {!fields.manualWallet && (
          <label className="field checkout-saved-wallet">
            Carteira salva
            <select
              className="input"
              value={props.walletId}
              onChange={(event) => props.onWallet(event.target.value)}
            >
              {props.wallets.map((wallet) => (
                <option value={wallet.id} key={wallet.id}>
                  {wallet.label} ({wallet.network})
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="field collector-notes">
          Observação do colecionador (opcional)
          <textarea
            className="input"
            aria-label="Observação do colecionador"
            maxLength={1000}
            value={fields.notes}
            onChange={(event) => onField('notes', event.target.value)}
          />
        </label>
      </fieldset>
    </form>
  );
}
