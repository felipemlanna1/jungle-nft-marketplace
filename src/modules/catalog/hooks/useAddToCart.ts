import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '../../../contracts';
import { market } from '../../../services/marketplace';
import type { AddToCartInput } from '../shared-types';

export function useAddToCart(ownerId: string) {
  const client = useQueryClient();
  const ownsSession = (ownerId: string) =>
    (client.getQueryData<User | null>(['session'])?.id ?? 'guest') === ownerId;
  const mutation = useMutation({
    mutationKey: ['cart-add', ownerId],
    mutationFn: (input: AddToCartInput) => {
      if (!ownsSession(input.ownerId)) throw new Error('A sessão mudou. Tente novamente.');
      return market.addItem(input.nftId, input.quantity, input.editionId);
    },
    onSuccess: async (_data, input) => {
      if (!ownsSession(input.ownerId)) return;
      await client.invalidateQueries({ queryKey: ['cart', input.ownerId] });
      await client.invalidateQueries({ queryKey: ['quote', input.ownerId] });
    },
  });
  const ownsFeedback = mutation.variables?.ownerId === ownerId;
  return {
    mutate: mutation.mutate,
    reset: mutation.reset,
    isSuccess: ownsFeedback && mutation.isSuccess,
    isPending: ownsFeedback && mutation.isPending,
    isError: ownsFeedback && mutation.isError,
    error: ownsFeedback ? mutation.error : null,
  };
}
