namespace Trazos.UI.Docs.Navigation;

public sealed record NavItem(string Title, string Href, string? TitleEs = null);

public sealed record NavSection(string Title, string TitleEs, IReadOnlyList<NavItem> Items);

/// <summary>
/// Single source of truth for the documentation sidebar.
/// </summary>
public static class DocsNav
{
    public static IReadOnlyList<NavSection> Sections { get; } =
    [
        new("Getting started", "Primeros pasos",
        [
            new("Introduction", "", "Introducción"),
            new("Installation", "installation", "Instalación"),
            new("Design tokens", "tokens", "Tokens de diseño"),
            new("Theming", "theming", "Temas y modo oscuro"),
        ]),
        new("Actions", "Acciones",
        [
            new("Button", "components/button"),
            new("LinkButton", "components/link-button"),
            new("IconButton", "components/icon-button"),
            new("WhatsAppButton", "components/whatsapp-button"),
        ]),
        new("Display", "Visualización",
        [
            new("Badge", "components/badge"),
            new("Card", "components/card"),
            new("IconBox", "components/icon-box"),
            new("EmptyState", "components/empty-state"),
            new("DataTable", "components/data-table"),
            new("MonthCalendar", "components/month-calendar"),
        ]),
        new("Decoration", "Decoración",
        [
            new("Sketch", "components/sketch"),
            new("Tape", "components/tape"),
            new("PhotoFrame", "components/photo-frame"),
            new("SectionHeading", "components/section-heading"),
        ]),
        new("Forms", "Formularios",
        [
            new("TextInput", "components/text-input"),
            new("TextArea", "components/text-area"),
            new("SelectInput", "components/select-input"),
            new("Checkbox", "components/checkbox"),
            new("Autocomplete", "components/autocomplete"),
            new("RadioCardGroup", "components/radio-card-group"),
            new("FormSection", "components/form-section"),
        ]),
        new("Navigation", "Navegación",
        [
            new("Tabs", "components/tabs"),
            new("AppShell", "components/app-shell"),
            new("Drawer", "components/drawer"),
        ]),
        new("Overlays & feedback", "Superposiciones y avisos",
        [
            new("Modal", "components/modal"),
            new("Confirm dialog", "components/confirm-dialog", "Diálogo de confirmación"),
            new("Toast", "components/toast"),
            new("LoadingSpinner", "components/loading-spinner"),
            new("Skeleton", "components/skeleton"),
        ]),
    ];
}
