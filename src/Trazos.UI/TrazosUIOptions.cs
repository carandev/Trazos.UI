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
}
