import { messageOf } from '../../hooks/useAccount';
import { usePasswordForm } from './usePasswordForm';
export function PasswordForm() {
  const { current, setCurrent, password, setSenha, confirm, setConfirm, error, mutation, submit } =
    usePasswordForm();
  return (
    <>
      <h2>Alterar senha</h2>
      <form className="stack" onSubmit={submit}>
        <label className="field">
          Senha atual
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </label>
        <label className="field">
          Nova senha
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setSenha(e.target.value)}
          />
        </label>
        <label className="field">
          Confirmar nova senha
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>
        {(error || mutation.error) && (
          <p role="alert" className="field-error">
            {error || messageOf(mutation.error)}
          </p>
        )}
        {mutation.isSuccess && (
          <p role="status" className="notice">
            Senha atualizada.
          </p>
        )}
        <button className="button button-secondary" disabled={mutation.isPending}>
          {mutation.isPending ? 'Atualizando…' : 'Atualizar senha'}
        </button>
      </form>
    </>
  );
}
