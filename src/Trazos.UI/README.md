# Trazos.UI

> A warm, artisanal, hand-crafted Blazor component library and design system with organic sketch curves, editorial serif typography, and accessible UI primitives.

## Features

- **Artisanal Aesthetics**: Organic border-radii (`sketch-card`, `sketch-sm`), warm parchment backgrounds (`#FAF7F2`), ink accents (`#2C221E`), and soft shadows.
- **Zero Heavy Dependencies**: Pure Blazor components (`.razor` + scoped `.razor.css`). Without Tailwind CSS, add the small icon-size snippet from the installation guide.
- **Dark Mode**: Every color is a role-based CSS variable (`--trazos-*`). Light is the default; add `data-theme="dark"` to `<html>` (or any ancestor) for the dark theme.
- **Atomic Primitives**:
  - `Button`: Primary, Wine, Secondary, Outline, Cream, Lavender, Ghost variants with loading spinners.
  - `Card`: Default, Lavender, and Interactive variants with header/footer support.
  - `Badge`: Success, Warning, Error, Info, Lavender, Cream, Neutral status tags.
  - `TextInput`, `SelectInput`, `TextArea`, `Checkbox`: Accessible forms with labels, error states, and helper texts.
  - `Modal`: High-contrast, sketch-bordered dialogs with backdrop click handling and customizable sizes.
  - `Drawer`: Mobile responsive slide-out drawer with native touch-swipe gestures and body scroll lock.
  - `Toast`: Global notification toast system.
  - `LoadingSpinner`: Artisanal dual-ring spinning halo with overlay and message support.
  - `AppShell`: Ready-to-use application layout with desktop sidebar, topbar, and mobile drawer.
  - `MonthCalendar<TItem>`: Generic month grid with day selection, month navigation and colored item chips (`CalendarItemTone`). On small screens items collapse into colored dots.
  - `RadioCardGroup<TValue>`: Mutually exclusive options rendered as cards with title, description and icon. Uses native radios (keyboard and screen-reader friendly).
  - `Autocomplete<TItem>`: Debounced async search with keyboard navigation, custom item templates, and either a "selected" chip or clear-on-select mode.
  - `FormSection`: Numbered section heading to split long forms into simple steps.
  - `EmptyState`: Friendly empty view with icon, explanation and next-step actions.

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

The library never reads `prefers-color-scheme` on its own; your app decides (for example, with a small script in `<head>` that reads the system preference and a saved choice). Customize the palette by overriding tokens after `trazos.css`:

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

## License

MIT
