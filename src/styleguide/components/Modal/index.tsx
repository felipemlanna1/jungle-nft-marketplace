import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ModalProps } from './shared-types';
import { useModal } from './useModal';

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  onOpenAutoFocus,
  onCloseAutoFocus,
}: ModalProps) {
  const { captureOpener, restoreOpener } = useModal({ onOpenAutoFocus, onCloseAutoFocus });
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="dialog-content"
          onOpenAutoFocus={captureOpener}
          onCloseAutoFocus={restoreOpener}
        >
          <Dialog.Title className="dialog-title">{title}</Dialog.Title>
          {description && <Dialog.Description className="muted">{description}</Dialog.Description>}
          <Dialog.Close
            className="button button-ghost button-icon dialog-close"
            aria-label="Fechar diálogo"
          >
            <X size={20} />
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
