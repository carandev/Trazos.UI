using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.JSInterop;

namespace Trazos.UI.Components;

public partial class Drawer : IDisposable
{
    private bool _previousIsOpen;
    private double _touchStartX;
    private bool _isDragging;
    private const string BodyClass = "trazos-drawer-open";

    [Inject]
    private IJSRuntime JS { get; set; } = null!;

    [Parameter]
    public bool IsOpen { get; set; }

    [Parameter]
    public EventCallback<bool> IsOpenChanged { get; set; }

    [Parameter]
    public EventCallback OnClose { get; set; }

    [Parameter]
    public string? Title { get; set; }

    [Parameter]
    public RenderFragment? Header { get; set; }

    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    [Parameter]
    public bool ShowCloseButton { get; set; } = true;

    [Parameter]
    public string CloseButtonAriaLabel { get; set; } = "Cerrar menú";

    protected override async Task OnParametersSetAsync()
    {
        if (IsOpen != _previousIsOpen)
        {
            _previousIsOpen = IsOpen;
            if (IsOpen)
            {
                await EnableBodyScrollLockAsync();
            }
            else
            {
                await DisableBodyScrollLockAsync();
            }
        }
    }

    public async Task CloseAsync()
    {
        _previousIsOpen = false;
        await DisableBodyScrollLockAsync();
        IsOpen = false;
        await IsOpenChanged.InvokeAsync(false);
        await OnClose.InvokeAsync();
    }

    private async Task EnableBodyScrollLockAsync()
    {
        await Task.Delay(50);
        if (IsOpen)
        {
            await SetBodyClassAsync(true);
        }
    }

    private async Task DisableBodyScrollLockAsync()
    {
        await SetBodyClassAsync(false);
    }

    private async Task SetBodyClassAsync(bool add)
    {
        try
        {
            await JS.InvokeVoidAsync("eval", add
                ? $"document.body.classList.add('{BodyClass}')"
                : $"document.body.classList.remove('{BodyClass}')");
        }
        catch
        {
            // Ignore during prerendering or if JS runtime is unavailable
        }
    }

    private void OnTouchStart(TouchEventArgs e)
    {
        if (e.Touches.Length > 0)
        {
            _touchStartX = e.Touches[0].ClientX;
            _isDragging = true;
        }
    }

    private void OnTouchMove(TouchEventArgs e)
    {
        if (!_isDragging || IsOpen || e.Touches.Length == 0) return;

        var currentX = e.Touches[0].ClientX;
        var diff = currentX - _touchStartX;

        if (diff > 100)
        {
            IsOpen = true;
            _previousIsOpen = true;
            _ = IsOpenChanged.InvokeAsync(true);
            _ = EnableBodyScrollLockAsync();
            _isDragging = false;
        }
    }

    private void OnTouchEnd(TouchEventArgs e)
    {
        _isDragging = false;
    }

    public void Dispose()
    {
        _ = DisableBodyScrollLockAsync();
    }
}
