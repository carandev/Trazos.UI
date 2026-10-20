# Trazos.UI

> A warm, artisanal, hand-crafted Blazor component library and design system with organic sketch curves, editorial serif typography, and accessible UI primitives.

## Features

- **Artisanal Aesthetics**: Organic border-radii (`sketch-card`, `sketch-sm`), warm parchment backgrounds (`#FAF7F2`), ink accents (`#2C221E`), and soft shadows.
- **Zero Heavy Dependencies**: Pure Blazor components (`.razor` + scoped `.razor.css`). Works with or without Tailwind CSS.
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
