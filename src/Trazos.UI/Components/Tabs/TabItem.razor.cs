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

    protected override void OnInitialized()
    {
        ParentTabs?.AddTab(this);
    }

    protected override void OnParametersSet()
    {
        ParentTabs?.NotifyTabChanged();
    }

    public void Dispose()
    {
        ParentTabs?.RemoveTab(this);
    }
}
