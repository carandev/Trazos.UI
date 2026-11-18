using System.Collections.Generic;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

/// <summary>
/// Vertical container for a page's sections (<see cref="PageHeader"/>, cards, tables...)
/// with consistent spacing between them, so pages do not each define their own margins.
/// </summary>
public partial class PageStack
{
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    [Parameter]
    public string? Class { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }
}
