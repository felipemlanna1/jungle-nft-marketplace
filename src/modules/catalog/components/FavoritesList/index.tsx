import { Link } from '@tanstack/react-router';
import { Heart } from 'lucide-react';
import { Button } from '../../../../styleguide';
import { errorMessage } from '../../../../services/marketplace';
import type { FavoritesListProps } from '../../shared-types';
import { useFavoritesList } from './useFavoritesList';

export function FavoritesList({ onNavigate }: FavoritesListProps) {
  const { user, items, isPending, error, retry } = useFavoritesList();
  if (isPending) return <p role="status">Carregando sua lista de interesse…</p>;
  if (!user)
    return (
      <div className="favorites-empty">
        <Heart size={28} aria-hidden="true" />
        <p>Entre na sua conta para salvar obras e consultar sua lista de interesse.</p>
        <Button asChild>
          <Link to="/login" search={{ redirect: '/' }} onClick={onNavigate}>
            Entrar
          </Link>
        </Button>
      </div>
    );
  if (error)
    return (
      <div role="alert">
        <p>{errorMessage(error)}</p>
        <Button variant="secondary" onClick={retry}>
          Tentar novamente
        </Button>
      </div>
    );
  if (!items.length)
    return (
      <div className="favorites-empty">
        <Heart size={28} aria-hidden="true" />
        <p>Sua lista está vazia. Use o coração de uma obra para salvá-la aqui.</p>
        <Button asChild>
          <Link to="/" onClick={onNavigate}>
            Explorar NFTs
          </Link>
        </Button>
      </div>
    );
  return (
    <ul className="favorites-list">
      {items.map((item) => (
        <li key={item.id}>
          <Link to="/nft/$id" params={{ id: item.id }} onClick={onNavigate}>
            <img src={item.image} alt="" width="64" height="64" />
            <span>
              <strong>{item.title}</strong>
              <small>{item.price} ETH</small>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
