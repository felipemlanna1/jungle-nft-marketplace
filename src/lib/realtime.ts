import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { z } from 'zod';
import type { NFT, Order, User } from '../contracts';
import { keys, queryClient } from './query';

const versioned = z.object({ eventId: z.string().min(1), version: z.number().int().positive() });
let currentSocket: Socket | undefined;
export function disconnectRealtime() {
  currentSocket?.disconnect();
}
export function reconnectRealtime() {
  currentSocket?.connect();
}
/** One socket per mounted application shell, closed on session transition/unmount. */
export function useRealtime(user: User | null | undefined) {
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    const userId = user?.id;
    let socket: Socket | undefined;
    let disposed = false;
    async function connect() {
      // Import only after MSW has patched WebSocket; Engine.IO captures its constructor on import.
      const { io } = await import('socket.io-client');
      if (disposed) return;
      socket = io(location.origin, {
        path: '/marketplace-events/',
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 500,
        reconnectionDelayMax: 5_000,
        randomizationFactor: 0.3,
        query: userId ? { userId } : {},
      });
      currentSocket = socket;
      const seen = new Map<string, number>();
      const activeUser = () =>
        (queryClient.getQueryData<User | null>(keys.session)?.id ?? null) === (userId ?? null);
      const invalidate = () => {
        if (!activeUser()) return;
        void queryClient.invalidateQueries({ queryKey: ['catalog'] });
        void queryClient.invalidateQueries({ queryKey: ['nft'] });
        void queryClient.invalidateQueries({ queryKey: ['cart', userId ?? 'guest'] });
        void queryClient.invalidateQueries({ queryKey: ['quote', userId ?? 'guest'] });
        if (userId) void queryClient.invalidateQueries({ queryKey: ['order', userId] });
      };
      const onConnect = () => {
        setConnected(true);
        invalidate();
      };
      const onDisconnect = () => setConnected(false);
      const onNft = (input: unknown) => {
        const parsed = versioned
          .extend({
            nft: z.object({ id: z.string(), version: z.number().int().positive() }).passthrough(),
          })
          .safeParse(input);
        if (!parsed.success || !activeUser()) return;
        const { nft, version } = parsed.data;
        const latest = Math.max(
          seen.get(`nft:${nft.id}`) ?? 0,
          queryClient.getQueryData<NFT>(keys.nft(nft.id))?.version ?? 0,
        );
        if (version <= latest) return;
        seen.set(`nft:${nft.id}`, version);
        // The REST resource remains authoritative. Events invalidate every relevant projection.
        invalidate();
        window.dispatchEvent(
          new CustomEvent('marketplace:notice', {
            detail:
              'A collectible price or availability changed. Review the updated total before purchasing.',
          }),
        );
      };
      const onOrder = (input: unknown) => {
        const parsed = versioned
          .extend({
            userId: z.string(),
            order: z
              .object({
                id: z.string(),
                version: z.number().int().positive(),
                status: z.enum(['pending', 'confirmed', 'refused']),
              })
              .passthrough(),
          })
          .safeParse(input);
        if (!parsed.success || !activeUser() || parsed.data.userId !== userId) return;
        const { order, version } = parsed.data;
        const key = keys.order(order.id, userId);
        const existing = queryClient.getQueryData<Order>(key);
        if (version <= Math.max(seen.get(`order:${order.id}`) ?? 0, existing?.version ?? 0)) return;
        if (existing?.status === 'confirmed' || existing?.status === 'refused') return;
        seen.set(`order:${order.id}`, version);
        void queryClient.invalidateQueries({ queryKey: key });
        void queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      };
      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('connect_error', onDisconnect);
      socket.on('nft.updated', onNft);
      socket.on('order.updated', onOrder);
    }
    void connect();
    return () => {
      disposed = true;
      socket?.off();
      socket?.disconnect();
      if (currentSocket === socket) currentSocket = undefined;
      setConnected(false);
    };
  }, [user?.id]);
  return { connected };
}
