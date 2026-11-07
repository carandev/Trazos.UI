using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.JSInterop;
using Trazos.UI.Services;

namespace Trazos.UI.Components;

/// <summary>
/// Switches between the light and dark themes. Both icons are always rendered and CSS
/// shows the right one, so prerendered HTML is right before the app is interactive.
/// </summary>
public partial class ThemeToggle
{
    [Inject]
    private IThemeService Theme { get; set; } = null!;

    /// <summary>Accessible name of the button.</summary>
    [Parameter, EditorRequired]
    public string Label { get; set; } = string.Empty;

    /// <summary>Shown in the light theme.</summary>
    [Parameter]
    public RenderFragment? MoonIcon { get; set; }

    /// <summary>Shown in the dark theme.</summary>
    [Parameter]
    public RenderFragment? SunIcon { get; set; }

    [Parameter]
    public ButtonVariant Variant { get; set; } = ButtonVariant.Ghost;

    [Parameter]
    public IconButtonSize Size { get; set; } = IconButtonSize.Medium;

    [Parameter]
    public bool Disabled { get; set; }

    [Parameter]
    public string? Class { get; set; }

    [Parameter]
    public EventCallback<MouseEventArgs> OnClick { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        if (!firstRender) return;

        try
        {
            await Theme.InitializeAsync();
        }
        catch (JSException)
        {
            // Without the script the page keeps the theme it has.
        }
    }

    private async Task HandleClickAsync(MouseEventArgs args)
    {
        await OnClick.InvokeAsync(args);

        try
        {
            await Theme.InitializeAsync();
            await Theme.SetThemeAsync(Theme.Current == TrazosTheme.Dark ? TrazosTheme.Light : TrazosTheme.Dark);
        }
        catch (JSException)
        {
            // Without the script the page keeps the theme it has.
        }
    }
}
