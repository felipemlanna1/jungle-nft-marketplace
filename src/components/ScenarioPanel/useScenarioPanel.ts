import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { market } from '../../services/marketplace';
import { disconnectRealtime, reconnectRealtime } from '../../lib/realtime';
import type { Scenario } from '../../contracts';

export const useScenarioPanel = () => {
  const client = useQueryClient();
  const [scenario, setScenario] = useState<Scenario>('default');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const choose = async (value: Scenario) => {
    setBusy(true);
    try {
      await market.setScenario(value);
      setScenario(value);
      await client.invalidateQueries();
      setMessage('Cenário atualizado.');
    } catch {
      setMessage('Não foi possível atualizar o cenário. Tente redefinir a demonstração.');
    } finally {
      setBusy(false);
    }
  };
  const reset = async () => {
    setBusy(true);
    try {
      await market.reset();
      client.clear();
      location.assign('/');
    } catch {
      setMessage('Não foi possível redefinir os dados. Tente novamente.');
    } finally {
      setBusy(false);
    }
  };
  const changeNft = async (soldOut = false) => {
    try {
      await market.simulateNftUpdate('nft-1', soldOut);
      setMessage(
        soldOut
          ? 'Edição esgotada. O evento foi enviado pelo Socket.IO.'
          : 'Price and availability update sent through Socket.IO.',
      );
    } catch {
      setMessage('Não foi possível enviar a atualização.');
    }
  };
  const replay = async () => {
    try {
      await market.replayNftEvents('nft-1');
      setMessage('Eventos duplicados e antigos enviados pelo socket.');
    } catch {
      setMessage('Não foi possível reproduzir os eventos.');
    }
  };
  return {
    scenario,
    message,
    busy,
    choose,
    reset,
    changeNft,
    replay,
    disconnect: disconnectRealtime,
    reconnect: reconnectRealtime,
  };
};
