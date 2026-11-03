using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

/// <summary>
/// Agrupa campos relacionados de un formulario bajo un título claro, opcionalmente numerado,
/// para que formularios largos se lean como una secuencia de pasos sencillos.
/// </summary>
public partial class FormSection
{
    private readonly string _titleId = $"trazos-form-section-{Guid.NewGuid():N}";

    [Parameter, EditorRequired]
    public string Title { get; set; } = string.Empty;

    [Parameter]
    public string? Description { get; set; }

    /// <summary>Número de paso mostrado junto al título.</summary>
    [Parameter]
    public int? Step { get; set; }

    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    [Parameter]
    public string? Class { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }
}
