import { Link } from '@tanstack/react-router';
import { useAuthForm } from './useAuthForm';
export function AuthForm({ register }: { register: boolean }) {
  const { name, setName, email, setEmail, password, setSenha, redirect, mutation, submit, error } =
    useAuthForm(register);
  return (
    <section className="page-shell auth-shell">
      <div className="auth-art" aria-hidden="true">
        <span className="eyebrow">Uma nova economia criativa</span>
        <h2>
          Arte extraordinária.
          <br />
          Sua para colecionar.
        </h2>
        <div className="auth-orb" />
      </div>
      <section className="form-card auth-form" aria-labelledby="auth-title">
        <span className="eyebrow">Sua coleção começa aqui</span>
        <h1 id="auth-title">{register ? 'Crie sua conta' : 'Boas-vindas de volta'}</h1>
        <p className="muted">
          {register
            ? 'Conheça artistas. Encontre seu próximo favorito.'
            : 'Entre para continuar sua jornada de colecionador.'}
        </p>
        <form onSubmit={submit} className="stack">
          {register && (
            <label className="field">
              Nome completo
              <input
                className="input"
                autoComplete="name"
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}
          <label className="field">
            E-mail
            <input
              className="input"
              type="email"
              autoComplete="email"
              required
              maxLength={160}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="field">
            Senha
            <input
              className="input"
              type="password"
              autoComplete={register ? 'new-password' : 'current-password'}
              required
              minLength={register ? 8 : undefined}
              value={password}
              aria-describedby={register ? 'password-help auth-error' : 'auth-error'}
              onChange={(e) => setSenha(e.target.value)}
            />
          </label>
          {register && (
            <small id="password-help" className="muted">
              8+ caracteres, com maiúscula, minúscula e número.
            </small>
          )}
          <div id="auth-error" role={error ? 'alert' : undefined} className="field-error">
            {error}
          </div>
          <button className="button" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Aguarde…' : register ? 'Criar conta' : 'Entrar'}{' '}
            <span aria-hidden="true">→</span>
          </button>
        </form>
        <p>
          {register ? 'Já tem uma conta?' : 'Novo no Kurio?'}{' '}
          <Link to={register ? '/login' : '/register'} search={{ redirect }}>
            {register ? 'Entrar' : 'Crie sua conta'}
          </Link>
        </p>
        <aside className="notice demo-credentials">
          <strong>Conta de demonstração</strong>
          <span>collector@example.test</span>
          <code>Collect0r!Demo</code>
          <small>Contas, carteiras e compras são simuladas.</small>
        </aside>
      </section>
    </section>
  );
}
