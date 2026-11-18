using Microsoft.AspNetCore.Components;
using Trazos.UI.Components;
using Trazos.UI.Tests.Fixtures;

namespace Trazos.UI.Tests.Display;

public class ActionCardTests : BunitContext
{
    [Fact]
    public void Renders_href_on_the_root_anchor()
    {
        var cut = Render<ActionCard>(p => p
            .Add(x => x.Href, "/employees/new")
            .Add(x => x.Title, "New employee"));

        var anchor = cut.Find("a");
        Assert.Equal("/employees/new", anchor.GetAttribute("href"));
        Assert.Contains("trazos-action-card", anchor.ClassList);
    }

    [Fact]
    public void Renders_title_description_and_icon()
    {
        var cut = Render<ActionCard>(p => p
            .Add(x => x.Href, "/payroll/run")
            .Add(x => x.Title, "Run payroll")
            .Add(x => x.Description, "Process this month's payroll.")
            .Add(x => x.Icon, (RenderFragment)(b => b.AddMarkupContent(0, "<svg></svg>"))));

        var title = cut.Find("h3.trazos-action-card-title");
        Assert.Contains("trazos-heading", title.ClassList);
        Assert.Equal("Run payroll", title.TextContent);
        Assert.Equal("Process this month's payroll.", cut.Find("p.trazos-action-card-description").TextContent);
        Assert.NotNull(cut.Find(".trazos-action-card-icon").QuerySelector("svg"));
    }

    [Fact]
    public void Omits_the_description_paragraph_when_not_given()
    {
        var cut = Render<ActionCard>(p => p
            .Add(x => x.Href, "/reports")
            .Add(x => x.Title, "View reports"));

        Assert.Empty(cut.FindAll(".trazos-action-card-description"));
    }

    [Fact]
    public void Applies_icon_variant_and_defaults_to_primary()
    {
        var withIcon = Render<ActionCard>(p => p
            .Add(x => x.Href, "/reports")
            .Add(x => x.Title, "View reports")
            .Add(x => x.Icon, (RenderFragment)(b => b.AddMarkupContent(0, "<svg></svg>"))));

        var defaultIcon = withIcon.Find(".trazos-action-card-icon");
        Assert.Contains("trazos-icon-box-primary", defaultIcon.ClassList);

        var withVariant = Render<ActionCard>(p => p
            .Add(x => x.Href, "/reports")
            .Add(x => x.Title, "View reports")
            .Add(x => x.IconVariant, IconBoxVariant.Lavender)
            .Add(x => x.Icon, (RenderFragment)(b => b.AddMarkupContent(0, "<svg></svg>"))));

        var variantIcon = withVariant.Find(".trazos-action-card-icon");
        Assert.Contains("trazos-icon-box-lavender", variantIcon.ClassList);
    }

    [Fact]
    public void Renders_no_icon_box_when_no_icon_is_given()
    {
        var cut = Render<ActionCard>(p => p
            .Add(x => x.Href, "/reports")
            .Add(x => x.Title, "View reports"));

        Assert.Empty(cut.FindAll(".trazos-action-card-icon"));
    }
}
