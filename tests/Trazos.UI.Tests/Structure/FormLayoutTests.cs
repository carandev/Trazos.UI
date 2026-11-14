using Microsoft.AspNetCore.Components;
using Trazos.UI.Components;

namespace Trazos.UI.Tests.Structure;

public class FormLayoutTests : BunitContext
{
    [Fact]
    public void Form_grid_sets_its_column_count()
    {
        var cut = Render<FormGrid>(p => p.Add(x => x.Columns, 3).AddChildContent("<div class=\"trazos-form-full\">x</div>"));

        Assert.Contains("trazos-form-grid-cols-3", cut.Find(".trazos-form-grid").ClassList);
        Assert.Single(cut.FindAll(".trazos-form-full"));
    }

    [Fact]
    public void Form_actions_align_and_can_stick_to_the_bottom()
    {
        var cut = Render<FormActions>(p => p
            .Add(x => x.Align, FormActionsAlign.Between)
            .Add(x => x.Sticky, true)
            .AddChildContent("<button>Save</button>"));

        var root = cut.Find(".trazos-form-actions");
        Assert.Contains("is-between", root.ClassList);
        Assert.Contains("is-sticky", root.ClassList);
        Assert.Equal("Save", cut.Find("button").TextContent);
    }

    [Fact]
    public void Filter_bar_is_a_search_landmark_with_an_actions_area()
    {
        var cut = Render<FilterBar>(p => p
            .Add(x => x.Label, "Filtros")
            .AddChildContent("<input />")
            .Add(x => x.Actions, (RenderFragment)(b => b.AddMarkupContent(0, "<button>Reset</button>"))));

        var root = cut.Find(".trazos-filter-bar");
        Assert.Equal("search", root.GetAttribute("role"));
        Assert.Equal("Filtros", root.GetAttribute("aria-label"));
        Assert.Equal("Reset", cut.Find(".trazos-filter-bar-actions button").TextContent);
        Assert.Single(cut.FindAll(".trazos-filter-bar-fields input"));
    }
}
