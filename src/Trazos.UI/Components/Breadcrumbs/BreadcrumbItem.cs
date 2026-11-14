namespace Trazos.UI.Components;

/// <summary>One step of a <see cref="Breadcrumbs"/> trail. The last item is the current page and is not linked.</summary>
/// <param name="Text">Visible text.</param>
/// <param name="Href">Link target. Ignored for the last item.</param>
public sealed record BreadcrumbItem(string Text, string? Href = null);
