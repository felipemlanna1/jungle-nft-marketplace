import { tokens } from './tokens';
import { semanticTokens } from './semantic-tokens';
import { expeditionTokens } from './expedition-tokens';
import { expeditionColors } from './semantic-tokens/expedition-colors';

export const themes = {
  kurio: { tokens, semanticTokens },
  expedition: {
    tokens: expeditionTokens,
    semanticTokens: {
      colors: expeditionColors,
      radii: expeditionTokens.radii,
      spacing: expeditionTokens.spacing,
    },
  },
} as const;
export type ThemeName = keyof typeof themes;
export type Theme = (typeof themes)[ThemeName];
export const DEFAULT_THEME: ThemeName = 'expedition';
export const theme = themes[DEFAULT_THEME];
export function isThemeName(value: unknown): value is ThemeName {
  return value === 'kurio' || value === 'expedition';
}
