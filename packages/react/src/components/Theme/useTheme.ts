import { useCallback, useSyncExternalStore } from 'react';
import { DEFAULT_THEME_COLORS, DEFAULT_THEME_STORAGE_KEY, type Theme, type ThemeOptions } from './theme';

export interface UseThemeResult {
  theme: Theme;
  /** Applies a theme and remembers it, so the system no longer decides. */
  setTheme: (theme: Theme) => void;
}

const SYSTEM_DARK = '(prefers-color-scheme: dark)';

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

function readStored(key: string): Theme | null {
  try {
    const value = localStorage.getItem(key);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return typeof matchMedia === 'function' && matchMedia(SYSTEM_DARK).matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme, colors: Record<Theme, string>): void {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colors[theme]);
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function getServerSnapshot(): Theme {
  return 'light';
}

/**
 * Reads and sets the theme. The `data-theme` attribute on `<html>` is the source
 * of truth, so the hook stays in sync with the inline script from
 * `createThemeScript` and with other instances of the hook.
 */
export function useTheme({
  storageKey = DEFAULT_THEME_STORAGE_KEY,
  colors = DEFAULT_THEME_COLORS,
}: ThemeOptions = {}): UseThemeResult {
  const { light, dark } = colors;

  const subscribe = useCallback(
    (notify: () => void) => {
      const palette = { light, dark };
      const root = document.documentElement;
      if (!root.hasAttribute('data-theme')) {
        applyTheme(readStored(storageKey) ?? systemTheme(), palette);
      }

      const observer = new MutationObserver(notify);
      observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });

      const onSystemChange = (event: { matches: boolean }) => {
        if (readStored(storageKey) === null) applyTheme(event.matches ? 'dark' : 'light', palette);
      };
      const media = typeof matchMedia === 'function' ? matchMedia(SYSTEM_DARK) : null;
      media?.addEventListener('change', onSystemChange);

      const onStorage = (event: StorageEvent) => {
        if (event.key === storageKey) {
          applyTheme(isTheme(event.newValue) ? event.newValue : systemTheme(), palette);
        }
      };
      window.addEventListener('storage', onStorage);

      return () => {
        observer.disconnect();
        media?.removeEventListener('change', onSystemChange);
        window.removeEventListener('storage', onStorage);
      };
    },
    [storageKey, light, dark],
  );

  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback(
    (next: Theme) => {
      applyTheme(next, { light, dark });
      try {
        localStorage.setItem(storageKey, next);
      } catch {
        // Storage is unavailable, so the choice only lasts for this visit.
      }
    },
    [storageKey, light, dark],
  );

  return { theme, setTheme };
}
