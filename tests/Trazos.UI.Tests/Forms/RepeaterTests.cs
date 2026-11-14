using Microsoft.AspNetCore.Components;
using Trazos.UI.Components;

namespace Trazos.UI.Tests.Forms;

public class RepeaterTests : BunitContext
{
    private sealed class Bracket
    {
        public decimal From { get; set; }
        public decimal? To { get; set; }
    }

    private static RenderFragment<RepeaterContext<Bracket>> Row => ctx => b =>
    {
        b.OpenElement(0, "span");
        b.AddAttribute(1, "class", ctx.IsLast ? "row last" : "row");
        b.AddContent(2, $"{ctx.Index}:{ctx.Item.From}");
        b.CloseElement();
    };

    [Fact]
    public void Rows_render_with_their_index_and_the_last_row_is_marked()
    {
        var items = new List<Bracket> { new() { From = 0, To = 1000 }, new() { From = 1000 } };
        var cut = Render<Repeater<Bracket>>(p => p.Add(x => x.Items, items).Add(x => x.ItemTemplate, Row));

        var rows = cut.FindAll(".row").Select(r => r.TextContent).ToList();
        Assert.Equal(["0:0", "1:1000"], rows);
        Assert.Single(cut.FindAll(".row.last"));
        Assert.Equal("1:1000", cut.Find(".row.last").TextContent);
    }

    [Fact]
    public void Add_appends_a_new_item_and_remove_deletes_the_right_one()
    {
        var items = new List<Bracket> { new() { From = 0 } };
        var changes = 0;
        var cut = Render<Repeater<Bracket>>(p => p
            .Add(x => x.Items, items)
            .Add(x => x.ItemTemplate, Row)
            .Add(x => x.CreateItem, () => new Bracket { From = items.Last().From + 500 })
            .Add(x => x.RemoveLabelFormat, "Quitar fila {0}")
            .Add(x => x.ItemsChanged, (List<Bracket> _) => changes++));

        cut.Find("button.trazos-repeater-add").Click();
        cut.Find("button.trazos-repeater-add").Click();
        Assert.Equal([0m, 500m, 1000m], items.Select(i => i.From));

        cut.Find("button[aria-label='Quitar fila 2']").Click();

        Assert.Equal([0m, 1000m], items.Select(i => i.From));
        Assert.Equal(3, changes);
    }

    [Fact]
    public void Min_and_max_items_disable_remove_and_add()
    {
        var items = new List<Bracket> { new(), new() };
        var cut = Render<Repeater<Bracket>>(p => p
            .Add(x => x.Items, items)
            .Add(x => x.ItemTemplate, Row)
            .Add(x => x.CreateItem, () => new Bracket())
            .Add(x => x.MinItems, 2)
            .Add(x => x.MaxItems, 2));

        Assert.All(cut.FindAll("button.trazos-repeater-remove"), b => Assert.True(b.HasAttribute("disabled")));
        Assert.True(cut.Find("button.trazos-repeater-add").HasAttribute("disabled"));
    }

    [Fact]
    public void Without_create_item_there_is_no_add_button()
    {
        var cut = Render<Repeater<Bracket>>(p => p.Add(x => x.Items, new List<Bracket>()).Add(x => x.ItemTemplate, Row));

        Assert.Empty(cut.FindAll("button.trazos-repeater-add"));
    }
}
