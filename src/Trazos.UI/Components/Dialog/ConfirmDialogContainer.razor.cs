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

    protected override void OnInitialized()
    {
        DialogService.OnConfirmRequested += HandleConfirmRequestedAsync;
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
    }
}
