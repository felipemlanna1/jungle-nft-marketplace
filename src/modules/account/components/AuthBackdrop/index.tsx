import { CatalogPage } from '../../../catalog';
export function AuthBackdrop() {
  return (
    <div className="auth-backdrop" aria-hidden="true" inert>
      <CatalogPage />
    </div>
  );
}
