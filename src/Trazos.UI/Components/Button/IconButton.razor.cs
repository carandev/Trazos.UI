using System.Collections.Generic;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Trazos.UI.Components;

/// <summary>A square button that only shows an icon. Its hit area is never below 44px.</summary>
public partial class IconButton
{
    /// <summary>Accessible name. An icon alone has none, so this is required.</summary>
    [Parameter, EditorRequired]
    public string Label { get; set; } = string.Empty;

    [Parameter]
    public ButtonVariant Variant { get; set; } = ButtonVariant.Ghost;

    [Parameter]
    public IconButtonSize Size { get; set; } = IconButtonSize.Medium;

    [Parameter]
    public string Type { get; set; } = "button";

    [Parameter]
    public bool Disabled { get; set; }

    /// <summary>Shows a spinner in place of the icon and disables the button.</summary>
    [Parameter]
    public bool Loading { get; set; }

    [Parameter]
    public string? Class { get; set; }

    /// <summary>The icon.</summary>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    [Parameter]
    public EventCallback<MouseEventArgs> OnClick { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    private string CssClass => string.Join(' ',
        "trazos-icon-btn",
        Size == IconButtonSize.Large ? "trazos-icon-btn-lg" : string.Empty,
        Class ?? string.Empty).Trim();
}
