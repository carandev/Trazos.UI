using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

/// <summary>
/// Grupo de opciones excluyentes presentadas como tarjetas con título y descripción.
/// Pensado para decisiones donde el usuario necesita entender qué implica cada opción.
/// Usa radios nativos, por lo que funciona con teclado y lectores de pantalla.
/// </summary>
public partial class RadioCardGroup<TValue>
{
    private readonly string _name = $"trazos-radio-cards-{Guid.NewGuid():N}";

    [Parameter, EditorRequired]
    public List<RadioCardOption<TValue>> Options { get; set; } = [];

    [Parameter]
    public TValue? Value { get; set; }

    [Parameter]
    public EventCallback<TValue> ValueChanged { get; set; }

    [Parameter]
    public string? Label { get; set; }

    [Parameter]
    public string? HelperText { get; set; }

    [Parameter]
    public string? Error { get; set; }

    [Parameter]
    public bool Required { get; set; }

    [Parameter]
    public bool Disabled { get; set; }

    /// <summary>Columnas en pantallas medianas o grandes (1 o 2). En móvil siempre es 1.</summary>
    [Parameter]
    public int Columns { get; set; } = 2;

    [Parameter]
    public string? Class { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    private bool IsSelected(RadioCardOption<TValue> option) =>
        EqualityComparer<TValue>.Default.Equals(option.Value, Value);

    private async Task SelectAsync(RadioCardOption<TValue> option)
    {
        Value = option.Value;
        await ValueChanged.InvokeAsync(option.Value);
    }
}
