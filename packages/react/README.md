# @carandev/trazos-ui

Trazos UI for React: a warm, hand-drawn component library ("Cuaderno" style) with organic sketch borders, parchment tones and accessible primitives.
It is the React twin of the [`Trazos.UI`](https://www.nuget.org/packages/Trazos.UI) Blazor library: same markup, same class names, same CSS and the same design tokens ([`packages/tokens`](../tokens/README.md)).

- React 19, TypeScript strict, ESM with `.d.ts` types
- Tree-shakeable: one module per component, `sideEffects` limited to CSS
- Plain CSS in one file (`styles.css`), no runtime CSS-in-JS
- Opt-in dark mode with `<html data-theme="dark">`
- Accessible: labelled fields, focus-trapped dialogs, WAI-ARIA tabs and combobox, live-region toasts

## Install

```bash
npm install @carandev/trazos-ui
```

`react` and `react-dom` 19 are peer dependencies.

## Set up

Import the stylesheet once, at the root of your app. It contains the tokens, the utility classes and every component's styles. To use only the CSS variables, without components, import `@carandev/trazos-ui/tokens.css` instead.

```tsx
// main.tsx
import '@carandev/trazos-ui/styles.css';
```

Load the fonts (Marcellus, Caveat, Plus Jakarta Sans), for example in `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Marcellus&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" />
```

Form controls do not inherit the page font by default. If your app has no CSS reset that does it, add this to your global stylesheet:

```css
button, input, select, textarea { font: inherit; }
```

Wrap the app in the providers you use. `AppShell` already includes both.

```tsx
import { ConfirmDialogProvider, ToastProvider } from '@carandev/trazos-ui';

<ToastProvider>
  <ConfirmDialogProvider>
    <App />
  </ConfirmDialogProvider>
</ToastProvider>
```

## Use

```tsx
import { Button, TextInput, useConfirm, useToast } from '@carandev/trazos-ui';
import { useState } from 'react';

export function RenameFlow() {
  const [name, setName] = useState('');
  const confirm = useConfirm();
  const toast = useToast();

  async function save() {
    if (await confirm('Rename this flow for everyone?', { confirmText: 'Rename' })) {
      toast.showSuccess('Flow renamed.', 'Done');
    }
  }

  return (
    <>
      <TextInput label="Name" required value={name} onValueChange={setName} />
      <Button variant="primary" onClick={() => void save()}>
        Save
      </Button>
    </>
  );
}
```

## Components

| Component | Notes |
|-----------|-------|
| `Button` | `variant`: `primary` `wine` `secondary` `outline` `cream` `lavender` `ghost`; `size`: `small` `medium` `large`; `loading`, `leadingIcon`, `trailingIcon` |
| `LinkButton` | A link styled as `Button`: `href`, `variant`, `size`, `leadingIcon`, `trailingIcon` |
| `IconButton` | Icon-only button with a square hit area of at least 44px: `label` (required), `variant`, `size`: `medium` `large`; `loading` |
| `Badge` | `variant`: `success` `warning` `error` `info` `lavender` `cream` `neutral`; `uppercase` (default `true`), `leadingIcon` |
| `Card` | `variant`: `default` `white` `lavender` `interactive` `olive` `gold` `wine` `sky`; `media`, `header`, `footer`; `fill` makes the body fill the card height |
| `IconBox` | `variant`: `primary` `lavender` `cream` `wine` `neutral`; `size` |
| `LoadingSpinner` | `message`, `overlay` |
| `Skeleton` | `variant`: `text` `circular` `card` `rounded`; `width`, `height`, `count` |
| `WhatsAppButton` | `phoneNumber`, `defaultCountryCode` (`57`), `showPhone` |
| `EmptyState` | `title`, `description`, `icon`, `iconVariant`, `actions`, `compact` |
| `FormSection` | `title`, `description`, `step` |
| `TextInput`, `TextArea`, `SelectInput` | `label`, `helperText`, `error`, `required`; `value` + `onValueChange` or `defaultValue` |
| `Checkbox` | `checked` + `onCheckedChange` or `defaultChecked` |
| `RadioCardGroup<T>` | `options: RadioCardOption<T>[]`, `value` + `onValueChange`, `columns` |
| `Autocomplete<T>` | `searchFn(query, signal)`, `itemText`, `renderItem`, `selectedItem` + `onSelectedItemChange`, `clearOnSelect`, `minChars`, `debounceMs` |
| `DataTable<T>` | `items`, `tableHeader`, `rowTemplate`, `loading`, `emptyMessage`, `onRowClick` |
| `Tabs` / `TabItem` | `variant`: `underline` `pills` `contained`; controlled by `activeIndex` or `activeKey` (`TabItem tabKey`) |
| `MonthCalendar<T>` | `items` + `startSelector`/`endSelector`/`titleSelector`/`toneSelector`, `month`, `selectedDate`, `onItemClick`; helpers `getGridStart`, `getGridEndExclusive` |
| `Modal` | `open` + `onOpenChange`, `title`, `footer`, `size`, `closeOnBackdropClick` |
| `Drawer` | `open` + `onOpenChange`, `title`, `header` |
| `ConfirmDialogProvider` + `useConfirm()` | `await confirm(message, overrides?)` or `confirm(options)` → `Promise<boolean>` |
| `ToastProvider` + `useToast()` | `showSuccess` `showError` `showWarning` `showInfo` `(message, title?)` |
| `SketchUnderline`, `SketchCircle`, `SketchArrow`, `SketchSquiggle` | Decorative hand-drawn strokes: `color`, `strokeWidth`, `animated` |
| `Tape` | Decorative tape, needs a positioned parent: `color`, `rotate`, `position`: `top` `top-left` `top-right` |
| `PhotoFrame` | `src`, `alt`, `caption`, `tape`, `imgProps` |
| `SectionHeading` | `title`, `eyebrow`, `as`, `underline`, `actions` |
| `VisuallyHidden` | Screen-reader-only content, for example an `aria-live` region |
| `SkipLink` | Hidden until focused: `href` (default `#main`) |
| `Reveal` | Fades and rises on scroll: `delay` in ms. Content stays visible without JavaScript, with reduced motion, and when already on screen |
| `CopyButton` | Built on `IconButton`: `value`, `label`, `copiedLabel` (all required), `errorLabel`, `fallback`, `onCopied`, `icon`, `checkIcon` |
| `LinkList` + `LinkListItem` | Compact link rows: `href`, `meta`, `icon` |
| `AppShell` | `brand`, `sidebar`, `topBar`, `drawerHeader`, `drawerContent`, `isDevelopment`, `environmentName`, `showEnvironmentBadge` |

Every component forwards `ref`, `className` and native attributes to its root element (form controls: to the native `<input>`, `<textarea>` or `<select>`). Variant unions mirror the Blazor `*Variant` enums (`ButtonVariant.Primary` → `'primary'`). Default texts (aria-labels, "Confirmar", "Sin resultados", month names) match the Blazor library, which is Spanish-first; override them with props.

Try every component in the playground: `npm run dev -w @carandev/trazos-playground` from the repository root.

## Dark mode

```html
<html data-theme="dark">
```

Every token switches; nothing in the components changes. There is no automatic `prefers-color-scheme` switch, so your app decides.

## Theming

Override any `--trazos-*` token after importing `styles.css`. Light values go in `:root`, dark values in `[data-theme="dark"]`. See [`packages/tokens`](../tokens/README.md) for the full list.

## License

MIT
