import { useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { market } from '../../services/marketplace';
export const useLayout = () => {
  const location = useLocation();
  const marketplaceAnchor =
    location.pathname === '/' && location.hash.replace(/^#/, '') === 'marketplace';
  const activeSection =
    marketplaceAnchor || /^\/(?:nft|cart|checkout|orders)(?:\/|$)/.test(location.pathname)
      ? 'market'
      : 'home';
  const homeCurrent: 'page' | 'location' | undefined =
    activeSection === 'home' ? (location.pathname === '/' ? 'page' : 'location') : undefined;
  const marketCurrent: 'page' | 'location' | undefined =
    activeSection === 'market' ? (location.pathname === '/' ? 'page' : 'location') : undefined;
  const [menuOpen, setMenuOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [logoutError, setLogoutError] = useState('');
  const [leaving, setLeaving] = useState(false);
  const menuTrigger = useRef<HTMLElement | null>(null);
  const favoritesTrigger = useRef<HTMLElement | null>(null);
  const switchingToFavorites = useRef(false);
  const favoritesNavigating = useRef(false);
  const session = useQuery({
    queryKey: ['session'],
    queryFn: ({ signal }) => market.session(signal),
    retry: false,
  });
  const cart = useQuery({
    queryKey: ['cart', session.data?.id ?? 'guest'],
    queryFn: market.cart,
    enabled: !session.isPending,
  });
  const count = cart.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const client = useQueryClient();
  const navigate = useNavigate();
  function openMenu() {
    menuTrigger.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setMenuOpen(true);
  }
  function openFavorites() {
    favoritesTrigger.current = menuOpen
      ? menuTrigger.current
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    switchingToFavorites.current = menuOpen;
    favoritesNavigating.current = false;
    setMenuOpen(false);
    setFavoritesOpen(true);
  }
  function navigateFromFavorites() {
    favoritesNavigating.current = true;
    setMenuOpen(false);
    setFavoritesOpen(false);
  }
  function restoreMenuFocus(event: Event) {
    if (!switchingToFavorites.current) return;
    event.preventDefault();
    switchingToFavorites.current = false;
  }
  function restoreFavoritesFocus(event: Event) {
    event.preventDefault();
    if (favoritesNavigating.current) {
      favoritesNavigating.current = false;
      return;
    }
    const target = [
      favoritesTrigger.current,
      document.querySelector<HTMLElement>('.site-header .wordmark'),
      document.querySelector<HTMLElement>('.mobile-nav-center'),
    ].find((element) => element?.isConnected && element.getClientRects().length);
    target?.focus({ preventScroll: true });
  }
  function submitSearch(event: FormEvent) {
    event.preventDefault();
    void navigate({ to: '/', search: { q: searchTerm.trim() || undefined } });
    setSearchOpen(false);
  }
  async function logout() {
    setLeaving(true);
    try {
      await market.logout();
      client.clear();
      await navigate({ to: '/' });
      setMenuOpen(false);
    } catch {
      setLogoutError('Não foi possível sair. Tente novamente.');
    } finally {
      setLeaving(false);
    }
  }

  return {
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
  };
};
