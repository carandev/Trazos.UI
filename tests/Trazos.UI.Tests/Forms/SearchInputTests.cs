using Microsoft.AspNetCore.Components.Web;
using Trazos.UI.Components;

namespace Trazos.UI.Tests.Forms;

public class SearchInputTests : BunitContext
{
    [Fact]
    public void Typing_raises_value_changed_once_after_the_debounce()
    {
        var calls = new List<string?>();
        var cut = Render<SearchInput>(p => p
            .Add(x => x.Debounce, 500)
            .Add(x => x.ValueChanged, (string? v) => calls.Add(v)));

        cut.Find("input").Input("a");
        cut.Find("input").Input("an");
        cut.Find("input").Input("ana");
        Assert.Empty(calls);

        cut.WaitForAssertion(() => Assert.Equal(["ana"], calls), TimeSpan.FromSeconds(5));
        Assert.Equal("search", cut.Find("input").GetAttribute("type"));
    }

    [Fact]
    public void The_clear_button_empties_the_value_immediately_and_only_shows_with_text()
    {
        string? value = "ana";
        var cut = Render<SearchInput>(p => p
            .Add(x => x.Value, value)
            .Add(x => x.Debounce, 0)
            .Add(x => x.ClearLabel, "Limpiar")
            .Add(x => x.ValueChanged, (string? v) => value = v));

        var clear = cut.Find("button.trazos-search-clear");
        Assert.Equal("Limpiar", clear.GetAttribute("aria-label"));
        clear.Click();

        Assert.Equal(string.Empty, value);
        Assert.Empty(cut.FindAll("button.trazos-search-clear"));
    }

    [Fact]
    public void Escape_clears_and_zero_debounce_is_immediate()
    {
        string? value = null;
        var cut = Render<SearchInput>(p => p
            .Add(x => x.Debounce, 0)
            .Add(x => x.ValueChanged, (string? v) => value = v));

        cut.Find("input").Input("bogotá");
        Assert.Equal("bogotá", value);

        cut.Find("input").KeyDown(new KeyboardEventArgs { Key = "Escape" });
        Assert.Equal(string.Empty, value);
    }
}
