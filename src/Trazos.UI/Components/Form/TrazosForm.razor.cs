using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;

namespace Trazos.UI.Components;

/// <summary>
/// Thin wrapper over <see cref="EditForm"/> that auto-wires <see cref="DataAnnotationsValidator"/>
/// and, by default, a <see cref="ValidationSummary"/>, so apps do not repeat that boilerplate on
/// every form. Trazos inputs (<c>TextInput</c>, <c>SelectInput</c>, ...) already read the cascaded
/// <see cref="EditContext"/> through <c>FormFieldBase</c>, so they keep working unchanged inside a
/// <c>TrazosForm</c> instead of a raw <see cref="EditForm"/>.
/// <para>
/// <see cref="EditForm"/> itself still requires exactly one of <see cref="Model"/> or
/// <see cref="EditContext"/> to be set, and <see cref="OnSubmit"/> is still mutually exclusive
/// with <see cref="OnValidSubmit"/>/<see cref="OnInvalidSubmit"/>; <c>TrazosForm</c> forwards the
/// parameters straight through and lets <see cref="EditForm"/> enforce those invariants itself.
/// </para>
/// </summary>
public partial class TrazosForm
{
    /// <summary>Forwarded to <see cref="EditForm.Model"/>.</summary>
    [Parameter]
    public object? Model { get; set; }

    /// <summary>Forwarded to <see cref="EditForm.EditContext"/>.</summary>
    [Parameter]
    public EditContext? EditContext { get; set; }

    [Parameter]
    public EventCallback<EditContext> OnValidSubmit { get; set; }

    [Parameter]
    public EventCallback<EditContext> OnInvalidSubmit { get; set; }

    [Parameter]
    public EventCallback<EditContext> OnSubmit { get; set; }

    /// <summary>Renders a <see cref="ValidationSummary"/> right after the validator, before <see cref="ChildContent"/>. Defaults to <c>true</c>.</summary>
    [Parameter]
    public bool ShowValidationSummary { get; set; } = true;

    /// <summary>The form's fields. Receives the <see cref="EditContext"/>, exactly like <see cref="EditForm.ChildContent"/>.</summary>
    [Parameter]
    public RenderFragment<EditContext>? ChildContent { get; set; }

    [Parameter]
    public string? Class { get; set; }
}
