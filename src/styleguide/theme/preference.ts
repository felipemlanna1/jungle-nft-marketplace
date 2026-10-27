export const DEFAULT_THEME = 'kurio' as const;
export const THEME_STORAGE_KEY = 'jungle.marketplace.theme';
export const THEME_VERSION_KEY = 'jungle.marketplace.theme.version';
export const THEME_VERSION = '3';

export function resolveThemePreference(storage: Pick<Storage, 'getItem'>) {
  try {
    if (storage.getItem(THEME_VERSION_KEY) !== THEME_VERSION) return DEFAULT_THEME;
    const saved = storage.getItem(THEME_STORAGE_KEY);
    return saved === 'kurio' ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}
