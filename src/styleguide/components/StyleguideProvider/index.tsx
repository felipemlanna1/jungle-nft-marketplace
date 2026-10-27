import type { ReactNode } from 'react';
import { ThemeContext, useStyleguide } from './useStyleguide';

export function StyleguideProvider({ children }: { children: ReactNode }) {
  const value = useStyleguide();
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
