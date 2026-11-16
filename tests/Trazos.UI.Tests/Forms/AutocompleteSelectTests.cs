using Trazos.UI.Components;
using Trazos.UI.Tests.Fixtures;

namespace Trazos.UI.Tests.Forms;

public class AutocompleteSelectTests : BunitContext
{
    [Fact]
    public void Focusing_with_min_chars_zero_lists_every_preloaded_item()
    {
        var cut = Render<EmployeePickerForm>();

        cut.Find("#employee").Focus();

        cut.WaitForAssertion(() => Assert.Equal(3, cut.FindAll("[role='option']").Count));
    }

    [Fact]
    public void Typing_filters_the_preloaded_list_and_choosing_binds_the_id()
    {
        var model = new EmployeePickerForm.PickerModel();
        var cut = Render<EmployeePickerForm>(p => p.Add(x => x.Model, model));

        cut.Find("#employee").Focus();
        cut.Find("#employee").Input("ospi");
        cut.WaitForAssertion(() => Assert.Single(cut.FindAll("[role='option']")));

        cut.Find("[role='option']").MouseDown();

        Assert.Equal(2, model.EmployeeId);
        Assert.Contains("Julián Ospina", cut.Markup);
    }

    [Fact]
    public void An_existing_id_shows_its_item_and_clearing_resets_the_value()
    {
        var model = new EmployeePickerForm.PickerModel { EmployeeId = 3 };
        var cut = Render<EmployeePickerForm>(p => p.Add(x => x.Model, model));

        Assert.Contains("Luisa Fernanda Gil", cut.Markup);

        cut.Find(".trazos-autocomplete-clear").Click();

        Assert.Equal(0, model.EmployeeId);
    }

    [Fact]
    public void It_shows_the_validation_message_of_the_bound_id()
    {
        var cut = Render<EmployeePickerForm>();

        cut.Find("form").Submit();

        Assert.Equal("Choose an employee.", cut.Find(".trazos-autocomplete-error").TextContent);
    }

    [Fact]
    public void Autocomplete_filters_items_without_a_search_function()
    {
        string? picked = null;
        var cut = Render<Autocomplete<string>>(p => p
            .Add(x => x.Items, ["Bogotá", "Medellín", "Cali"])
            .Add(x => x.ItemText, s => s)
            .Add(x => x.MinChars, 1)
            .Add(x => x.DebounceMs, 0)
            .Add(x => x.SelectedItemChanged, (string? s) => picked = s));

        cut.Find("input").Focus();
        cut.Find("input").Input("MED");
        cut.WaitForAssertion(() => Assert.Single(cut.FindAll("[role='option']")));
        cut.Find("[role='option']").MouseDown();

        Assert.Equal("Medellín", picked);
    }

    [Fact]
    public void Autocomplete_with_a_search_function_keeps_its_previous_behavior()
    {
        var terms = new List<string>();
        var cut = Render<Autocomplete<string>>(p => p
            .Add(x => x.SearchFunc, (term, _) => { terms.Add(term); return Task.FromResult<IEnumerable<string>>(["Bogotá"]); })
            .Add(x => x.ItemText, s => s)
            .Add(x => x.DebounceMs, 0));

        cut.Find("input").Focus();
        cut.Find("input").Input("b");
        Assert.Empty(terms);

        cut.Find("input").Input("bo");
        cut.WaitForAssertion(() => Assert.Single(cut.FindAll("[role='option']")));
        Assert.Equal(["bo"], terms);
    }
}
