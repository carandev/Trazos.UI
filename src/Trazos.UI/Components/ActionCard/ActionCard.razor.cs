using System.Collections.Generic;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

/// <summary>
/// Large clickable tile for a dashboard/home quick action: an icon, a title and a
/// short description, all linking to <see cref="Href"/>. Lay several of these out in
/// a responsive CSS grid of your own; this component only renders one tile.
/// </summary>
public partial class ActionCard
{
    /// <summary>
    /// Target of the card. Rendered as a plain anchor: Blazor's router intercepts
    /// same-origin relative clicks automatically, the same pattern <see cref="Button.Href"/> uses.
    /// </summary>
    [Parameter, EditorRequired]
    public string Href { get; set; } = string.Empty;

    [Parameter]
    public RenderFragment? Icon { get; set; }

    [Parameter]
    public IconBoxVariant IconVariant { get; set; } = IconBoxVariant.Primary;

    [Parameter, EditorRequired]
    public string Title { get; set; } = string.Empty;

    [Parameter]
    public string? Description { get; set; }

    [Parameter]
    public string? Class { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }
}
