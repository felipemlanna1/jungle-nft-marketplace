import { createContext, type ReactNode } from 'react';
import { theme, type Theme } from '../../theme';
export const ThemeContext = createContext<Theme | null>(null);
export const StyleguideProvider = ({ children }: { children: ReactNode }) => (
  <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
);
