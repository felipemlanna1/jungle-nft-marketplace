import { useRef } from 'react';
import type { ModalProps } from './shared-types';

export function useModal({
  onOpenAutoFocus,
  onCloseAutoFocus,
}: Pick<ModalProps, 'onOpenAutoFocus' | 'onCloseAutoFocus'>) {
  const opener = useRef<HTMLElement | null>(null);
  const captureOpener = (event: Event) => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    onOpenAutoFocus?.(event);
  };
  const restoreOpener = (event: Event) => {
    onCloseAutoFocus?.(event);
    if (event.defaultPrevented || !opener.current?.isConnected) return;
    event.preventDefault();
    opener.current.focus({ preventScroll: true });
  };
  return { captureOpener, restoreOpener };
}
