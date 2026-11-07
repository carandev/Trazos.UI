using System;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Trazos.UI.Services;

namespace Trazos.UI.Extensions;

public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Registers Trazos.UI services, including dialogs, the theme and configuration options.
    /// </summary>
    /// <param name="services">The service collection.</param>
    /// <param name="configure">Optional configuration action for TrazosUIOptions.</param>
    /// <returns>The service collection for chaining.</returns>
    public static IServiceCollection AddTrazosUI(this IServiceCollection services, Action<TrazosUIOptions>? configure = null)
    {
        var options = new TrazosUIOptions();
        configure?.Invoke(options);

        services.TryAddSingleton(options);
        services.TryAddScoped<IDialogService, DialogService>();
        services.TryAddScoped<IThemeService, ThemeService>();

        return services;
    }
}
