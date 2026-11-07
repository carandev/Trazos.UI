using System.Collections.Generic;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Trazos.UI.Components;

public partial class Button
{
    [Parameter]
    public ButtonVariant Variant { get; set; } = ButtonVariant.Primary;

    [Parameter]
    public ButtonSize Size { get; set; } = ButtonSize.Medium;

    [Parameter]
    public string Type { get; set; } = "button";

    /// <summary>
    /// Renders a link instead of a button. <see cref="LinkButton"/> is the public way to do
    /// this; it lives here because scoped CSS only reaches the elements this file renders.
    /// </summary>
    [Parameter]
    public string? Href { get; set; }

    [Parameter]
    public bool Disabled { get; set; }

    [Parameter]
    public bool Loading { get; set; }

    [Parameter]
    public string? Class { get; set; }

    [Parameter]
    public RenderFragment? LeadingIcon { get; set; }

    [Parameter]
    public RenderFragment? TrailingIcon { get; set; }

    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    [Parameter]
    public EventCallback<MouseEventArgs> OnClick { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    private string ButtonTypeValue => string.IsNullOrWhiteSpace(Type) ? "button" : Type;

    private string VariantClass => Variant switch
    {
        ButtonVariant.Wine => "wine",
        ButtonVariant.Secondary => "secondary",
        ButtonVariant.Outline => "outline",
        ButtonVariant.Cream => "cream",
        ButtonVariant.Lavender => "lavender",
        ButtonVariant.Ghost => "ghost",
        _ => "primary"
    };

    private string SizeClass => Size switch
    {
        ButtonSize.Small => "sm",
        ButtonSize.Large => "lg",
        _ => "md"
    };
}
