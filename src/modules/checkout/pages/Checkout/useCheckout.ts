import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { Network, Order, OrderInput, Quote } from '../../../../contracts';
import { market } from '../../../../services/marketplace';
import { messageOf, useAuthenticatedUser } from '../../../account/hooks/useAccount';
import { readCoupon } from '../../hooks/useCart';
import { clearAttempt, readAttempt, saveAttempt, type PurchaseAttempt } from '../../attempt';

export function useCheckout() {
  const session = useAuthenticatedUser();
  const user = session.data;
  const navigate = useNavigate();
  const client = useQueryClient();
  const cart = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => market.cart(),
    enabled: !!user,
  });
  const coupon = user ? readCoupon(user.id) : '';
  const quote = useQuery({
    queryKey: ['quote', user?.id, cart.data?.version, coupon],
    queryFn: () => market.quote(coupon || undefined),
    enabled: !!user && !!cart.data?.items.length,
    retry: false,
  });
  const wallets = useQuery({
    queryKey: ['wallets', user?.id],
    queryFn: () => market.wallets(),
    enabled: !!user,
  });
  const [collectorName, setCollectorName] = useState('');
  const [collectorEmail, setCollectorEmail] = useState('');
  const [walletId, setWalletId] = useState('');
  const [network, setRede] = useState<Network>('Ethereum');
  const [connection, setConnection] = useState<'idle' | 'connected' | 'declined'>('idle');
  const [review, setReview] = useState<Quote | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const [attempt, setAttempt] = useState<PurchaseAttempt | null>(null);
  const initializedUserId = useRef<string | null>(null);
  useEffect(() => {
    if (!user || initializedUserId.current === user.id) return;
    initializedUserId.current = user.id;
    setCollectorName(user.name);
    setCollectorEmail(user.email);
    setAttempt(readAttempt(user.id));
    setWalletId('');
    setRede('Ethereum');
    setConnection('idle');
    setReview(null);
    setError('');
    setPending(false);
    busy.current = false;
  }, [user]);
  useEffect(() => {
    const primary = wallets.data?.find((w) => w.primary) ?? wallets.data?.[0];
    if (primary && !walletId) {
      setWalletId(primary.id);
      setRede(primary.network);
    }
  }, [wallets.data, walletId]);
  const proceed = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!walletId || connection !== 'connected') {
      setError('Conecte uma carteira salva para continuar.');
      return;
    }
    if (wallets.data?.find((wallet) => wallet.id === walletId)?.network !== network) {
      setError('Selecione a mesma rede cadastrada na carteira.');
      return;
    }
    if (quote.data) setReview(quote.data);
  };
  const showOrder = (order: Order, input: OrderInput) => {
    if (!user) return;
    const next = { userId: user.id, input, orderId: order.id };
    saveAttempt(next);
    setAttempt(next);
    client.setQueryData(['order', user.id, order.id], order);
    void client.invalidateQueries({ queryKey: ['cart'] });
    void navigate({ to: '/orders/$id', params: { id: order.id } });
  };
  const submitPurchase = async () => {
    if (!user || !review || busy.current) return;
    busy.current = true;
    setPending(true);
    setError('');
    let submittedInput = attempt?.input;
    try {
      if (attempt) {
        const existing = await market.findOrderByAttempt(attempt.input.idempotencyKey);
        if (existing) {
          showOrder(existing, attempt.input);
          return;
        }
        showOrder(await market.order(attempt.input), attempt.input);
        return;
      }
      const fresh = await market.quote(coupon || undefined);
      client.setQueryData(['quote', user.id, cart.data?.version, coupon], fresh);
      if (fresh.fingerprint !== review.fingerprint) {
        setReview(fresh);
        setError(
          'The price, availability or fees changed. Review the updated order and confirm again.',
        );
        return;
      }
      const input: OrderInput = {
        quoteFingerprint: fresh.fingerprint,
        idempotencyKey: crypto.randomUUID(),
        walletId,
        network,
        collectorName: collectorName.trim(),
        collectorEmail: collectorEmail.trim(),
        ...(coupon ? { coupon } : {}),
      };
      submittedInput = input;
      const saved = { userId: user.id, input };
      if (!saveAttempt(saved)) {
        setError(
          'O armazenamento do navegador está indisponível. Nenhuma compra foi iniciada. Habilite o armazenamento para recuperar a tentativa após atualizar a página.',
        );
        return;
      }
      setAttempt(saved);
      showOrder(await market.order(input), input);
    } catch (cause) {
      let rejectedBeforeCreation = false;
      if (
        submittedInput &&
        axios.isAxiosError(cause) &&
        cause.response &&
        cause.response.status >= 400 &&
        cause.response.status < 500
      ) {
        try {
          const existing = await market.findOrderByAttempt(submittedInput.idempotencyKey);
          if (existing) {
            showOrder(existing, submittedInput);
            return;
          }
          rejectedBeforeCreation = true;
          clearAttempt(user.id);
          setAttempt(null);
          setReview(null);
          void client.invalidateQueries({ queryKey: ['cart'] });
          void client.invalidateQueries({ queryKey: ['quote'] });
        } catch {
          /* Uncertain outcome keeps the attempt for recovery. */
        }
      }
      setError(
        messageOf(cause) +
          (rejectedBeforeCreation
            ? ' Revise os dados e tente novamente.'
            : ' Seus itens foram preservados. Recupere esta tentativa antes de iniciar outra compra.'),
      );
    } finally {
      busy.current = false;
      setPending(false);
    }
  };
  const recover = async () => {
    if (!user || !attempt || busy.current) return;
    busy.current = true;
    setPending(true);
    setError('');
    try {
      const existing = await market.findOrderByAttempt(attempt.input.idempotencyKey);
      if (existing) showOrder(existing, attempt.input);
      else showOrder(await market.order(attempt.input), attempt.input);
    } catch (cause) {
      if (
        axios.isAxiosError(cause) &&
        cause.response &&
        cause.response.status >= 400 &&
        cause.response.status < 500
      ) {
        try {
          const existing = await market.findOrderByAttempt(attempt.input.idempotencyKey);
          if (existing) {
            showOrder(existing, attempt.input);
            return;
          }
          clearAttempt(user.id);
          setAttempt(null);
          setReview(null);
          void client.invalidateQueries({ queryKey: ['cart'] });
          void client.invalidateQueries({ queryKey: ['quote'] });
          setError(
            messageOf(cause) +
              ' A tentativa não criou um pedido. Revise os dados antes de tentar novamente.',
          );
          return;
        } catch {
          /* Keep the attempt whenever the server outcome remains uncertain. */
        }
      }
      setError(messageOf(cause));
    } finally {
      busy.current = false;
      setPending(false);
    }
  };
  return {
    user,
    cart,
    quote,
    wallets,
    collectorName,
    setCollectorName,
    collectorEmail,
    setCollectorEmail,
    walletId,
    setWalletId,
    network,
    setRede,
    connection,
    setConnection,
    review,
    setReview,
    error,
    pending,
    attempt,
    proceed,
    submitPurchase,
    recover,
  };
}
