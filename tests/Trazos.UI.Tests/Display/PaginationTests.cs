using Trazos.UI.Components;

namespace Trazos.UI.Tests.Display;

public class PaginationTests : BunitContext
{
    [Fact]
    public void Long_ranges_collapse_into_ellipses_around_the_current_page()
    {
        var cut = Render<Pagination>(p => p.Add(x => x.Page, 10).Add(x => x.PageSize, 10).Add(x => x.TotalCount, 200));

        var labels = cut.FindAll(".trazos-pagination-pages li").Select(li => li.TextContent.Trim()).ToList();
        Assert.Equal(["1", "…", "9", "10", "11", "…", "20"], labels);
        Assert.Equal("page", cut.Find("button[aria-current]").GetAttribute("aria-current"));
        Assert.Equal("10", cut.Find("button[aria-current]").TextContent.Trim());
    }

    [Fact]
    public void Previous_and_next_move_one_page_and_disable_at_the_ends()
    {
        var page = 1;
        var cut = Render<Pagination>(p => p
            .Add(x => x.Page, 1).Add(x => x.PageSize, 10).Add(x => x.TotalCount, 25)
            .Add(x => x.PreviousLabel, "Anterior")
            .Add(x => x.PageChanged, (int v) => page = v));

        var previous = cut.Find("button[aria-label='Anterior']");
        Assert.True(previous.HasAttribute("disabled"));

        cut.Find("button.trazos-pagination-next").Click();
        Assert.Equal(2, page);

        cut.Render(p => p.Add(x => x.Page, 3));
        Assert.True(cut.Find("button.trazos-pagination-next").HasAttribute("disabled"));
    }

    [Fact]
    public void The_summary_shows_the_visible_range_and_total()
    {
        var cut = Render<Pagination>(p => p.Add(x => x.Page, 2).Add(x => x.PageSize, 10).Add(x => x.TotalCount, 15));

        Assert.Equal("11–15 of 15", cut.Find(".trazos-pagination-summary").TextContent);

        cut.Render(p => p.Add(x => x.SummaryFormat, "{0}-{1} de {2}"));
        Assert.Equal("11-15 de 15", cut.Find(".trazos-pagination-summary").TextContent);
    }

    [Fact]
    public void Changing_the_page_size_returns_to_the_first_page()
    {
        int? size = null;
        int? page = null;
        var cut = Render<Pagination>(p => p
            .Add(x => x.Page, 4).Add(x => x.PageSize, 10).Add(x => x.TotalCount, 100)
            .Add(x => x.PageSizeOptions, [10, 25, 50])
            .Add(x => x.PageSizeChanged, (int v) => size = v)
            .Add(x => x.PageChanged, (int v) => page = v));

        var options = cut.FindAll("select option").Select(o => o.TextContent).ToList();
        Assert.Equal(["10", "25", "50"], options);

        cut.Find("select").Change("25");

        Assert.Equal(25, size);
        Assert.Equal(1, page);
    }

    [Fact]
    public void Without_page_size_options_there_is_no_selector_and_no_results_shows_one_page()
    {
        var cut = Render<Pagination>(p => p.Add(x => x.Page, 1).Add(x => x.PageSize, 10).Add(x => x.TotalCount, 0));

        Assert.Empty(cut.FindAll("select"));
        Assert.Equal("0–0 of 0", cut.Find(".trazos-pagination-summary").TextContent);
        Assert.Single(cut.FindAll(".trazos-pagination-pages li"));
    }
}
