using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

public partial class SectionHeading
{
    /// <summary>The heading text. Use <see cref="TitleContent"/> for markup.</summary>
    [Parameter]
    public string? Title { get; set; }

    /// <summary>The heading content. Takes precedence over <see cref="Title"/>.</summary>
    [Parameter]
    public RenderFragment? TitleContent { get; set; }

    /// <summary>Handwritten line above the title.</summary>
    [Parameter]
    public string? Eyebrow { get; set; }

    /// <summary>Heading level, from 1 to 6. Defaults to 2.</summary>
    [Parameter]
    public int Level { get; set; } = 2;

    /// <summary>Draws a sketch underline below the title.</summary>
    [Parameter]
    public bool Underline { get; set; }

    /// <summary>Rendered beside the title, such as a "see all" link.</summary>
    [Parameter]
    public RenderFragment? Actions { get; set; }

    [Parameter]
    public string? Class { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    // Built in code to choose the tag, so its scoped CSS rule has to use ::deep.
    private RenderFragment Heading => builder =>
    {
        builder.OpenElement(0, $"h{Math.Clamp(Level, 1, 6)}");
        builder.AddAttribute(1, "class", "trazos-heading trazos-section-heading-title");
        if (TitleContent is not null) builder.AddContent(2, TitleContent);
        else builder.AddContent(3, Title);
        builder.CloseElement();
    };
}
