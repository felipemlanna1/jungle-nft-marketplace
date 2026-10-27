import type { FooterProps } from '../shared-types';
import { Newsletter } from './components/Newsletter';
import { footerSocialLinks } from './content';
import { Link } from '@tanstack/react-router';
import { Bell, Palette, Wallet } from 'lucide-react';
import { catalogCategories } from '../../../domain/catalog';

const benefits = [
  {
    Icon: Wallet,
    title: 'Segurança da carteira',
    text: 'Proteja sua carteira e colecione arte digital com confiança.',
  },
  {
    Icon: Palette,
    title: 'Criadores em destaque',
    text: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.',
  },
  {
    Icon: Bell,
    title: 'Alertas de lançamentos',
    text: 'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.',
  },
];
const helpLinks = [
  'Central de ajuda',
  'Como comprar NFTs',
  'Carteira e segurança',
  'Política do mercado',
  'Denunciar item',
];

export function Footer({ onOpenOptions, onOpenFavorites }: FooterProps) {
  return (
    <footer className="site-footer page-shell" aria-label="Rodapé">
      <div className="footer-benefits">
        {benefits.map(({ Icon, title, text }) => (
          <div className="footer-benefit" key={title}>
            <span className="footer-medallion">
              <Icon size={28} strokeWidth={1.6} aria-hidden="true" />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
        <Newsletter />
      </div>
      <div className="footer-brand-band">
        <Link to="/" className="wordmark">
          KURIO
        </Link>
        <p>
          Feito para colecionadores,
          <br />
          criadores e cultura
        </p>
        <span>Contato demonstrativo</span>
        <span>Sem transações reais</span>
      </div>
      <div className="footer-columns">
        <div>
          <h3>Meu perfil</h3>
          <Link to="/profile">Meu perfil</Link>
          <span>Minha coleção</span>
          <span>Atividade</span>
          <span>Estúdio do criador</span>
          <button className="footer-text-action" type="button" onClick={onOpenFavorites}>
            Lista de interesse
          </button>
        </div>
        <div>
          <h3>Central de ajuda</h3>
          {helpLinks.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div>
          <h3>Coleções</h3>
          {catalogCategories
            .filter((item) => ['Art', 'Photography', 'Music', '3D', 'Utility'].includes(item.value))
            .map((item) => (
              <Link key={item.value} to="/" search={{ category: item.value }}>
                {item.label}
              </Link>
            ))}
        </div>
        <div className="footer-networks">
          <h3>Redes sociais</h3>
          <div className="footer-socials" role="group" aria-label="Redes sociais ilustrativas">
            {footerSocialLinks.map(({ name, href, image }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Abrir ${name} em nova aba`}
                title={`Link ilustrativo: ${name}`}
              >
                <img src={image} width="30" height="30" alt="" />
              </a>
            ))}
          </div>
          <small className="footer-socials-disclaimer">Links ilustrativos do protótipo.</small>
          <h3>Carteiras compatíveis</h3>
          <p className="footer-wallets">METAMASK · WALLETCONNECT · COINBASE</p>
          <small>Interface demonstrativa. Sem conexão a carteiras reais.</small>
        </div>
      </div>
      <p className="footer-copyright">© 2026 Kurio. Propriedade digital para todos.</p>
      <button
        type="button"
        className="demo-options-link"
        aria-label="Opções da demonstração"
        onClick={onOpenOptions}
      >
        Demonstração
      </button>
    </footer>
  );
}
