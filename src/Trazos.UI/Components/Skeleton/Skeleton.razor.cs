using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

public enum SkeletonVariant
{
    Text,
    Circular,
    Card,
    Rounded
}

public partial class Skeleton
{
    [Parameter]
    public SkeletonVariant Variant { get; set; } = SkeletonVariant.Text;

    [Parameter]
    public string? Width { get; set; }

    [Parameter]
    public string? Height { get; set; }

    [Parameter]
    public int Count { get; set; } = 1;

    [Parameter]
    public string? Class { get; set; }

    private string VariantClass => Variant switch
    {
        SkeletonVariant.Circular => "circular",
        SkeletonVariant.Card => "card",
        SkeletonVariant.Rounded => "rounded",
        _ => "text"
    };

    private string Style
    {
        get
        {
            var style = "";
            if (!string.IsNullOrEmpty(Width))
                style += $"width: {Width}; ";
            if (!string.IsNullOrEmpty(Height))
                style += $"height: {Height}; ";
            return style.Trim();
        }
    }
}
