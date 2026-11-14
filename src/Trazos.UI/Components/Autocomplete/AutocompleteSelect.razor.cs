using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

/// <summary>
/// Searchable select bound to an id: an <see cref="Autocomplete{TItem}"/> over
/// a preloaded list (or a search function) whose <c>Value</c> is
/// <c>ValueSelector(item)</c>, such as an employee or company id. Works inside
/// an EditForm like the other fields. With <c>MinChars="0"</c> the list opens
/// on focus.
/// </summary>
public partial class AutocompleteSelect<TItem, TValue> : FormFieldBase<TValue>
{
    private TItem? _selected;
    private bool _hasSelected;

    public AutocompleteSelect() : base("trazos-autocomplete-select")
    {
    }

    /// <summary>Items to choose from. Also used to show the item of an existing value.</summary>
    [Parameter]
    public IEnumerable<TItem>? Items { get; set; }

    /// <summary>Remote search. When set, it is used instead of filtering <see cref="Items"/>.</summary>
    [Parameter]
    public Func<string, CancellationToken, Task<IEnumerable<TItem>>>? SearchFunc { get; set; }

    /// <summary>
    /// Loads the item of a value that is not in <see cref="Items"/>, such as an
    /// existing id when the list comes from <see cref="SearchFunc"/>.
    /// </summary>
    [Parameter]
    public Func<TValue, CancellationToken, Task<TItem?>>? ResolveItem { get; set; }

    /// <summary>The value bound for an item, normally its id.</summary>
    [Parameter, EditorRequired]
    public Func<TItem, TValue> ValueSelector { get; set; } = null!;

    [Parameter, EditorRequired]
    public Func<TItem, string> ItemText { get; set; } = null!;

    [Parameter]
    public RenderFragment<TItem>? ItemTemplate { get; set; }

    [Parameter]
    public string? Placeholder { get; set; }

    [Parameter]
    public int MinChars { get; set; } = 0;

    [Parameter]
    public int DebounceMs { get; set; } = 150;

    [Parameter]
    public int MaxResults { get; set; } = 50;

    [Parameter]
    public string NoResultsText { get; set; } = "No results";

    [Parameter]
    public string SearchingText { get; set; } = "Searching…";

    [Parameter]
    public string ClearText { get; set; } = "Clear selection";

    private TItem? SelectedItem
    {
        get
        {
            if (_hasSelected && EqualityComparer<TValue>.Default.Equals(ValueSelector(_selected!), Value))
            {
                return _selected;
            }

            return Items is null
                ? default
                : Items.FirstOrDefault(item => EqualityComparer<TValue>.Default.Equals(ValueSelector(item), Value));
        }
    }

    protected override async Task OnParametersSetAsync()
    {
        if (ResolveItem is null || Value is null || EqualityComparer<TValue>.Default.Equals(Value, default!)
            || SelectedItem is not null)
        {
            return;
        }

        var item = await ResolveItem(Value, CancellationToken.None);
        if (item is not null && EqualityComparer<TValue>.Default.Equals(ValueSelector(item), Value))
        {
            _selected = item;
            _hasSelected = true;
        }
    }

    private Task OnSelectedAsync(TItem? item)
    {
        if (item is null)
        {
            _selected = default;
            _hasSelected = false;
            return SetValueAsync(default!);
        }

        _selected = item;
        _hasSelected = true;
        return SetValueAsync(ValueSelector(item));
    }
}
