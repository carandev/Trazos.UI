using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

public partial class SelectInput
{
    [Parameter]
    public string Id { get; set; } = $"trazos-select-{Guid.NewGuid():N}";

    [Parameter]
    public string? Label { get; set; }

    [Parameter]
    public string? Value { get; set; }

    [Parameter]
    public EventCallback<string?> ValueChanged { get; set; }

    [Parameter]
    public string? Placeholder { get; set; }

    [Parameter]
    public string? HelperText { get; set; }

    [Parameter]
    public string? Error { get; set; }

    [Parameter]
    public bool Required { get; set; }

    [Parameter]
    public bool Disabled { get; set; }

    [Parameter]
    public string? Class { get; set; }

    [Parameter]
    public RenderFragment? LeadingIcon { get; set; }

    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    private bool HasError => !string.IsNullOrEmpty(Error);

    private async Task OnSelectionChanged(ChangeEventArgs e)
    {
        Value = e.Value?.ToString();
        await ValueChanged.InvokeAsync(Value);
    }
}
