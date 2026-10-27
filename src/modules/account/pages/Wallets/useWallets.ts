import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Network, Wallet } from '../../../../contracts';
import { market } from '../../../../services/marketplace';
import { useAuthenticatedUser } from '../../hooks/useAccount';

export function useWallets() {
  const session = useAuthenticatedUser();
  const user = session.data;
  const client = useQueryClient();
  const wallets = useQuery({
    queryKey: ['wallets', user?.id],
    queryFn: () => market.wallets(),
    enabled: !!user,
  });
  const [editing, setEditing] = useState<Wallet | null>(null);
  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [network, setRede] = useState<Network>('Ethereum');
  const [primary, setPrincipal] = useState(false);
  const [error, setError] = useState('');
  const save = useMutation({
    mutationFn: () =>
      market.saveWallet({
        ...(editing ? { id: editing.id } : {}),
        label: label.trim(),
        address: address.trim(),
        network,
        primary,
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['wallets'] });
      setEditing(null);
      setLabel('');
      setAddress('');
      setPrincipal(false);
    },
  });
  const edit = (wallet: Wallet) => {
    setEditing(wallet);
    setLabel(wallet.label);
    setAddress(wallet.address);
    setRede(wallet.network);
    setPrincipal(wallet.primary);
    setError('');
    save.reset();
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!/^0x[a-fA-F0-9]{40}$/.test(address.trim())) {
      setError('Enter a valid 0x address with 40 hexadecimal characters.');
      return;
    }
    setError('');
    save.mutate();
  };
  return {
    user,
    wallets,
    editing,
    setEditing,
    label,
    setLabel,
    address,
    setAddress,
    network,
    setRede,
    primary,
    setPrincipal,
    error,
    save,
    edit,
    submit,
  };
}
