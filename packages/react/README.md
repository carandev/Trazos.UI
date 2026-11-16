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

### Router links

In a single-page app, render the library's links through the router so they navigate without reloading the page. `Breadcrumbs`, `PageHeader` (breadcrumbs and back link), `LinkButton` and `LinkListItem` use the provided component, passing `href`, `className`, `aria-current`, `children`, `ref` and the other anchor attributes:

```tsx
import { TrazosLinkProvider } from '@carandev/trazos-ui';
import { Link } from 'react-router';

<TrazosLinkProvider component={({ href, ...rest }) => <Link to={href} {...rest} />}>
  <App />
</TrazosLinkProvider>
```

Without the provider they render a plain `<a>`. Links that leave the app (`target="_blank"`, `download`, a `mailto:` or absolute URL) always stay plain anchors.

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
| `TextInput`, `TextArea`, `SelectInput` | `label`, `helperText`, `error`, `required`; `value` + `onValueChange` or `defaultValue`. `TextInput` takes text `prefix` / `suffix`; `SelectInput` takes typed `options` |
| `NumberInput` | `value: number \| null`, `mode`: `number` `currency` `percent` (percent binds the fraction), `locale`, `currency`, `min`, `max`, `step` (arrow keys), `decimals` |
| `DateInput` | ISO `'yyyy-MM-dd'` values, `monthOnly`, `min`, `max` |
| `SearchInput` | Debounced `onValueChange` (`debounce`, default 300 ms), clear button, Escape clears |
| `PhoneInput` | Country code picker + number, value `"+57 3001234567"`, `countries` |
| `FileInput` | Drop zone: `accept`, `maxFileSize`, `multiple`, `maxFiles`, file list with remove, rejection messages |
| `RadioGroup<T>`, `CheckboxGroup<T>` | Compact native choice lists from `options`; `CheckboxGroup` value is an array in option order |
| `Repeater<T>` | Editable rows: `items` + `onItemsChange`, `renderItem({ item, index, isLast })`, `createItem`, `minItems`, `maxItems` |
| `FormGrid`, `FormActions`, `FilterBar` | Responsive field grid (`columns`, `trazos-form-full`), submit bar (`align`, `sticky`), filter row (`role="search"`, `actions`) |
| `Checkbox` | `checked` + `onCheckedChange` or `defaultChecked` |
| `RadioCardGroup<T>` | `options: RadioCardOption<T>[]`, `value` + `onValueChange`, `columns` |
| `AutocompleteSelect<T, V>` | Searchable select bound to an id: `items`, `valueSelector`, `value` + `onValueChange`, `resolveItem` |
| `Autocomplete<T>` | `searchFn(query, signal)`, `itemText`, `renderItem`, `selectedItem` + `onSelectedItemChange`, `clearOnSelect`, `minChars`, `debounceMs` |
| `DataTable<T>` | `items`, `tableHeader`, `rowTemplate`, `loading`, `emptyMessage`, `onRowClick`; `SortHeader` + `sort`/`onSortChange`, `toolbar`, `tableFooter`, `rowActions`, `pagination`, `trazos-cell-numeric` |
| `Pagination` | `page` + `onPageChange`, `pageSize` + `onPageSizeChange`, `totalCount`, `pageSizeOptions`, labels as props |
| `DescriptionList` + `DescriptionItem` | Label/value grid: `columns`, `bordered`, `hint`, `emptyText`, `fullWidth` |
| `Stat` | `label`, `value`, `delta`, `trend`, `inverted`, `icon` |
| `ProgressBar`, `Stepper` | Progress with `valueText` or `indeterminate`; steps with `current` |
| `Tabs` / `TabItem` | `variant`: `underline` `pills` `contained`; controlled by `activeIndex` or `activeKey` (`TabItem tabKey`) |
| `MonthCalendar<T>` | `items` + `startSelector`/`endSelector`/`titleSelector`/`toneSelector`, `month`, `selectedDate`, `onItemClick`; helpers `getGridStart`, `getGridEndExclusive` |
| `Modal` | `open` + `onOpenChange`, `title`, `footer`, `size`, `closeOnBackdropClick` |
| `Drawer` | `open` + `onOpenChange`, `title`, `header` |
| `ConfirmDialogProvider` + `useConfirm()` | `await confirm(message, overrides?)` or `confirm(options)` → `Promise<boolean>`. `usePrompt()` asks for a typed reason → `{ confirmed, text }` |
| `Alert` | Inline persistent message: `tone`, `title`, `actions`, `dismissible` + `onDismiss` |
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
| `ThemeToggle`, `useTheme()`, `createThemeScript()` | Light and dark switching; see [Dark mode](#dark-mode) |
| `SiteHeader`, `useScrollSpy(ids)` | Top bar for public sites: `links`, `navLabel`, `openMenuLabel`, `closeMenuLabel` (all required), `logo`, `actions`, `activeHref`, `currentType` |
| `TrazosLinkProvider` | `component` renders the library's navigational links, such as a router's `Link`; see [Router links](#router-links) |
| `PageHeader`, `Breadcrumbs`, `Divider` | Page title with breadcrumbs or back link and actions; trail with `aria-current`; separator with optional `label` |
| `Ribbon`, `NoPrint`, `PrintOnly` | Corner status band; print helpers. Printed pages always use the light tokens |
| `AppShell` | `brand`, `sidebar`, `topBar`, `drawerHeader`, `drawerContent`, `isDevelopment`, `environmentName`, `showEnvironmentBadge` |

Every component forwards `ref`, `className` and native attributes to its root element (form controls: to the native `<input>`, `<textarea>` or `<select>`). Variant unions mirror the Blazor `*Variant` enums (`ButtonVariant.Primary` → `'primary'`). Default texts (aria-labels, "Confirmar", "Sin resultados", month names) match the Blazor library, which is Spanish-first; override them with props. Newer website components (`CopyButton`, `ThemeToggle`, `SiteHeader`) have no default texts, so their labels are required props. `CopyButton` and `ThemeToggle` forward native attributes to the button, and `LinkListItem` to the link.

Try every component in the playground: `npm run dev -w @carandev/trazos-playground` from the repository root.

## Dark mode

```html
<html data-theme="dark">
```

Every token switches; nothing in the components changes. The tokens have no automatic `prefers-color-scheme` switch, so your app decides, or uses the helpers below.

To follow the system until the user chooses, inline the theme script in `<head>`, after the `theme-color` meta tag. It applies the theme before first paint, so there is no flash of the wrong colors, and it updates `theme-color`:

```tsx
import { createThemeScript } from '@carandev/trazos-ui';

<meta name="theme-color" content="#FAF7F2" />
<script dangerouslySetInnerHTML={{ __html: createThemeScript() }} />
```

In Astro, use `<script is:inline set:html={createThemeScript()} />`.

Then use `ThemeToggle`, or `useTheme()` to build your own control:

```tsx
<ThemeToggle label="Toggle theme" />

const { theme, setTheme } = useTheme();
```

The choice is stored in `localStorage` under `trazos-theme`. Pass the same `storageKey` and `colors` to `createThemeScript`, `useTheme` and `ThemeToggle` to change them.

## Theming

Override any `--trazos-*` token after importing `styles.css`. Light values go in `:root`, dark values in `[data-theme="dark"]`. See [`packages/tokens`](../tokens/README.md) for the full list.

## Upgrading to 3.0

- `SelectInput` with `options` only renders its own themed list instead of a native `<select>`: `ref`, `name` and `form` go to a hidden select, and `onChange` does not fire (use `onValueChange`). With `<option>` children it stays native.
- `TextInput` takes text `prefix` / `suffix`, so the native RDFa `prefix` attribute is no longer accepted.
- `DescriptionList` shows each item as a tile by default. Use `variant="plain"` for the previous label/value grid; `bordered` only applies to `plain`.

## License

MIT
