import { Button } from '../../../../styleguide';
import { messageOf } from '../../hooks/useAccount';
import { PasswordField } from '../PasswordField';
import { usePasswordForm } from './usePasswordForm';
export function PasswordForm() {
  const {
    current,
    setCurrent,
    password,
    setPassword,
    confirm,
    setConfirm,
    error,
    mutation,
    submit,
  } = usePasswordForm();
  return (
    <section className="collector-password-section" aria-labelledby="password-section-title">
      <h2 id="password-section-title" className="visually-hidden">
        Alterar senha
      </h2>
      <form className="collector-password-form" onSubmit={submit}>
        <fieldset className="password-fields-lock" disabled={mutation.isPending}>
          <PasswordField
            label="Senha atual"
            autoComplete="current-password"
            required
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
          />
          <PasswordField
            label="Nova senha"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <PasswordField
            label="Confirmar nova senha"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
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
          {(current || password || confirm) && (
            <Button className="collector-save" disabled={mutation.isPending}>
              {mutation.isPending ? 'Atualizando…' : 'Atualizar senha'}
            </Button>
          )}
        </fieldset>
      </form>
    </section>
  );
}
