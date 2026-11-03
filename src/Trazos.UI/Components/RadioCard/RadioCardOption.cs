using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

/// <summary>
/// Opción de un <see cref="RadioCardGroup{TValue}"/>.
/// </summary>
/// <param name="Value">Valor que representa la opción.</param>
/// <param name="Title">Texto principal de la opción.</param>
/// <param name="Description">Explicación breve de qué implica elegirla.</param>
/// <param name="Icon">Ícono opcional mostrado a la izquierda.</param>
public record RadioCardOption<TValue>(
    TValue Value,
    string Title,
    string? Description = null,
    RenderFragment? Icon = null);
