import { figmaAssets } from '../../../../assets/figma';
import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

export function CatalogPromotions() {
  return (
    <section className="catalog-promotions page-shell" aria-label="Coleções em destaque">
      <article className="catalog-promotion">
        <img
          src={figmaAssets.home.imgFrame136}
          width="292"
          height="250"
          alt="Emerald Ape"
          loading="lazy"
        />
        <div>
          <h2>
            Lançamentos gênesis
            <br />
            de edição limitada
          </h2>
          <p>Colecione edições escassas diretamente dos criadores antes da revelação pública.</p>
          <Link className="button" to="/nft/$id" params={{ id: 'nft-1' }}>
            Explorar <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </article>
      <article className="catalog-promotion">
        <img
          src={figmaAssets.home.imgNftArtwork05}
          width="287"
          height="250"
          alt="Neon Vessel"
          loading="lazy"
        />
        <div>
          <h2>
            Arte digital selecionada
            <br />e muito mais
          </h2>
          <p>Explore novos artistas, coleções e obras digitais que definem a cultura.</p>
          <Link className="button" to="/nft/$id" params={{ id: 'nft-3' }}>
            Explorar <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </article>
    </section>
  );
}
