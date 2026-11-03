using System.Collections.Generic;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

public partial class Badge
{
    [Parameter]
    public BadgeVariant Variant { get; set; } = BadgeVariant.Neutral;

    [Parameter]
    public string? Class { get; set; }

    [Parameter]
    public RenderFragment? LeadingIcon { get; set; }

    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    private string VariantClass => Variant switch
    {
        BadgeVariant.Success => "success",
        BadgeVariant.Warning => "warning",
        BadgeVariant.Error => "error",
        BadgeVariant.Info => "info",
        BadgeVariant.Lavender => "lavender",
        BadgeVariant.Cream => "cream",
        _ => "neutral"
    };
}
