import { Link } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, Check, Heart, Minus, Plus, ShieldCheck } from 'lucide-react';
import { errorMessage } from '../../../../services/marketplace';
import { Button, Notice, Skeleton } from '../../../../components/ui';
import { useNftDetails } from './useNftDetails';
export function NFTDetailPage({ id }: { id: string }) {
  const {
    nft,
    session,
    favorite,
    quantity,
    validQuantity,
    isFavorite,
    add,
    added,
    decrease,
    increase,
    changeQuantity,
  } = useNftDetails(id);
  if (nft.isPending)
    return (
      <section className="page-shell detail-page" aria-label="Carregando obra" role="status">
        <nav className="breadcrumbs" aria-hidden="true">
          <span>Início</span>
          <span>/</span>
          <span>Marketplace</span>
          <span>/</span>
          <span>Carregando obra</span>
        </nav>
        <div className="detail-grid">
          <div className="detail-art">
            <Skeleton className="detail-art-skeleton" />
          </div>
          <div className="detail-copy stack" aria-hidden="true">
            <Skeleton className="text-skeleton short" />
            <Skeleton className="text-skeleton" />
            <Skeleton className="text-skeleton short" />
            <div className="detail-creator">
              <Skeleton className="text-skeleton" />
            </div>
            <div className="detail-description">
              <Skeleton className="text-skeleton" />
              <Skeleton className="text-skeleton" />
              <Skeleton className="text-skeleton short" />
            </div>
            <div className="edition-picker">
              <Skeleton className="text-skeleton" />
            </div>
            <Skeleton className="text-skeleton" />
          </div>
        </div>
      </section>
    );
  if (nft.isError)
    return (
      <section className="page-shell empty-state">
        <h1>Obra não encontrada</h1>
        <p>{errorMessage(nft.error)}</p>
        <Button asChild variant="secondary">
          <Link to="/">Voltar ao marketplace</Link>
        </Button>
      </section>
    );
  const item = nft.data;
  return (
    <section className="page-shell detail-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Início</Link>
        <span>/</span>
        <Link to="/">Marketplace</Link>
        <span>/</span>
        <span>{item.title}</span>
      </nav>
      <div className="detail-grid">
        <div className="detail-art">
          <img src={item.image} alt={item.title} width="680" height="680" fetchPriority="high" />
          <span className="detail-edition">{item.collection}</span>
        </div>
        <div className="detail-copy">
          <p className="eyebrow">
            {item.category} · Coleção verificada <Check size={12} />
          </p>
          <h1>{item.title}</h1>
          <p className="detail-price">
            {item.price}
            <span>ETH</span>
          </p>
          <div className="detail-creator">
            <span className="creator-avatar">{item.creator.slice(0, 1)}</span>
            <div>
              <span className="overline">Criado por</span>
              <strong>{item.creator}</strong>
            </div>
            <span className="verified">
              <Check size={10} />
            </span>
          </div>
          <div className="detail-description">
            <h2>Sobre esta obra</h2>
            <p>
              Uma expressão original de cor, forma e imaginação. Esta peça faz parte da coleção{' '}
              {item.collection}, criada para quem vê o extraordinário nos detalhes.
            </p>
            <p className="muted">
              Obra e transação demonstrativas. Nenhum ativo real é comprado ou transferido.
            </p>
          </div>
          <div className="edition-picker">
            <div>
              <span className="overline">Edição disponível</span>
              <strong>
                {item.available > 0 ? `${item.available} unidades` : 'Edição esgotada'}
              </strong>
            </div>
            <label className="quantity-picker">
              <span className="sr-only">Quantidade</span>
              <button
                type="button"
                aria-label="Diminuir quantidade"
                disabled={quantity <= 1}
                onClick={() => {
                  decrease();
                }}
              >
                <Minus size={15} />
              </button>
              <input
                type="number"
                min="1"
                max={item.available}
                aria-label="Quantidade"
                value={quantity}
                onChange={(event) => {
                  changeQuantity(Number(event.target.value));
                }}
              />
              <button
                type="button"
                aria-label="Aumentar quantidade"
                disabled={quantity >= item.available}
                onClick={() => {
                  increase();
                }}
              >
                <Plus size={15} />
              </button>
            </label>
          </div>
          <div className="detail-actions">
            <Button
              onClick={() => add.mutate()}
              disabled={add.isPending || item.available === 0 || quantity !== validQuantity}
            >
              {add.isPending ? (
                'Adicionando…'
              ) : added ? (
                <>
                  <Check size={16} /> Adicionado ao carrinho
                </>
              ) : (
                <>
                  Adicionar ao carrinho <ArrowRight size={16} />
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              disabled={favorite.isPending || !session.data}
              aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              aria-pressed={isFavorite}
              onClick={() => favorite.mutate({ id, active: !isFavorite })}
            >
              <Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} />
            </Button>
          </div>
          {!session.data && (
            <p className="field-hint">
              <Link to="/login" search={{ redirect: `/nft/${id}` }}>
                Entre para salvar favoritos.
              </Link>{' '}
              Você pode adicionar ao carrinho como visitante.
            </p>
          )}
          {add.isError && <Notice tone="error">{errorMessage(add.error)}</Notice>}
          {favorite.isError && (
            <Notice tone="error">
              {errorMessage(favorite.error)} O estado anterior foi restaurado.
            </Notice>
          )}
          {added && (
            <Notice tone="success">
              A obra está no seu carrinho. <Link to="/cart">Ver carrinho →</Link>
            </Notice>
          )}
          <div className="detail-assurance">
            <ShieldCheck size={18} />
            <span>Cotação e disponibilidade confirmadas no checkout.</span>
          </div>
        </div>
      </div>
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Continuar explorando
      </Link>
    </section>
  );
}
