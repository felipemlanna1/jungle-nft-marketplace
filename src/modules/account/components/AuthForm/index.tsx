import { Link } from '@tanstack/react-router';
import * as Dialog from '@radix-ui/react-dialog';
import { Button, Input } from '../../../../styleguide';
import type { AuthFormProps } from '../../shared-types';
import { PasswordField } from '../PasswordField';
import { AuthBackdrop } from '../AuthBackdrop';
import { SocialOptions } from '../SocialOptions';
import { useAuthForm } from './useAuthForm';
export function AuthForm({ register }: AuthFormProps) {
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirm,
    setConfirm,
    redirect,
    mutation,
    submit,
    unavailable,
    close,
    error,
    favoriteId,
    fillDemoLogin,
    demoFilled,
    canContinue,
    continueToMarketplace,
  } = useAuthForm(register);
  return (
    <section className={`auth-screen ${register ? 'auth-register' : 'auth-login'}`}>
      <AuthBackdrop />
      <Dialog.Root
        open
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="account-auth-overlay" />
          <Dialog.Content className={`account-auth-card ${register ? 'is-register' : ''}`}>
            <Dialog.Close className="auth-close" aria-label="Fechar e voltar ao início">
              <img src="/figma/login/imgX.svg" alt="" />
            </Dialog.Close>
            <span className="auth-mobile-brand" aria-hidden="true">
              KURIO
            </span>
            <nav className="auth-tabs" aria-label="Acesso à conta">
              <Link
                to="/login"
                search={{ redirect, favorite: favoriteId }}
                aria-current={!register ? 'page' : undefined}
              >
                Entrar
              </Link>
              <span aria-hidden="true">|</span>
              <Link
                to="/register"
                search={{ redirect, favorite: favoriteId }}
                aria-current={register ? 'page' : undefined}
              >
                Criar conta
              </Link>
            </nav>
            <Dialog.Title className="auth-mobile-title">
              {register ? 'Criar perfil de colecionador' : 'Entrar'}
            </Dialog.Title>
            <Dialog.Description className="auth-description">
              {register
                ? 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.'
                : 'Entre para gerenciar sua carteira, coleção e perfil de criador.'}
            </Dialog.Description>
            {favoriteId && (
              <p className="auth-favorite-context">
                Entre para salvar a obra selecionada nos seus favoritos e voltar à sua seleção.
              </p>
            )}
            <form onSubmit={submit} className="auth-fields">
              {register && (
                <label className="field">
                  <span className="visually-hidden">Nome completo</span>
                  <Input
                    autoComplete="name"
                    required
                    maxLength={80}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Nome de usuário"
                  />
                </label>
              )}
              <label className="field">
                <span className="visually-hidden">E-mail</span>
                <Input
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={160}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Digite seu e-mail"
                />
              </label>
              <PasswordField
                label="Senha"
                hideLabel
                placeholder="Senha"
                autoComplete={register ? 'new-password' : 'current-password'}
                required
                minLength={register ? 8 : undefined}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-describedby={error ? 'auth-error' : undefined}
              />
              {register && (
                <PasswordField
                  label="Confirmar senha"
                  hideLabel
                  placeholder="Confirmar senha"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                />
              )}
              {!register && (
                <>
                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() => unavailable('Recuperação de senha')}
                  >
                    Esqueceu sua senha?
                  </button>
                  <div className="auth-demo-access">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={fillDemoLogin}
                      disabled={mutation.isPending}
                    >
                      Usar conta de demonstração
                    </Button>
                    <p role={demoFilled ? 'status' : undefined}>
                      {demoFilled
                        ? 'Credenciais preenchidas. Se você já alterou a senha, informe a senha atual antes de entrar.'
                        : 'Preenche as credenciais fictícias. Depois, selecione Entrar. Não use dados pessoais.'}
                    </p>
                  </div>
                </>
              )}
              {error && (
                <p id="auth-error" role="alert" className="field-error auth-error">
                  {error}
                </p>
              )}
              <Button className="auth-submit" type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  'Aguarde…'
                ) : register ? (
                  <>
                    <span className="auth-desktop-copy">Criar conta</span>
                    <span className="auth-mobile-copy">Criar perfil</span>
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
              {canContinue && (
                <Button type="button" variant="secondary" onClick={continueToMarketplace}>
                  Continuar para o marketplace
                </Button>
              )}
            </form>
            <SocialOptions onSelect={unavailable} />
            <p className="auth-mobile-footer">
              {register ? 'Já tem uma conta? ' : 'Novo na Kurio? '}
              <Link
                to={register ? '/login' : '/register'}
                search={{ redirect, favorite: favoriteId }}
              >
                {register ? 'Entre' : 'Crie uma conta'}
              </Link>
            </p>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
