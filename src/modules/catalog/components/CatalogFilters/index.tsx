import { Button, RangeSlider } from '../../../../styleguide';
import { catalogCategories } from '../../../../domain/catalog';
import type { CatalogFiltersProps } from '../../shared-types';
import { usePriceRange } from './usePriceRange';

export function CatalogFilters({
  search,
  facets,
  update,
  minPrice,
  maxPrice,
  onMinPrice,
  onMaxPrice,
  applyPrice,
  priceError,
  idPrefix,
}: CatalogFiltersProps) {
  const range = usePriceRange(minPrice, maxPrice, onMinPrice, onMaxPrice);
  return (
    <div className="catalog-filter-panel">
      <section className="filter-section">
        <h3>Coleções</h3>
        <nav aria-label="Filtrar coleção">
          {catalogCategories.map((category) => (
            <button
              key={category.value}
              type="button"
              className={search.category === category.value ? 'category-active' : ''}
              aria-pressed={search.category === category.value}
              onClick={() =>
                update({
                  category: search.category === category.value ? undefined : category.value,
                  page: 1,
                })
              }
            >
              <span>{category.label}</span>
              <span>({facets?.categories[category.value] ?? 0})</span>
            </button>
          ))}
        </nav>
      </section>
      <form className="filter-section filter-price" onSubmit={applyPrice}>
        <h3>Faixa de preço</h3>
        <div className="price-controls">
          <div className="price-range-sliders">
            <RangeSlider
              value={range.value}
              onValueChange={range.change}
              labels={['Preço mínimo em ETH', 'Preço máximo em ETH']}
            />
          </div>
          <div className="price-value-controls">
            <span>Preço:</span>
            <label className="sr-only" htmlFor={`${idPrefix}-min`}>
              Preço mínimo
            </label>
            <input
              id={`${idPrefix}-min`}
              aria-label="Preço mínimo"
              inputMode="decimal"
              value={minPrice}
              onChange={(event) => onMinPrice(event.target.value)}
            />
            <span>-</span>
            <label className="sr-only" htmlFor={`${idPrefix}-max`}>
              Preço máximo
            </label>
            <input
              id={`${idPrefix}-max`}
              aria-label="Preço máximo"
              inputMode="decimal"
              value={maxPrice}
              onChange={(event) => onMaxPrice(event.target.value)}
            />
            <span>ETH</span>
          </div>
          <Button type="submit" size="small">
            Aplicar
          </Button>
          {priceError && (
            <p role="alert" className="field-error">
              {priceError}
            </p>
          )}
        </div>
      </form>
      <section className="filter-section">
        <h3>Rede</h3>
        <nav aria-label="Filtrar rede">
          {(['Ethereum', 'Polygon', 'Solana'] as const).map((network) => (
            <button
              key={network}
              type="button"
              className={search.network === network ? 'category-active' : ''}
              aria-pressed={search.network === network}
              onClick={() =>
                update({ network: search.network === network ? undefined : network, page: 1 })
              }
            >
              <span>{network}</span>
              <span>({facets?.networks[network] ?? 0})</span>
            </button>
          ))}
        </nav>
      </section>
    </div>
  );
}
