import type { ArticlePreview } from '../../../../contracts';
export interface EditorialCardProps {
  article: ArticlePreview;
  onRead: (article: ArticlePreview) => void;
}
export interface ArticleReaderProps {
  id: string;
}
