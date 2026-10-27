import { useTheme } from '../../hooks/useTheme';
import type { ThemeName } from '../../theme';

export const themeOptions: ReadonlyArray<{ value: ThemeName; label: string }> = [
  { value: 'expedition', label: 'Jungle' },
  { value: 'kurio', label: 'Kurio' },
];
export function useThemeSwitcher() {
  const { themeName, setTheme } = useTheme();
  return { options: themeOptions, selectedTheme: themeName, selectTheme: setTheme };
}
