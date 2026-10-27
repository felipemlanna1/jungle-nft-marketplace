import { Link } from '@tanstack/react-router';
import type { AccountSidebarProps } from '../../shared-types';
import { useAccountSidebar } from './useAccountSidebar';
const unavailableItems = [
  ['Atividade', 'imgShopping1'],
  ['Lista de interesse', 'imgHeart1'],
  ['Ofertas', 'imgActivity'],
  ['Arquivos baixados', 'imgDownload'],
  ['Suporte', 'imgDangerTriangle'],
] as const;
export function AccountSidebar({ active }: AccountSidebarProps) {
  const { logout, error, pending } = useAccountSidebar();
  return (
    <aside className="collector-sidebar">
      <h2>Meu perfil</h2>
      <nav aria-label="Área do colecionador">
        <Link to="/profile" aria-current={active === 'profile' ? 'page' : undefined}>
          <span className="sidebar-icon">
            <img src="/figma/profile/imgUser.svg" alt="" />
          </span>
          Dados do perfil
        </Link>
        <Link to="/wallets" aria-current={active === 'wallets' ? 'page' : undefined}>
          <span className="sidebar-icon">
            <img src="/figma/profile/imgLocation.svg" alt="" />
          </span>
          Carteiras
        </Link>
        {unavailableItems.map(([label, asset]) => (
          <span
            className="sidebar-unavailable"
            key={label}
            aria-disabled="true"
            title="Não disponível nesta demonstração"
          >
            <span className="sidebar-icon">
              <img src={`/figma/profile/${asset}.svg`} alt="" />
            </span>
            {label}
          </span>
        ))}
        <button
          type="button"
          className="sidebar-logout"
          onClick={() => void logout()}
          disabled={pending}
        >
          <span className="sidebar-icon">
            <img src="/figma/profile/imgLogout1.svg" alt="" />
          </span>
          {pending ? 'Saindo…' : 'Sair'}
        </button>
      </nav>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </aside>
  );
}
