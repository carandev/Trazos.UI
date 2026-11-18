using Microsoft.AspNetCore.Components.Web;
using Trazos.UI.Components;
using Trazos.UI.Tests.Fixtures;

namespace Trazos.UI.Tests.Display;

public class DataTableTests : BunitContext
{
    [Fact]
    public void Cell_styles_reach_consumer_cells_through_deep_selectors()
    {
        // Issue #22: th and td come from the consumer's fragments, so they carry the
        // consumer's scope attribute and only ::deep selectors can reach them.
        var css = File.ReadAllText(RepoPaths.File("src/Trazos.UI/Components/Table/DataTable.razor.css"));

        Assert.Contains(".trazos-table-head ::deep th", css);
        Assert.Contains(".trazos-table-body ::deep td", css);
        Assert.Contains(".trazos-table-foot ::deep td", css);
        Assert.DoesNotContain(".trazos-table-head th {", css);
        Assert.DoesNotContain(".trazos-table-body td {", css);
    }

    [Fact]
    public void Sort_headers_expose_aria_sort_and_toggle_the_direction()
    {
        var cut = Render<EmployeeTable>();
        var headers = cut.FindAll("th.trazos-sort-header");
        Assert.Equal("none", headers[0].GetAttribute("aria-sort"));

        cut.Find("th.trazos-sort-header button").Click();
        Assert.Equal(new TableSort("name", false), cut.Instance.Sort);

        cut.Render();
        Assert.Equal("ascending", cut.FindAll("th.trazos-sort-header")[0].GetAttribute("aria-sort"));

        cut.Find("th.trazos-sort-header button").Click();
        Assert.Equal(new TableSort("name", true), cut.Instance.Sort);

        cut.FindAll("th.trazos-sort-header button")[1].Click();
        Assert.Equal(new TableSort("salary", false), cut.Instance.Sort);
        Assert.Equal(3, cut.Instance.SortChanges);
        Assert.Contains("trazos-cell-end", cut.FindAll("th.trazos-sort-header")[1].ClassList);
    }

    [Fact]
    public void Toolbar_footer_actions_and_pagination_render_in_their_slots()
    {
        var cut = Render<EmployeeTable>();

        Assert.Single(cut.FindAll(".trazos-table-toolbar input.filter"));
        Assert.Equal("Total", cut.Find("tfoot.trazos-table-foot td").TextContent);
        Assert.Single(cut.FindAll(".trazos-table-pagination .pager"));
        Assert.Equal(2, cut.FindAll("td.trazos-table-actions button.edit").Count);
        Assert.Equal("Acciones", cut.Find("th.trazos-table-actions-head").TextContent.Trim());
        // The footer row gets an empty cell under the actions column.
        Assert.Equal(4, cut.FindAll("tfoot tr > *").Count);
    }

    [Fact]
    public void Row_actions_do_not_trigger_the_row_click()
    {
        var cut = Render<EmployeeTable>();

        cut.FindAll("button.edit")[1].Click();

        Assert.Equal("Grace", cut.Instance.Edited);
        Assert.Null(cut.Instance.Clicked);
    }

    [Fact]
    public void Clickable_rows_are_reachable_and_open_with_the_keyboard()
    {
        var cut = Render<EmployeeTable>();
        var row = cut.FindAll("tr.trazos-table-row")[0];

        Assert.Equal("0", row.GetAttribute("tabindex"));
        row.KeyDown(new KeyboardEventArgs { Key = "Enter" });

        Assert.Equal("Ada", cut.Instance.Clicked);
    }

    [Fact]
    public void Interactive_rows_get_their_accessible_name_from_RowAriaLabel()
    {
        var cut = Render<DataTable<string>>(p => p
            .Add(x => x.Items, ["Ada", "Grace"])
            .Add(x => x.RowTemplate, item => b => b.AddMarkupContent(0, $"<td>{item}</td>"))
            .Add(x => x.OnRowClick, _ => { })
            .Add(x => x.RowAriaLabel, item => $"Ver detalle de {item}"));

        var rows = cut.FindAll("tr.trazos-table-row");
        Assert.Equal("Ver detalle de Ada", rows[0].GetAttribute("aria-label"));
        Assert.Equal("Ver detalle de Grace", rows[1].GetAttribute("aria-label"));
    }

    [Fact]
    public void Non_interactive_rows_ignore_RowAriaLabel()
    {
        var cut = Render<DataTable<string>>(p => p
            .Add(x => x.Items, ["Ada"])
            .Add(x => x.RowTemplate, item => b => b.AddMarkupContent(0, $"<td>{item}</td>"))
            .Add(x => x.RowAriaLabel, item => $"Ver detalle de {item}"));

        Assert.Null(cut.Find("tr.trazos-table-row").GetAttribute("aria-label"));
    }

    [Fact]
    public void A_plain_table_keeps_its_previous_markup()
    {
        var cut = Render<DataTable<string>>(p => p
            .Add(x => x.Items, ["a"])
            .Add(x => x.TableHeader, b => b.AddMarkupContent(0, "<th>Name</th>"))
            .Add(x => x.RowTemplate, item => b => b.AddMarkupContent(0, $"<td>{item}</td>")));

        Assert.Empty(cut.FindAll(".trazos-table-toolbar"));
        Assert.Empty(cut.FindAll("tfoot"));
        Assert.Empty(cut.FindAll(".trazos-table-actions-head"));
        Assert.Null(cut.Find("tr.trazos-table-row").GetAttribute("tabindex"));
        Assert.Equal("a", cut.Find("tbody td").TextContent);
    }
}
