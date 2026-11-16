# Trazos.UI

> A warm, artisanal, hand-crafted Blazor component library and design system with organic sketch curves, editorial serif typography, and accessible UI primitives.

## Features

- **Artisanal Aesthetics**: Organic border-radii (`sketch-card`, `sketch-sm`), warm parchment backgrounds (`#FAF7F2`), ink accents (`#2C221E`), and soft shadows.
- **Zero Heavy Dependencies**: Pure Blazor components (`.razor` + scoped `.razor.css`). Without Tailwind CSS, add the small icon-size snippet from the installation guide.
- **Dark Mode**: Every color is a role-based CSS variable (`--trazos-*`). Light is the default; add `data-theme="dark"` to `<html>` (or any ancestor) for the dark theme, or use `ThemeToggle` to follow the system until the user chooses.
- **Atomic Primitives**:
  - `Button`: Primary, Wine, Secondary, Outline, Cream, Lavender, Ghost variants with loading spinners.
  - `LinkButton`: A link that looks like a `Button`, for actions that navigate.
  - `IconButton`: A square, icon-only button with a required label and a hit area of at least 44px.
  - `Card`: Default, Lavender, Interactive, Olive, Gold, Wine and Sky variants with media, header and footer slots, and `Fill` for equal-height grids.
  - `Badge`: Success, Warning, Error, Info, Lavender, Cream, Neutral status tags.
  - `TextInput`, `SelectInput<TValue>`, `TextArea`, `Checkbox`, `RadioCardGroup<TValue>`: Accessible fields with labels, error states and helper texts. Bound with `@bind-Value` inside an `EditForm`, they show validation messages from the `EditContext` on their own.
  - `Modal`: High-contrast, sketch-bordered dialogs with backdrop click handling and customizable sizes.
  - `Drawer`: Mobile responsive slide-out drawer with native touch-swipe gestures and body scroll lock.
  - `Toast`: Global notification toast system.
  - `LoadingSpinner`: Artisanal dual-ring spinning halo with overlay and message support.
  - `AppShell`: Ready-to-use application layout with desktop sidebar, topbar, and mobile drawer.
  - `MonthCalendar<TItem>`: Generic month grid with day selection, month navigation and colored item chips (`CalendarItemTone`). On small screens items collapse into colored dots.
  - `RadioCardGroup<TValue>`: Mutually exclusive options rendered as cards with title, description and icon. Uses native radios (keyboard and screen-reader friendly).
  - `Autocomplete<TItem>`: Debounced async search, or a preloaded `Items` list filtered in memory, with keyboard navigation, custom item templates, and either a "selected" chip or clear-on-select mode. `AutocompleteSelect<TItem, TValue>` binds the chosen item's id.
  - `FormSection`: Numbered section heading to split long forms into simple steps.
  - `EmptyState`: Friendly empty view with icon, explanation and next-step actions.
- **Business apps** (forms, data and page structure):
  - `NumberInput<TValue>`, `DateInput<TValue>`, `SearchInput`, `PhoneInput`, `FileInput`: Typed fields with culture-aware numbers, currency and percent modes, month pickers, debounced search, country codes and a file drop zone. `TextInput` takes text `Prefix` and `Suffix`.
  - `RadioGroup<TValue>`, `CheckboxGroup<TItem>`: Compact native choice lists built from `SelectOption` items.
  - `FormGrid`, `FormActions`, `FilterBar`, `Repeater<TItem>`: Responsive field grids, a submit bar that can stick on phones, a filter row above lists, and editable rows for tiered tables.
  - `DataTable<TItem>` with `SortHeader`, toolbar, totals row, row actions and a `Pagination` slot; `Pagination` also works alone.
  - `DescriptionList`, `Stat`, `ProgressBar`, `Stepper`: Detail grids, dashboard numbers, progress and multi-step indicators.
  - `Alert`, `IPromptDialogService.PromptAsync`: Inline persistent messages and a confirmation that requires a typed reason.
  - `PageHeader`, `Breadcrumbs`, `Divider`, `Ribbon`, `NoPrint`, `PrintOnly`: Page structure, status marks and print helpers. Printed pages always use the light tokens.
