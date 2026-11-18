using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Routing;
using Microsoft.Extensions.DependencyInjection;
using Trazos.UI.Components;

namespace Trazos.UI.Tests.Structure;

public class SidebarNavTests : BunitContext
{
    [Fact]
    public void Section_renders_its_title_and_aria_label()
    {
        var cut = Render<SidebarNavSection>(p => p
            .Add(x => x.Title, "Main")
            .AddChildContent("<p>Item</p>"));

        var root = cut.Find("div.trazos-sidebar-nav-section");
        Assert.Equal("Main", root.GetAttribute("aria-label"));

        var title = cut.Find("p.trazos-sidebar-nav-section-title");
        Assert.Equal("Main", title.TextContent);
        Assert.Equal("true", title.GetAttribute("aria-hidden"));
    }

    [Fact]
    public void Item_renders_its_icon_label_and_href()
    {
        var cut = Render<SidebarNavItem>(p => p
            .Add(x => x.Href, "/employees")
            .Add(x => x.Icon, (RenderFragment)(b => b.AddMarkupContent(0, "<svg data-testid=\"icon\"></svg>")))
            .AddChildContent("Employees"));

        var link = cut.Find("a.trazos-sidebar-nav-item");
        Assert.Equal("/employees", link.GetAttribute("href"));
        cut.Find("span.trazos-sidebar-nav-item-icon svg");
        Assert.Equal("Employees", cut.Find("span.trazos-sidebar-nav-item-label").TextContent);
    }

    [Fact]
    public void Item_gets_is_active_when_a_longer_route_matches_with_prefix_matching()
    {
        Services.GetRequiredService<NavigationManager>().NavigateTo("/employees/123");

        var cut = Render<SidebarNavItem>(p => p
            .Add(x => x.Href, "/employees")
            .AddChildContent("Employees"));

        Assert.Contains("is-active", cut.Find("a").ClassList);
    }

    [Fact]
    public void Item_does_not_get_is_active_on_a_longer_route_with_all_matching()
    {
        Services.GetRequiredService<NavigationManager>().NavigateTo("/employees/123");

        var cut = Render<SidebarNavItem>(p => p
            .Add(x => x.Href, "/employees")
            .Add(x => x.Match, NavLinkMatch.All)
            .AddChildContent("Employees"));

        Assert.DoesNotContain("is-active", cut.Find("a").ClassList);
    }

    [Fact]
    public void Item_gets_is_active_on_an_exact_route_with_all_matching()
    {
        Services.GetRequiredService<NavigationManager>().NavigateTo("/employees");

        var cut = Render<SidebarNavItem>(p => p
            .Add(x => x.Href, "/employees")
            .Add(x => x.Match, NavLinkMatch.All)
            .AddChildContent("Employees"));

        Assert.Contains("is-active", cut.Find("a").ClassList);
    }

    [Fact]
    public void Footer_renders_after_the_items_and_outside_the_scrollable_wrapper()
    {
        var cut = Render<SidebarNav>(p => p
            .AddChildContent("<p>Item</p>")
            .Add(x => x.Footer, (RenderFragment)(b => b.AddMarkupContent(0, "<button>Settings</button>"))));

        var items = cut.Find("div.trazos-sidebar-nav-items");
        Assert.DoesNotContain("Settings", items.InnerHtml);

        var footer = cut.Find("div.trazos-sidebar-nav-items ~ button");
        Assert.Equal("Settings", footer.TextContent);
    }
}
