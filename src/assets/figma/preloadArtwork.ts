import { responsiveArtwork } from './responsiveArtwork';

/** Resource hints use the same API image and responsive selection as the rendered artwork. */
export function preloadArtwork(image: string, sizes?: string) {
  const artwork = responsiveArtwork(image, sizes);
  const href = new URL(image, document.baseURI).href;
  const duplicate = [...document.querySelectorAll<HTMLLinkElement>('link[rel="preload"]')].some(
    (link) =>
      link.as === 'image' &&
      link.href === href &&
      link.imageSrcset === (artwork?.srcSet ?? '') &&
      link.imageSizes === (artwork?.sizes ?? ''),
  );
  if (duplicate) return;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = image;
  link.fetchPriority = 'high';
  if (artwork) {
    link.imageSrcset = artwork.srcSet;
    link.imageSizes = artwork.sizes;
  }
  document.head.append(link);
}
