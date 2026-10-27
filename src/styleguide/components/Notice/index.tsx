import type { ReactNode } from 'react';
import { clsx } from 'clsx';
export const Notice = ({
  children,
  tone = 'info',
}: {
  children: ReactNode;
  tone?: 'info' | 'error' | 'success';
}) => (
  <div className={clsx('notice', `notice-${tone}`)} role={tone === 'error' ? 'alert' : 'status'}>
    {children}
  </div>
);
