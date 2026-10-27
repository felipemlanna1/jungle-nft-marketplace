import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import type { CatalogSearch, NFT } from '../../shared-types';
import { market } from '../../../../services/marketplace';
import { useCatalog, useFavorite } from '../../hooks/useCatalog';
import { useTheme } from '../../../../styleguide';
export const categories = [
  { label: 'Todas as coleções', value: '' },
  { label: 'Arte digital', value: 'Art' },
  { label: 'Arte abstrata', value: 'Abstract' },
  { label: 'Fotografia', value: 'Photography' },
];
export function useMarketplace() {
  const { themeName } = useTheme();
  const search = useSearch({ strict: false }) as CatalogSearch;
  const navigate = useNavigate();
  const [term, setTerm] = useState(search.q ?? '');
  const [authNotice, setAuthNotice] = useState(false);
  useEffect(() => {
    setTerm(search.q ?? '');
  }, [search.q]);
  const catalog = useCatalog(search);
  const session = useQuery({
    queryKey: ['session'],
    queryFn: ({ signal }) => market.session(signal),
    retry: false,
  });
  const { favorites, mutation } = useFavorite(session.data);
  const totalPages = Math.max(
    1,
    Math.ceil((catalog.data?.total ?? 0) / (catalog.data?.pageSize ?? 9)),
  );
  function update(values: Partial<CatalogSearch>) {
    void navigate({ to: '/', search: { ...search, ...values } });
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    update({ q: term.trim() || undefined, page: 1 });
  }
  function favorite(nft: NFT) {
    if (!session.data) {
      setAuthNotice(true);
      return;
    }
    setAuthNotice(false);
    mutation.mutate({ id: nft.id, active: !favorites.includes(nft.id) });
  }
  function clearFilters() {
    setTerm('');
    void navigate({ to: '/', search: {} });
  }
  return {
    themeName,
    search,
    term,
    setTerm,
    authNotice,
    catalog,
    totalPages,
    mutation,
    favorites,
    update,
    submit,
    favorite,
    clearFilters,
  };
}
