export const tokens = {
  colors: {
    brown: { 950: '#140d0a', 900: '#241612', 850: '#38220f', 800: '#3f2319', 700: '#55321f' },
    amber: { 300: '#e89b55', 400: '#e89b55', 500: '#d28a4c' },
    neutral: { 100: '#f5f1eb', 400: '#cfb28c' },
    red: { 300: '#f29388', 950: '#351b18' },
    green: { 300: '#96c6a0', 950: '#172b1b' },
    translucent: { header: '#120e0bf5', overlay: '#080604cc', glow: '#d2a35e26' },
  },
  fonts: {
    body: '"Roboto Mono Variable", "Roboto Mono", ui-monospace, monospace',
    display: '"Roboto Mono Variable", "Roboto Mono", ui-monospace, monospace',
  },
  radii: { sm: '5px', md: '9px', lg: '12px' },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '40px' },
  breakpoints: { compact: '374px', mobile: '767px', tablet: '1000px', desktop: '1440px' },
} as const;
