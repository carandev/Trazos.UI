using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

/// <summary>Checkbox with a hand-drawn box. Works standalone or bound inside an EditForm.</summary>
public partial class Checkbox : FormFieldBase<bool>
{
    public Checkbox() : base("trazos-chk")
    {
    }

    /// <summary>Rich label. Takes precedence over <c>Label</c>.</summary>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    private async Task OnCheckboxChanged(ChangeEventArgs e)
    {
        if (bool.TryParse(e.Value?.ToString(), out var isChecked))
        {
            await SetValueAsync(isChecked);
        }
    }
}
