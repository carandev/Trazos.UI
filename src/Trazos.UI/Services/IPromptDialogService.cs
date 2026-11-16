using System.Threading.Tasks;
using Trazos.UI.Components;

namespace Trazos.UI.Services;

/// <summary>Options of a confirmation that asks for a typed reason or comment.</summary>
/// <param name="Message">Explanation shown above the field.</param>
/// <param name="Title">Dialog title.</param>
/// <param name="InputLabel">Label of the text field.</param>
/// <param name="ConfirmText">Text of the confirm button.</param>
/// <param name="CancelText">Text of the cancel button.</param>
/// <param name="ConfirmVariant">Variant of the confirm button, for example Wine for a rejection.</param>
/// <param name="Placeholder">Placeholder of the text field.</param>
/// <param name="Required">The text cannot be empty.</param>
/// <param name="MinLength">Minimum length after trimming. 0 turns the check off.</param>
/// <param name="MaxLength">Maximum length, enforced by the field.</param>
/// <param name="RequiredMessage">Shown when the text is empty and <paramref name="Required"/> is on.</param>
/// <param name="MinLengthMessage">Shown when the text is too short. <c>{0}</c> is <paramref name="MinLength"/>.</param>
/// <param name="InitialText">Text already in the field when the dialog opens.</param>
/// <param name="Size">Modal size.</param>
public record PromptDialogOptions(
    string Message,
    string Title = "Confirm action",
    string InputLabel = "Reason",
    string ConfirmText = "Confirm",
    string CancelText = "Cancel",
    ButtonVariant ConfirmVariant = ButtonVariant.Primary,
    string? Placeholder = null,
    bool Required = true,
    int MinLength = 0,
    int MaxLength = 500,
    string RequiredMessage = "This field is required.",
    string MinLengthMessage = "Write at least {0} characters.",
    string? InitialText = null,
    string Size = "small");

/// <summary>Answer of a prompt dialog.</summary>
/// <param name="Confirmed">The user confirmed with valid text.</param>
/// <param name="Text">The trimmed text, or <c>null</c> when cancelled.</param>
public sealed record PromptResult(bool Confirmed, string? Text)
{
    public static PromptResult Cancelled { get; } = new(false, null);
}

/// <summary>
/// Opens a confirmation that requires a typed reason or comment, for
/// approve, reject and cancel flows. Shown by the same
/// <c>ConfirmDialogContainer</c> as <see cref="IDialogService"/>.
/// </summary>
public interface IPromptDialogService
{
    event System.Func<PromptDialogOptions, Task<PromptResult>>? OnPromptRequested;

    /// <summary>Resolves when the user confirms with valid text or cancels.</summary>
    Task<PromptResult> PromptAsync(PromptDialogOptions options);
}
