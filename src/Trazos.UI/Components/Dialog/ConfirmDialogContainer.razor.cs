using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Trazos.UI.Services;

namespace Trazos.UI.Components;

public partial class ConfirmDialogContainer : IDisposable
{
    private bool _isOpen;
    private ConfirmDialogOptions? _currentOptions;
    private TaskCompletionSource<bool>? _tcs;

    private PromptDialogOptions? _prompt;
    private TaskCompletionSource<PromptResult>? _promptTcs;
    private IPromptDialogService? _promptService;
    private readonly string _promptFieldId = $"trazos-prompt-{Guid.NewGuid():N}";
    private string? _promptText;
    private string? _promptError;

    [Inject]
    private IServiceProvider ServiceProvider { get; set; } = default!;

    protected override void OnInitialized()
    {
        DialogService.OnConfirmRequested += HandleConfirmRequestedAsync;
        // Optional, so apps that registered only IDialogService keep working.
        _promptService = ServiceProvider.GetService(typeof(IPromptDialogService)) as IPromptDialogService;
        if (_promptService != null)
        {
            _promptService.OnPromptRequested += HandlePromptRequestedAsync;
        }
    }

    private Task<PromptResult> HandlePromptRequestedAsync(PromptDialogOptions options)
    {
        _promptTcs?.TrySetResult(PromptResult.Cancelled);
        _prompt = options;
        _promptText = options.InitialText;
        _promptError = null;
        _promptTcs = new TaskCompletionSource<PromptResult>();
        _ = InvokeAsync(StateHasChanged);
        return _promptTcs.Task;
    }

    private void OnPromptTextChanged(string? text)
    {
        _promptText = text;
        if (_promptError != null)
        {
            _promptError = Validate(text);
        }
    }

    private string? Validate(string? text)
    {
        if (_prompt is null)
        {
            return null;
        }

        var trimmed = text?.Trim() ?? string.Empty;
        if (trimmed.Length == 0)
        {
            return _prompt.Required ? _prompt.RequiredMessage : null;
        }

        return _prompt.MinLength > 0 && trimmed.Length < _prompt.MinLength
            ? string.Format(System.Globalization.CultureInfo.CurrentCulture, _prompt.MinLengthMessage, _prompt.MinLength)
            : null;
    }

    private void ConfirmPrompt()
    {
        _promptError = Validate(_promptText);
        if (_promptError != null)
        {
            return;
        }

        var text = _promptText?.Trim();
        _prompt = null;
        _promptTcs?.TrySetResult(new PromptResult(true, string.IsNullOrEmpty(text) ? null : text));
    }

    private void CancelPrompt()
    {
        _prompt = null;
        _promptTcs?.TrySetResult(PromptResult.Cancelled);
    }

    private Task<bool> HandleConfirmRequestedAsync(ConfirmDialogOptions options)
    {
        _currentOptions = options;
        _isOpen = true;
        _tcs = new TaskCompletionSource<bool>();
        StateHasChanged();
        return _tcs.Task;
    }

    private void Confirm()
    {
        _isOpen = false;
        _tcs?.TrySetResult(true);
        _currentOptions = null;
    }

    private void Cancel()
    {
        _isOpen = false;
        _tcs?.TrySetResult(false);
        _currentOptions = null;
    }

    public void Dispose()
    {
        DialogService.OnConfirmRequested -= HandleConfirmRequestedAsync;
        if (_promptService != null)
        {
            _promptService.OnPromptRequested -= HandlePromptRequestedAsync;
        }

        _promptTcs?.TrySetResult(PromptResult.Cancelled);
    }
}
