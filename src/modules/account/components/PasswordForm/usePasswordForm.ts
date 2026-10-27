import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { market } from '../../../../services/marketplace';
import { passwordValid } from '../../hooks/useAccount';
export function usePasswordForm() {
  const [current, setCurrent] = useState('');
  const [password, setSenha] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const mutation = useMutation({
    mutationFn: () => market.changePassword(current, password),
    onSuccess: () => {
      setCurrent('');
      setSenha('');
      setConfirm('');
    },
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirm) {
      setError('The new passwords do not match.');
      return;
    }
    if (!passwordValid(password)) {
      setError('Use at least 8 characters with uppercase, lowercase and a number.');
      return;
    }
    setError('');
    mutation.mutate();
  };
  return {
    current,
    setCurrent,
    password,
    setSenha,
    confirm,
    setConfirm,
    error,
    mutation,
    submit,
  };
}
