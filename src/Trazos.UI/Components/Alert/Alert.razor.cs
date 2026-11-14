using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

/// <summary>
/// Inline, persistent message with a tone, an optional title, body, actions
/// and a dismiss button. Unlike a toast it stays in the page until the user
/// or the app removes it, so it also fits inside a Modal for destructive-action
/// warnings. Warning and danger alerts use <c>role="alert"</c>; info and
/// success use <c>role="status"</c>.
/// </summary>
public partial class Alert
{
    private bool _dismissed;

    [Parameter]
    public AlertTone Tone { get; set; } = AlertTone.Info;

    [Parameter]
    public string? Title { get; set; }

    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    /// <summary>Buttons or links shown below the body.</summary>
    [Parameter]
    public RenderFragment? Actions { get; set; }

    /// <summary>Replaces the tone's default icon.</summary>
    [Parameter]
    public RenderFragment? Icon { get; set; }

    /// <summary>Shows a close button. The alert hides itself and raises <see cref="OnDismiss"/>.</summary>
    [Parameter]
    public bool Dismissible { get; set; }

    /// <summary>Accessible name of the close button.</summary>
    [Parameter]
    public string DismissLabel { get; set; } = "Dismiss";

    [Parameter]
    public EventCallback OnDismiss { get; set; }

    [Parameter]
    public string? Class { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    private string ToneName => Tone.ToString().ToLowerInvariant();

    private string Role => Tone is AlertTone.Warning or AlertTone.Danger ? "alert" : "status";

    private async Task DismissAsync()
    {
        _dismissed = true;
        await OnDismiss.InvokeAsync();
    }
}
