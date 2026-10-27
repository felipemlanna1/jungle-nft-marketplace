import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import type { CatalogSearch, NFT } from '../../shared-types';
import { market } from '../../../../services/marketplace';
import { useCatalog, useFavorite } from '../../hooks/useCatalog';
import { toWei } from '../../../../domain/money';
export function useMarketplace() {
  const search = useSearch({ strict: false }) as CatalogSearch;
  const navigate = useNavigate();
  const [term, setTerm] = useState(search.q ?? '');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(search.minPrice ?? '0.02');
  const [maxPrice, setMaxPrice] = useState(search.maxPrice ?? '12.30');
  const [priceError, setPriceError] = useState('');
  useEffect(() => {
    setMinPrice(search.minPrice ?? '0.02');
    setMaxPrice(search.maxPrice ?? '12.30');
    setPriceError('');
  }, [search.minPrice, search.maxPrice]);
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
  function applyPrice(event: FormEvent) {
    event.preventDefault();
    try {
      const minimum = minPrice.trim().replace(',', '.') || undefined;
      const maximum = maxPrice.trim().replace(',', '.') || undefined;
      const minimumWei = minimum === undefined ? undefined : toWei(minimum);
      const maximumWei = maximum === undefined ? undefined : toWei(maximum);
      if (minimumWei !== undefined && maximumWei !== undefined && minimumWei > maximumWei) {
        setPriceError('O preço mínimo deve ser menor ou igual ao máximo.');
        return;
      }
      setPriceError('');
      update({ minPrice: minimum, maxPrice: maximum, page: 1 });
      setFiltersOpen(false);
    } catch {
      setPriceError('Informe preços válidos em ETH.');
    }
  }
  function favorite(nft: NFT) {
    if (!session.data) {
      void navigate({
        to: '/login',
        search: {
          redirect: window.location.pathname + window.location.search + window.location.hash,
          favorite: nft.id,
        },
      });
      return;
    }
    mutation.mutate({ id: nft.id, active: !favorites.includes(nft.id), ownerId: session.data.id });
  }
  function clearFilters() {
    setTerm('');
    void navigate({ to: '/', search: {} });
  }
  return {
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    priceError,
    applyPrice,
    filtersOpen,
    setFiltersOpen,
    search,
    term,
    setTerm,
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
