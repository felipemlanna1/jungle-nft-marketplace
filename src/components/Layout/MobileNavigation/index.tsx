import type { MobileNavigationProps } from '../shared-types';
import { figmaAssets } from '../../../assets/figma';
import { Link } from '@tanstack/react-router';

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
        <img
          className="mobile-nav-disc"
          src={figmaAssets['mobile-home'].imgEllipse39}
          width="65"
          height="65"
          alt=""
        />
        <span className="mobile-menu-symbol" aria-hidden="true">
          <img
            className="mobile-menu-symbol-top-left"
            src={figmaAssets['mobile-home'].imgVector6}
            alt=""
          />
          <img
            className="mobile-menu-symbol-top-right"
            src={figmaAssets['mobile-home'].imgVector4}
            alt=""
          />
          <img
            className="mobile-menu-symbol-bottom-left"
            src={figmaAssets['mobile-home'].imgVector3}
            alt=""
          />
          <img
            className="mobile-menu-symbol-bottom-right"
            src={figmaAssets['mobile-home'].imgVector5}
            alt=""
          />
          <img
            className="mobile-menu-symbol-line"
            src={figmaAssets['mobile-home'].imgVector2}
            alt=""
          />
        </span>
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
