import { describe, expect, it } from 'vitest';
import {
  resolveThemePreference,
  THEME_STORAGE_KEY,
  THEME_VERSION_KEY,
  THEME_VERSION,
} from './preference';

const storage = (values: Record<string, string>) => ({
  getItem: (key: string) => values[key] ?? null,
});
describe('theme preference release migration', () => {
  it('opens the Figma appearance instead of retaining an unversioned legacy default', () => {
    expect(resolveThemePreference(storage({ [THEME_STORAGE_KEY]: 'expedition' }))).toBe('kurio');
  });
  it('does not restore the removed appearance even from a versioned preference', () => {
    expect(
      resolveThemePreference(
        storage({ [THEME_STORAGE_KEY]: 'expedition', [THEME_VERSION_KEY]: THEME_VERSION }),
      ),
    ).toBe('kurio');
  });
  it('falls back safely for an invalid current preference', () => {
    expect(
      resolveThemePreference(
        storage({ [THEME_STORAGE_KEY]: 'unsupported', [THEME_VERSION_KEY]: THEME_VERSION }),
      ),
    ).toBe('kurio');
  });
  it('uses the default when no preference exists', () => {
    expect(resolveThemePreference(storage({}))).toBe('kurio');
  });
  it('does not fail when preference reads are blocked', () => {
    expect(
      resolveThemePreference({
        getItem: () => {
          throw new Error('Storage blocked');
        },
      }),
    ).toBe('kurio');
  });
});
