using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.JSInterop;
using Trazos.UI.Internal;

namespace Trazos.UI.Components;

/// <summary>Copies a value to the clipboard, with a handwritten note and a screen-reader announcement.</summary>
public partial class CopyButton
{
    private const int NoteDurationMs = 2000;

    private enum CopyStatus { Idle, Copied, Failed }

    [Inject]
    private IJSRuntime JS { get; set; } = null!;

    /// <summary>The text to copy.</summary>
    [Parameter, EditorRequired]
    public string Value { get; set; } = string.Empty;

    /// <summary>Accessible name of the button.</summary>
    [Parameter, EditorRequired]
    public string Label { get; set; } = string.Empty;

    /// <summary>Shown and announced after copying. There is no default, so the library stays language-neutral.</summary>
    [Parameter, EditorRequired]
    public string CopiedLabel { get; set; } = string.Empty;

    /// <summary>Shown and announced when copying fails and there is no <see cref="Fallback"/>.</summary>
    [Parameter]
    public string? ErrorLabel { get; set; }

    /// <summary>Runs when the clipboard API is missing or refuses, such as opening a <c>mailto:</c> link.</summary>
    [Parameter]
    public EventCallback<string> Fallback { get; set; }

    /// <summary>Runs after the value reached the clipboard.</summary>
    [Parameter]
    public EventCallback<string> OnCopied { get; set; }

    [Parameter]
    public RenderFragment? Icon { get; set; }

    [Parameter]
    public RenderFragment? CheckIcon { get; set; }

    [Parameter]
    public ButtonVariant Variant { get; set; } = ButtonVariant.Ghost;

    [Parameter]
    public IconButtonSize Size { get; set; } = IconButtonSize.Medium;

    [Parameter]
    public bool Disabled { get; set; }

    [Parameter]
    public bool Loading { get; set; }

    [Parameter]
    public string? Class { get; set; }

    [Parameter]
    public EventCallback<MouseEventArgs> OnClick { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    private CopyStatus _status = CopyStatus.Idle;
    private CancellationTokenSource? _noteTimer;
    private IJSObjectReference? _module;

    private string? Message => _status switch
    {
        CopyStatus.Copied => CopiedLabel,
        CopyStatus.Failed => ErrorLabel,
        _ => null
    };

    private async Task HandleClickAsync(MouseEventArgs args)
    {
        await OnClick.InvokeAsync(args);

        if (await TryWriteToClipboardAsync())
        {
            ShowNote(CopyStatus.Copied);
            await OnCopied.InvokeAsync(Value);
            return;
        }

        try
        {
            if (!Fallback.HasDelegate) throw new InvalidOperationException("No fallback");
            await Fallback.InvokeAsync(Value);
        }
        catch (Exception)
        {
            // The fallback is host code, and any failure of it means the copy failed.
            ShowNote(CopyStatus.Failed);
        }
    }

    private async Task<bool> TryWriteToClipboardAsync()
    {
        try
        {
            _module ??= await TrazosModule.ImportAsync(JS);
            await _module.InvokeVoidAsync("copyText", Value);
            return true;
        }
        catch (JSException)
        {
            return false;
        }
    }

    private void ShowNote(CopyStatus status)
    {
        _status = status;
        _noteTimer?.Cancel();
        _noteTimer?.Dispose();
        _noteTimer = new CancellationTokenSource();
        _ = HideNoteAsync(_noteTimer.Token);
    }

    private async Task HideNoteAsync(CancellationToken token)
    {
        try
        {
            await Task.Delay(NoteDurationMs, token);
            _status = CopyStatus.Idle;
            await InvokeAsync(StateHasChanged);
        }
        catch (OperationCanceledException)
        {
            // A newer note replaced this one, or the component is gone.
        }
    }

    public async ValueTask DisposeAsync()
    {
        _noteTimer?.Cancel();
        _noteTimer?.Dispose();
        if (_module is null) return;

        try
        {
            await _module.DisposeAsync();
        }
        catch (JSDisconnectedException)
        {
            // The circuit is gone, and the module with it.
        }
    }
}
