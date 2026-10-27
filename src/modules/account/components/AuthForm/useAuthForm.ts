import { useState, type FormEvent } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { market } from '../../../../services/marketplace';
import { DEMO_LOGIN } from '../../../../config/demo';
import { keys } from '../../../../lib/query';
import type { AuthSearch } from '../../shared-types';
import {
  assertSessionOwner,
  messageOf,
  passwordValid,
  safeRedirect,
  useAcceptSession,
} from '../../hooks/useAccount';
import type { User } from '../../../../contracts';
export function useAuthForm(register: boolean) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [validation, setValidation] = useState('');
  const [demoFilled, setDemoFilled] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const search = useSearch({ strict: false }) as AuthSearch;
  const navigate = useNavigate();
  const client = useQueryClient();
  const accept = useAcceptSession();
  const redirect = safeRedirect(search.redirect);
  const mutation = useMutation({
    mutationFn: async () => {
      await client.fetchQuery({
        queryKey: keys.session,
        queryFn: ({ signal }) => market.session(signal),
        staleTime: 0,
        retry: false,
      });
      return register
        ? market.register(name.trim(), email.trim(), password)
        : market.login(email.trim(), password);
    },
    onSuccess: async (user) => {
      await accept(user);
      if (search.favorite) {
        try {
          assertSessionOwner(client, user.id);
          const favorites = await market.toggleFavorite(search.favorite, true);
          if (client.getQueryData<User | null>(['session'])?.id !== user.id) return;
          client.setQueryData(['favorites', user.id], favorites);
        } catch (cause) {
          if (client.getQueryData<User | null>(['session'])?.id !== user.id) return;
          setValidation(
            `Você entrou, mas não foi possível salvar o favorito. ${messageOf(cause)} Você pode tentar novamente ou voltar ao marketplace.`,
          );
          setCanContinue(true);
          return;
        }
      }
      void navigate({ to: redirect });
    },
  });
  function submit(event: FormEvent) {
    event.preventDefault();
    if (mutation.isPending) return;
    if (register && !name.trim()) {
      setValidation('Informe seu nome.');
      return;
    }
    if (register && !passwordValid(password)) {
      setValidation('Use 8 ou mais caracteres, com maiúscula, minúscula e número.');
      return;
    }
    if (register && password !== confirm) {
      setValidation('As senhas não coincidem.');
      return;
    }
    setValidation('');
    setCanContinue(false);
    mutation.mutate();
  }
  function fillDemoLogin() {
    setEmail(DEMO_LOGIN.email);
    setPassword(DEMO_LOGIN.password);
    setValidation('');
    setDemoFilled(true);
    setCanContinue(false);
    mutation.reset();
  }
  function unavailable(provider: string) {
    setValidation(
      provider === 'Recuperação de senha'
        ? 'A recuperação de senha não está conectada nesta demonstração. Use uma conta de demonstração ou crie um perfil.'
        : `O acesso com ${provider} não está conectado nesta demonstração. Entre com e-mail e senha.`,
    );
  }
  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirm,
    setConfirm,
    redirect,
    mutation,
    submit,
    unavailable,
    favoriteId: search.favorite,
    fillDemoLogin,
    demoFilled,
    canContinue,
    continueToMarketplace: () => void navigate({ to: redirect }),
    close: () => void navigate({ to: redirect }),
    error:
      validation ||
      (axios.isAxiosError(mutation.error) &&
      mutation.error.response?.data?.code === 'INVALID_CREDENTIALS'
        ? 'E-mail ou senha incorretos. Se você alterou a senha desta conta, use a senha atual.'
        : mutation.error
          ? messageOf(mutation.error)
          : ''),
  };
}
