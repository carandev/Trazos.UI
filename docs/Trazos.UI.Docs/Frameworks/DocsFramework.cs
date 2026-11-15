using Microsoft.JSInterop;

namespace Trazos.UI.Docs.Frameworks;

public enum DocsFw
{
    Blazor,
    React,
}

/// <summary>
/// The library the reader is documenting: Blazor (Trazos.UI on NuGet) or React
/// (@carandev/trazos-ui on npm). The choice is remembered in localStorage, and a
/// <c>?fw=react</c> or <c>?fw=blazor</c> link picks it on arrival.
/// </summary>
public sealed class DocsFramework(IJSRuntime js)
{
    public DocsFw Current { get; private set; } = DocsFw.Blazor;

    public bool IsReact => Current == DocsFw.React;

    public string Code => IsReact ? "react" : "blazor";

    public event Action? Changed;

    /// <summary>Picks the value for the current framework.</summary>
    public T Pick<T>(T blazor, T react) => IsReact ? react : blazor;

    public async Task InitializeAsync()
    {
        try
        {
            var code = await js.InvokeAsync<string?>("trazosDocs.getFramework");
            Current = code == "react" ? DocsFw.React : DocsFw.Blazor;
        }
        catch (JSException)
        {
            // Keep Blazor when the browser APIs are unavailable.
        }
    }

    public async Task SetAsync(DocsFw framework)
    {
        if (framework == Current) return;

        Current = framework;
        Changed?.Invoke();

        try
        {
            await js.InvokeVoidAsync("trazosDocs.saveFramework", Code);
        }
        catch (JSException)
        {
            // The choice still applies for this visit.
        }
    }
}
