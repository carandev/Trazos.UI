export type Lang = 'en' | 'es';

let current: Lang = 'en';

/** Called by mount() before a demo renders; the docs page remounts every demo when the language changes. */
export function setLanguage(lang: Lang): void {
  current = lang;
}

/**
 * Picks the demo text for the docs language. The docs show each call as the
 * plain text, so write both arguments as single-quoted string literals.
 */
export function t(en: string, es: string): string {
  return current === 'es' ? es : en;
}
