import { defaultParseSearch } from '@tanstack/react-router';
import { queryClient } from '../../lib/query';
import { preloadArtwork } from '../../assets/figma/preloadArtwork';
import { detailArtworkSizes } from '../../assets/figma/responsiveArtwork';
import { catalogQueryOptions, nftQueryOptions } from '../../modules/catalog/queries';
import { validateCatalogSearch } from './search';

/** Called after transport readiness; only public queries may begin before the first application render. */
export async function prefetchPublicRoute(location: Pick<Location, 'pathname' | 'search'>) {
  if (location.pathname === '/') {
    const search = validateCatalogSearch(defaultParseSearch(location.search));
    const options = catalogQueryOptions(search);
    await queryClient.prefetchQuery(options);
    const data = queryClient.getQueryData(options.queryKey);
    for (const item of data?.items.slice(0, 4) ?? []) preloadArtwork(item.image);
    return;
  }
  const match = /^\/nft\/([^/]+)\/?$/.exec(location.pathname);
  if (!match) return;
  let id: string;
  try {
    id = decodeURIComponent(match[1]);
  } catch {
    return;
  }
  const options = nftQueryOptions(id);
  await queryClient.prefetchQuery(options);
  const data = queryClient.getQueryData(options.queryKey);
  if (data) preloadArtwork(data.image, detailArtworkSizes);
}
