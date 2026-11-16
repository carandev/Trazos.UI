using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Trazos.UI.Components;

/// <summary>
/// Select bound to any value type: strings, enums, ids such as <c>int</c> or
/// <c>Guid</c>, and their nullable forms. Works standalone or bound inside an EditForm.
/// <para>
/// With <see cref="Options"/> only, the field draws its own list (a combobox
/// trigger and a listbox popup) so it follows the theme, dark mode included.
/// With <c>&lt;option&gt;</c> children, alone or mixed with <see cref="Options"/>,
/// it stays a styled native select, because Blazor cannot read the children.
/// </para>
/// </summary>
public partial class SelectInput<TValue> : FormFieldBase<TValue>
{
    // Letters typed within this window build one type-ahead prefix.
    private const long TypeAheadWindowMs = 500;

    private List<SelectOption<TValue>> _items = [];
    private ElementReference _trigger;
    private bool _isOpen;
    private int _activeIndex = -1;
    private string _typeAhead = string.Empty;
    private long _typeAheadAt;

    public SelectInput() : base("trazos-select")
    {
    }

    /// <summary>Text shown while there is no value. It is never a choosable option.</summary>
    [Parameter]
    public string? Placeholder { get; set; }

    /// <summary>
    /// Typed options. Alone, they render the library list; mixed with
    /// <c>&lt;option&gt;</c> children, they render before them in a native select.
    /// </summary>
    [Parameter]
    public IEnumerable<SelectOption<TValue>>? Options { get; set; }

    [Parameter]
    public RenderFragment? LeadingIcon { get; set; }

    /// <summary><c>&lt;option&gt;</c> elements. Their <c>value</c> is converted to <typeparamref name="TValue"/>. They keep the native select.</summary>
    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    private bool UseListbox => Options is not null && ChildContent is null;

    private bool HasNoValue => string.IsNullOrEmpty(CurrentValueAsString);

    private bool HasLabel => !string.IsNullOrEmpty(Label);

    private string LabelId => $"{Id}-label";

    private string ListboxId => $"{Id}-listbox";

    private string GetOptionId(int index) => $"{Id}-option-{index}";

    private int SelectedIndex => _items.FindIndex(o => EqualityComparer<TValue>.Default.Equals(o.Value, Value));

    private string? DisplayText => SelectedIndex is var i and >= 0 ? _items[i].Text : Placeholder;

    protected override void OnParametersSet()
    {
        base.OnParametersSet();
        _items = Options?.ToList() ?? [];
        if (_activeIndex >= _items.Count)
        {
            _activeIndex = -1;
        }
        if (Disabled)
        {
            Close();
        }
    }

    private Task OnSelectionChanged(ChangeEventArgs e) => SetValueFromStringAsync(e.Value?.ToString());

    private bool IsEnabled(int index) => index >= 0 && index < _items.Count && !_items[index].Disabled;

    private int FirstEnabled() => _items.FindIndex(o => !o.Disabled);

    private int LastEnabled() => _items.FindLastIndex(o => !o.Disabled);

    /// <summary>The next enabled index from <paramref name="from"/> in <paramref name="step"/> direction, or <paramref name="from"/> at the edge.</summary>
    private int NextEnabled(int from, int step)
    {
        for (var i = from + step; i >= 0 && i < _items.Count; i += step)
        {
            if (!_items[i].Disabled)
            {
                return i;
            }
        }
        return from;
    }

    private void Open(int activeIndex)
    {
        if (Disabled || _items.Count == 0)
        {
            return;
        }
        _isOpen = true;
        _activeIndex = activeIndex;
    }

    private void OpenOnSelected(bool fromEnd = false)
    {
        var selected = SelectedIndex;
        Open(IsEnabled(selected) ? selected : fromEnd ? LastEnabled() : FirstEnabled());
    }

    private void Close()
    {
        _isOpen = false;
        _activeIndex = -1;
        _typeAhead = string.Empty;
    }

    private async Task OnTriggerClick(MouseEventArgs e)
    {
        // A click with Detail 0 comes from Enter or Space, which OnKeyDown already handled.
        if (Disabled || e.Detail == 0)
        {
            return;
        }

        if (_isOpen)
        {
            Close();
            return;
        }

        OpenOnSelected();
        // Some browsers (Safari) do not focus a clicked button; focus is what closes the list on blur.
        await _trigger.FocusAsync();
    }

    private async Task OnKeyDownAsync(KeyboardEventArgs e)
    {
        if (Disabled)
        {
            return;
        }

        switch (e.Key)
        {
            case "ArrowDown":
                if (_isOpen) _activeIndex = NextEnabled(_activeIndex, 1);
                else OpenOnSelected();
                break;
            case "ArrowUp":
                if (_isOpen) _activeIndex = NextEnabled(_activeIndex, -1);
                else OpenOnSelected(fromEnd: true);
                break;
            case "Home":
                if (_isOpen) _activeIndex = FirstEnabled();
                else Open(FirstEnabled());
                break;
            case "End":
                if (_isOpen) _activeIndex = LastEnabled();
                else Open(LastEnabled());
                break;
            case "Enter":
            case " ":
                if (_isOpen) await ChooseAsync(_activeIndex);
                else OpenOnSelected();
                break;
            case "Escape":
            case "Tab":
                Close();
                break;
            default:
                if (e.Key.Length == 1 && !e.CtrlKey && !e.AltKey && !e.MetaKey)
                {
                    TypeAhead(e.Key);
                }
                break;
        }
    }

    /// <summary>Moves to the next enabled option whose text starts with the letters typed so far.</summary>
    private void TypeAhead(string key)
    {
        var now = Environment.TickCount64;
        _typeAhead = now - _typeAheadAt > TypeAheadWindowMs ? key : _typeAhead + key;
        _typeAheadAt = now;

        if (!_isOpen)
        {
            Open(-1);
            if (!_isOpen)
            {
                return;
            }
        }

        // The same letter repeated cycles through the options that start with it.
        var repeated = _typeAhead.All(c => char.ToLowerInvariant(c) == char.ToLowerInvariant(_typeAhead[0]));
        var prefix = repeated ? _typeAhead[..1] : _typeAhead;
        var origin = _activeIndex < 0 ? 0 : _activeIndex + (prefix.Length == 1 ? 1 : 0);

        for (var i = 0; i < _items.Count; i++)
        {
            var index = (origin + i) % _items.Count;
            if (!_items[index].Disabled && _items[index].Text.StartsWith(prefix, StringComparison.CurrentCultureIgnoreCase))
            {
                _activeIndex = index;
                return;
            }
        }
    }

    private async Task ChooseAsync(int index)
    {
        if (!IsEnabled(index))
        {
            return;
        }

        var option = _items[index];
        Close();
        if (!EqualityComparer<TValue>.Default.Equals(option.Value, Value))
        {
            await SetValueAsync(option.Value);
        }
    }
}
