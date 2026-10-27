import { ChevronRight } from 'lucide-react';
import type { CollectionStripProps } from '../../shared-types';
import { collections } from './collections';

export function CollectionStrip({ category, onSelect }: CollectionStripProps) {
  return (
    <nav className="game-collection-strip page-shell" aria-label="Explorar coleções em destaque">
      {collections.map(({ category: value, label, description, icon: Icon }) => (
        <button
          type="button"
          className="game-collection"
          key={value}
          aria-pressed={(category === 'all' || !category ? '' : category) === value}
          onClick={() => onSelect(value)}
        >
          <Icon size={28} strokeWidth={1.4} aria-hidden="true" />
          <span>
            <strong>{label}</strong>
            <small>{description}</small>
          </span>
          <ChevronRight size={17} aria-hidden="true" />
        </button>
      ))}
    </nav>
  );
}
