using System.Collections.Generic;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

/// <summary>A framed image with an offset ink shadow and a rotated backing sheet.</summary>
public partial class PhotoFrame
{
    [Parameter, EditorRequired]
    public string Src { get; set; } = string.Empty;

    [Parameter, EditorRequired]
    public string Alt { get; set; } = string.Empty;

    /// <summary>Handwritten text below the image.</summary>
    [Parameter]
    public RenderFragment? Caption { get; set; }

    /// <summary>Pins the frame with a strip of tape.</summary>
    [Parameter]
    public bool ShowTape { get; set; }

    [Parameter]
    public string? TapeColor { get; set; }

    [Parameter]
    public double? TapeRotate { get; set; }

    [Parameter]
    public TapePosition TapePosition { get; set; } = TapePosition.Top;

    /// <summary>Extra attributes for the image, such as <c>loading</c> or <c>width</c>.</summary>
    [Parameter]
    public Dictionary<string, object>? ImageAttributes { get; set; }

    [Parameter]
    public string? Class { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }
}
