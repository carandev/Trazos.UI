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

    [Parameter]
    public RenderFragment? Header { get; set; }

    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    [Parameter]
    public RenderFragment? Footer { get; set; }

    [Parameter]
    public EventCallback<MouseEventArgs> OnClick { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    private string VariantClass => Variant switch
    {
        CardVariant.Lavender => "lavender",
        CardVariant.Interactive => "interactive",
        _ => "default"
    };
}
