using System.Collections.Generic;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Layout;

/// <summary>
/// Centered single-card layout for login, password-reset and similar auth pages:
/// a full-height centered container around one <see cref="Trazos.UI.Components.Card"/>,
/// with an optional footer rendered below the card (outside it), for links such as
/// "Forgot your password?" or "Don't have an account? Sign up".
/// </summary>
public partial class AuthLayout
{
    /// <summary>Rendered above the card, such as a logo.</summary>
    [Parameter]
    public RenderFragment? Brand { get; set; }

    /// <summary>Rendered as a heading inside the card, above the content, when non-empty.</summary>
    [Parameter]
    public string? Title { get; set; }

    /// <summary>Rendered under the title, inside the card, when non-empty.</summary>
    [Parameter]
    public string? Subtitle { get; set; }

    /// <summary>The form or content inside the card.</summary>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    /// <summary>Rendered below the card, outside it.</summary>
    [Parameter]
    public RenderFragment? Footer { get; set; }

    [Parameter]
    public string? Class { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }
}
