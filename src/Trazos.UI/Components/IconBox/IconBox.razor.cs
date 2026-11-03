using System.Collections.Generic;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

public partial class IconBox
{
    [Parameter]
    public IconBoxVariant Variant { get; set; } = IconBoxVariant.Primary;

    [Parameter]
    public IconBoxSize Size { get; set; } = IconBoxSize.Medium;

    [Parameter]
    public string? Class { get; set; }

    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    private string VariantClass => Variant switch
    {
        IconBoxVariant.Lavender => "lavender",
        IconBoxVariant.Cream => "cream",
        IconBoxVariant.Wine => "wine",
        IconBoxVariant.Neutral => "neutral",
        _ => "primary"
    };

    private string SizeClass => Size switch
    {
        IconBoxSize.Small => "sm",
        IconBoxSize.Large => "lg",
        _ => "md"
    };
}
