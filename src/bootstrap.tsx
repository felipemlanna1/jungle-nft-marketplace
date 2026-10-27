import { createRoot, type Root } from 'react-dom/client';
import { BootstrapSkeleton } from './app/components/BootstrapSkeleton';

export function mountLoading(pathname: string): Root {
  const root = createRoot(document.getElementById('root')!);
  root.render(<BootstrapSkeleton pathname={pathname} />);
  return root;
}

export function showStartupFailure(root: Root) {
  root.render(
    <main className="page-shell empty-state">
      <h1>Não foi possível carregar a demonstração</h1>
      <p>Recarregue a página para tentar novamente.</p>
      <button className="button button-primary" onClick={() => location.reload()}>
        Recarregar
      </button>
    </main>,
  );
}
