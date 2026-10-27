import { Link } from '@tanstack/react-router';
import { messageOf } from '../../hooks/useAccount';
import { PasswordForm } from '../../components/PasswordForm';
import { useProfile } from './useProfile';
export function ProfilePage() {
  const { session, name, setName, avatar, localError, save, submit, loadAvatar } = useProfile();
  if (session.isPending)
    return (
      <section className="page-shell">
        <p role="status">Carregando seu perfil…</p>
      </section>
    );
  if (!session.data)
    return (
      <section className="page-shell">
        <Link to="/login">Entrar</Link>
      </section>
    );
  return (
    <section className="page-shell">
      <div className="flow-heading">
        <span className="eyebrow">Sua conta</span>
        <h1>Perfil do colecionador</h1>
        <p className="muted">Uma coleção com a sua identidade.</p>
      </div>
      <div className="flow-grid">
        <section className="form-card">
          <h2>Dados pessoais</h2>
          <form className="stack" onSubmit={submit}>
            <div className="profile-avatar">
              {avatar ? (
                <img src={avatar} alt="Seu avatar" />
              ) : (
                <span aria-hidden="true">{session.data.name.slice(0, 1)}</span>
              )}
              <label className="button button-secondary">
                Enviar avatar
                <input
                  className="visually-hidden"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => loadAvatar(e.target.files?.[0])}
                />
              </label>
            </div>
            <label className="field">
              Nome de exibição
              <input
                className="input"
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="field">
              E-mail
              <input className="input" type="email" value={session.data.email} readOnly />
              <small className="muted">O e-mail de acesso não pode ser alterado aqui.</small>
            </label>
            {(localError || save.error) && (
              <p role="alert" className="field-error">
                {localError || messageOf(save.error)}
              </p>
            )}
            {save.isSuccess && (
              <p role="status" className="notice">
                Seu perfil foi salvo.
              </p>
            )}
            <button className="button" disabled={save.isPending}>
              {save.isPending ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </form>
        </section>
        <section className="form-card">
          <PasswordForm />
          <hr />
          <h2>Suas carteiras</h2>
          <p className="muted">Gerencie as carteiras das suas compras simuladas.</p>
          <Link className="button button-secondary" to="/wallets">
            Gerenciar carteiras →
          </Link>
        </section>
      </div>
    </section>
  );
}
