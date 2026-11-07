namespace Trazos.UI;

/// <summary>
/// Configuration options for the Trazos.UI library.
/// </summary>
public class TrazosUIOptions
{
    /// <summary>
    /// Gets or sets whether the application is currently running in a development environment.
    /// When true, development indicators (e.g., environment badge) and diagnostic aids can be active.
    /// </summary>
    public bool IsDevelopment { get; set; }

    /// <summary>
    /// Gets or sets the display name of the environment (e.g., "DEV", "STAGING", "LOCAL", "PROD").
    /// </summary>
    public string? EnvironmentName { get; set; }

    /// <summary>
    /// Gets or sets whether to display an environment badge in the AppShell when IsDevelopment is true.
    /// Defaults to true.
    /// </summary>
    public bool ShowEnvironmentBadge { get; set; } = true;

    /// <summary>
    /// Gets or sets the <c>localStorage</c> key that holds the user's theme. If you change it,
    /// also set <c>data-storage-key</c> on the <c>trazos-theme.js</c> script tag.
    /// </summary>
    public string ThemeStorageKey { get; set; } = "trazos-theme";

    /// <summary>Gets or sets the <c>theme-color</c> meta value in the light theme.</summary>
    public string ThemeLightColor { get; set; } = "#FAF7F2";

    /// <summary>Gets or sets the <c>theme-color</c> meta value in the dark theme.</summary>
    public string ThemeDarkColor { get; set; } = "#1A1512";
}
