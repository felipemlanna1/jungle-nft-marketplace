import { useEffect, useRef, useState } from 'react';
import type { User } from '../../../../contracts';
import type { CheckoutFields } from '../../shared-types';

const emptyFields: CheckoutFields = {
  username: '',
  profileName: '',
  ens: '',
  referralCode: '',
  notes: '',
  manualWallet: false,
  address: '',
  secondaryAddress: '',
  walletType: 'MetaMask',
};
export function useCheckoutFields(user?: User | null) {
  const initializedId = useRef<string | null>(null);
  const [fields, setFields] = useState<CheckoutFields>(emptyFields);
  useEffect(() => {
    if (!user || initializedId.current === user.id) return;
    initializedId.current = user.id;
    setFields({
      ...emptyFields,
      username: user.username ?? user.email.split('@')[0],
      profileName: user.walletNickname ?? user.name,
      ens: user.ens ?? '',
    });
  }, [user]);
  const setField = <K extends keyof CheckoutFields>(field: K, value: CheckoutFields[K]) =>
    setFields((current) => ({ ...current, [field]: value }));
  return { fields, setField };
}
