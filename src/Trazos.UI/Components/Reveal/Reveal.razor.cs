using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using Trazos.UI.Internal;

namespace Trazos.UI.Components;

/// <summary>
/// Fades and raises its content when it scrolls into view. Only JavaScript hides the
/// content, and only when it is below the fold, so prerendered HTML is always visible.
/// </summary>
public partial class Reveal
{
    [Inject]
    private IJSRuntime JS { get; set; } = null!;

    /// <summary>Milliseconds to wait before the entrance starts, to stagger siblings.</summary>
    [Parameter]
    public int Delay { get; set; }

    [Parameter]
    public string? Class { get; set; }

    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    private ElementReference _element;
    private IJSObjectReference? _module;
    private bool _disposed;

    private string? StyleValue => StyleAttribute.Merge(
        $"--trazos-reveal-delay: {Delay.ToString(CultureInfo.InvariantCulture)}ms",
        AdditionalAttributes);

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
            await module.InvokeVoidAsync("watchReveal", _element);
        }
        catch (JSException)
        {
            // Without the script nothing was hidden, so the content stays visible.
        }
    }

    public async ValueTask DisposeAsync()
    {
        _disposed = true;
        if (_module is null) return;

        try
        {
            await _module.InvokeVoidAsync("unwatchReveal", _element);
            await _module.DisposeAsync();
        }
        catch (JSDisconnectedException)
        {
            // The circuit is gone, and the observer with it.
        }
    }
}
