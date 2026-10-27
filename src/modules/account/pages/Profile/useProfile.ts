import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { market } from '../../../../services/marketplace';
import { assertSessionOwner, useAuthenticatedUser } from '../../hooks/useAccount';
import type { ProfileChange, ProfileFormValues } from '../../shared-types';
const emptyProfile: ProfileFormValues = {
  name: '',
  username: '',
  email: '',
  ens: '',
  walletNickname: '',
  avatar: '',
};
export function useProfile() {
  const session = useAuthenticatedUser();
  const client = useQueryClient();
  const [values, setValues] = useState<ProfileFormValues>(emptyProfile);
  const [localError, setLocalError] = useState('');
  const initializedUserId = useRef<string | null>(null);
  useEffect(() => {
    const user = session.data;
    if (!user || initializedUserId.current === user.id) return;
    initializedUserId.current = user.id;
    setValues({
      name: user.name,
      email: user.email,
      username: user.username ?? '',
      ens: user.ens ?? '',
      walletNickname: user.walletNickname ?? '',
      avatar: user.avatar ?? '',
    });
    setLocalError('');
  }, [session.data]);
  const ready = Boolean(session.data && initializedUserId.current === session.data.id);
  const save = useMutation({
    mutationKey: ['profile-save', session.data?.id],
    mutationFn: ({ owner, values: snapshot }: ProfileChange) => {
      assertSessionOwner(client, owner);
      return market.updateProfile({
        ...snapshot,
        name: snapshot.name.trim(),
        email: snapshot.email.trim(),
        username: snapshot.username.trim(),
        ens: snapshot.ens.trim(),
        walletNickname: snapshot.walletNickname.trim(),
      });
    },
    onSuccess: (user, { owner }) => {
      const active = client.getQueryData<{ id: string }>(['session']);
      if (active?.id === owner && user.id === owner) client.setQueryData(['session'], user);
    },
  });
  function setField<K extends keyof ProfileFormValues>(field: K, value: ProfileFormValues[K]) {
    if (!ready || save.isPending) return;
    setValues((current) => ({ ...current, [field]: value }));
    save.reset();
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (session.data && ready && !save.isPending)
      save.mutate({ owner: session.data.id, values: { ...values } });
  }
  function loadAvatar(file?: File) {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 350_000) {
      setLocalError('Escolha uma imagem PNG, JPEG ou WebP de até 350 KB.');
      return;
    }
    const owner = initializedUserId.current;
    const reader = new FileReader();
    reader.onload = () => {
      if (initializedUserId.current !== owner) return;
      setField('avatar', String(reader.result));
      setLocalError('');
    };
    reader.onerror = () => setLocalError('Não foi possível ler a imagem. Tente outro arquivo.');
    reader.readAsDataURL(file);
  }
  return { ready, session, values, setField, localError, save, submit, loadAvatar };
}
