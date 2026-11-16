using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Trazos.UI.Components;

/// <summary>
/// Search box for filtering lists: <c>type="search"</c>, a search icon, a clear
/// button and Escape to clear. <c>ValueChanged</c> is debounced, so a list is
/// filtered once the user pauses instead of on every key.
/// </summary>
public partial class SearchInput : FormFieldBase<string?>
{
    private CancellationTokenSource? _debounce;
    private string? _text;
    private string? _lastValue;

    public SearchInput() : base("trazos-search")
    {
    }

    /// <summary>Milliseconds to wait after the last key before raising <c>ValueChanged</c>. 0 raises it on every key.</summary>
    [Parameter]
    public int Debounce { get; set; } = 300;

    [Parameter]
    public string? Placeholder { get; set; }

    /// <summary>Accessible name when there is no visible <c>Label</c>.</summary>
    [Parameter]
    public string AriaLabel { get; set; } = "Search";

    /// <summary>Accessible name of the clear button.</summary>
    [Parameter]
    public string ClearLabel { get; set; } = "Clear search";

    private bool HasText => !string.IsNullOrEmpty(_text);

    protected override void OnParametersSet()
    {
        base.OnParametersSet();
        if (!string.Equals(Value, _lastValue, StringComparison.Ordinal))
        {
            _text = Value;
            _lastValue = Value;
        }
    }

    private async Task OnInput(ChangeEventArgs e)
    {
        _text = e.Value?.ToString();
        CancelPending();

        if (Debounce <= 0)
        {
            await CommitAsync(_text);
            return;
        }

        var cts = new CancellationTokenSource();
        _debounce = cts;
        var text = _text;
        try
        {
            await Task.Delay(Debounce, cts.Token);
        }
        catch (TaskCanceledException)
        {
            return;
        }

        await InvokeAsync(() => CommitAsync(text));
    }

    private async Task OnKeyDown(KeyboardEventArgs e)
    {
        if (e.Key == "Escape" && HasText)
        {
            await ClearAsync();
        }
    }

    private async Task ClearAsync()
    {
        CancelPending();
        _text = string.Empty;
        await CommitAsync(string.Empty);
    }

    private async Task CommitAsync(string? text)
    {
        _lastValue = text;
        await SetValueAsync(text);
        StateHasChanged();
    }

    private void CancelPending()
    {
        _debounce?.Cancel();
        _debounce?.Dispose();
        _debounce = null;
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            CancelPending();
        }

        base.Dispose(disposing);
    }
}
