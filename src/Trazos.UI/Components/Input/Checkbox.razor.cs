using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

public partial class Checkbox
{
    [Parameter]
    public string Id { get; set; } = $"trazos-chk-{Guid.NewGuid():N}";

    [Parameter]
    public string? Label { get; set; }

    [Parameter]
    public bool Value { get; set; }

    [Parameter]
    public EventCallback<bool> ValueChanged { get; set; }

    [Parameter]
    public string? HelperText { get; set; }

    [Parameter]
    public string? Error { get; set; }

    [Parameter]
    public bool Disabled { get; set; }

    [Parameter]
    public string? Class { get; set; }

    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    private bool HasError => !string.IsNullOrEmpty(Error);

    private async Task OnCheckboxChanged(ChangeEventArgs e)
    {
        if (bool.TryParse(e.Value?.ToString(), out var isChecked))
        {
            Value = isChecked;
            await ValueChanged.InvokeAsync(Value);
        }
    }
}
