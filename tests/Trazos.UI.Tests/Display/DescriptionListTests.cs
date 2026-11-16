using Microsoft.AspNetCore.Components;
using Trazos.UI.Components;
using Trazos.UI.Tests.Fixtures;

namespace Trazos.UI.Tests.Display;

public class DescriptionListTests : BunitContext
{
    private static string ListCss => File.ReadAllText(RepoPaths.File("src/Trazos.UI/Components/DescriptionList/DescriptionList.razor.css"));
    private static string ItemCss => File.ReadAllText(RepoPaths.File("src/Trazos.UI/Components/DescriptionList/DescriptionItem.razor.css"));

    [Fact]
    public void Defaults_to_tiles_with_two_columns_and_keeps_plain_and_bordered()
    {
        var tiles = Render<DescriptionList>();
        var dl = tiles.Find("dl");
        Assert.Contains("trazos-dl", dl.ClassList);
        Assert.Contains("trazos-dl-tiles", dl.ClassList);
        Assert.Contains("trazos-dl-cols-2", dl.ClassList);
        Assert.DoesNotContain("trazos-dl-plain", dl.ClassList);

        var plain = Render<DescriptionList>(p => p
            .Add(x => x.Variant, DescriptionListVariant.Plain)
            .Add(x => x.Bordered, true)
            .Add(x => x.Columns, 9));
        var plainDl = plain.Find("dl");
        Assert.Contains("trazos-dl-plain", plainDl.ClassList);
        Assert.Contains("is-bordered", plainDl.ClassList);
        Assert.Contains("trazos-dl-cols-4", plainDl.ClassList);
        Assert.DoesNotContain("trazos-dl-tiles", plainDl.ClassList);

        Assert.Contains("trazos-dl-cols-1", Render<DescriptionList>(p => p.Add(x => x.Columns, 0)).Find("dl").ClassList);
    }

    [Fact]
    public void Min_item_width_sets_the_custom_property_and_keeps_the_host_style()
    {
        var cut = Render<DescriptionList>(p => p
            .Add(x => x.MinItemWidth, "16rem")
            .AddUnmatched("style", "margin-top: 1rem")
            .AddUnmatched("data-x", "1"));
        var dl = cut.Find("dl");
        Assert.Equal("--trazos-dl-min: 16rem; margin-top: 1rem", dl.GetAttribute("style"));
        Assert.Equal("1", dl.GetAttribute("data-x"));

        Assert.Null(Render<DescriptionList>().Find("dl").GetAttribute("style"));
    }

    [Fact]
    public void Item_span_is_clamped_to_one_through_four()
    {
        string ItemClass(int span) => Render<DescriptionItem>(p => p.Add(x => x.Label, "A").Add(x => x.Span, span)).Find(".trazos-dl-item").ClassName ?? string.Empty;

        Assert.DoesNotContain("trazos-dl-span", ItemClass(1));
        Assert.DoesNotContain("trazos-dl-span", ItemClass(0));
        Assert.Contains("trazos-dl-span-2", ItemClass(2));
        Assert.Contains("trazos-dl-span-3", ItemClass(3));
        Assert.Contains("trazos-dl-span-4", ItemClass(9));
    }

    [Theory]
    [InlineData(DescriptionTone.Olive, "trazos-dl-tone-olive")]
    [InlineData(DescriptionTone.Gold, "trazos-dl-tone-gold")]
    [InlineData(DescriptionTone.Wine, "trazos-dl-tone-wine")]
    [InlineData(DescriptionTone.Sky, "trazos-dl-tone-sky")]
    public void Item_tone_adds_its_class(DescriptionTone tone, string expected)
    {
        var item = Render<DescriptionItem>(p => p.Add(x => x.Label, "A").Add(x => x.Tone, tone)).Find(".trazos-dl-item");
        Assert.Contains(expected, item.ClassList);
    }

    [Fact]
    public void Highlight_tints_the_item_olive_and_default_items_have_no_tone()
    {
        var plainItem = Render<DescriptionItem>(p => p.Add(x => x.Label, "A")).Find(".trazos-dl-item");
        Assert.DoesNotContain(plainItem.ClassList, c => c.StartsWith("trazos-dl-tone-") || c == "trazos-dl-highlight");

        var highlighted = Render<DescriptionItem>(p => p.Add(x => x.Label, "Net pay").Add(x => x.Value, "$ 3.210.000").Add(x => x.Highlight, true)).Find(".trazos-dl-item");
        Assert.Contains("trazos-dl-highlight", highlighted.ClassList);
        Assert.Contains("trazos-dl-tone-olive", highlighted.ClassList);

        var toned = Render<DescriptionItem>(p => p.Add(x => x.Label, "A").Add(x => x.Highlight, true).Add(x => x.Tone, DescriptionTone.Gold)).Find(".trazos-dl-item");
        Assert.Contains("trazos-dl-tone-gold", toned.ClassList);
        Assert.DoesNotContain("trazos-dl-tone-olive", toned.ClassList);
    }

