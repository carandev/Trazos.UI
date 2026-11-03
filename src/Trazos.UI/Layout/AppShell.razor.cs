using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Layout;

public partial class AppShell
{
    [Inject]
    private TrazosUIOptions Options { get; set; } = default!;

    private bool _isDrawerOpen;

    [Parameter]
    public RenderFragment? Brand { get; set; }

    [Parameter]
    public RenderFragment? Sidebar { get; set; }

    [Parameter]
    public RenderFragment? TopBar { get; set; }

    [Parameter]
    public RenderFragment? DrawerHeader { get; set; }

    [Parameter]
    public RenderFragment? DrawerContent { get; set; }

    [Parameter]
    public RenderFragment? Body { get; set; }

    [Parameter]
    public string ContainerClass { get; set; } = string.Empty;

    public void ToggleDrawer()
    {
        _isDrawerOpen = !_isDrawerOpen;
    }

    public void CloseDrawer()
    {
        _isDrawerOpen = false;
    }

    public void OpenDrawer()
    {
        _isDrawerOpen = true;
    }
}
