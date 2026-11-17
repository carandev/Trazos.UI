using System.Reflection;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.Extensions.Logging;
using Trazos.UI.Docs.Navigation;

namespace Trazos.UI.Docs.Search;

/// <summary>One documentation page rendered to HTML for the search index.</summary>
public sealed record SearchPageSource(string Href, string Html);

/// <summary>
/// Renders every page listed in <see cref="DocsNav"/> to static HTML, in the current
/// language and framework, so the search index is built from the real pages and never
/// drifts from them. Demos are left out (see <see cref="SearchIndexHost"/>).
/// </summary>
public sealed class DocsPageRenderer(IServiceProvider services, ILoggerFactory loggerFactory)
{
    private static readonly IReadOnlyDictionary<string, Type> Routes = typeof(DocsPageRenderer).Assembly
        .GetExportedTypes()
        .Where(type => typeof(IComponent).IsAssignableFrom(type))
        .SelectMany(type => type.GetCustomAttributes<RouteAttribute>().Select(route => (Href: route.Template.Trim('/'), Type: type)))
        .ToDictionary(route => route.Href, route => route.Type);

    private readonly ILogger _logger = loggerFactory.CreateLogger<DocsPageRenderer>();

    /// <summary>The page component for a navigation href, or null when no page has that route.</summary>
    public static Type? PageFor(string href) => Routes.GetValueOrDefault(href);

    public async Task<IReadOnlyList<SearchPageSource>> RenderAllAsync(CancellationToken cancellationToken = default)
    {
        await using var renderer = new HtmlRenderer(services, loggerFactory);
        var pages = new List<SearchPageSource>();

        foreach (var item in DocsNav.Sections.SelectMany(section => section.Items))
        {
            cancellationToken.ThrowIfCancellationRequested();

            if (PageFor(item.Href) is not { } page)
            {
                _logger.LogWarning("Search index: no page has the route '{Href}'.", item.Href);
                continue;
            }

            try
            {
                var html = await renderer.Dispatcher.InvokeAsync(() =>
                {
                    var parameters = ParameterView.FromDictionary(new Dictionary<string, object?>
                    {
                        [nameof(SearchIndexHost.Page)] = page,
                    });

                    // Only the synchronous first render is needed: the page text never waits on I/O.
                    return renderer.BeginRenderingComponent<SearchIndexHost>(parameters).ToHtmlString();
                });
                pages.Add(new SearchPageSource(item.Href, html));
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Search index: the page '{Href}' could not be rendered.", item.Href);
            }

            // WebAssembly runs on one thread: give the browser a frame between pages.
            await Task.Delay(1, cancellationToken);
        }

        return pages;
    }
}
