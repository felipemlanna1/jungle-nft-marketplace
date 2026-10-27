import { Button } from '../../../styleguide';
import { useErrorRecovery } from './useErrorRecovery';
export function RouteErrorFallback() {
  const { reload } = useErrorRecovery();
  return (
    <section className="page-shell empty-state" role="alert">
      <h1>Não foi possível mostrar esta página</h1>
      <p>Recarregue a página para tentar novamente.</p>
      <Button onClick={reload}>Recarregar página</Button>
    </section>
  );
}
