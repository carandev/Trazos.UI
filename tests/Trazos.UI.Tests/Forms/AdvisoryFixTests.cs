using Trazos.UI.Components;

namespace Trazos.UI.Tests.Forms;

public class AdvisoryFixTests : BunitContext
{
    [Fact]
    public void A_string_select_keeps_an_empty_option_as_an_empty_string()
    {
        string? value = "design";
        var cut = Render<SelectInput<string>>(p => p
            .Add(x => x.Value, value)
            .Add(x => x.ValueChanged, (string v) => value = v)
            .AddChildContent("<option value=\"\">Any</option><option value=\"design\">Design</option>"));

        cut.Find("select").Change("");

        Assert.Equal(string.Empty, value);
    }

    [Fact]
    public void Percent_mode_rejects_integer_types()
    {
        var error = Assert.Throws<InvalidOperationException>(() => Render<NumberInput<int>>(p => p
            .Add(x => x.Mode, NumberInputMode.Percent)));

        Assert.Contains("Percent", error.Message);
    }

    [Fact]
    public void Autocomplete_select_resolves_an_existing_value_through_the_resolver()
    {
        var cut = Render<AutocompleteSelect<string, int>>(p => p
            .Add(x => x.SearchFunc, (_, _) => Task.FromResult<IEnumerable<string>>([]))
            .Add(x => x.ItemText, s => s)
            .Add(x => x.ValueSelector, s => s.Length)
            .Add(x => x.ResolveItem, (id, _) => Task.FromResult<string?>(id == 3 ? "Ana" : null))
            .Add(x => x.Value, 3));

        cut.WaitForAssertion(() => Assert.Contains("Ana", cut.Markup));
    }
}
