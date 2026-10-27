import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ArticlePreview } from '../../../../contracts';
import { market } from '../../../../services/marketplace';

export function useEditorialHighlights() {
  const [selected, setSelected] = useState<ArticlePreview | null>(null);
  const articles = useQuery({
    queryKey: ['articles'],
    queryFn: ({ signal }) => market.articles(signal),
    retry: false,
  });
  function onOpenChange(open: boolean) {
    if (!open) setSelected(null);
  }
  return { articles, selected, openArticle: setSelected, onOpenChange };
}
