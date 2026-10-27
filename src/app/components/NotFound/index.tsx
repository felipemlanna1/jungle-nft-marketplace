import { Link } from '@tanstack/react-router';
import { Button } from '../../../styleguide';
export function NotFound() {
  return (
    <section className="page-shell empty-state">
      <h1>Página não encontrada</h1>
      <p>Explore o marketplace para encontrar sua próxima obra.</p>
      <Button asChild>
        <Link to="/">Explorar NFTs</Link>
      </Button>
    </section>
  );
}
