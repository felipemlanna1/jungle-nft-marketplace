import { useLocation } from '@tanstack/react-router';

export function useRoutePending() {
  const isNftRoute = useLocation({ select: (location) => location.pathname.startsWith('/nft/') });
  return { isNftRoute };
}
