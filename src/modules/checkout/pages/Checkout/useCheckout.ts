import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { Network, Order, OrderInput, Quote, User, WalletType } from '../../../../contracts';
import { market } from '../../../../services/marketplace';
import { messageOf, useAuthenticatedUser } from '../../../account/hooks/useAccount';
import { readCoupon } from '../../hooks/useCart';
import { useCheckoutFields } from './useCheckoutFields';
import { clearAttempt, readAttempt, saveAttempt, type PurchaseAttempt } from '../../attempt';

export function useCheckout() {
  const session = useAuthenticatedUser();
  const user = session.data;
  const { fields, setField } = useCheckoutFields(user);
  const navigate = useNavigate();
  const client = useQueryClient();
  const cart = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => market.cart(),
    enabled: !!user,
  });
  const ownsSession = () =>
    Boolean(user && client.getQueryData<User | null>(['session'])?.id === user.id);
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
  const [network, setNetwork] = useState<Network>('Ethereum');
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
    setNetwork('Ethereum');
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
      setNetwork(primary.network);
    }
  }, [wallets.data, walletId]);
  const selectedWallet = wallets.data?.find((wallet) => wallet.id === walletId);
  const cartNetworks = new Set(cart.data?.items.map((item) => item.nft.network));
  const mixedNetworks = cartNetworks.size > 1;
  const connect = async () => {
    if (!user || !ownsSession() || busy.current) return;
    setError('');
    busy.current = true;
    setPending(true);
    try {
      if (mixedNetworks) throw new Error('Remova os itens de outra rede antes de continuar.');
      if (cartNetworks.size && !cartNetworks.has(network))
        throw new Error('A rede da carteira deve ser a mesma dos NFTs.');
      if (fields.manualWallet) {
        if (!/^0x[a-fA-F0-9]{40}$/.test(fields.address))
          throw new Error('Informe um endereço válido iniciado por 0x.');
        const saved = await market.saveWallet({
          label: fields.profileName || 'Carteira da compra',
          address: fields.address,
          network,
          primary: false,
          walletType: fields.walletType,
          displayName: collectorName,
          profileName: fields.profileName,
          secondaryAddress: fields.secondaryAddress,
          email: collectorEmail,
          ens: fields.ens || undefined,
          referralCode: fields.referralCode,
        });
        if (!ownsSession()) return;
        const wallet = saved.find(
          (item) =>
            item.address.toLowerCase() === fields.address.toLowerCase() && item.network === network,
        );
        if (!wallet) throw new Error('Não foi possível salvar a carteira.');
        client.setQueryData(['wallets', user.id], saved);
        setWalletId(wallet.id);
      } else if (!selectedWallet || selectedWallet.network !== network) {
        throw new Error('Selecione uma carteira da mesma rede dos NFTs.');
      }
      if (ownsSession()) setConnection('connected');
    } catch (cause) {
      if (!ownsSession()) return;
      setError(messageOf(cause));
      setConnection('idle');
    } finally {
      if (ownsSession()) {
        busy.current = false;
        setPending(false);
      }
    }
  };
  const updateField: typeof setField = (field, value) => {
    setField(field, value);
    if (['manualWallet', 'address', 'secondaryAddress', 'walletType'].includes(field)) {
      setConnection('idle');
      setReview(null);
    }
  };
  const changeWallet = (id: string) => {
    setWalletId(id);
    const wallet = wallets.data?.find((item) => item.id === id);
    if (wallet) setNetwork(wallet.network);
    setConnection('idle');
    setReview(null);
  };
  const changeNetwork = (value: Network) => {
    setNetwork(value);
    setConnection('idle');
    setReview(null);
  };
  const changeProvider = (value: string) => {
    if (!(['MetaMask', 'WalletConnect', 'Coinbase'] as string[]).includes(value)) return;
    updateField('walletType', value as WalletType);
  };
  const disconnect = () => {
    setConnection('idle');
    setReview(null);
  };
  const declineConnection = () => {
    setConnection('declined');
    setReview(null);
  };
  const editReview = () => setReview(null);
  const proceed = (event: FormEvent) => {
    event.preventDefault();
    if (!ownsSession()) return;
    setError('');
    if (mixedNetworks) {
      setError('O carrinho contém NFTs de redes diferentes. Revise os itens.');
      return;
    }
    if (cartNetworks.size && !cartNetworks.has(network)) {
      setError('A rede da carteira deve ser a mesma dos NFTs.');
      return;
    }
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
    if (!user || !ownsSession()) return;
    const next = { userId: user.id, input, orderId: order.id };
    saveAttempt(next);
    setAttempt(next);
    client.setQueryData(['order', user.id, order.id], order);
    void client.invalidateQueries({ queryKey: ['cart'] });
    void navigate({ to: '/orders/$id', params: { id: order.id } });
  };
  const submitPurchase = async () => {
    if (!user || !ownsSession() || !review || busy.current) return;
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
        if (!ownsSession()) return;
        showOrder(await market.order(attempt.input), attempt.input);
        return;
      }
      const fresh = await market.quote(coupon || undefined);
      if (!ownsSession()) return;
      client.setQueryData(['quote', user.id, cart.data?.version, coupon], fresh);
      if (fresh.fingerprint !== review.fingerprint) {
        setReview(fresh);
        setError(
          'O preço, a disponibilidade ou as taxas mudaram. Revise os valores e confirme novamente.',
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
        provider: fields.walletType,
        collectorDetails: {
          username: fields.username.trim(),
          profileName: fields.profileName.trim(),
          ens: fields.ens.trim() || undefined,
          referralCode: fields.referralCode.trim() || undefined,
          notes: fields.notes.trim() || undefined,
        },
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
      if (!ownsSession()) return;
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
          if (!ownsSession()) return;
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
      if (ownsSession()) {
        busy.current = false;
        setPending(false);
      }
    }
  };
  const recover = async () => {
    if (!user || !ownsSession() || !attempt || busy.current) return;
    busy.current = true;
    setPending(true);
    setError('');
    try {
      const existing = await market.findOrderByAttempt(attempt.input.idempotencyKey);
      if (!ownsSession()) return;
      if (existing) showOrder(existing, attempt.input);
      else showOrder(await market.order(attempt.input), attempt.input);
    } catch (cause) {
      if (!ownsSession()) return;
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
          if (!ownsSession()) return;
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
      if (ownsSession()) {
        busy.current = false;
        setPending(false);
      }
    }
  };
  return {
    user,
    fields,
    setField: updateField,
    selectedWallet,
    mixedNetworks,
    connect,
    cart,
    quote,
    wallets,
    collectorName,
    setCollectorName,
    collectorEmail,
    setCollectorEmail,
    walletId,
    changeWallet,
    network,
    changeNetwork,
    connection,
    changeProvider,
    disconnect,
    declineConnection,
    review,
    editReview,
    error,
    pending,
    attempt,
    proceed,
    submitPurchase,
    recover,
  };
}
