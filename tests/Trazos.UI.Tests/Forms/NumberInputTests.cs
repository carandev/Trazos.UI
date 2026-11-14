using System.Globalization;
using Microsoft.AspNetCore.Components.Web;
using Trazos.UI.Components;
using Trazos.UI.Tests.Fixtures;

namespace Trazos.UI.Tests.Forms;

public class NumberInputTests : BunitContext
{
    private static readonly CultureInfo Colombia = CultureInfo.GetCultureInfo("es-CO");
    private static readonly CultureInfo English = CultureInfo.GetCultureInfo("en-US");

    [Fact]
    public void Currency_mode_formats_with_the_culture_and_shows_the_symbol_as_prefix()
    {
        var cut = Render<NumberInput<decimal>>(p => p
            .Add(x => x.Value, 1234567.5m)
            .Add(x => x.Mode, NumberInputMode.Currency)
            .Add(x => x.Decimals, 2)
            .Add(x => x.Culture, Colombia));

        Assert.Equal("1.234.567,50", cut.Find("input").GetAttribute("value"));
        Assert.Equal("$", cut.Find(".trazos-input-affix.leading").TextContent);
        Assert.Equal("decimal", cut.Find("input").GetAttribute("inputmode"));
    }

    [Fact]
    public void A_currency_symbol_replaces_the_culture_symbol()
    {
        var cut = Render<NumberInput<decimal>>(p => p
            .Add(x => x.Value, 2500m)
            .Add(x => x.Mode, NumberInputMode.Currency)
            .Add(x => x.CurrencySymbol, "COP")
            .Add(x => x.Decimals, 0)
            .Add(x => x.Culture, Colombia));

        Assert.Equal("2.500", cut.Find("input").GetAttribute("value"));
        Assert.Equal("COP", cut.Find(".trazos-input-affix.leading").TextContent);
    }

    [Fact]
    public void Typed_text_is_parsed_with_the_culture()
    {
        decimal value = 0;
        var cut = Render<NumberInput<decimal>>(p => p
            .Add(x => x.Culture, Colombia)
            .Add(x => x.ValueChanged, (decimal v) => value = v));

        cut.Find("input").Change("$ 2.500,75");

        Assert.Equal(2500.75m, value);
    }

    [Fact]
    public void Integers_round_and_nullable_values_clear()
    {
        int? value = 1;
        var cut = Render<NumberInput<int?>>(p => p
            .Add(x => x.Value, value)
            .Add(x => x.Culture, English)
            .Add(x => x.ValueChanged, (int? v) => value = v));

        cut.Find("input").Change("12.6");
        Assert.Equal(13, value);

        cut.Find("input").Change("");
        Assert.Null(value);
    }

    [Fact]
    public void Percent_mode_shows_the_fraction_as_a_percentage()
    {
        decimal value = 0.15m;
        var cut = Render<NumberInput<decimal>>(p => p
            .Add(x => x.Value, value)
            .Add(x => x.Mode, NumberInputMode.Percent)
            .Add(x => x.Culture, English)
            .Add(x => x.ValueChanged, (decimal v) => value = v));

        Assert.Equal("15", cut.Find("input").GetAttribute("value"));
        Assert.Equal("%", cut.Find(".trazos-input-affix.trailing").TextContent);

        cut.Find("input").Change("20.5");

        Assert.Equal(0.205m, value);
    }

    [Fact]
    public void Values_are_clamped_to_min_and_max()
    {
        var value = 0;
        var cut = Render<NumberInput<int>>(p => p
            .Add(x => x.Min, 0)
            .Add(x => x.Max, 100)
            .Add(x => x.Culture, English)
            .Add(x => x.ValueChanged, (int v) => value = v));

        cut.Find("input").Change("150");
        Assert.Equal(100, value);

        cut.Find("input").Change("-4");
        Assert.Equal(0, value);
    }

    [Fact]
    public void Arrow_keys_step_the_value_and_expose_spinbutton_semantics()
    {
        var value = 90;
        var cut = Render<NumberInput<int>>(p => p
            .Add(x => x.Value, value)
            .Add(x => x.Step, 5)
            .Add(x => x.Min, 0)
            .Add(x => x.Max, 100)
            .Add(x => x.Culture, English)
            .Add(x => x.ValueChanged, (int v) => value = v));

        var input = cut.Find("input");
        Assert.Equal("spinbutton", input.GetAttribute("role"));
        Assert.Equal("90", input.GetAttribute("aria-valuenow"));
        Assert.Equal("0", input.GetAttribute("aria-valuemin"));
        Assert.Equal("100", input.GetAttribute("aria-valuemax"));

        input.KeyDown(new KeyboardEventArgs { Key = "ArrowUp" });
        Assert.Equal(95, value);
        cut.Find("input").KeyDown(new KeyboardEventArgs { Key = "ArrowUp" });
        cut.Find("input").KeyDown(new KeyboardEventArgs { Key = "ArrowUp" });
        Assert.Equal(100, value);
        cut.Find("input").KeyDown(new KeyboardEventArgs { Key = "ArrowDown" });
        Assert.Equal(95, value);
    }

    [Fact]
    public void Inside_an_edit_form_it_shows_validation_and_parse_errors()
    {
        var model = new PayrollModel();
        var cut = Render<PayrollForm>(p => p.Add(x => x.Model, model));

        cut.Find("form").Submit();
        Assert.Equal("Enter the base salary.", cut.Find("#salary-error").TextContent);

        cut.Find("#salary").Change("abc");
        Assert.Equal("Enter a valid number.", cut.Find("#salary-error").TextContent);

        cut.Find("#salary").Change("3500000");
        Assert.Equal(3_500_000m, model.Salary);
        Assert.Empty(cut.FindAll("#salary-error"));
    }
}
