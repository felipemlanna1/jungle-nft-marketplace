import { describe, expect, it } from 'vitest';
import { format } from 'prettier';
import { resolveBreakpoints } from '../../scripts/lib/resolve-breakpoints.mjs';

describe('theme media compilation', () => {
  it('resolves the real formatter output for both media query syntaxes', async () => {
    const formatted = await format(
      '@media (width > __BREAKPOINT_MOBILE__) { .quantity { gap: 12px; } } @media (max-width: __BREAKPOINT_MOBILE__) { .quantity { gap: 8px; } }',
      { parser: 'css' },
    );
    expect(formatted).toContain('__breakpoint_mobile__');
    const compiled = resolveBreakpoints(formatted, { mobile: '767px' });
    expect(compiled).toContain('(width > 767px)');
    expect(compiled).toContain('(max-width: 767px)');
    expect(compiled).not.toMatch(/__breakpoint_/i);
  });

  it('fails the build when a media query references an undeclared token', () => {
    expect(() =>
      resolveBreakpoints('@media (width > __BREAKPOINT_UNKNOWN__) {}', { mobile: '767px' }),
    ).toThrow('Unknown breakpoint placeholder');
  });
});
