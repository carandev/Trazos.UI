using System.Collections.Generic;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Trazos.UI.Components;

/// <summary>A link that looks like a <see cref="Button"/>, for actions that navigate.</summary>
public partial class LinkButton
{
    [Parameter, EditorRequired]
    public string Href { get; set; } = string.Empty;

    [Parameter]
    public ButtonVariant Variant { get; set; } = ButtonVariant.Primary;

    [Parameter]
    public ButtonSize Size { get; set; } = ButtonSize.Medium;

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
}
