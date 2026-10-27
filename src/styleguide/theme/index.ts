import { tokens } from './tokens';
import { semanticTokens } from './semantic-tokens';
export const theme = { tokens, semanticTokens } as const;
export type Theme = typeof theme;
