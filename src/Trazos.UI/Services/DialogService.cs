using System;
using System.Threading.Tasks;
using Trazos.UI.Components;

namespace Trazos.UI.Services;

public class DialogService : IDialogService
{
    public event Func<ConfirmDialogOptions, Task<bool>>? OnConfirmRequested;

    public async Task<bool> ConfirmAsync(ConfirmDialogOptions options)
    {
        if (OnConfirmRequested != null)
        {
            return await OnConfirmRequested.Invoke(options);
        }

        // Fallback: si no hay contenedor registrado, devuelve false por seguridad
        return false;
    }

    public Task<bool> ConfirmAsync(
        string message,
        string title = "Confirmar acción",
        string confirmText = "Confirmar",
        string cancelText = "Cancelar",
        ButtonVariant confirmVariant = ButtonVariant.Primary)
    {
        return ConfirmAsync(new ConfirmDialogOptions(
            Message: message,
            Title: title,
            ConfirmText: confirmText,
            CancelText: cancelText,
            ConfirmVariant: confirmVariant
        ));
    }
}
