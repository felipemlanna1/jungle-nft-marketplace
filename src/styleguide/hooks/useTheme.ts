import { useContext } from 'react';
import { ThemeContext } from '../components/StyleguideProvider/useStyleguide';
export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('StyleguideProvider is required.');
  return value;
}
