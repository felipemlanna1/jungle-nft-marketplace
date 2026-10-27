import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Wallet } from '../../../../contracts';
import { market } from '../../../../services/marketplace';
import { assertSessionOwner, useAuthenticatedUser } from '../../hooks/useAccount';
import type { WalletChange, WalletEditor, WalletFormValues } from '../../shared-types';
const emptyWallet: WalletFormValues = {
  displayName: '',
  label: '',
  profileName: '',
  address: '',
  secondaryAddress: '',
  network: 'Ethereum',
  walletType: '',
  referralCode: '',
  email: '',
  ens: '',
};
const formValues = (wallet: Wallet): WalletFormValues => ({
  ...emptyWallet,
  ...wallet,
  walletType: wallet.walletType ?? '',
});
export function useWallets() {
  const session = useAuthenticatedUser();
  const user = session.data;
  const client = useQueryClient();
  const wallets = useQuery({
    queryKey: ['wallets', user?.id],
    queryFn: () => market.wallets(),
    enabled: !!user,
  });
  const [editor, setEditor] = useState<WalletEditor>({ wallet: null, primary: true });
  const [values, setValues] = useState<WalletFormValues>(emptyWallet);
  const [sameAsPrimary, setSameAsPrimary] = useState(false);
  const [error, setError] = useState('');
  const initializedUser = useRef<string | null>(null);
  const primaryWallet = wallets.data?.find((wallet) => wallet.primary);
  const secondaryWallets = wallets.data?.filter((wallet) => !wallet.primary) ?? [];
  useEffect(() => {
    if (!user || !wallets.data || initializedUser.current === user.id) return;
    initializedUser.current = user.id;
    const primary = wallets.data.find((wallet) => wallet.primary);
    setEditor({ wallet: primary ?? null, primary: true });
    setValues(primary ? formValues(primary) : emptyWallet);
    setError('');
    setSameAsPrimary(false);
  }, [user, wallets.data]);
  const ready = Boolean(user && initializedUser.current === user.id && wallets.data);
  const save = useMutation({
    mutationKey: ['wallet-save', user?.id],
    mutationFn: ({ wallet, owner }: WalletChange) => {
      assertSessionOwner(client, owner);
      return market.saveWallet(wallet);
    },
    onSuccess: (saved, { owner, wallet }) => {
      if (client.getQueryData<{ id: string }>(['session'])?.id !== owner) return;
      client.setQueryData(['wallets', owner], saved);
      const updated =
        saved.find((item) => item.id === wallet.id) ??
        saved.find((item) => item.address.toLowerCase() === wallet.address?.toLowerCase());
      if (updated) {
        setEditor({ wallet: updated, primary: updated.primary });
        setValues(formValues(updated));
      }
      setError('');
    },
  });
  function setField<K extends keyof WalletFormValues>(field: K, value: WalletFormValues[K]) {
    if (!ready || save.isPending) return;
    setValues((current) => ({ ...current, [field]: value }));
    setError('');
    save.reset();
  }
  function edit(wallet: Wallet) {
    if (!ready || save.isPending) return;
    setEditor({ wallet, primary: wallet.primary });
    setValues(formValues(wallet));
    setError('');
    setSameAsPrimary(false);
    save.reset();
  }
  function add(primary: boolean) {
    if (!ready || save.isPending) return;
    setEditor({ wallet: null, primary });
    setValues(emptyWallet);
    setError('');
    setSameAsPrimary(false);
    save.reset();
  }
  function copyPrimary() {
    if (!ready || save.isPending || !primaryWallet) return;
    setSameAsPrimary(true);
    setEditor({ wallet: primaryWallet, primary: true });
    setValues(formValues(primaryWallet));
    setError('');
    save.reset();
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!user || !ready || save.isPending) return;
    if (!/^0x[a-fA-F0-9]{40}$/.test(values.address.trim())) {
      setError('Informe um endereço 0x com 40 caracteres hexadecimais.');
      return;
    }
    if (
      values.secondaryAddress.trim() &&
      !/^(0x[a-fA-F0-9]{40}|[a-zA-Z0-9-]+\.eth)$/.test(values.secondaryAddress.trim())
    ) {
      setError('Informe um endereço secundário 0x válido ou um nome .eth.');
      return;
    }
    const { walletType, ...fields } = values;
    setError('');
    save.mutate({
      owner: user.id,
      wallet: {
        ...fields,
        ...(walletType ? { walletType } : {}),
        ...(editor.wallet ? { id: editor.wallet.id } : {}),
        label: values.label.trim(),
        address: values.address.trim(),
        primary: editor.primary,
      },
    });
  }
  return {
    ready,
    user,
    wallets,
    editor,
    values,
    setField,
    error,
    save,
    edit,
    add,
    submit,
    primaryWallet,
    secondaryWallets,
    sameAsPrimary,
    copyPrimary,
  };
}
