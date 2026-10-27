import './styles.css';
import '@fontsource-variable/roboto-mono/wght.css';
import './styles.kurio.css';
import { criticalMedia } from './assets/critical-media';

function preloadHomepageArtwork() {
  if (location.pathname !== '/') return;
  const preload = document.createElement('link');
  preload.rel = 'preload';
  preload.as = 'image';
  preload.fetchPriority = 'high';
  preload.href = matchMedia('(max-width: 767px)').matches
    ? criticalMedia.kurioHeroMobile
    : criticalMedia.kurioHero;
  if (matchMedia('(max-width: 767px)').matches) {
    preload.imageSrcset = criticalMedia.kurioHeroMobileSrcSet;
    preload.imageSizes = criticalMedia.kurioHeroMobileSizes;
  }
  document.head.append(preload);
}

async function bootstrap() {
  const loadingModule = import('./bootstrap');
  const loadingRoot = loadingModule.then(({ mountLoading }) => mountLoading(location.pathname));
  if (location.pathname.startsWith('/nft/')) {
    void import('./app/routes/NftRoute').catch(() => {
      // The router presents a chunk-loading failure if this route is actually requested.
    });
  }
  try {
    // Paint only placeholders early; application queries and sockets wait for interception.
    const [application, root] = await Promise.all([
      import('./application'),
      loadingRoot,
      import.meta.env.VITE_MOCKS !== 'false'
        ? import('./mocks/browser').then(({ startMocks }) => startMocks())
        : Promise.resolve(),
    ]);
    void application.prefetchPublicRoute(location);
    application.mountApplication(root);
  } catch {
    const [loading, root] = await Promise.all([loadingModule, loadingRoot]);
    loading.showStartupFailure(root);
  }
}
preloadHomepageArtwork();
bootstrap().catch(() => {
  const root = document.getElementById('root');
  if (root)
    root.innerHTML =
      '<main style="padding:3rem;font-family:system-ui"><h1>Unable to start the demo</h1><p>Please reload this page. A service worker is required for the simulated API.</p><button onclick="location.reload()">Reload</button></main>';
});
