import type { ReactNode } from 'react';
import type { DialogContentProps } from '@radix-ui/react-dialog';

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  onOpenAutoFocus?: DialogContentProps['onOpenAutoFocus'];
  onCloseAutoFocus?: DialogContentProps['onCloseAutoFocus'];
}
