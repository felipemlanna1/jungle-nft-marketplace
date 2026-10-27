import { useState, type FormEvent } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { market } from '../../../../services/marketplace';
import { messageOf, passwordValid, safeRedirect, useAcceptSession } from '../../hooks/useAccount';

export function useAuthForm(register: boolean) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setSenha] = useState('');
  const [validation, setValidation] = useState('');
  const search = useSearch({ strict: false }) as { redirect?: string };
  const navigate = useNavigate();
  const accept = useAcceptSession();
  const redirect = safeRedirect(search.redirect);
  const mutation = useMutation({
    mutationFn: () =>
      register
        ? market.register(name.trim(), email.trim(), password)
        : market.login(email.trim(), password),
    onSuccess: async (user) => {
      await accept(user);
      void navigate({ to: redirect });
    },
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (mutation.isPending) return;
    if (register && !passwordValid(password)) {
      setValidation(
        'Use at least 8 characters, including an uppercase letter, a lowercase letter and a number.',
      );
      return;
    }
    setValidation('');
    mutation.mutate();
  };
  const error = validation || (mutation.error ? messageOf(mutation.error) : '');
  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setSenha,
    redirect,
    mutation,
    submit,
    error,
  };
}
