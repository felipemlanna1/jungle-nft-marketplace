import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { Scenario } from '../../contracts';
import { useScenarioPanel } from './useScenarioPanel';
import type { ScenarioPanelProps } from './shared-types';
import { DEMO_LOGIN } from '../../config/demo';
const scenarios: { value: Scenario; label: string }[] = [
  { value: 'default', label: 'Rede normal' },
  { value: 'slow', label: 'Rede lenta' },
  { value: 'empty', label: 'Catálogo vazio' },
  { value: 'offline', label: 'Sem conexão' },
  { value: 'server-error', label: 'Erro da API (503)' },
  { value: 'expired', label: 'Sessão expirada' },
  { value: 'payment-refused', label: 'Pagamento recusado' },
  { value: 'order-timeout', label: 'Timeout após criar pedido' },
];
export const ScenarioPanel = ({ open, onOpenChange, onCloseAutoFocus }: ScenarioPanelProps) => {
  const { scenario, message, busy, choose, reset, changeNft, replay, disconnect, reconnect } =
    useScenarioPanel();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content demo-dialog" onCloseAutoFocus={onCloseAutoFocus}>
          <div className="modal-heading">
            <Dialog.Title>Explore todos os estados</Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Close demo scenarios" className="button button-ghost button-icon">
                <X />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="muted">
            Marketplace simulado. Não use dados pessoais, carteiras ou senhas reais.
          </Dialog.Description>
          <label className="field">
            Rede e pagamento
            <select
              value={scenario}
              disabled={busy}
              onChange={(event) => void choose(event.target.value as Scenario)}
            >
              {scenarios.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <p className="muted">
            Conta: {DEMO_LOGIN.email}
            <br />
            Senha: {DEMO_LOGIN.password}
          </p>
          <div className="stack">
            <button
              className="button button-secondary"
              aria-label="Simulate an NFT price update"
              disabled={busy}
              onClick={() => void changeNft()}
            >
              Alterar preço de uma obra
            </button>
            <button
              className="button button-secondary"
              disabled={busy}
              onClick={() => void changeNft(true)}
            >
              Simular edição esgotada
            </button>
            <button
              className="button button-secondary"
              disabled={busy}
              onClick={() => void replay()}
            >
              Repetir eventos antigos e duplicados
            </button>
            <div className="form-grid">
              <button className="button button-secondary" onClick={disconnect}>
                Desconectar tempo real
              </button>
              <button className="button button-secondary" onClick={reconnect}>
                Reconectar tempo real
              </button>
            </div>
            <button
              className="button button-secondary"
              disabled={busy}
              onClick={() => void reset()}
            >
              Redefinir todos os dados
            </button>
          </div>
          <p role="status" aria-live="polite">
            {message}
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
