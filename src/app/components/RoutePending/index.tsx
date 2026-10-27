import { GenericPageSkeleton } from '../GenericPageSkeleton';
import { NftDetailsSkeleton } from '../../../modules/catalog/components/NftDetailsSkeleton';
import { useRoutePending } from './useRoutePending';
export function RoutePending() {
  const { isNftRoute } = useRoutePending();
  if (isNftRoute) return <NftDetailsSkeleton />;
  return <GenericPageSkeleton />;
}
