import { useParams } from '@tanstack/react-router';
export function useOrderRoute() {
  return useParams({ strict: false }) as { id: string };
}
