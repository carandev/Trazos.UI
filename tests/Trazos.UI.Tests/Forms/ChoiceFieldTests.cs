using Trazos.UI.Components;
using Trazos.UI.Tests.Fixtures;

namespace Trazos.UI.Tests.Forms;

public class ChoiceFieldTests : BunitContext
{
    [Fact]
    public void Radio_group_renders_native_radios_and_binds_the_choice()
    {
        var model = new ChoicesForm.ChoicesModel();
        var cut = Render<ChoicesForm>(p => p.Add(x => x.Model, model));

        var group = cut.Find("#shift");
        Assert.Equal("radiogroup", group.GetAttribute("role"));
        var radios = cut.FindAll("#shift input[type='radio']");
        Assert.Equal(3, radios.Count);
        Assert.True(radios[2].HasAttribute("disabled"));
        Assert.Equal(radios[0].GetAttribute("name"), radios[1].GetAttribute("name"));

        radios[1].Change(true);

        Assert.Equal("pm", model.Shift);
        Assert.True(cut.FindAll("#shift input[type='radio']")[1].HasAttribute("checked"));
    }

    [Fact]
    public void Checkbox_group_adds_and_removes_items_in_option_order()
    {
        var model = new ChoicesForm.ChoicesModel();
        var cut = Render<ChoicesForm>(p => p.Add(x => x.Model, model));

        cut.FindAll("#benefits input[type='checkbox']")[2].Change(true);
        cut.FindAll("#benefits input[type='checkbox']")[0].Change(true);
        Assert.Equal([1, 3], model.Benefits);

        cut.FindAll("#benefits input[type='checkbox']")[2].Change(false);
        Assert.Equal([1], model.Benefits);
        Assert.Equal("group", cut.Find("#benefits").GetAttribute("role"));
    }

    [Fact]
    public void Choice_groups_and_phone_show_validation_messages()
    {
        var cut = Render<ChoicesForm>();

        cut.Find("form").Submit();

        Assert.Equal("Choose a shift.", cut.Find("#shift-error").TextContent);
        Assert.Equal("Choose at least one benefit.", cut.Find("#benefits-error").TextContent);
        Assert.Equal("Enter a phone.", cut.Find("#phone-error").TextContent);
        Assert.Equal("true", cut.Find("#benefits").GetAttribute("aria-invalid"));
    }

    [Fact]
    public void Phone_input_combines_the_dial_code_and_the_digits()
    {
        var model = new ChoicesForm.ChoicesModel();
        var cut = Render<ChoicesForm>(p => p.Add(x => x.Model, model));

        Assert.Equal("+57", cut.Find("select.trazos-phone-country").GetAttribute("value"));
        cut.Find("#phone").Input("300 123-4567");
        Assert.Equal("+57 3001234567", model.Phone);

        cut.Find("select.trazos-phone-country").Change("+1");
        Assert.Equal("+1 3001234567", model.Phone);

        cut.Find("#phone").Input("");
        Assert.Null(model.Phone);
    }

    [Fact]
    public void Phone_input_splits_an_existing_value()
    {
        var cut = Render<PhoneInput>(p => p.Add(x => x.Value, "+34 612345678"));

        Assert.Equal("+34", cut.Find("select").GetAttribute("value"));
        Assert.Equal("612345678", cut.Find("input").GetAttribute("value"));
        Assert.Equal("tel", cut.Find("input").GetAttribute("type"));
        Assert.Equal("Country code", cut.Find("select").GetAttribute("aria-label"));
    }
}
