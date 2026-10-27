import { Link } from '@tanstack/react-router';
import { ArrowRight, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import type { CatalogSearch } from '../../shared-types';
import { errorMessage } from '../../../../services/marketplace';
import { Button, Input, Notice } from '../../../../components/ui';
import { NFTCard } from '../../components/NFTCard';
import { CatalogSkeleton } from '../../components/CatalogSkeleton';
import { categories, useMarketplace } from './useMarketplace';
import { MarketplaceHero } from '../../components/MarketplaceHero';
import { CollectionStrip } from '../../components/CollectionStrip';
export function CatalogPage() {
  const {
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
  } = useMarketplace();
  return (
    <>
      <MarketplaceHero appearance={themeName} />
      {themeName === 'expedition' && (
        <CollectionStrip
          category={search.category}
          onSelect={(category) => update({ category: category || undefined, page: 1 })}
        />
      )}
      <section
        className="marketplace-section page-shell"
        id="marketplace"
        aria-labelledby="marketplace-title"
      >
        <div
          className={`section-heading ${themeName === 'expedition' ? 'game-lobby-heading' : ''}`}
        >
          <div>
            <p className="eyebrow">
              {themeName === 'expedition'
                ? 'SEU PRÓXIMO TESOURO'
                : 'Encontre sua próxima descoberta'}
            </p>
            <h2 id="marketplace-title">
              {themeName === 'expedition'
                ? 'O próximo item da sua coleção'
                : 'Explore o marketplace'}
              <span className="accent">.</span>
            </h2>
          </div>
          <span className="collection-count">
            {catalog.data?.total ?? ' - '} obras selecionadas
          </span>
        </div>
        <div className="catalog-layout">
          <aside className="catalog-sidebar">
            <h3>Coleções</h3>
            <nav aria-label="Filtrar coleção">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category.value}
                  className={
                    ((!search.category || search.category === 'all') && !category.value) ||
                    search.category === category.value
                      ? 'category-active'
                      : ''
                  }
                  aria-pressed={
                    ((!search.category || search.category === 'all') && !category.value) ||
                    search.category === category.value
                  }
                  onClick={() => update({ category: category.value || undefined, page: 1 })}
                >
                  {category.label}
                  <ChevronRight size={13} />
                </button>
              ))}
            </nav>
            <div className="sidebar-note">
              <span className="small-spark">✦</span>
              <h4>
                Sua próxima
                <br />
                grande descoberta.
              </h4>
              <p>Obras digitais que merecem fazer parte da sua coleção.</p>
            </div>
          </aside>
          <div className="catalog-content">
            <div className="catalog-toolbar">
              <form className="catalog-search" role="search" onSubmit={submit}>
                <Search size={17} aria-hidden="true" />
                <Input
                  id="catalog-search"
                  type="search"
                  aria-label="Buscar obras ou criadores"
                  placeholder="Buscar obras, coleções ou criadores"
                  value={term}
                  onChange={(event) => setTerm(event.target.value)}
                />
                <button type="submit" aria-label="Buscar">
                  <ArrowRight size={17} />
                </button>
              </form>
              <div className="sort-control">
                <SlidersHorizontal size={15} aria-hidden="true" />
                <label htmlFor="catalog-sort" className="sr-only">
                  Ordenar obras
                </label>
                <select
                  id="catalog-sort"
                  value={search.sort ?? 'newest'}
                  onChange={(event) =>
                    update({
                      sort: event.target.value as CatalogSearch['sort'],
                      page: 1,
                    })
                  }
                >
                  <option value="newest">Mais recentes</option>
                  <option value="price-asc">Menor preço</option>
                  <option value="price-desc">Maior preço</option>
                </select>
              </div>
            </div>
            {authNotice && (
              <Notice>
                Entre na sua conta para salvar favoritos.{' '}
                <Link to="/login" search={{ redirect: '/' }}>
                  Entrar
                </Link>
              </Notice>
            )}
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
                <div className="results-bar" aria-live="polite">
                  <span>
                    {!search.category || search.category === 'all'
                      ? 'Todas as coleções'
                      : search.category}{' '}
                    {search.q ? `· “${search.q}”` : ''}
                  </span>
                  <span>
                    {catalog.isFetching ? 'Atualizando…' : `${catalog.data.total} resultados`}
                  </span>
                </div>
                <div className="nft-grid">
                  {catalog.data.items.map((nft) => (
                    <NFTCard
                      key={nft.id}
                      nft={nft}
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
                  <span>
                    Página {catalog.data.page} de {totalPages}
                  </span>
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
      <section className="collector-banner page-shell">
        <div>
          <p className="eyebrow">Uma nova forma de colecionar</p>
          <h2>
            Arte que conecta.
            <br />
            Coleções que contam histórias.
          </h2>
        </div>
        <Button asChild variant="secondary">
          <Link to="/register">
            Comece sua coleção <ArrowRight size={16} />
          </Link>
        </Button>
      </section>
    </>
  );
}
