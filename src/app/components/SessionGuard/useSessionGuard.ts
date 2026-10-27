import { useLocation } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { market } from '../../../services/marketplace';
import { safeRedirect } from '../../../lib/returnTo';
import { keys } from '../../../lib/query';
import type { SessionAccess } from '../../shared-types';

export function useSessionGuard() {
  const location = useLocation();
  const session = useQuery({
    queryKey: keys.session,
    queryFn: ({ signal }) => market.session(signal),
    retry: false,
  });
  const access: SessionAccess = session.isPending
    ? 'loading'
    : session.isError
      ? 'unavailable'
      : session.data
        ? 'authenticated'
        : 'guest';
  return { access, returnTo: safeRedirect(location.href), retry: session.refetch };
}
