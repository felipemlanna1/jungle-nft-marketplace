import { useId } from 'react';
import { useQuery } from '@tanstack/react-query';
import { market } from '../../../../services/marketplace';

export function useRelatedNfts(excludeIds: readonly string[]) {
  const criterionId = useId();
  const excluded = [...new Set(excludeIds)].sort();
  const recommendations = useQuery({
    queryKey: ['recommendations', excluded],
    queryFn: ({ signal }) => market.recommendations({ exclude: excluded, limit: 8 }, signal),
    staleTime: 30_000,
  });
  return {
    criterionId,
    criterionLabel: recommendations.data?.label,
    isPending: recommendations.isPending,
    error: recommendations.error,
    retry: () => void recommendations.refetch(),
    items: recommendations.data?.items ?? [],
  };
}
