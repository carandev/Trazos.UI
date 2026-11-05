using Microsoft.JSInterop;

namespace Trazos.UI.Docs.Localization;

/// <summary>
/// Light or dark theme of the docs site. The page script applies it to
/// <c>&lt;html data-theme&gt;</c> before Blazor starts; this service reads it back
/// and switches it. The choice is remembered in localStorage; on the first visit it
/// follows the operating system preference.
/// </summary>
public sealed class DocsTheme(IJSRuntime js)
{
    public bool IsDark { get; private set; }

    public async Task InitializeAsync()
    {
        try
        {
            IsDark = await js.InvokeAsync<string?>("trazosDocs.getTheme") == "dark";
        }
        catch (JSException)
        {
            // Keep light when the browser APIs are unavailable.
        }
    }

    public async Task ToggleAsync()
    {
        IsDark = !IsDark;

        try
        {
            await js.InvokeVoidAsync("trazosDocs.applyTheme", IsDark ? "dark" : "light", true);
        }
        catch (JSException)
        {
            // Nothing else to do: without JS interop the theme cannot change.
        }
    }
}
