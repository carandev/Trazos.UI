using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using Trazos.UI.Internal;

namespace Trazos.UI.Components;

/// <summary>
/// Reports the id of the section that crosses the middle of the viewport, for one-page
/// sites. It renders nothing: <c>&lt;ScrollSpy Ids="ids" @bind-ActiveId="_active" /&gt;</c>.
/// </summary>
public sealed class ScrollSpy : ComponentBase, IAsyncDisposable
{
    [Inject]
    private IJSRuntime JS { get; set; } = null!;

    [Parameter, EditorRequired]
    public IReadOnlyList<string> Ids { get; set; } = [];

    [Parameter]
    public string? ActiveId { get; set; }

    [Parameter]
    public EventCallback<string?> ActiveIdChanged { get; set; }

    private IJSObjectReference? _module;
    private DotNetObjectReference<ScrollSpy>? _reference;
    private IReadOnlyList<string>? _watched;
    private int _handle;
    private bool _disposed;

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        // Hosts often pass a new list on each render, so this compares its contents.
        if (_watched is not null && _watched.SequenceEqual(Ids)) return;
        var ids = Ids.ToArray();
        _watched = ids;

        try
        {
            if (_module is null)
            {
                var module = await TrazosModule.ImportAsync(JS);
                if (_disposed)
                {
                    await module.DisposeAsync();
                    return;
                }

                _module = module;
                _reference = DotNetObjectReference.Create(this);
            }

            await _module.InvokeVoidAsync("unwatchScrollSpy", _handle);
            _handle = await _module.InvokeAsync<int>("watchScrollSpy", _reference, ids);
        }
        catch (JSException)
        {
            // Without the script no link is marked as active.
        }
    }

    /// <summary>Called by the browser. Not meant for app code.</summary>
    [JSInvokable]
    public async Task OnActiveChanged(string id)
    {
        if (id == ActiveId) return;
        ActiveId = id;
        await ActiveIdChanged.InvokeAsync(id);
    }

    public async ValueTask DisposeAsync()
    {
        _disposed = true;

        try
        {
            if (_module is not null)
            {
                await _module.InvokeVoidAsync("unwatchScrollSpy", _handle);
                await _module.DisposeAsync();
            }
        }
        catch (JSDisconnectedException)
        {
            // The circuit is gone, and the observer with it.
        }

        _reference?.Dispose();
    }
}
