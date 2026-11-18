using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Routing;

namespace Trazos.UI.Layout;

public partial class AppShell : IDisposable
{
    [Inject]
    private TrazosUIOptions Options { get; set; } = default!;

    [Inject]
    private NavigationManager Navigation { get; set; } = default!;

    private bool _isDrawerOpen;

    /// <summary>Closes the mobile drawer whenever the route changes. Defaults to true; set false to manage it yourself.</summary>
    [Parameter]
    public bool CloseDrawerOnNavigation { get; set; } = true;

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

    protected override void OnInitialized()
    {
        Navigation.LocationChanged += HandleLocationChanged;
    }

    private void HandleLocationChanged(object? sender, LocationChangedEventArgs e)
    {
        if (!CloseDrawerOnNavigation || !_isDrawerOpen)
        {
            return;
        }

        _isDrawerOpen = false;
        InvokeAsync(StateHasChanged);
    }

    public void Dispose()
    {
        Navigation.LocationChanged -= HandleLocationChanged;
    }
}