- **Decoration**:
  - `SketchUnderline`, `SketchCircle`, `SketchArrow`, `SketchSquiggle`: Hand-drawn inline SVG strokes with an optional draw-in animation.
  - `Tape`: A strip of translucent tape that pins a positioned parent.
  - `PhotoFrame`: A framed image with an ink shadow, a backing sheet, optional tape and a handwritten caption.
  - `SectionHeading`: Eyebrow, title with a heading level you choose, optional sketch underline and an actions slot.
- **Website helpers**:
  - `SiteHeader`: Top bar with logo, links, actions, a blurred sticky style after scrolling and a mobile menu. `ScrollSpy` marks the active section on one-page sites.
  - `ThemeToggle`, `IThemeService`: Light and dark switching; see [Dark Mode](#dark-mode).
  - `LinkList`, `LinkListItem`: A compact semantic list of links with metadata and truncation.
  - `CopyButton`: Copies a value, with a handwritten note, an `aria-live` announcement and a configurable fallback.
  - `Reveal`: Entrance on scroll that keeps content visible with reduced motion and before JavaScript runs.
  - `SkipLink`, `VisuallyHidden`: Keyboard and screen-reader helpers.

## Calendar Example

```razor
<MonthCalendar TItem="EventDto"
               Items="_events"
               StartSelector="e => e.Start"
               EndSelector="e => e.End"
               TitleSelector="e => e.Title"
               ToneSelector="e => e.IsPublic ? CalendarItemTone.Olive : CalendarItemTone.Lavender"
               Month="_month"
               MonthChanged="LoadMonthAsync"
               @bind-SelectedDate="_selectedDay"
               OnItemClick="OpenEvent" />
```

Use `MonthCalendar<TItem>.GetGridStart(month)` and `GetGridEndExclusive(month)` to request only the visible date range from your API.

## Installation

Add a reference to `Trazos.UI`:

```bash
dotnet add package Trazos.UI
```

Or add a project reference in your `.csproj`:

```xml
<ProjectReference Include="..\Trazos.UI\Trazos.UI.csproj" />
```

In your `_Imports.razor`:

```razor
@using Trazos.UI
@using Trazos.UI.Components
@using Trazos.UI.Layout
```

In your `index.html` or `App.razor`:

```html
<link href="_content/Trazos.UI/trazos.css" rel="stylesheet" />
```

## Dark Mode

Dark mode is opt-in, so existing apps keep their look:

```html
<html data-theme="dark">
```

To follow the system until the user chooses, load the theme script in `<head>`, as a blocking script after the `theme-color` meta tag. It applies the theme before first paint, so there is no flash of the wrong colors:

```html
<meta name="theme-color" content="#FAF7F2" />
<script src="_content/Trazos.UI/trazos-theme.js"></script>
```

Then use `<ThemeToggle Label="Toggle theme" />`, or `IThemeService` to build your own control. Both need `AddTrazosUI()`. The storage key and colors are in `TrazosUIOptions`; if you change the key, also set `data-storage-key` on the script tag.

Without that script, nothing reads `prefers-color-scheme`. Customize the palette by overriding tokens after `trazos.css`:

```css
:root { --trazos-olive: #3F7D5E; }
[data-theme="dark"] { --trazos-olive: #7CC09D; }
```

See `wwwroot/trazos.css` for the full token list.

## Quick Example

```razor
<Card Class="mb-4">
    <Header>
        <h2 class="trazos-heading text-lg font-bold">My Card</h2>
    </Header>
    <ChildContent>
        <TextInput Label="Name"
                   Placeholder="Enter your full name..."
                   @bind-Value="_name" />

        <Button Variant="ButtonVariant.Primary"
                OnClick="SaveAsync"
                Class="mt-4">
            Save
        </Button>
    </ChildContent>
</Card>
```

## Upgrading to 3.0

- `SelectInput` is generic (`SelectInput<TValue>`). A select without `Value`, `ValueChanged` or `Options` can no longer infer its type: add `TValue="string"`.
- `SelectInput` with `Options` only renders its own themed list instead of a native `<select>`. With `<option>` children it stays native. Host CSS that targeted the native element inside an Options-only select needs updating.
- `DescriptionList` shows each item as a tile by default. Use `Variant="DescriptionListVariant.Plain"` for the previous label/value grid; `Bordered` only applies to `Plain`.
- Fields bound with `@bind-Value` inside an `EditForm` now show the validation message on their own. An explicit `Error` still wins.

## License

MIT
