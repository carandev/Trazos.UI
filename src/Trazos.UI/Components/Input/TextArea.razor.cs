using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

/// <summary>Multi-line text field. Works standalone or bound inside an EditForm.</summary>
public partial class TextArea : FormFieldBase<string?>
{
    public TextArea() : base("trazos-textarea")
    {
    }

    [Parameter]
    public int Rows { get; set; } = 4;

    [Parameter]
    public string? Placeholder { get; set; }

    [Parameter]
    public bool ReadOnly { get; set; }

    private Task OnInputChanged(ChangeEventArgs e) => SetValueAsync(e.Value?.ToString());
}
