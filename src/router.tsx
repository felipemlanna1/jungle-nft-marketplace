import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  Link,
  useLocation,
} from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Component, type ReactNode, useEffect } from 'react';
import { Layout } from './components/Layout';
import { CatalogPage, NFTDetailPage } from './modules/catalog';
import { LoginPage, RegisterPage, ProfilePage, WalletsPage } from './modules/account';
import { CartPage, CheckoutPage, OrderPage } from './modules/checkout';
import { market } from './services/marketplace';
import { useRealtime } from './lib/realtime';
import { ScenarioPanel } from './components/ScenarioPanel';
import { LiveNotice } from './components/LiveNotice';
import type { CatalogSearch } from './contracts';

class Boundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <section className="page-shell empty-state" role="alert">
        <h1>Something went wrong</h1>
        <p>Your cart is saved. Reload to continue.</p>
        <button className="button" onClick={() => location.reload()}>
          Reload marketplace
        </button>
      </section>
    ) : (
      this.props.children
    );
  }
}
function Shell() {
  const location = useLocation();
  const { data: user } = useQuery({
    queryKey: ['session'],
    queryFn: ({ signal }) => market.session(signal),
    retry: false,
  });
  const { connected } = useRealtime(user);
  useEffect(() => {
    document.title =
      location.pathname === '/'
        ? 'KURIO : O futuro da arte digital'
        : `${location.pathname.split('/')[1]} · KURIO`;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);
  return (
    <Layout>
      <LiveNotice />
      <Boundary key={location.pathname}>
        <Outlet />
      </Boundary>
      <ScenarioPanel connected={connected} />
    </Layout>
  );
}
function Guard({ children }: { children: ReactNode }) {
  const { data: user, isPending } = useQuery({
    queryKey: ['session'],
    queryFn: ({ signal }) => market.session(signal),
    retry: false,
  });
  const loc = useLocation();
  if (isPending)
    return (
      <section className="page-shell" aria-busy="true">
        <p role="status">Checking your session…</p>
      </section>
    );
  if (!user)
    return (
      <section className="page-shell empty-state">
        <h1>Continue with your collector account</h1>
        <p>Sign in to keep your collection, wallets, and order history together.</p>
        <Link className="button" to="/login" search={{ redirect: loc.pathname }}>
          Sign in to continue
        </Link>
      </section>
    );
  return children;
}
function NotFound() {
  return (
    <section className="page-shell empty-state">
      <h1>Page not found</h1>
      <p>This page may have moved. Discover something extraordinary instead.</p>
      <Link className="button" to="/">
        Explore NFTs
      </Link>
    </section>
  );
}
const root = createRootRoute({ component: Shell, notFoundComponent: NotFound });
const catalog = createRoute({
  getParentRoute: () => root,
  path: '/',
  validateSearch: (raw: Record<string, unknown>): CatalogSearch => ({
    q: typeof raw.q === 'string' ? raw.q.slice(0, 100) : '',
    category: typeof raw.category === 'string' ? raw.category : 'all',
    sort: raw.sort === 'price-asc' || raw.sort === 'price-desc' ? raw.sort : 'newest',
    page: Math.max(1, Number.isFinite(Number(raw.page)) ? Math.floor(Number(raw.page)) : 1),
  }),
  component: CatalogPage,
});
const nft = createRoute({
  getParentRoute: () => root,
  path: '/nft/$id',
  component: function NFT() {
    const { id } = nft.useParams();
    return <NFTDetailPage id={id} />;
  },
});
const cart = createRoute({ getParentRoute: () => root, path: '/cart', component: CartPage });
const redirectSearch = (raw: Record<string, unknown>): { redirect?: string } => ({
  redirect:
    typeof raw.redirect === 'string' &&
    raw.redirect.startsWith('/') &&
    !raw.redirect.startsWith('//') &&
    !raw.redirect.includes('\\')
      ? raw.redirect
      : '/',
});
const login = createRoute({
  getParentRoute: () => root,
  path: '/login',
  validateSearch: redirectSearch,
  component: LoginPage,
});
const register = createRoute({
  getParentRoute: () => root,
  path: '/register',
  validateSearch: redirectSearch,
  component: RegisterPage,
});
const checkout = createRoute({
  getParentRoute: () => root,
  path: '/checkout',
  component: () => (
    <Guard>
      <CheckoutPage />
    </Guard>
  ),
});
const profile = createRoute({
  getParentRoute: () => root,
  path: '/profile',
  component: () => (
    <Guard>
      <ProfilePage />
    </Guard>
  ),
});
const wallets = createRoute({
  getParentRoute: () => root,
  path: '/wallets',
  component: () => (
    <Guard>
      <WalletsPage />
    </Guard>
  ),
});
const order = createRoute({
  getParentRoute: () => root,
  path: '/orders/$id',
  component: function Order() {
    const { id } = order.useParams();
    return (
      <Guard>
        <OrderPage id={id} />
      </Guard>
    );
  },
});
export const router = createRouter({
  routeTree: root.addChildren([
    catalog,
    nft,
    cart,
    login,
    register,
    checkout,
    profile,
    wallets,
    order,
  ]),
  defaultPreload: 'intent',
  scrollRestoration: true,
});
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
