using System;
using System.Threading.Tasks;

namespace Trazos.UI.Services;

/// <summary>
/// Reads and sets the light or dark theme. The <c>data-theme</c> attribute on
/// <c>&lt;html&gt;</c> is the source of truth, and the choice is kept in
/// <c>localStorage</c>. The theme follows the system until the user chooses.
/// </summary>
public interface IThemeService
{
    /// <summary>The current theme. It is <see cref="TrazosTheme.Light"/> until initialized.</summary>
    TrazosTheme Current { get; }

    /// <summary>Raised when the theme changes for any reason, including another browser tab.</summary>
    event Action? Changed;

    /// <summary>
    /// Connects to the browser. It needs JavaScript, so call it from
    /// <c>OnAfterRenderAsync</c> when the app prerenders. Repeated calls do nothing.
    /// </summary>
    Task InitializeAsync();

    /// <summary>Applies a theme and remembers it, so the system no longer decides.</summary>
    Task SetThemeAsync(TrazosTheme theme);
}
