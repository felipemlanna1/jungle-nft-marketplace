import { tokens } from '../tokens';
export const colors = {
  background: tokens.colors.brown[950],
  surface: tokens.colors.brown[900],
  surfaceRaised: tokens.colors.brown[850],
  border: tokens.colors.brown[800],
  foreground: tokens.colors.neutral[100],
  muted: tokens.colors.neutral[400],
  accent: tokens.colors.amber[500],
  accentHover: tokens.colors.amber[400],
  focus: tokens.colors.amber[300],
  danger: tokens.colors.red[300],
  success: tokens.colors.green[300],
} as const;
