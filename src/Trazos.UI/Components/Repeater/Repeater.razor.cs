using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

/// <summary>
/// Editable list of rows: each row renders <see cref="ItemTemplate"/> with a
/// remove button, and an add button appends <see cref="CreateItem"/>(). Built
/// for tiered tables such as rate brackets, price tiers or schedules; the
/// context's <c>IsLast</c> lets the last row stay open-ended. The list is
/// changed in place and <see cref="ItemsChanged"/> is raised, so
/// <c>@bind-Items</c> works with a model list.
/// </summary>
public partial class Repeater<TItem>
{
    // Row keys live apart from the items, because value-equal items (records,
    // numbers) would produce duplicate @key values.
    private readonly List<object> _keys = [];

    [Parameter, EditorRequired]
    public List<TItem> Items { get; set; } = [];

    [Parameter]
    public EventCallback<List<TItem>> ItemsChanged { get; set; }

    [Parameter, EditorRequired]
    public RenderFragment<RepeaterContext<TItem>> ItemTemplate { get; set; } = null!;

    /// <summary>Builds the item added by the add button. No add button when null.</summary>
    [Parameter]
    public Func<TItem>? CreateItem { get; set; }

    /// <summary>Column titles above the rows, laid out like the row cells.</summary>
    [Parameter]
    public RenderFragment? Header { get; set; }

    /// <summary>Shown when there are no rows.</summary>
    [Parameter]
    public RenderFragment? EmptyContent { get; set; }

    [Parameter]
    public int MinItems { get; set; }

    [Parameter]
    public int? MaxItems { get; set; }

    [Parameter]
    public bool Disabled { get; set; }

    /// <summary>Accessible name of the list of rows.</summary>
    [Parameter]
    public string? Label { get; set; }

    [Parameter]
    public string AddText { get; set; } = "Add row";

    /// <summary>Accessible name of each remove button. <c>{0}</c> is the row number, from 1.</summary>
    [Parameter]
    public string RemoveLabelFormat { get; set; } = "Remove row {0}";

    [Parameter]
    public string? Class { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    private object KeyAt(int index)
    {
        while (_keys.Count < Items.Count)
        {
            _keys.Add(new object());
        }

        if (_keys.Count > Items.Count)
        {
            _keys.RemoveRange(Items.Count, _keys.Count - Items.Count);
        }

        return _keys[index];
    }

    private async Task AddAsync()
    {
        if (CreateItem is null || (MaxItems is { } max && Items.Count >= max))
        {
            return;
        }

        Items.Add(CreateItem());
        _keys.Add(new object());
        await ItemsChanged.InvokeAsync(Items);
    }

    private async Task RemoveAtAsync(int index)
    {
        if (Items.Count <= MinItems || index < 0 || index >= Items.Count)
        {
            return;
        }

        Items.RemoveAt(index);
        if (index < _keys.Count)
        {
            _keys.RemoveAt(index);
        }

        await ItemsChanged.InvokeAsync(Items);
    }
}
