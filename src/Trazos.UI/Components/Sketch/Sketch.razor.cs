using System.Collections.Generic;
using System.Globalization;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

/// <summary>
/// A hand-drawn stroke. The shapes derive from this class, so that they all render
/// through this file and share its scoped CSS.
/// </summary>
public abstract partial class Sketch
{
    /// <summary>Any CSS color. Each sketch defaults to a token, so it follows the theme.</summary>
    [Parameter]
    public string? Color { get; set; }

    [Parameter]
    public double? StrokeWidth { get; set; }

    /// <summary>Draws the stroke in when it mounts. Reduced motion shows it complete.</summary>
    [Parameter]
    public bool Animated { get; set; }

    [Parameter]
    public string? Class { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    private protected abstract SketchShape Shape { get; }

    // SVG numbers always use a dot, whatever the culture of the app is.
    private string WidthValue => (StrokeWidth ?? Shape.StrokeWidth).ToString(CultureInfo.InvariantCulture);
}

/// <param name="D">The path data.</param>
/// <param name="Delay">Starts after the previous stroke, in seconds.</param>
internal sealed record SketchStroke(string D, double? Delay = null);

/// <param name="Stretch">Stretches to its box instead of keeping the drawn proportions.</param>
internal sealed record SketchShape(string ViewBox, string Color, double StrokeWidth, bool Stretch, IReadOnlyList<SketchStroke> Strokes);

public sealed class SketchUnderline : Sketch
{
    private static readonly SketchShape Definition = new("0 0 220 14", "var(--trazos-wine)", 3, true,
        [new("M3 9 C 40 2, 80 13, 120 7 S 190 3, 217 8")]);

    private protected override SketchShape Shape => Definition;
}

public sealed class SketchCircle : Sketch
{
    private static readonly SketchShape Definition = new("0 0 160 60", "var(--trazos-lavender-border)", 3, true,
        [new("M20 8 C 70 -2, 150 6, 154 28 C 158 52, 60 58, 18 50 C -6 44, 4 14, 34 9")]);

    private protected override SketchShape Shape => Definition;
}

public sealed class SketchArrow : Sketch
{
    private static readonly SketchShape Definition = new("0 0 80 60", "var(--trazos-lavender)", 2.5, false,
        [new("M8 8 C 20 40, 40 50, 70 46"), new("M60 38 L71 46 L60 53", 0.8)]);

    private protected override SketchShape Shape => Definition;
}

public sealed class SketchSquiggle : Sketch
{
    private static readonly SketchShape Definition = new("0 0 720 20", "var(--trazos-border-strong)", 2, true,
        [new("M2 10 C 120 4, 240 16, 360 9 S 600 4, 718 11")]);

    private protected override SketchShape Shape => Definition;
}
