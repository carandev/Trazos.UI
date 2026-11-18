using System.Collections.Generic;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

/// <summary>
/// List container for the AppShell sidebar's navigation: a scrollable list of
/// <see cref="SidebarNavSection"/>s and <see cref="SidebarNavItem"/>s, with an
/// optional bottom-pinned <see cref="Footer"/> area such as a user menu or a
/// "collapse" button.
/// </summary>
public partial class SidebarNav
{
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    /// <summary>A bottom-pinned area rendered after the scrollable item list.</summary>
    [Parameter]
    public RenderFragment? Footer { get; set; }

    [Parameter]
    public string? Class { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }
}
