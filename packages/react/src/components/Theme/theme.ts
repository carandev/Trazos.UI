export type Theme = 'light' | 'dark';

export interface ThemeOptions {
  /** The `localStorage` key that holds the user's choice. */
  storageKey?: string;
  /** Values for the `theme-color` meta tag. */
  colors?: Record<Theme, string>;
}

export const DEFAULT_THEME_STORAGE_KEY = 'trazos-theme';

/** The `--trazos-page` token in each theme. */
export const DEFAULT_THEME_COLORS: Record<Theme, string> = { light: '#FAF7F2', dark: '#1A1512' };

/**
 * Returns a script to inline in `<head>`, after the `theme-color` meta tag. It
 * applies the theme before first paint, which avoids a flash of the wrong colors,
 * and follows the system until the user chooses.
 */
export function createThemeScript({
  storageKey = DEFAULT_THEME_STORAGE_KEY,
  colors = DEFAULT_THEME_COLORS,
}: ThemeOptions = {}): string {
  // Escaping < means no value can close the surrounding script tag.
  const config = JSON.stringify({ key: storageKey, colors }).replace(/</g, '\\u003c');
  return `(function(){var c=${config},r=document.documentElement,m=window.matchMedia('(prefers-color-scheme: dark)');function s(){try{var v=localStorage.getItem(c.key);return v==='dark'||v==='light'?v:null}catch(e){return null}}function a(t){r.setAttribute('data-theme',t);var e=document.querySelector('meta[name="theme-color"]');if(e)e.setAttribute('content',c.colors[t])}a(s()||(m.matches?'dark':'light'));m.addEventListener('change',function(e){if(!s())a(e.matches?'dark':'light')})})()`;
}
