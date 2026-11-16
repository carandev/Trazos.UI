import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8');

function block(selector) {
  const start = css.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `missing ${selector} block`);
  const end = css.indexOf('\n}', start);
  return css.slice(start, end);
}

function declaredTokens(source) {
  return new Set([...source.matchAll(/(--trazos-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
}

const light = declaredTokens(block(':root'));
const dark = declaredTokens(block('[data-theme="dark"]'));

test('declares every token family in the light theme', () => {
  for (const token of [
    '--trazos-font-display',
    '--trazos-font-hand',
    '--trazos-font-sans',
    '--trazos-radius-sketch',
    '--trazos-radius-sketch-card',
    '--trazos-radius-sketch-sm',
    '--trazos-radius-sketch-btn',
    '--trazos-surface',
    '--trazos-border',
    '--trazos-text',
    '--trazos-focus',
    '--trazos-shadow-sketch',
    '--trazos-shadow-soft',
    '--trazos-olive',
    '--trazos-wine',
    '--trazos-gold',
    '--trazos-lavender',
    '--trazos-sky',
    '--trazos-whatsapp',
  ]) {
    assert.ok(light.has(token), `${token} is not declared in :root`);
  }
});

test('the dark theme only redefines tokens that exist in the light theme', () => {
  const unknown = [...dark].filter((token) => !light.has(token));
  assert.deepEqual(unknown, []);
});

test('the dark theme redefines every color role except theme-independent ones', () => {
  const themeIndependent = new Set([
    '--trazos-font-display',
    '--trazos-font-hand',
    '--trazos-font-sans',
    '--trazos-radius-sketch',
    '--trazos-radius-sketch-card',
    '--trazos-radius-sketch-sm',
    '--trazos-radius-sketch-btn',
    '--trazos-whatsapp',
    '--trazos-whatsapp-hover',
    '--trazos-whatsapp-border',
    '--trazos-whatsapp-text',
  ]);
  const missing = [...light].filter((token) => !themeIndependent.has(token) && !dark.has(token));
  assert.deepEqual(missing, []);
});

function tokenValue(source, token) {
  const match = source.match(new RegExp(`${token}\\s*:\\s*([^;]+);`));
  assert.ok(match, `${token} is not declared`);
  return match[1].trim();
}

test('dark background tints are opaque, like the light ones', () => {
  // These tokens fill the background of whole components (toasts, cards,
  // badges, icon boxes). A translucent value lets whatever sits behind the
  // component show through, which only happens in dark mode.
  const backgroundTints = [...light].filter((token) =>
    /^--trazos-(olive|wine|gold|lavender|sky)-(soft|tint|tint-alt|tint-hover)$/.test(token)
    || token === '--trazos-cream-soft'
    || /^--trazos-lavender-card-(start|end)$/.test(token));
  assert.ok(backgroundTints.length === 16, 'expected the tint families to be found');

  const darkBlock = block('[data-theme="dark"]');
  const translucent = backgroundTints.filter((token) => {
    const value = tokenValue(darkBlock, token);
    return /rgba\(|hsla\(|transparent|\/\s*0?\.\d/.test(value);
  });
  assert.deepEqual(translucent, []);
});

test('printing always uses the light tokens', () => {
  // Dark text on white paper: a dark theme must not reach the printer.
  assert.match(css, /@media not print\s*{\s*\[data-theme="dark"\]\s*{/);
});

test('utilities ship print helpers', () => {
  const utilities = readFileSync(new URL('../utilities.css', import.meta.url), 'utf8');
  assert.match(utilities, /\.trazos-print-only\s*{\s*display:\s*none/);
  const print = utilities.slice(utilities.indexOf('@media print'));
  assert.ok(print.length > 0, 'missing @media print block');
  for (const rule of ['.trazos-no-print', '.trazos-print-only', '.trazos-print-break-before', '.trazos-print-avoid-break']) {
    assert.ok(print.includes(rule), `${rule} is missing from the print block`);
  }
});
