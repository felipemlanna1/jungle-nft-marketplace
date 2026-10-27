import type { MobileNavigationProps } from '../shared-types';
import { figmaAssets } from '../../../assets/figma';
import { Link } from '@tanstack/react-router';
import { Grid2X2 } from 'lucide-react';

export function MobileNavigation({ count, signedIn, onMenu, onFavorites }: MobileNavigationProps) {
  return (
    <nav className="mobile-bottom-nav" aria-label="Navegação móvel">
      <Link to="/" search={{}} aria-label="Início">
        <img src={figmaAssets['mobile-home'].imgHome} width="19" height="19" alt="" />
      </Link>
      <button type="button" onClick={onFavorites} aria-label="Lista de interesse">
        <img src={figmaAssets['mobile-home'].imgVector1} width="20" height="18" alt="" />
      </button>
      <button
        className="mobile-nav-center"
        type="button"
        onClick={onMenu}
        aria-label="Abrir navegação"
      >
        <Grid2X2 size={26} strokeWidth={1.5} />
      </button>
      <Link to="/cart" aria-label={`Carrinho, ${count} itens`}>
        <img src={figmaAssets['mobile-home'].imgShop} width="20" height="20" alt="" />
        {count > 0 && <span className="mobile-cart-count">{count}</span>}
      </Link>
      <Link to={signedIn ? '/profile' : '/login'} aria-label={signedIn ? 'Perfil' : 'Entrar'}>
        <img src={figmaAssets['mobile-home'].imgUser} width="20" height="20" alt="" />
      </Link>
    </nav>
  );
}
