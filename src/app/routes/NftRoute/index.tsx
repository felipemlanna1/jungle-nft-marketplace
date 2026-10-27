import { NFTDetailPage } from '../../../modules/catalog/pages/NftDetails';
import { useNftRoute } from './useNftRoute';
export function NftRoute() {
  const { id } = useNftRoute();
  return <NFTDetailPage key={id} id={id} />;
}
