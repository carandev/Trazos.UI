using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

/// <summary>Single-line text field. Works standalone or bound inside an EditForm.</summary>
public partial class TextInput : FormFieldBase<string?>
{
    public TextInput() : base("trazos-input")
    {
    }

    [Parameter]
    public string Type { get; set; } = "text";

    [Parameter]
    public string? Placeholder { get; set; }

    [Parameter]
    public bool ReadOnly { get; set; }

    /// <summary>Text shown inside the field before the value, such as <c>$</c> or <c>COP</c>.</summary>
    [Parameter]
    public string? Prefix { get; set; }

    /// <summary>Text shown inside the field after the value, such as <c>%</c> or <c>kg</c>.</summary>
    [Parameter]
    public string? Suffix { get; set; }

    [Parameter]
    public RenderFragment? LeadingIcon { get; set; }

    [Parameter]
    public RenderFragment? TrailingIcon { get; set; }

    private Task OnInputChanged(ChangeEventArgs e) => SetValueAsync(e.Value?.ToString());
}
