using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

/// <summary>
/// Top of an application page: breadcrumbs or a back link, the page title, an
/// optional subtitle and metadata, and a right-aligned action area that moves
/// below the title on narrow screens. Use it for list, detail and form pages;
/// SectionHeading is meant for marketing-style sections.
/// </summary>
public partial class PageHeader
{
    [Parameter, EditorRequired]
    public string Title { get; set; } = string.Empty;

    [Parameter]
    public string? Subtitle { get; set; }

    /// <summary>Heading level of the title, 1 to 6.</summary>
    [Parameter]
    public int Level { get; set; } = 1;

    /// <summary>Breadcrumb trail shown above the title. Takes precedence over the back link.</summary>
    [Parameter]
    public IReadOnlyList<BreadcrumbItem>? Breadcrumbs { get; set; }

    [Parameter]
    public string BreadcrumbsLabel { get; set; } = "Breadcrumb";

    /// <summary>Target of a back link shown above the title.</summary>
    [Parameter]
    public string? BackHref { get; set; }

    [Parameter]
    public string BackLabel { get; set; } = "Back";

    /// <summary>Small content under the subtitle, such as badges or dates.</summary>
    [Parameter]
    public RenderFragment? Meta { get; set; }

    /// <summary>Buttons aligned to the right of the title.</summary>
    [Parameter]
    public RenderFragment? Actions { get; set; }

    /// <summary>Content below the header row, such as tabs.</summary>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    [Parameter]
    public string? Class { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    private RenderFragment Heading => builder =>
    {
        builder.OpenElement(0, $"h{Math.Clamp(Level, 1, 6)}");
        builder.AddAttribute(1, "class", "trazos-heading trazos-page-header-title");
        builder.AddContent(2, Title);
        builder.CloseElement();
    };
}
