using System;
using System.Threading.Tasks;
using Trazos.UI.Components;

namespace Trazos.UI.Services;

public record ConfirmDialogOptions(
    string Message,
    string Title = "Confirmar acción",
    string ConfirmText = "Confirmar",
    string CancelText = "Cancelar",
    ButtonVariant ConfirmVariant = ButtonVariant.Primary,
    string Size = "small"
);

public interface IDialogService
{
    event Func<ConfirmDialogOptions, Task<bool>>? OnConfirmRequested;

    Task<bool> ConfirmAsync(ConfirmDialogOptions options);

    Task<bool> ConfirmAsync(
        string message,
        string title = "Confirmar acción",
        string confirmText = "Confirmar",
        string cancelText = "Cancelar",
        ButtonVariant confirmVariant = ButtonVariant.Primary);
}
