using System.Collections.Generic;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

public partial class Badge
{
    [Parameter]
    public BadgeVariant Variant { get; set; } = BadgeVariant.Neutral;

    /// <summary>Set to false to keep the original case, for values such as C# or lazytsql.</summary>
    [Parameter]
    public bool Uppercase { get; set; } = true;

    [Parameter]
    public string? Class { get; set; }

    [Parameter]
    public RenderFragment? LeadingIcon { get; set; }

    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    private string? CaseClass => Uppercase ? null : "trazos-badge-keep-case";

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
