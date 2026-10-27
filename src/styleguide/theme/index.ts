import { tokens } from './tokens';
import { semanticTokens } from './semantic-tokens';
import { DEFAULT_THEME } from './preference';
export { DEFAULT_THEME } from './preference';

export const themes = { kurio: { tokens, semanticTokens } } as const;
export type ThemeName = keyof typeof themes;
export type Theme = (typeof themes)[ThemeName];
export const theme = themes[DEFAULT_THEME];
export function isThemeName(value: unknown): value is ThemeName {
  return value === 'kurio';
}