    [Fact]
    public void Icon_renders_hidden_inside_the_term_and_actions_come_after_the_value()
    {
        var cut = Render<DescriptionItem>(p => p
            .Add(x => x.Label, "Email")
            .Add(x => x.Value, "ana@example.com")
            .Add(x => x.Hint, "Work")
            .Add(x => x.Icon, (RenderFragment)(b => b.AddMarkupContent(0, "<svg></svg>")))
            .Add(x => x.Actions, (RenderFragment)(b => b.AddMarkupContent(0, "<button type=\"button\">Copy</button>"))));

        var icon = cut.Find("dt .trazos-dl-icon");
        Assert.Equal("true", icon.GetAttribute("aria-hidden"));
        Assert.NotNull(icon.QuerySelector("svg"));
        Assert.Equal("Email", cut.Find("dt .trazos-dl-label-text").TextContent);

        var children = cut.Find(".trazos-dl-item").Children.Select(c => $"{c.TagName.ToLowerInvariant()}.{string.Join(".", c.ClassList)}").ToList();
        Assert.Equal(["dt.trazos-dl-label", "dd.trazos-dl-value", "dd.trazos-dl-hint", "dd.trazos-dl-actions"], children);
        Assert.Equal("Copy", cut.Find("dd.trazos-dl-actions button").TextContent);
    }

    [Fact]
    public void Without_icon_or_actions_no_extra_elements_render()
    {
        var cut = Render<DescriptionItem>(p => p.Add(x => x.Label, "Bank"));
        Assert.Empty(cut.FindAll(".trazos-dl-icon"));
        Assert.Empty(cut.FindAll(".trazos-dl-actions"));
        Assert.Empty(cut.FindAll(".trazos-dl-hint"));
        Assert.Equal("Bank", cut.Find("dt").TextContent);
        var value = cut.Find("dd.trazos-dl-value");
        Assert.Equal("—", value.TextContent);
        Assert.Contains("is-empty", value.ClassList);
    }

    [Fact]
    public void Child_content_takes_precedence_over_value_and_full_width_still_works()
    {
        var cut = Render<DescriptionItem>(p => p
            .Add(x => x.Label, "Status")
            .Add(x => x.Value, "ignored")
            .Add(x => x.FullWidth, true)
            .Add(x => x.Class, "extra")
            .AddChildContent("<span>Active</span>"));
        var item = cut.Find(".trazos-dl-item");
        Assert.Contains("is-full", item.ClassList);
        Assert.Contains("extra", item.ClassList);
        Assert.Equal("Active", cut.Find("dd.trazos-dl-value span").TextContent);
        Assert.DoesNotContain("ignored", cut.Markup);
    }

    [Fact]
    public void Grid_auto_fits_by_min_width_capped_by_columns_and_spans_only_when_wide()
    {
        var css = ListCss;
        Assert.Contains("repeat(auto-fit, minmax(", css);
        Assert.Contains("var(--trazos-dl-min, 12rem)", css);
        Assert.Contains("var(--trazos-dl-cols)", css);
        Assert.Contains("container: trazos-dl / inline-size", css);
        Assert.Contains(".trazos-dl-cols-4 {", css);

        var items = ItemCss;
        Assert.Contains("@container trazos-dl", items);
        Assert.Contains(".trazos-dl-span-2", items);
        Assert.Contains(".trazos-dl-span-4", items);
        Assert.Contains("grid-column: 1 / -1", items);
        Assert.Contains("overflow-wrap: anywhere", items);
    }

    [Fact]
    public void Tiles_use_tokens_and_tones_use_the_opaque_tints()
    {
        var items = ItemCss;
        Assert.Contains(".trazos-dl-tiles .trazos-dl-item", items);
        Assert.Contains("var(--trazos-radius-sketch-sm)", items);
        Assert.Contains("1.5px solid var(--trazos-border-soft)", items);
        foreach (var tone in new[] { "olive", "gold", "wine", "sky" })
        {
            Assert.Contains($".trazos-dl-tone-{tone}", items);
            Assert.Contains($"var(--trazos-{tone}-tint)", items);
        }
        Assert.DoesNotMatch(@"#[0-9a-fA-F]{3,8}\b", items);
        Assert.DoesNotMatch(@"#[0-9a-fA-F]{3,8}\b", ListCss);
    }

    [Fact]
    public void The_list_takes_the_full_width_so_a_flex_parent_cannot_collapse_it()
    {
        // The list is a size container: without an explicit width it has no
        // intrinsic size inside a flex row and shrinks to a sliver.
        var rule = ListCss[ListCss.IndexOf(".trazos-dl {", StringComparison.Ordinal)..];
        rule = rule[..rule.IndexOf('}')];

        Assert.Contains("width: 100%", rule);
        Assert.Contains("box-sizing: border-box", rule);
    }
}
