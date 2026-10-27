import { useContext } from 'react';
import { ThemeContext } from '../components/StyleguideProvider';
export const useTheme = () => {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('StyleguideProvider is required.');
  return theme;
};
