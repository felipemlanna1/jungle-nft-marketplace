import { expeditionTokens } from '../expedition-tokens';

const palette = expeditionTokens.colors;
export const expeditionColors = {
  background: palette.forest[950],
  surface: palette.forest[900],
  surfaceRaised: palette.forest[850],
  border: palette.forest[800],
  foreground: palette.neutral[100],
  muted: palette.neutral[400],
  accent: palette.gold[400],
  accentHover: palette.gold[200],
  accentForeground: palette.forest[950],
  focus: palette.gold[200],
  danger: palette.red[300],
  success: palette.green[300],
  headerBackground: palette.translucent.header,
  overlay: palette.translucent.overlay,
  gameGlow: palette.translucent.glow,
  gameProgress: palette.forest[400],
  dangerSurface: palette.red[950],
  successSurface: palette.green[950],
} as const;
