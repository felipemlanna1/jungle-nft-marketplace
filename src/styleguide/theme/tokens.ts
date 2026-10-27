export const tokens = {
  colors: {
    brown: { 950: '#120e0b', 900: '#1a1410', 850: '#211a14', 800: '#362a20', 700: '#74552e' },
    amber: { 300: '#f2c985', 400: '#e3b674', 500: '#d2a35e' },
    neutral: { 100: '#f1e7d9', 400: '#ad9f8c' },
    red: { 300: '#f29388', 950: '#351b18' },
    green: { 300: '#96c6a0', 950: '#172b1b' },
    translucent: { header: '#120e0bf5', overlay: '#080604cc', glow: '#d2a35e26' },
  },
  fonts: {
    body: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    display: 'ui-monospace, "SFMono-Regular", Consolas, monospace',
  },
  radii: { sm: '5px', md: '9px', lg: '12px' },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '40px' },
  breakpoints: { mobile: '767px', tablet: '1000px', desktop: '1440px' },
} as const;
