import { figmaAssets } from '../../../../assets/figma';
import { Link } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { CatalogSort } from '../../shared-types';
import { catalogSortOptions } from '../../config';
import { Select } from '../../../../styleguide';
import { errorMessage } from '../../../../services/marketplace';
import { Button, Input, Modal, Notice } from '../../../../components/ui';
import { NFTCard } from '../../components/NFTCard';
import { CatalogSkeleton } from '../../components/CatalogSkeleton';
import { useMarketplace } from './useMarketplace';
import { MarketplaceHero } from '../../components/MarketplaceHero';
import { CatalogPromotions } from '../../components/CatalogPromotions';
import { EditorialHighlights } from '../../components/EditorialHighlights';
import { CatalogFilters } from '../../components/CatalogFilters';
export function CatalogPage() {
  const {
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
  } = useMarketplace();
  return (
    <>
      <div className="mobile-catalog-tools page-shell">
        <form className="catalog-search" role="search" onSubmit={submit}>
          <img src={figmaAssets['mobile-home'].imgSearch} width="22" height="22" alt="" />
          <Input
            id="mobile-catalog-search"
            type="search"
            aria-label="Buscar obras ou criadores"
            placeholder="Explorar coleções"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
          />
          <button className="sr-only" type="submit">
            Buscar
          </button>
        </form>
        <button
          className="mobile-filter-button"
          type="button"
          aria-label="Abrir filtros"
          onClick={() => setFiltersOpen(true)}
        >
          <img src={figmaAssets['mobile-home'].imgFilter} width="22" height="22" alt="" />
        </button>
      </div>
      <MarketplaceHero />
      <section className="marketplace-section page-shell" id="marketplace" aria-label="Marketplace">
        <h2 className="sr-only">Marketplace</h2>
        <div className="catalog-layout">
          <aside className="catalog-sidebar">
            <CatalogFilters
              search={search}
              facets={catalog.data?.facets}
              update={update}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPrice={setMinPrice}
              onMaxPrice={setMaxPrice}
              applyPrice={applyPrice}
              priceError={priceError}
              idPrefix="desktop-price"
            />
            <Link className="featured-nft-banner" to="/nft/$id" params={{ id: 'nft-2' }}>
              <strong>NFT EM DESTAQUE</strong>
              <span>OFERTA LIMITADA</span>
              <img
                src={figmaAssets.home.imgNftArtwork18}
                width="250"
                height="368"
                alt="Sage Nomad, personagem com chapéu e moletom roxo"
              />
            </Link>
          </aside>
          <div className="catalog-content">
            <div className="catalog-toolbar">
              <nav className="catalog-tabs" aria-label="Seleção do catálogo">
                {(
                  [
                    { value: 'all', label: 'Todos os NFTs' },
                    { value: 'new', label: 'Novos lançamentos' },
                    { value: 'trending', label: 'Em alta' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.value}
                    className={(search.tab ?? 'all') === tab.value ? 'is-active' : ''}
                    type="button"
                    aria-pressed={(search.tab ?? 'all') === tab.value}
                    onClick={() =>
                      update({ tab: tab.value === 'all' ? undefined : tab.value, page: 1 })
                    }
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
              <div className="sort-control">
                <label id="catalog-sort-label" htmlFor="catalog-sort">
                  Ordenar por:
                </label>
                <Select<CatalogSort>
                  id="catalog-sort"
                  aria-labelledby="catalog-sort-label"
                  value={search.sort ?? 'newest'}
                  options={catalogSortOptions}
                  onValueChange={(sort) => update({ sort, page: 1 })}
                />
              </div>
            </div>
            {mutation.isError && (
              <Notice tone="error">
                {errorMessage(mutation.error)} O favorito foi restaurado.
              </Notice>
            )}
            {catalog.isPending ? (
              <CatalogSkeleton />
            ) : catalog.isError ? (
              <div className="empty-state">
                <h3>Não foi possível carregar a coleção.</h3>
                <p>{errorMessage(catalog.error)}</p>
                <Button variant="secondary" onClick={() => catalog.refetch()}>
                  Tentar novamente
                </Button>
              </div>
            ) : !catalog.data.items.length ? (
              <div className="empty-state">
                <Search size={30} />
                <h3>Nenhuma obra por aqui.</h3>
                <p>Tente outro termo ou explore todas as coleções.</p>
                <Button variant="secondary" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              </div>
            ) : (
              <>
                {(search.q ||
                  (search.category && search.category !== 'all') ||
                  search.network ||
                  search.minPrice !== undefined ||
                  search.maxPrice !== undefined ||
                  catalog.isFetching) && (
                  <div className="results-bar" aria-live="polite">
                    <span>
                      {catalog.data.total} resultados{search.q ? ` para “${search.q}”` : ''}
                    </span>
                    <button type="button" onClick={clearFilters}>
                      Limpar filtros
                    </button>
                  </div>
                )}
                <div className="nft-grid">
                  {catalog.data.items.map((nft, index) => (
                    <NFTCard
                      key={nft.id}
                      nft={nft}
                      priority={index < 4}
                      favorite={favorites.includes(nft.id)}
                      onFavorite={() => favorite(nft)}
                      busy={mutation.isPending}
                    />
                  ))}
                </div>
                <nav className="pagination" aria-label="Paginação do catálogo">
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label="Página anterior"
                    disabled={(search.page ?? 1) <= 1}
                    onClick={() => update({ page: Math.max(1, (search.page ?? 1) - 1) })}
                  >
                    <ChevronLeft size={17} />
                  </Button>
                  <span className="sr-only" aria-live="polite">
                    Página {catalog.data.page} de {totalPages}
                  </span>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <Button
                      key={page}
                      variant="secondary"
                      size="icon"
                      className={catalog.data.page === page ? 'page-active' : undefined}
                      aria-label={`Ir para página ${page}`}
                      aria-current={catalog.data.page === page ? 'page' : undefined}
                      onClick={() => update({ page })}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label="Próxima página"
                    disabled={(search.page ?? 1) >= totalPages}
                    onClick={() => update({ page: (search.page ?? 1) + 1 })}
                  >
                    <ChevronRight size={17} />
                  </Button>
                </nav>
              </>
            )}
          </div>
        </div>
      </section>
      <CatalogPromotions />
      <EditorialHighlights />
      <Modal
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        title="Filtrar NFTs"
        description="Selecione uma coleção, faixa de preço ou rede."
      >
        <CatalogFilters
          search={search}
          facets={catalog.data?.facets}
          update={(values) => {
            update(values);
            setFiltersOpen(false);
          }}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPrice={setMinPrice}
          onMaxPrice={setMaxPrice}
          applyPrice={applyPrice}
          priceError={priceError}
          idPrefix="mobile-price"
        />
        <div className="field mobile-filter-sort">
          <label id="mobile-sort-label" htmlFor="mobile-catalog-sort">
            Ordenar NFTs
          </label>
          <Select<CatalogSort>
            id="mobile-catalog-sort"
            className="select-trigger-full"
            aria-labelledby="mobile-sort-label"
            value={search.sort ?? 'newest'}
            options={catalogSortOptions}
            onValueChange={(sort) => {
              update({ sort, page: 1 });
              setFiltersOpen(false);
            }}
          />
        </div>
      </Modal>
    </>
  );
}
