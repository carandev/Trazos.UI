using Microsoft.Extensions.DependencyInjection;
using Trazos.UI.Services;

namespace Trazos.UI.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddTrazosUI(this IServiceCollection services)
    {
        services.AddScoped<IDialogService, DialogService>();
        return services;
    }
}
