using System.Collections.Generic;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

/// <summary>
/// Mensaje para listas o vistas sin contenido: explica por qué está vacío
/// y ofrece la siguiente acción posible.
/// </summary>
public partial class EmptyState
{
    [Parameter, EditorRequired]
    public string Title { get; set; } = string.Empty;

    [Parameter]
    public string? Description { get; set; }

    [Parameter]
    public RenderFragment? Icon { get; set; }

    [Parameter]
    public IconBoxVariant IconVariant { get; set; } = IconBoxVariant.Cream;

    /// <summary>Botones o enlaces para resolver el estado vacío.</summary>
    [Parameter]
    public RenderFragment? Actions { get; set; }

    /// <summary>Versión con menos espacio vertical, para paneles laterales.</summary>
    [Parameter]
    public bool Compact { get; set; }

    [Parameter]
    public string? Class { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }
}
