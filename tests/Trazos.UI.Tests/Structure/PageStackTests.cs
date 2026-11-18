using Trazos.UI.Components;

namespace Trazos.UI.Tests.Structure;

public class PageStackTests : BunitContext
{
    [Fact]
    public void Renders_its_children_in_a_trazos_page_stack_container()
    {
        var cut = Render<PageStack>(p => p
            .Add(x => x.Class, "extra")
            .AddChildContent("<p>First</p><p>Second</p>"));

        var root = cut.Find("div.trazos-page-stack");
        Assert.Contains("extra", root.ClassList);
        Assert.Equal(2, root.Children.Length);
    }
}
