using System;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

public partial class TabItem : ComponentBase, IDisposable
{
    [CascadingParameter]
    internal Tabs? ParentTabs { get; set; }

    [Parameter]
    public string? Key { get; set; }

    [Parameter]
    public string Title { get; set; } = string.Empty;

    [Parameter]
    public RenderFragment? Icon { get; set; }

    [Parameter]
    public RenderFragment? Badge { get; set; }

    [Parameter]
    public RenderFragment? HeaderTemplate { get; set; }

    [Parameter]
    public bool Disabled { get; set; }

    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    // Header state the parent Tabs renders from this item. RenderFragment parameters are
    // compared by presence only: Blazor hands over a new delegate on every render, so
    // comparing them by reference would notify the parent on each of its own renders
    // and loop forever.
    private (string? Key, string Title, bool Disabled, bool HasIcon, bool HasBadge, bool HasHeader)? _headerState;

    protected override void OnInitialized()
    {
        ParentTabs?.AddTab(this);
    }

    protected override void OnParametersSet()
    {
        var current = (Key, Title, Disabled, Icon is not null, Badge is not null, HeaderTemplate is not null);
        var previous = _headerState;
        _headerState = current;

        // The first pass is covered by AddTab, which already re-renders the parent.
        if (previous is not null && previous != current)
        {
            ParentTabs?.NotifyTabChanged();
        }
    }

    public void Dispose()
    {
        ParentTabs?.RemoveTab(this);
    }
}
