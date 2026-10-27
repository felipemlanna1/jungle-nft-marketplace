import { tokens as kurioTokens } from './tokens';

export const expeditionTokens = {
  ...kurioTokens,
  colors: {
    forest: {
      950: '#071713',
      900: '#0c211b',
      850: '#132e25',
      800: '#294136',
      600: '#46745b',
      400: '#8bc5a2',
    },
    gold: { 200: '#f5dba5', 300: '#edce93', 400: '#e6bf77', 500: '#cfaa65' },
    neutral: { 100: '#edf4ed', 400: '#a4b8ab' },
    red: { 300: '#f5a39b', 950: '#351c1b' },
    green: { 300: '#a1dbb0', 950: '#153324' },
    translucent: {
      header: '#071713f5',
      overlay: '#020b08cc',
      glow: '#e6bf7726',
    },
  },
  fonts: {
    body: kurioTokens.fonts.body,
    display: '"Arial Black", "Arial", ui-sans-serif, system-ui, sans-serif',
  },
} as const;
