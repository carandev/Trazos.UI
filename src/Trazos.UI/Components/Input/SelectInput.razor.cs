using System.Collections.Generic;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

/// <summary>
/// Styled native select bound to any value type: strings, enums, ids such as
/// <c>int</c> or <c>Guid</c>, and their nullable forms. Options come from
/// <see cref="Options"/>, from <c>&lt;option&gt;</c> children, or both.
/// Works standalone or bound inside an EditForm.
/// </summary>
public partial class SelectInput<TValue> : FormFieldBase<TValue>
{
    public SelectInput() : base("trazos-select")
    {
    }

    [Parameter]
    public string? Placeholder { get; set; }

    /// <summary>Typed options. Rendered before any <c>&lt;option&gt;</c> children.</summary>
    [Parameter]
    public IEnumerable<SelectOption<TValue>>? Options { get; set; }

    [Parameter]
    public RenderFragment? LeadingIcon { get; set; }

    /// <summary><c>&lt;option&gt;</c> elements. Their <c>value</c> is converted to <typeparamref name="TValue"/>.</summary>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    private bool HasNoValue => string.IsNullOrEmpty(CurrentValueAsString);

    private Task OnSelectionChanged(ChangeEventArgs e) => SetValueFromStringAsync(e.Value?.ToString());
}
