import { FavoritesList } from '../../modules/catalog/components/FavoritesList';
import { figmaAssets } from '../../assets/figma';
import { useLayout } from './useLayout';
import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import {
  ChevronDown,
  Menu,
  Search,
  Heart,
  ShoppingBag,
  House,
  UserRound,
  Wallet,
  LogOut,
  LogIn,
  FlaskConical,
} from 'lucide-react';
import { Button, Input, Modal } from '../../styleguide';
import { Footer } from './Footer';
import { MobileNavigation } from './MobileNavigation';
export function Layout({
  children,
  onOpenScenarios,
}: {
  children: ReactNode;
  onOpenScenarios: () => void;
}) {
  const {
    activeSection,
    homeCurrent,
    marketCurrent,
    favoritesOpen,
    setFavoritesOpen,
    openFavorites,
    navigateFromFavorites,
    restoreFavoritesFocus,
    searchOpen,
    setSearchOpen,
    searchTerm,
    setSearchTerm,
    submitSearch,
    menuOpen,
    openMenu,
    setMenuOpen,
    restoreMenuFocus,
    logoutError,
    leaving,
    session,
    count,
    logout,
  } = useLayout();
  return (
    <>
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="wordmark" aria-label="Página inicial da Kurio">
            kurio
          </Link>
          <div className="header-divider" />
          <nav className="desktop-nav" aria-label="Navegação principal">
            <Link
              to="/"
              hash=""
              search={{}}
              activeOptions={{ exact: true, includeHash: true, includeSearch: false }}
              activeProps={{}}
              className={activeSection === 'home' ? 'is-active' : undefined}
              aria-current={homeCurrent}
            >
              Início
            </Link>
            <Link
              to="/"
              hash="marketplace"
              search={{}}
              activeOptions={{ exact: true, includeHash: true, includeSearch: false }}
              activeProps={{}}
              className={activeSection === 'market' ? 'is-active' : undefined}
              aria-current={marketCurrent}
            >
              Mercado
            </Link>
            <span className="nav-unavailable" title="Conteúdo editorial fora desta demonstração">
              Criadores
            </span>
            <span className="nav-unavailable" title="Conteúdo editorial fora desta demonstração">
              Aprenda
            </span>
          </nav>
          <div className="header-actions">
            <button
              type="button"
              className="header-search"
              aria-label="Buscar obras ou criadores"
              onClick={() => setSearchOpen(true)}
            >
              <img src={figmaAssets.home.imgSearchIcon} width="20" height="20" alt="" />
            </button>
            <Link to="/cart" className="cart-link" aria-label={`Carrinho, ${count} itens`}>
              <img
                className="kurio-cart-icon"
                src={figmaAssets.home.imgCartIcon}
                width="24"
                height="24"
                alt=""
              />
              {count > 0 && <span className="cart-count">{count}</span>}
            </Link>
            {session.data ? (
              <Button variant="secondary" size="small" onClick={openMenu}>
                <span className="tiny-avatar">{session.data.name.slice(0, 1)}</span>
                <span className="account-label">{session.data.name}</span>
                <ChevronDown size={14} />
              </Button>
            ) : (
              <Button asChild variant="secondary" size="small">
                <Link to="/login">
                  <img
                    className="kurio-login-icon"
                    src={figmaAssets.home.imgLogout}
                    width="18"
                    height="18"
                    alt=""
                  />{' '}
                  Entrar
                </Link>
              </Button>
            )}
            <Button
              className="mobile-menu"
              variant="ghost"
              size="icon"
              aria-label="Abrir navegação"
              onClick={openMenu}
            >
              <Menu size={22} />
            </Button>
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer onOpenOptions={openMenu} onOpenFavorites={openFavorites} />
      <MobileNavigation
        count={count}
        signedIn={Boolean(session.data)}
        onMenu={openMenu}
        onFavorites={openFavorites}
      />
      <Modal
        open={favoritesOpen}
        onOpenChange={setFavoritesOpen}
        onCloseAutoFocus={restoreFavoritesFocus}
        title="Lista de interesse"
        description="As obras que você salvou na sua conta."
      >
        <FavoritesList onNavigate={navigateFromFavorites} />
      </Modal>
      <Modal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title="Explorar coleções"
        description="Busque pelo nome da obra ou do criador."
      >
        <form className="header-search-form stack" role="search" onSubmit={submitSearch}>
          <label className="field" htmlFor="header-catalog-search">
            Buscar obras ou criadores
            <Input
              id="header-catalog-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar obras ou criadores"
            />
          </label>
          <Button type="submit">
            <Search size={17} aria-hidden="true" /> Buscar
          </Button>
        </form>
      </Modal>
      <Modal
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onCloseAutoFocus={restoreMenuFocus}
        title={session.data ? 'Sua conta' : 'Menu'}
        description="Acesse sua conta e seus itens."
      >
        <Button variant="ghost" aria-label="Open demo scenarios" onClick={onOpenScenarios}>
          <FlaskConical size={18} aria-hidden="true" /> Cenários de teste
        </Button>
        <nav className="account-menu" aria-label="Navegação da conta">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            <House size={18} aria-hidden="true" /> Início
          </Link>
          <Link to="/cart" onClick={() => setMenuOpen(false)}>
            <ShoppingBag size={18} aria-hidden="true" /> Carrinho ({count})
          </Link>
          <button type="button" onClick={openFavorites}>
            <Heart size={18} aria-hidden="true" /> Lista de interesse
          </button>
          <Link to="/profile" onClick={() => setMenuOpen(false)}>
            <UserRound size={18} aria-hidden="true" /> Perfil
          </Link>
          <Link to="/wallets" onClick={() => setMenuOpen(false)}>
            <Wallet size={18} aria-hidden="true" /> Carteiras
          </Link>
          {session.data ? (
            <Button variant="secondary" onClick={logout} disabled={leaving}>
              <LogOut size={18} aria-hidden="true" /> {leaving ? 'Saindo…' : 'Sair'}
            </Button>
          ) : (
            <Button asChild>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                <LogIn size={18} aria-hidden="true" /> Entrar
              </Link>
            </Button>
          )}
          {logoutError && (
            <p role="alert" className="field-error">
              {logoutError}
            </p>
          )}
        </nav>
      </Modal>
    </>
  );
}
