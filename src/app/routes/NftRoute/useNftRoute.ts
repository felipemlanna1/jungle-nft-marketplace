import { useParams } from '@tanstack/react-router';
export function useNftRoute() {
  return useParams({ strict: false }) as { id: string };
}
