using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Trazos.UI.Docs.Frameworks;

public enum ReactDemoStatus
{
    Mounted,
    /// <summary>The bundle loaded but has no demo with that id.</summary>
    Missing,
    /// <summary>The bundle could not load: apps/docs-react was not built.</summary>
    Unavailable,
    /// <summary>A newer mount or an unmount replaced this one while it loaded.</summary>
    Cancelled,
}

/// <summary>
/// Bridge to the live React demos built by apps/docs-react into wwwroot/react.
/// The module is imported once, on the first React demo the reader opens.
/// </summary>
public sealed class ReactDemos(IJSRuntime js) : IAsyncDisposable
{
    public const string ModulePath = "./react/trazos-react-demos.js";

    private Task<IJSObjectReference?>? _module;

    private Task<IJSObjectReference?> ModuleAsync() => _module ??= LoadAsync();

    private async Task<IJSObjectReference?> LoadAsync()
    {
        try
        {
            return await js.InvokeAsync<IJSObjectReference>("import", ModulePath);
        }
        catch (JSException)
        {
            return null;
        }
    }

    public async Task<ReactDemoStatus> MountAsync(ElementReference host, string id, string lang)
    {
        var module = await ModuleAsync();
        if (module is null) return ReactDemoStatus.Unavailable;
        if (!await module.InvokeAsync<bool>("has", id)) return ReactDemoStatus.Missing;

        return await module.InvokeAsync<bool>("mount", host, id, lang)
            ? ReactDemoStatus.Mounted
            : ReactDemoStatus.Cancelled;
    }

    public async Task UnmountAsync(ElementReference host)
    {
        var module = await ModuleAsync();
        if (module is null) return;

        try
        {
            await module.InvokeVoidAsync("unmount", host);
        }
        catch (JSDisconnectedException)
        {
            // The page is going away; React goes with it.
        }
    }

    /// <summary>The code the docs show for a demo, or null when it cannot be loaded.</summary>
    public async Task<string?> SourceAsync(string id, string lang)
    {
        var module = await ModuleAsync();
        return module is null ? null : await module.InvokeAsync<string?>("source", id, lang);
    }

    public async ValueTask DisposeAsync()
    {
        if (_module is { IsCompletedSuccessfully: true, Result: { } module })
        {
            await module.DisposeAsync();
        }
    }
}
