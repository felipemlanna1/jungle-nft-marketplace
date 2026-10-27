import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { market } from '../../../../services/marketplace';
import { useAuthenticatedUser } from '../../hooks/useAccount';

export function useProfile() {
  const session = useAuthenticatedUser();
  const client = useQueryClient();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [localError, setLocalError] = useState('');
  const initializedUserId = useRef<string | null>(null);
  useEffect(() => {
    const user = session.data;
    if (!user || initializedUserId.current === user.id) return;
    initializedUserId.current = user.id;
    setName(user.name);
    setAvatar(user.avatar ?? '');
    setLocalError('');
  }, [session.data]);
  const save = useMutation({
    mutationFn: () => market.updateProfile({ name: name.trim(), avatar }),
    onSuccess: (user) => {
      const active = client.getQueryData<{ id: string }>(['session']);
      if (active?.id === user.id) client.setQueryData(['session'], user);
    },
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!save.isPending) save.mutate();
  };
  const loadAvatar = (file?: File) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 350_000) {
      setLocalError('Choose a PNG, JPEG or WebP image smaller than 350 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(String(reader.result));
      setLocalError('');
    };
    reader.onerror = () => setLocalError('We could not read that image. Please try another.');
    reader.readAsDataURL(file);
  };
  return {
    session,
    name,
    setName,
    avatar,
    localError,
    save,
    submit,
    loadAvatar,
  };
}
