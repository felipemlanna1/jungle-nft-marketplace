import { useEffect, useRef, useState } from 'react';
import { useLocation } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { market } from '../../../services/marketplace';
import { useRealtime } from '../../../lib/realtime';
import { useNftPreviewStore } from '../../../modules/catalog/stores/useNftPreviewStore';
import { keys } from '../../../lib/query';

const titles: Record<string, string> = {
  nft: 'Obra',
  cart: 'Carrinho',
  checkout: 'Pagamento',
  login: 'Entrar',
  register: 'Criar conta',
  profile: 'Perfil',
  wallets: 'Carteiras',
  orders: 'Pedido',
};
export function useAppShell() {
  const previewNftId = useNftPreviewStore((state) => state.nftId);
  const [scenariosOpen, setScenariosOpen] = useState(false);
  const scenarioTrigger = useRef<HTMLElement | null>(null);
  const openScenarios = () => {
    scenarioTrigger.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setScenariosOpen(true);
  };
  const restoreScenarioFocus = (event: Event) => {
    event.preventDefault();
    if (scenarioTrigger.current?.isConnected)
      scenarioTrigger.current.focus({ preventScroll: true });
  };
  const location = useLocation();
  const session = useQuery({
    queryKey: keys.session,
    queryFn: ({ signal }) => market.session(signal),
    retry: false,
  });
  const { connected } = useRealtime(session.data);
  useEffect(() => {
    const section = location.pathname.split('/')[1];
    document.title = section
      ? `${titles[section] ?? 'Página'} · KURIO`
      : 'KURIO: O futuro da arte digital';
  }, [location.pathname]);
  return {
    previewNftId,
    routeKey: location.pathname + location.searchStr,
    connected,
    scenariosOpen,
    setScenariosOpen,
    openScenarios,
    restoreScenarioFocus,
  };
}
