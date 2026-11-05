# @carandev/trazos-tokens

Design tokens for **Trazos UI**, the warm, hand-drawn "Cuaderno" style: parchment surfaces, ink text, organic sketch borders.
Everything is plain CSS custom properties. No build step, no JavaScript.

This file is the single source of truth: the React package (`@carandev/trazos-ui`) and the Blazor package (`Trazos.UI` on NuGet) both ship these exact tokens.

## Install

```bash
npm install @carandev/trazos-tokens
```

## Use

Import once, before your own styles:

```js
import '@carandev/trazos-tokens';            // bundlers (Vite, webpack, Next.js)
```

```css
@import '@carandev/trazos-tokens/tokens.css'; /* plain CSS */
```

Then read the tokens in your styles:

```css
.note {
  background: var(--trazos-surface);
  color: var(--trazos-text);
  border: 1.5px solid var(--trazos-border);
  border-radius: var(--trazos-radius-sketch-card);
  box-shadow: var(--trazos-shadow-soft);
  font-family: var(--trazos-font-sans);
}
```

The fonts are not bundled. Load Marcellus, Caveat and Plus Jakarta Sans (for example from Google Fonts) or override the `--trazos-font-*` tokens.

## Token families

| Family | Examples |
|--------|----------|
| Typography | `--trazos-font-display`, `--trazos-font-hand`, `--trazos-font-sans` |
| Sketch radii | `--trazos-radius-sketch`, `-card`, `-sm`, `-btn` |
| Surfaces | `--trazos-page`, `--trazos-panel`, `--trazos-surface`, `--trazos-field`, ... |
| Borders | `--trazos-border`, `--trazos-border-soft`, `--trazos-border-input`, ... |
| Text | `--trazos-text`, `--trazos-text-muted`, `--trazos-on-accent`, ... |
| Focus, status, overlays | `--trazos-focus`, `--trazos-focus-ring`, `--trazos-danger`, `--trazos-backdrop` |
| Shadows | `--trazos-shadow-sketch`, `-sketch-lg`, `-soft`, `-deep` |
| Accents | `--trazos-olive-*`, `--trazos-wine-*`, `--trazos-gold-*`, `--trazos-lavender-*`, `--trazos-sky-*`, `--trazos-whatsapp-*` |
| Legacy | `--trazos-color-ink`, `--trazos-color-parchment-*`, `--trazos-color-olive-500`, ... |

The full list, with a comment on what each role is for, is in [`tokens.css`](./tokens.css).

## Dark mode

Dark mode is opt-in. Set the attribute on any ancestor, normally `<html>`:

```html
<html data-theme="dark">
```

There is no automatic switch from `prefers-color-scheme`; your app decides.

## Theming

Override any token after the import. Put light values in `:root` and dark values in `[data-theme="dark"]`.
