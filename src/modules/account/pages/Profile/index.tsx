import { Input, Button } from '../../../../styleguide';
import { messageOf } from '../../hooks/useAccount';
import { PasswordForm } from '../../components/PasswordForm';
import { AccountSidebar } from '../../components/AccountSidebar';
import { EnsField } from '../../components/EnsField';
import { useProfile } from './useProfile';
export function ProfilePage() {
  const { ready, session, values, setField, localError, save, submit, loadAvatar } = useProfile();
  if (!session.data)
    return (
      <section className="page-shell">
        <p role="status">Carregando seu perfil…</p>
      </section>
    );
  return (
    <section className="page-shell collector-account">
      <AccountSidebar active="profile" />
      <div className="collector-content">
        <h1>Perfil do colecionador</h1>
        <form id="collector-profile-form" className="collector-profile-form" onSubmit={submit}>
          <fieldset className="collector-field-grid" disabled={save.isPending || !ready}>
            <label className="field">
              Nome de exibição
              <span className="required-mark" aria-hidden="true">
                *
              </span>
              <Input
                required
                aria-label="Nome de exibição"
                maxLength={80}
                autoComplete="name"
                value={values.name}
                onChange={(event) => setField('name', event.target.value)}
              />
            </label>
            <label className="field">
              Nome de usuário
              <span className="required-mark" aria-hidden="true">
                *
              </span>
              <Input
                required
                aria-label="Nome de usuário"
                minLength={3}
                maxLength={40}
                autoComplete="username"
                pattern="[A-Za-z0-9._\-]{3,40}"
                value={values.username}
                onChange={(event) => setField('username', event.target.value)}
              />
            </label>
            <label className="field">
              E-mail
              <span className="required-mark" aria-hidden="true">
                *
              </span>
              <Input
                required
                aria-label="E-mail"
                type="email"
                maxLength={160}
                autoComplete="email"
                value={values.email}
                onChange={(event) => setField('email', event.target.value)}
              />
            </label>
            <EnsField value={values.ens} onChange={(value) => setField('ens', value)} />
            <label className="field">
              Apelido da carteira
              <Input
                maxLength={60}
                value={values.walletNickname}
                onChange={(event) => setField('walletNickname', event.target.value)}
              />
            </label>
            <div className="collector-avatar-field">
              <span>Avatar</span>
              <div className="collector-avatar-controls">
                {values.avatar ? (
                  <img className="collector-avatar" src={values.avatar} alt="Seu avatar" />
                ) : (
                  <span className="collector-avatar collector-avatar-placeholder">
                    <img src="/figma/profile/imgImage2.svg" alt="" />
                  </span>
                )}
                <label className="avatar-upload button button-secondary">
                  Alterar
                  <input
                    className="visually-hidden"
                    aria-label="Alterar avatar"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => loadAvatar(event.target.files?.[0])}
                  />
                </label>
                <Button
                  variant="ghost"
                  type="button"
                  className="avatar-remove"
                  onClick={() => setField('avatar', '')}
                  disabled={!values.avatar}
                  title={!values.avatar ? 'Não há avatar para remover.' : 'Remover avatar'}
                >
                  Remover
                </Button>
              </div>
            </div>
          </fieldset>
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
        </form>
        <PasswordForm />
        <Button
          className="collector-save collector-profile-save"
          form="collector-profile-form"
          aria-label="Salvar alterações"
          disabled={save.isPending || !ready}
        >
          {save.isPending ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </section>
  );
}
