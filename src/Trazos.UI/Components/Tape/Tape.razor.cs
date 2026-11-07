using System.Collections.Generic;
using System.Globalization;
using Microsoft.AspNetCore.Components;
using Trazos.UI.Internal;

namespace Trazos.UI.Components;

/// <summary>
/// A strip of translucent tape. Its parent must be positioned, since the tape is
/// placed against the parent's top edge.
/// </summary>
public partial class Tape
{
    /// <summary>Any CSS color. Defaults to translucent gold.</summary>
    [Parameter]
    public string? Color { get; set; }

    /// <summary>Rotation in degrees. Defaults to -3.</summary>
    [Parameter]
    public double? Rotate { get; set; }

    [Parameter]
    public TapePosition Position { get; set; } = TapePosition.Top;

    [Parameter]
    public string? Class { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    private string PositionClass => Position switch
    {
        TapePosition.TopLeft => "top-left",
        TapePosition.TopRight => "top-right",
        _ => "top"
    };

    private string? StyleValue
    {
        get
        {
            var parts = new List<string>();
            if (Color is not null) parts.Add($"--trazos-tape-color: {Color}");
            if (Rotate is { } rotate) parts.Add($"--trazos-tape-rotate: {rotate.ToString(CultureInfo.InvariantCulture)}deg");
            return StyleAttribute.Merge(string.Join("; ", parts), AdditionalAttributes);
        }
    }
}
