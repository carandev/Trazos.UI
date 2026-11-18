using Microsoft.AspNetCore.Components;
using Trazos.UI.Layout;

namespace Trazos.UI.Tests.Structure;

public class AuthLayoutTests : BunitContext
{
    [Fact]
    public void Renders_brand_title_subtitle_children_and_footer()
    {
        var cut = Render<AuthLayout>(p => p
            .Add(x => x.Brand, (RenderFragment)(b => b.AddMarkupContent(0, "<span>Acme</span>")))
            .Add(x => x.Title, "Sign in")
            .Add(x => x.Subtitle, "Welcome back")
            .Add(x => x.Footer, (RenderFragment)(b => b.AddMarkupContent(0, "<a href=\"/forgot\">Forgot your password?</a>")))
            .AddChildContent("<p>Form</p>"));

        Assert.Contains("Acme", cut.Find(".trazos-auth-layout-brand").TextContent);

        var title = cut.Find("h1.trazos-heading.trazos-auth-layout-title");
        Assert.Equal("Sign in", title.TextContent);

        Assert.Equal("Welcome back", cut.Find("p.trazos-auth-layout-subtitle").TextContent);
        Assert.Contains("Form", cut.Find(".trazos-card-body").TextContent);
        Assert.Contains("Forgot your password?", cut.Find(".trazos-auth-layout-footer").TextContent);
    }

    [Fact]
    public void Omits_the_title_and_subtitle_elements_when_not_given()
    {
        var cut = Render<AuthLayout>(p => p.AddChildContent("<p>Form</p>"));

        Assert.Empty(cut.FindAll("h1"));
        Assert.Empty(cut.FindAll(".trazos-auth-layout-subtitle"));
    }

    [Fact]
    public void Renders_the_footer_outside_the_card_not_inside_its_body()
    {
        var cut = Render<AuthLayout>(p => p
            .Add(x => x.Footer, (RenderFragment)(b => b.AddMarkupContent(0, "<a href=\"/forgot\">Forgot your password?</a>")))
            .AddChildContent("<p>Form</p>"));

        var card = cut.Find(".trazos-card-box");
        Assert.Empty(card.QuerySelectorAll(".trazos-auth-layout-footer"));

        var footer = cut.Find(".trazos-auth-layout-footer");
        Assert.Contains("Forgot your password?", footer.TextContent);
    }
}
