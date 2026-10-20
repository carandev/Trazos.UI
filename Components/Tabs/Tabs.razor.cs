using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

public partial class Tabs : ComponentBase
{
    private readonly List<TabItem> _tabs = [];
    private readonly string _id = "trazos-tabs-" + Guid.NewGuid().ToString("N")[..8];

    [Parameter]
    public TabsVariant Variant { get; set; } = TabsVariant.Underline;

    [Parameter]
    public int ActiveIndex { get; set; } = 0;

    [Parameter]
    public EventCallback<int> ActiveIndexChanged { get; set; }

    [Parameter]
    public string? ActiveKey { get; set; }

    [Parameter]
    public EventCallback<string?> ActiveKeyChanged { get; set; }

    [Parameter]
    public string? Class { get; set; }

    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    public TabItem? ActiveTab
    {
        get
        {
            if (_tabs.Count == 0) return null;

            if (!string.IsNullOrEmpty(ActiveKey))
            {
                var match = _tabs.FirstOrDefault(t => string.Equals(t.Key, ActiveKey, StringComparison.OrdinalIgnoreCase));
                if (match != null) return match;
            }

            if (ActiveIndex >= 0 && ActiveIndex < _tabs.Count)
            {
                return _tabs[ActiveIndex];
            }

            return _tabs.FirstOrDefault();
        }
    }

    private string VariantClass => Variant switch
    {
        TabsVariant.Pills => "pills",
        TabsVariant.Contained => "contained",
        _ => "underline"
    };

    internal void AddTab(TabItem tab)
    {
        if (!_tabs.Contains(tab))
        {
            _tabs.Add(tab);
            StateHasChanged();
        }
    }

    internal void RemoveTab(TabItem tab)
    {
        if (_tabs.Remove(tab))
        {
            StateHasChanged();
        }
    }

    internal void NotifyTabChanged()
    {
        StateHasChanged();
    }

    private async Task SelectTabAsync(TabItem tab, int index)
    {
        if (tab.Disabled) return;

        ActiveIndex = index;
        if (ActiveIndexChanged.HasDelegate)
        {
            await ActiveIndexChanged.InvokeAsync(index);
        }

        if (!string.IsNullOrEmpty(tab.Key))
        {
            ActiveKey = tab.Key;
            if (ActiveKeyChanged.HasDelegate)
            {
                await ActiveKeyChanged.InvokeAsync(tab.Key);
            }
        }

        StateHasChanged();
    }

    private bool IsTabActive(TabItem tab, int index)
    {
        if (!string.IsNullOrEmpty(ActiveKey) && !string.IsNullOrEmpty(tab.Key))
        {
            return string.Equals(tab.Key, ActiveKey, StringComparison.OrdinalIgnoreCase);
        }

        return index == ActiveIndex || (ActiveTab == tab);
    }

    private string GetTabHeaderId(TabItem tab, int index) => $"{_id}-tab-{tab.Key ?? index.ToString()}";
    private string GetTabPanelId(TabItem tab, int index) => $"{_id}-panel-{tab.Key ?? index.ToString()}";
    private string GetActiveHeaderId() => ActiveTab != null ? GetTabHeaderId(ActiveTab, _tabs.IndexOf(ActiveTab)) : string.Empty;
    private string GetActivePanelId() => ActiveTab != null ? GetTabPanelId(ActiveTab, _tabs.IndexOf(ActiveTab)) : string.Empty;
}
