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
