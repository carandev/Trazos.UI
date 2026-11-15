import type { Lang } from './i18n';

// A single-quoted string literal, with escapes: 'It\'s on'.
const LITERAL = String.raw`'((?:[^'\\]|\\.)*)'`;
// t('English', 'Español'), with optional line breaks and trailing comma.
const CALL = String.raw`t\(\s*${LITERAL}\s*,\s*${LITERAL}\s*,?\s*\)`;

const attributeCall = new RegExp(String.raw`=\{${CALL}\}`, 'g');
const childCall = new RegExp(String.raw`(?<![=$])\{${CALL}\}`, 'g');
const bareCall = new RegExp(CALL, 'g');
const i18nImport = /^import \{ t \} from '(?:\.\.?\/)+i18n';\r?\n/gm;
const localHelper = /from '(?:\.\.\/)+(icons|data)'/g;

const unescape = (literal: string): string => literal.replace(/\\(.)/g, '$1');

/**
 * Turns a demo module into the snippet the docs show: the code a reader would
 * write in their own app. Each t() call becomes its text in the chosen
 * language, the i18n import is dropped and local helpers import from './'.
 */
export function toDisplaySource(raw: string, lang: Lang): string {
  const pick = (en: string, es: string): string => (lang === 'es' ? es : en);

  return raw
    .replace(i18nImport, '')
    .replace(localHelper, "from './$1'")
    .replace(attributeCall, (_, en: string, es: string) => {
      const literal = pick(en, es);
      const text = unescape(literal);
      return text.includes('"') ? `={'${literal}'}` : `="${text}"`;
    })
    .replace(childCall, (_, en: string, es: string) => {
      const literal = pick(en, es);
      const text = unescape(literal);
      return /[{}<>]/.test(text) ? `{'${literal}'}` : text;
    })
    .replace(bareCall, (_, en: string, es: string) => `'${pick(en, es)}'`)
    .trimEnd();
}
