using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.JSInterop;
using Trazos.UI.Internal;

namespace Trazos.UI.Services;

public sealed class ThemeService(IJSRuntime js, TrazosUIOptions options) : IThemeService, IAsyncDisposable
{
    private readonly Dictionary<string, string> _colors = new()
    {
        ["light"] = options.ThemeLightColor,
        ["dark"] = options.ThemeDarkColor
    };

    private IJSObjectReference? _module;
    private DotNetObjectReference<ThemeService>? _reference;
    private Task? _initialization;

    public TrazosTheme Current { get; private set; } = TrazosTheme.Light;

    public event Action? Changed;

    public async Task InitializeAsync()
    {
        _initialization ??= ConnectAsync();

        try
        {
            await _initialization;
        }
        catch
        {
            // A prerender may have called too early, so a later call can try again.
            _initialization = null;
            throw;
        }
    }

    private async Task ConnectAsync()
    {
        _module = await TrazosModule.ImportAsync(js);
        _reference = DotNetObjectReference.Create(this);
        Update(await _module.InvokeAsync<string>("watchTheme", _reference, options.ThemeStorageKey, _colors));
    }

    public async Task SetThemeAsync(TrazosTheme theme)
    {
        await InitializeAsync();
        await _module!.InvokeVoidAsync("setTheme", ToValue(theme), options.ThemeStorageKey, _colors);
        Update(ToValue(theme));
    }

    /// <summary>Called by the browser when <c>data-theme</c> changes. Not meant for app code.</summary>
    [JSInvokable]
    public void OnThemeChanged(string theme) => Update(theme);

    private void Update(string value)
    {
        var theme = value == "dark" ? TrazosTheme.Dark : TrazosTheme.Light;
        if (theme == Current) return;
        Current = theme;
        Changed?.Invoke();
    }

    private static string ToValue(TrazosTheme theme) => theme == TrazosTheme.Dark ? "dark" : "light";

    public async ValueTask DisposeAsync()
    {
        try
        {
            if (_module is not null)
            {
                await _module.InvokeVoidAsync("unwatchTheme");
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
