using Microsoft.AspNetCore.Components;
using Trazos.UI.Components;

namespace Trazos.UI.Tests.Structure;

public class PageStructureTests : BunitContext
{
    private static readonly IReadOnlyList<BreadcrumbItem> Trail =
    [
        new("Home", "/"),
        new("Employees", "/employees"),
        new("Ada Lovelace"),
    ];

    [Fact]
    public void Breadcrumbs_link_every_item_but_the_current_page()
    {
        var cut = Render<Breadcrumbs>(p => p.Add(x => x.Items, Trail).Add(x => x.Label, "Ruta"));

        Assert.Equal("Ruta", cut.Find("nav").GetAttribute("aria-label"));
        var items = cut.FindAll("ol > li");
        Assert.Equal(3, items.Count);
        Assert.Equal("/", items[0].QuerySelector("a")!.GetAttribute("href"));
        Assert.Equal("/employees", items[1].QuerySelector("a")!.GetAttribute("href"));
        Assert.Null(items[2].QuerySelector("a"));
        Assert.Equal("page", items[2].QuerySelector("[aria-current]")!.GetAttribute("aria-current"));
        Assert.Equal(2, cut.FindAll(".trazos-breadcrumbs-separator[aria-hidden='true']").Count);
    }

    [Fact]
    public void Page_header_renders_title_level_subtitle_back_link_and_actions()
    {
        var cut = Render<PageHeader>(p => p
            .Add(x => x.Title, "Payroll run")
            .Add(x => x.Subtitle, "November 2026")
            .Add(x => x.Level, 2)
            .Add(x => x.BackHref, "/payroll")
            .Add(x => x.BackLabel, "Volver")
            .Add(x => x.Actions, (RenderFragment)(b => b.AddMarkupContent(0, "<button>Approve</button>"))));

        Assert.Equal("Payroll run", cut.Find("h2.trazos-page-header-title").TextContent);
        Assert.Equal("November 2026", cut.Find(".trazos-page-header-subtitle").TextContent);
        var back = cut.Find("a.trazos-page-header-back");
        Assert.Equal("/payroll", back.GetAttribute("href"));
        Assert.Contains("Volver", back.TextContent);
        Assert.Equal("Approve", cut.Find(".trazos-page-header-actions button").TextContent);
    }

    [Fact]
    public void Page_header_accepts_breadcrumbs_and_defaults_to_h1()
    {
        var cut = Render<PageHeader>(p => p
            .Add(x => x.Title, "Ada Lovelace")
            .Add(x => x.Breadcrumbs, Trail));

        Assert.Single(cut.FindAll("h1"));
        Assert.Single(cut.FindAll("nav.trazos-breadcrumbs"));
        Assert.Empty(cut.FindAll(".trazos-page-header-back"));
        Assert.Empty(cut.FindAll(".trazos-page-header-actions"));
    }

    [Fact]
    public void Divider_is_a_separator_with_optional_label_and_orientation()
    {
        var plain = Render<Divider>();
        var labeled = Render<Divider>(p => p.Add(x => x.Label, "Deductions"));
        var vertical = Render<Divider>(p => p.Add(x => x.Vertical, true));

        Assert.Equal("separator", plain.Find("[role='separator']").GetAttribute("role"));
        Assert.Equal("Deductions", labeled.Find(".trazos-divider-label").TextContent);
        Assert.Equal("Deductions", labeled.Find("[role='separator']").GetAttribute("aria-label"));
        Assert.Equal("vertical", vertical.Find("[role='separator']").GetAttribute("aria-orientation"));
        Assert.Null(plain.Find("[role='separator']").GetAttribute("aria-orientation"));
    }
}
