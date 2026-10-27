import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { market } from '../../../../services/marketplace';
import { assertSessionOwner, passwordValid, useSession } from '../../hooks/useAccount';
import type { PasswordChange } from '../../shared-types';
export function usePasswordForm() {
  const client = useQueryClient();
  const session = useSession();
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const mutation = useMutation({
    mutationKey: ['password-change', session.data?.id],
    mutationFn: ({ owner, current, password }: PasswordChange) => {
      assertSessionOwner(client, owner);
      return market.changePassword(current, password);
    },
    onSuccess: (_result, { owner }) => {
      if (client.getQueryData<{ id: string }>(['session'])?.id !== owner) return;
      setCurrent('');
      setPassword('');
      setConfirm('');
    },
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!session.data || mutation.isPending) return;
    if (password !== confirm) {
      setError('As novas senhas não coincidem.');
      return;
    }
    if (!passwordValid(password)) {
      setError('Use 8 ou mais caracteres, com maiúscula, minúscula e número.');
      return;
    }
    setError('');
    mutation.mutate({ owner: session.data.id, current, password });
  };
  return {
    current,
    setCurrent,
    password,
    setPassword,
    confirm,
    setConfirm,
    error,
    mutation,
    submit,
  };
}
