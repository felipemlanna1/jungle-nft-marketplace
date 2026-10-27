import { Link, Outlet } from '@tanstack/react-router';
import { Button } from '../../../styleguide';
import { useSessionGuard } from './useSessionGuard';

export function SessionGuard() {
  const { access, returnTo, retry } = useSessionGuard();
  if (access === 'loading')
    return (
      <section className="page-shell" aria-busy="true">
        <p role="status">Verificando sua sessão…</p>
      </section>
    );
  if (access === 'unavailable')
    return (
      <section className="page-shell empty-state" role="alert">
        <h1>Não foi possível verificar sua sessão</h1>
        <p>Verifique sua conexão e tente novamente. Nenhuma alteração foi confirmada.</p>
        <Button onClick={() => void retry()}>Tentar novamente</Button>
      </section>
    );
  if (access === 'guest')
    return (
      <section className="page-shell empty-state">
        <h1>Continue com sua conta de colecionador</h1>
        <p>Entre para acessar suas carteiras e acompanhar seus pedidos.</p>
        <Button asChild>
          <Link to="/login" search={{ redirect: returnTo }}>
            Entrar para continuar
          </Link>
        </Button>
      </section>
    );
  return <Outlet />;
}
