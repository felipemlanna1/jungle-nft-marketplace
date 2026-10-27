import { useRef } from 'react';
import { tokens } from '../../../../styleguide/theme/tokens';

export function useAuthPresentation() {
  const contentRef = useRef<HTMLDivElement>(null);
  function focusContent(event: Event) {
    if (!window.matchMedia(`(max-width: ${tokens.breakpoints.mobile})`).matches) return;
    event.preventDefault();
    contentRef.current?.focus({ preventScroll: true });
  }
  return { contentRef, focusContent };
}
