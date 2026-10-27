import { useLayout } from './useLayout';
import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowUpRight, ChevronDown, Gem, Menu, Search, ShoppingBag } from 'lucide-react';
import { Button, Modal, ThemeSwitcher } from '../../styleguide';
export function Layout({ children }: { children: ReactNode }) {
  const { themeName, menuOpen, setMenuOpen, logoutError, leaving, session, count, logout } =
    useLayout();
  return (
    <>
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="wordmark" aria-label="Página inicial da Kurio">
            {themeName === 'expedition' ? (
              <>
                <span className="game-brand-emblem">
                  <Gem size={24} strokeWidth={1.5} />
                </span>
                <span className="game-brand-copy">
                  kurio<small>EXPLORE. COLECIONE.</small>
                </span>
              </>
            ) : (
              <>kurio</>
            )}
          </Link>
          <div className="header-divider" />
          <nav className="desktop-nav" aria-label="Navegação principal">
            <Link to="/" search={{}} activeOptions={{ exact: true }}>
              Início
            </Link>
            <Link to="/" search={{ category: 'Art' }}>
              Mercado <ChevronDown size={14} />
            </Link>
            <Link to="/wallets">Carteiras</Link>
          </nav>
          <div className="header-actions">
            <ThemeSwitcher />
            <Link to="/" search={{}} className="header-search" aria-label="Buscar NFTs">
              <Search size={19} />
            </Link>
            <Link to="/cart" className="cart-link" aria-label={`Carrinho, ${count} itens`}>
              <ShoppingBag size={20} />
              {count > 0 && <span className="cart-count">{count}</span>}
            </Link>
            {session.data ? (
              <Button variant="secondary" size="small" onClick={() => setMenuOpen(true)}>
                <span className="tiny-avatar">{session.data.name.slice(0, 1)}</span>
                <span className="account-label">{session.data.name}</span>
                <ChevronDown size={14} />
              </Button>
            ) : (
              <Button asChild variant="secondary" size="small">
                <Link to="/login">
                  Entrar <ArrowUpRight size={14} />
                </Link>
              </Button>
            )}
            <Button
              className="mobile-menu"
              variant="ghost"
              size="icon"
              aria-label="Abrir navegação"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={22} />
            </Button>
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <Link to="/" className="wordmark">
            <span className="brand-symbol">c</span>kurio
            <span className="brand-dot">.</span>
          </Link>
          <p>Descubra. Colecione. Faça parte.</p>
          <span>Marketplace demonstrativo · Sem transações reais</span>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Kurio. Arte digital, imaginação humana.</span>
          <span>Desafio Jungle Gaming</span>
        </div>
      </footer>
      <Modal
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title={session.data ? 'Sua conta' : 'Explore a Kurio'}
        description="Gerencie sua coleção e sua conta."
      >
        <nav className="account-menu" aria-label="Navegação da conta">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Início
          </Link>
          <Link to="/cart" onClick={() => setMenuOpen(false)}>
            Carrinho ({count})
          </Link>
          <Link to="/profile" onClick={() => setMenuOpen(false)}>
            Perfil do colecionador
          </Link>
          <Link to="/wallets" onClick={() => setMenuOpen(false)}>
            Carteiras
          </Link>
          {session.data ? (
            <Button variant="secondary" onClick={logout} disabled={leaving}>
              {leaving ? 'Saindo…' : 'Sair'}
            </Button>
          ) : (
            <Button asChild>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                Entrar
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
