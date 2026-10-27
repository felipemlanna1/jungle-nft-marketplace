import { useQuery } from '@tanstack/react-query';
import { market } from '../../../../../../services/marketplace';

export function useArticleReader(id: string) {
  return useQuery({
    queryKey: ['article', id],
    queryFn: ({ signal }) => market.article(id, signal),
    retry: false,
  });
}
