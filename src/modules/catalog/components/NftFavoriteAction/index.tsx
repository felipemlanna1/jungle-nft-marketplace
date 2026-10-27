import { Link } from '@tanstack/react-router';
import { Heart } from 'lucide-react';
import { Button } from '../../../../styleguide';
import type { NftFavoriteActionProps } from '../../shared-types';

export function NftFavoriteAction({
  nftId,
  authenticated,
  active,
  pending,
  onToggle,
  className = '',
  showLabel = true,
}: NftFavoriteActionProps) {
  const icon = <Heart size={18} fill={active ? 'currentColor' : 'none'} aria-hidden="true" />;
  if (!authenticated)
    return (
      <Button variant="secondary" className={className} asChild>
        <Link
          to="/login"
          search={{ redirect: `/nft/${nftId}`, favorite: nftId }}
          aria-label="Entrar para favoritar"
        >
          {icon}
          {showLabel && <span>Favoritar</span>}
        </Link>
      </Button>
    );
  return (
    <Button
      variant="secondary"
      className={className}
      disabled={pending}
      aria-label={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      aria-pressed={active}
      onClick={onToggle}
    >
      {icon}
      {showLabel && <span>Favoritar</span>}
    </Button>
  );
}
