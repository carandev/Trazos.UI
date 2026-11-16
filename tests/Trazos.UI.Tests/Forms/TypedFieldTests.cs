using Trazos.UI.Components;
using Trazos.UI.Tests.Fixtures;

namespace Trazos.UI.Tests.Forms;

public class TypedFieldTests : BunitContext
{
    [Fact]
    public void Enum_options_are_generated_and_bound_to_a_nullable_enum()
    {
        var model = new AssignmentModel();
        var cut = Render<AssignmentForm>(p => p.Add(x => x.Model, model));

        Assert.Equal("Pick one", cut.Find("#frequency .trazos-select-value").TextContent.Trim());
        cut.Find("#frequency").Click();
        var texts = cut.FindAll("#frequency-listbox [role=option]").Select(o => o.TextContent.Trim()).ToList();
        Assert.Equal(["Weekly", "Biweekly", "Monthly"], texts);

        Choose(cut, "frequency", 1);

        Assert.Equal(PayFrequency.Biweekly, model.Frequency);
    }

    [Fact]
    public void Int_and_guid_values_round_trip_through_the_select()
    {
        var model = new AssignmentModel();
        var cut = Render<AssignmentForm>(p => p.Add(x => x.Model, model));

        cut.Find("#company").Click();
        Assert.Equal("true", cut.FindAll("#company-listbox [role=option]")[2].GetAttribute("aria-disabled"));

        Choose(cut, "company", 1);
        cut.Find("#manager").Change(AssignmentForm.ManagerGuid.ToString());

        Assert.Equal(2, model.CompanyId);
        Assert.Equal(AssignmentForm.ManagerGuid, model.ManagerId);

        cut.Find("#manager").Change("");
        Assert.Null(model.ManagerId);
    }

    [Fact]
    public void Typed_fields_show_validation_messages_and_clear_them_on_change()
    {
        var model = new AssignmentModel();
        var cut = Render<AssignmentForm>(p => p.Add(x => x.Model, model));

        cut.Find("form").Submit();

        Assert.Equal("Choose a frequency.", cut.Find("#frequency-error").TextContent);
        Assert.Equal("Choose a company.", cut.Find("#company-error").TextContent);
        Assert.Equal("Choose a contract.", cut.Find(".trazos-radio-cards-error").TextContent);
        Assert.Equal("true", cut.Find(".trazos-radio-cards").GetAttribute("aria-invalid"));

        cut.Find("#frequency").Click();
        Choose(cut, "frequency", 0);
        cut.FindAll(".trazos-radio-card-input")[1].Change(true);

        Assert.Empty(cut.FindAll("#frequency-error"));
        Assert.Empty(cut.FindAll(".trazos-radio-cards-error"));
        Assert.Equal("open", model.Contract);
        Assert.Contains("modified", cut.Find(".trazos-radio-cards").ClassList);
    }

    [Fact]
    public void Text_that_cannot_be_converted_shows_the_parse_error()
    {
        // Typed options cannot produce text, so the native select with option children is used here.
        var model = new AssignmentModel { ManagerId = AssignmentForm.ManagerGuid };
        var cut = Render<AssignmentForm>(p => p.Add(x => x.Model, model));

        cut.Find("#manager").Change("not-a-guid");

        Assert.Equal(AssignmentForm.ManagerGuid, model.ManagerId);
        Assert.Equal("Enter a valid value.", cut.Find("#manager-error").TextContent);

        cut.Find("#manager").Change(AssignmentForm.ManagerGuid.ToString());
        Assert.Empty(cut.FindAll("#manager-error"));
    }

    private static void Choose(IRenderedComponent<AssignmentForm> cut, string id, int index) =>
        cut.FindAll($"#{id}-listbox [role=option]")[index].MouseDown();

    [Fact]
    public void A_string_select_with_option_children_keeps_working_without_a_form()
    {
        string? team = null;
        var cut = Render<SelectInput<string>>(p => p
            .Add(x => x.Placeholder, "Choose")
            .Add(x => x.ValueChanged, (string v) => team = v)
            .AddChildContent("<option value=\"design\">Design</option>"));

        Assert.NotNull(cut.Find("option[value='']").GetAttribute("selected"));

        cut.Find("select").Change("design");

        Assert.Equal("design", team);
    }

    [Fact]
    public void A_radio_card_group_keeps_working_without_a_form()
    {
        var picked = 0;
        var cut = Render<RadioCardGroup<int>>(p => p
            .Add(x => x.Options, [new(1, "One"), new(2, "Two")])
            .Add(x => x.Error, "Pick one")
            .Add(x => x.ValueChanged, (int v) => picked = v));

        cut.FindAll("input")[1].Change(true);

        Assert.Equal(2, picked);
        Assert.Equal("Pick one", cut.Find(".trazos-radio-cards-error").TextContent);
    }
}
