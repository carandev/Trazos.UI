using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using Trazos.UI.Internal;

namespace Trazos.UI.Components;

/// <summary>
/// A top navigation bar for public websites. <c>AppShell</c> covers dashboards with a
/// sidebar. The mobile menu and the scrolled style need an interactive render mode.
/// </summary>
public partial class SiteHeader
{
    [Inject]
    private IJSRuntime JS { get; set; } = null!;

    [Parameter, EditorRequired]
    public IReadOnlyList<SiteHeaderLink> Links { get; set; } = [];

    /// <summary>Accessible name of the navigation.</summary>
    [Parameter, EditorRequired]
    public string NavLabel { get; set; } = string.Empty;

    [Parameter, EditorRequired]
    public string OpenMenuLabel { get; set; } = string.Empty;

    [Parameter, EditorRequired]
    public string CloseMenuLabel { get; set; } = string.Empty;

    [Parameter]
    public RenderFragment? Logo { get; set; }

    /// <summary>Rendered beside the menu button, such as a <see cref="ThemeToggle"/>.</summary>
    [Parameter]
    public RenderFragment? Actions { get; set; }

    /// <summary>The <c>Href</c> of the current link.</summary>
    [Parameter]
    public string? ActiveHref { get; set; }

    /// <summary>The <c>aria-current</c> value of the active link. <c>Location</c> suits a one-page site with <see cref="ScrollSpy"/>.</summary>
    [Parameter]
    public SiteHeaderCurrentType CurrentType { get; set; } = SiteHeaderCurrentType.Page;

    /// <summary>Raised when a navigation link is clicked.</summary>
    [Parameter]
    public EventCallback<SiteHeaderLink> OnLinkClick { get; set; }

    [Parameter]
    public string? Class { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    private readonly string _navId = $"trazos-site-header-nav-{Guid.NewGuid():N}";
    private ElementReference _header;
    private IJSObjectReference? _module;
    private DotNetObjectReference<SiteHeader>? _reference;
    private bool _menuOpen;
    private bool _disposed;

    private string CurrentValue => CurrentType == SiteHeaderCurrentType.Location ? "location" : "page";

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (!firstRender) return;

        try
        {
            var module = await TrazosModule.ImportAsync(JS);
            if (_disposed)
            {
                await module.DisposeAsync();
                return;
            }

            _module = module;
            _reference = DotNetObjectReference.Create(this);
            await module.InvokeVoidAsync("watchSiteHeader", _header, _reference);
        }
        catch (JSException)
        {
            // The header still works, without the scrolled style and the Escape key.
        }
    }

    private void ToggleMenu() => _menuOpen = !_menuOpen;

    /// <summary>Called by the browser on Escape. Not meant for app code.</summary>
    [JSInvokable]
    public void CloseMenu()
    {
        _menuOpen = false;
        StateHasChanged();
    }

    private async Task HandleLinkClickAsync(SiteHeaderLink link)
    {
        _menuOpen = false;
        await OnLinkClick.InvokeAsync(link);
    }

    public async ValueTask DisposeAsync()
    {
        _disposed = true;

        try
        {
            if (_module is not null)
            {
                await _module.InvokeVoidAsync("unwatchSiteHeader", _header);
                await _module.DisposeAsync();
            }
        }
        catch (JSDisconnectedException)
        {
            // The circuit is gone, and the listeners with it.
        }

        _reference?.Dispose();
    }
}
