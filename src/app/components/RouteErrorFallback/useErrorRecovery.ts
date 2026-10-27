import { useCallback } from 'react';
export function useErrorRecovery() {
  const reload = useCallback(() => window.location.reload(), []);
  return { reload };
}
