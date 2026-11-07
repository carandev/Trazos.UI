using System.Collections.Generic;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Trazos.UI.Components;

public partial class Card
{
    [Parameter]
    public CardVariant Variant { get; set; } = CardVariant.Default;

    [Parameter]
    public string? Class { get; set; }

    /// <summary>Rendered above the header and body, such as a cover image. It keeps its own aspect ratio.</summary>
    [Parameter]
    public RenderFragment? Media { get; set; }

    [Parameter]
    public RenderFragment? Header { get; set; }

    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    [Parameter]
    public RenderFragment? Footer { get; set; }

    /// <summary>Makes the body fill the card height, so <c>margin-top: auto</c> pins a row to the bottom in an equal-height grid.</summary>
    [Parameter]
    public bool Fill { get; set; }

    [Parameter]
    public EventCallback<MouseEventArgs> OnClick { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    private string VariantClass => Variant switch
    {
        CardVariant.Lavender => "lavender",
        CardVariant.Interactive => "interactive",
        CardVariant.Olive => "olive",
        CardVariant.Gold => "gold",
        CardVariant.Wine => "wine",
        CardVariant.Sky => "sky",
        _ => "default"
    };
}
