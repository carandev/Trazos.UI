using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.DependencyInjection;
using Trazos.UI.Extensions;
using Trazos.UI.Layout;

namespace Trazos.UI.Tests.Structure;

public class AppShellTests : BunitContext
{
    public AppShellTests()
    {
        Services.AddTrazosUI();
    }

    [Fact]
    public void Closes_the_drawer_when_the_route_changes()
    {
        var cut = Render<AppShell>(p => p.Add(x => x.Body, (RenderFragment)(b => b.AddMarkupContent(0, "<p>Page</p>"))));
        cut.Instance.OpenDrawer();
        cut.Render();
        Assert.Contains("open", cut.Find("aside.trazos-drawer").ClassList);

        Services.GetRequiredService<NavigationManager>().NavigateTo("/other");

        Assert.DoesNotContain("open", cut.Find("aside.trazos-drawer").ClassList);
    }

    [Fact]
    public void Keeps_the_drawer_open_when_CloseDrawerOnNavigation_is_false()
    {
        var cut = Render<AppShell>(p => p
            .Add(x => x.CloseDrawerOnNavigation, false)
            .Add(x => x.Body, (RenderFragment)(b => b.AddMarkupContent(0, "<p>Page</p>"))));
        cut.Instance.OpenDrawer();
        cut.Render();

        Services.GetRequiredService<NavigationManager>().NavigateTo("/other");

        Assert.Contains("open", cut.Find("aside.trazos-drawer").ClassList);
    }
}
