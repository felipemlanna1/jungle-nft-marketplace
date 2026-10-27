import { useEffect, useRef, useState, type FormEvent } from 'react';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '../../../../../contracts';
import { newsletterEmailSchema } from '../../../../../domain/schemas';
import { market } from '../../../../../services/marketplace';
import { useSession } from '../../../../../modules/account/hooks/useAccount';
import type { NewsletterDraft, NewsletterFeedback, NewsletterSubmission } from './shared-types';

export function useNewsletter() {
  const session = useSession();
  const client = useQueryClient();
  const ownerId = session.data?.id ?? 'guest';
  const identity = useRef({ ownerId, epoch: 0 });
  const [draft, setDraft] = useState<NewsletterDraft>({ ownerId, email: '' });
  const [feedback, setFeedback] = useState<NewsletterFeedback | null>(null);
  const currentOwner = () => client.getQueryData<User | null>(['session'])?.id ?? 'guest';
  const isCurrent = ({ ownerId: owner, epoch }: NewsletterSubmission) =>
    currentOwner() === owner &&
    identity.current.ownerId === owner &&
    identity.current.epoch === epoch;
  const subscription = useMutation({
    mutationKey: ['newsletter-subscribe', ownerId],
    gcTime: 0,
    mutationFn: (submission: NewsletterSubmission) => {
      if (!isCurrent(submission))
        throw new Error('A sessão mudou. Revise o e-mail antes de enviar.');
      return market.subscribeNewsletter(submission.email);
    },
    onSuccess: (_, submission) => {
      if (!isCurrent(submission)) return;
      setDraft({ ownerId: submission.ownerId, email: '' });
      setFeedback({
        ownerId: submission.ownerId,
        kind: 'success',
        message: 'Inscrição simulada confirmada. Nenhum e-mail real será enviado.',
      });
    },
    onError: (error, submission) => {
      if (!isCurrent(submission)) return;
      const invalidEmail = axios.isAxiosError(error) && error.response?.status === 400;
      setFeedback({
        ownerId: submission.ownerId,
        kind: 'error',
        invalidEmail,
        message: invalidEmail
          ? 'Revise o e-mail informado e tente novamente.'
          : 'Não foi possível confirmar sua inscrição. Tente novamente.',
      });
    },
  });
  const { reset } = subscription;
  useEffect(() => {
    if (identity.current.ownerId === ownerId) return;
    identity.current = { ownerId, epoch: identity.current.epoch + 1 };
    setDraft({ ownerId, email: '' });
    setFeedback(null);
    reset();
  }, [ownerId, reset]);
  const email = draft.ownerId === ownerId ? draft.email : '';
  const isPending = subscription.isPending && subscription.variables?.ownerId === ownerId;
  function setEmail(value: string) {
    setDraft({ ownerId, email: value });
    setFeedback(null);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending || session.isPending) return;
    if (!newsletterEmailSchema.safeParse(email.trim()).success) {
      setFeedback({
        ownerId,
        kind: 'error',
        invalidEmail: true,
        message: 'Digite um e-mail válido de até 160 caracteres.',
      });
      return;
    }
    setFeedback(null);
    subscription.mutate({ ownerId, epoch: identity.current.epoch, email: email.trim() });
  }
  return {
    email,
    setEmail,
    submit,
    isPending,
    disabled: session.isPending || isPending,
    feedback: feedback?.ownerId === ownerId ? feedback : null,
  };
}
