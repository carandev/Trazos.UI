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
public partial class RadioCardGroup<TValue> : FormFieldBase<TValue>
{
    private readonly string _name = $"trazos-radio-cards-{Guid.NewGuid():N}";

    public RadioCardGroup() : base("trazos-radio-cards")
    {
    }

    [Parameter, EditorRequired]
    public List<RadioCardOption<TValue>> Options { get; set; } = [];

    /// <summary>Columnas en pantallas medianas o grandes (1 o 2). En móvil siempre es 1.</summary>
    [Parameter]
    public int Columns { get; set; } = 2;

    private bool IsSelected(RadioCardOption<TValue> option) =>
        EqualityComparer<TValue>.Default.Equals(option.Value, Value);

    private Task SelectAsync(RadioCardOption<TValue> option) => SetValueAsync(option.Value);
}
