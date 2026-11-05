using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace Trazos.UI.Docs.Localization;

public enum DocsLang
{
    En,
    Es,
}

/// <summary>
/// Current documentation language. The choice is remembered in localStorage; on the first
/// visit it follows the browser language.
/// </summary>
public sealed class DocsLanguage(IJSRuntime js)
{
    public DocsLang Current { get; private set; } = DocsLang.En;

    public bool IsSpanish => Current == DocsLang.Es;

    public string Code => IsSpanish ? "es" : "en";

    public event Action? Changed;

    /// <summary>Picks the text for the current language.</summary>
    public string T(string en, string es) => IsSpanish ? es : en;

    /// <summary>Picks trusted, hand-written HTML for the current language.</summary>
    public MarkupString H(string en, string es) => new(T(en, es));

    public async Task InitializeAsync()
    {
        try
        {
            var code = await js.InvokeAsync<string?>("trazosDocs.getLanguage");
            Current = code == "es" ? DocsLang.Es : DocsLang.En;
            await js.InvokeVoidAsync("trazosDocs.applyLanguage", Code, false);
        }
        catch (JSException)
        {
            // Keep English when the browser APIs are unavailable.
        }
    }

    public async Task SetAsync(DocsLang lang)
    {
        if (lang == Current) return;

        Current = lang;
        Changed?.Invoke();

        try
        {
            await js.InvokeVoidAsync("trazosDocs.applyLanguage", Code, true);
        }
        catch (JSException)
        {
            // The choice still applies for this visit.
        }
    }
}
