import { Link } from '@tanstack/react-router';
import { ArrowRight, Compass, Diamond, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { Button } from '../../../../styleguide';
import type { MarketplaceHeroProps } from '../../shared-types';

export function MarketplaceHero({ appearance }: MarketplaceHeroProps) {
  if (appearance === 'expedition') {
    return (
      <section className="game-hero page-shell" aria-labelledby="hero-title">
        <img
          className="game-hero-background"
          src="/art/expedition-hero.webp"
          width="1672"
          height="941"
          alt=""
          fetchPriority="high"
        />
        <div className="game-hero-content">
          <p className="eyebrow">
            <span className="live-dot" /> UM UNIVERSO PARA EXPLORAR
          </p>
          <h1 id="hero-title">
            Sua próxima
            <br />
            grande <span className="accent">descoberta.</span>
          </h1>
          <p className="game-hero-description">
            Entre em novos mundos. Descubra arte digital e encontre as próximas peças da sua
            coleção.
          </p>
          <div className="game-hero-actions">
            <Button asChild>
              <a href="#marketplace">
                Explorar coleção <ArrowRight size={18} />
              </a>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/profile">
                Meu perfil <UserRound size={17} />
              </Link>
            </Button>
          </div>
          <div className="game-hero-meta">
            <span>
              <Compass size={15} /> Descubra criadores
            </span>
            <span>
              <ShieldCheck size={15} /> Explore coleções
            </span>
          </div>
        </div>
        <div className="game-hero-seal" aria-hidden="true">
          <Diamond size={23} />
          <span>
            <small>ARTE SEM LIMITES</small>
            <strong>Um novo mundo espera.</strong>
          </span>
        </div>
      </section>
    );
  }
  return (
    <section className="hero page-shell" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="live-dot" /> Bem-vindo à Kurio
        </p>
        <h1 id="hero-title">
          Seja dono do futuro
          <br />
          da arte digital<span className="accent">.</span>
        </h1>
        <p className="hero-description">
          Descubra NFTs selecionados de criadores, colecione o extraordinário e faça parte de uma
          nova cultura.
        </p>
        <Button asChild>
          <a href="#marketplace">
            Explorar coleção <ArrowRight size={16} />
          </a>
        </Button>
        <div className="hero-proof">
          <div className="avatar-stack">
            <span>AC</span>
            <span>LM</span>
            <span>JR</span>
          </div>
          <p>
            Arte original.
            <br />
            <strong>Possibilidades extraordinárias.</strong>
          </p>
        </div>
      </div>
      <div className="hero-art">
        <img
          src="/art/hero.svg"
          width="680"
          height="680"
          alt="Escultura digital abstrata em tons de âmbar, obra demonstrativa"
          fetchPriority="high"
        />
        <div className="hero-art-caption">
          <span>
            <span className="overline">Coleção em destaque</span>
            <strong>Beyond the ordinary</strong>
          </span>
          <Link to="/nft/$id" params={{ id: 'nft-1' }} aria-label="Explorar coleção em destaque">
            <ArrowRight size={19} />
          </Link>
        </div>
        <span className="hero-art-label">
          <Sparkles size={13} /> Arte sem limites
        </span>
      </div>
    </section>
  );
}
