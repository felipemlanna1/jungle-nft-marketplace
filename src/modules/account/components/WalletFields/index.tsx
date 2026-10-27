import { Input } from '../../../../styleguide';
import type { Network, WalletType } from '../../../../contracts';
import type { WalletFieldsProps } from '../../shared-types';
import { EnsField } from '../EnsField';
export function WalletFields({ values, setField }: WalletFieldsProps) {
  return (
    <div className="collector-field-grid">
      <label className="field">
        Nome de exibição
        <Input
          maxLength={80}
          value={values.displayName}
          onChange={(event) => setField('displayName', event.target.value)}
        />
      </label>
      <label className="field">
        Nome da carteira
        <span className="required-mark" aria-hidden="true">
          *
        </span>
        <Input
          required
          aria-label="Nome da carteira"
          maxLength={60}
          value={values.label}
          onChange={(event) => setField('label', event.target.value)}
        />
      </label>
      <label className="field">
        Rede
        <span className="required-mark" aria-hidden="true">
          *
        </span>
        <select
          className="input"
          aria-label="Rede"
          value={values.network}
          onChange={(event) => setField('network', event.target.value as Network)}
        >
          <option>Ethereum</option>
          <option>Polygon</option>
        </select>
      </label>
      <label className="field">
        Nome do perfil
        <Input
          maxLength={80}
          value={values.profileName}
          onChange={(event) => setField('profileName', event.target.value)}
        />
      </label>
      <label className="field">
        Endereço da carteira
        <span className="required-mark" aria-hidden="true">
          *
        </span>
        <Input
          required
          aria-label="Endereço da carteira"
          placeholder="Endereço 0x da carteira"
          spellCheck={false}
          autoCapitalize="none"
          maxLength={42}
          value={values.address}
          onChange={(event) => setField('address', event.target.value)}
        />
      </label>
      <label className="field secondary-address-field">
        <span className="visually-hidden">ENS ou carteira secundária (opcional)</span>
        <Input
          placeholder="ENS ou carteira secundária (opcional)"
          maxLength={253}
          value={values.secondaryAddress}
          onChange={(event) => setField('secondaryAddress', event.target.value)}
        />
      </label>
      <label className="field">
        Tipo de carteira
        <select
          className="input"
          required
          aria-label="Tipo de carteira"
          value={values.walletType}
          onChange={(event) => setField('walletType', event.target.value as WalletType | '')}
        >
          <option value="">Selecione uma carteira</option>
          <option>MetaMask</option>
          <option>Coinbase</option>
          <option>WalletConnect</option>
        </select>
      </label>
      <label className="field">
        Código de indicação
        <Input
          maxLength={60}
          value={values.referralCode}
          onChange={(event) => setField('referralCode', event.target.value)}
        />
      </label>
      <label className="field">
        E-mail
        <Input
          type="email"
          autoComplete="email"
          maxLength={160}
          value={values.email}
          onChange={(event) => setField('email', event.target.value)}
        />
      </label>
      <EnsField
        id="wallet-ens-name"
        value={values.ens}
        onChange={(value) => setField('ens', value)}
      />
    </div>
  );
}
