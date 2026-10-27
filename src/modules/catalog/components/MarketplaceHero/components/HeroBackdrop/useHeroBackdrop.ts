import { useId } from 'react';

export function useHeroBackdrop() {
  const prefix = useId().replaceAll(':', '');
  return {
    surfaceId: `${prefix}-surface`,
    firstOrbId: `${prefix}-first-orb`,
    secondOrbId: `${prefix}-second-orb`,
    maskId: `${prefix}-mask`,
  };
}
