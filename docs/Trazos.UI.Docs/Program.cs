using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Trazos.UI.Docs;
using Trazos.UI.Docs.Localization;
using Trazos.UI.Extensions;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddTrazosUI(options =>
{
    options.IsDevelopment = builder.HostEnvironment.IsDevelopment();
    options.EnvironmentName = builder.HostEnvironment.Environment;
});

builder.Services.AddSingleton<DocsLanguage>();
builder.Services.AddSingleton<DocsTheme>();

var host = builder.Build();
await host.Services.GetRequiredService<DocsLanguage>().InitializeAsync();
await host.Services.GetRequiredService<DocsTheme>().InitializeAsync();
await host.RunAsync();
