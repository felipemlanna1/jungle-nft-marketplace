import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
} from '@tanstack/react-router';
import { AppShell } from './app/components/AppShell';
import { SessionGuard } from './app/components/SessionGuard';
import { NotFound } from './app/components/NotFound';
import { RoutePending } from './app/components/RoutePending';
import { RouteErrorFallback } from './app/components/RouteErrorFallback';
import { validateCatalogSearch, validateRedirectSearch } from './app/routing/search';
import { CatalogPage } from './modules/catalog/pages/Marketplace';

const root = createRootRoute({ component: AppShell, notFoundComponent: NotFound });
const authenticated = createRoute({
  getParentRoute: () => root,
  id: 'authenticated',
  component: SessionGuard,
});
const catalog = createRoute({
  getParentRoute: () => root,
  path: '/',
  validateSearch: validateCatalogSearch,
  component: CatalogPage,
});
const nft = createRoute({
  getParentRoute: () => root,
  path: '/nft/$id',
  component: lazyRouteComponent(() => import('./app/routes/NftRoute'), 'NftRoute'),
});
const cart = createRoute({
  getParentRoute: () => root,
  path: '/cart',
  component: lazyRouteComponent(() => import('./modules/checkout/pages/Cart'), 'CartPage'),
});
const login = createRoute({
  getParentRoute: () => root,
  path: '/login',
  validateSearch: validateRedirectSearch,
  component: lazyRouteComponent(() => import('./modules/account/pages/Login'), 'LoginPage'),
});
const register = createRoute({
  getParentRoute: () => root,
  path: '/register',
  validateSearch: validateRedirectSearch,
  component: lazyRouteComponent(() => import('./modules/account/pages/Register'), 'RegisterPage'),
});
const checkout = createRoute({
  getParentRoute: () => authenticated,
  path: '/checkout',
  component: lazyRouteComponent(() => import('./modules/checkout/pages/Checkout'), 'CheckoutPage'),
});
const profile = createRoute({
  getParentRoute: () => authenticated,
  path: '/profile',
  component: lazyRouteComponent(() => import('./modules/account/pages/Profile'), 'ProfilePage'),
});
const wallets = createRoute({
  getParentRoute: () => authenticated,
  path: '/wallets',
  component: lazyRouteComponent(() => import('./modules/account/pages/Wallets'), 'WalletsPage'),
});
const order = createRoute({
  getParentRoute: () => authenticated,
  path: '/orders/$id',
  component: lazyRouteComponent(() => import('./app/routes/OrderRoute'), 'OrderRoute'),
});

export const router = createRouter({
  routeTree: root.addChildren([
    catalog,
    nft,
    cart,
    login,
    register,
    authenticated.addChildren([checkout, profile, wallets, order]),
  ]),
  defaultPreload: 'intent',
  defaultPendingComponent: RoutePending,
  defaultErrorComponent: RouteErrorFallback,
  scrollRestoration: true,
});
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
