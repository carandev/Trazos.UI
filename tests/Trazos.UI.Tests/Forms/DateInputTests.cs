using Trazos.UI.Components;
using Trazos.UI.Tests.Fixtures;

namespace Trazos.UI.Tests.Forms;

public class DateInputTests : BunitContext
{
    [Fact]
    public void A_nullable_date_only_binds_the_native_date_value()
    {
        DateOnly? value = new DateOnly(2026, 3, 15);
        var cut = Render<DateInput<DateOnly?>>(p => p
            .Add(x => x.Value, value)
            .Add(x => x.Min, new DateOnly(2026, 1, 1))
            .Add(x => x.Max, new DateOnly(2026, 12, 31))
            .Add(x => x.ValueChanged, (DateOnly? v) => value = v));

        var input = cut.Find("input");
        Assert.Equal("date", input.GetAttribute("type"));
        Assert.Equal("2026-03-15", input.GetAttribute("value"));
        Assert.Equal("2026-01-01", input.GetAttribute("min"));
        Assert.Equal("2026-12-31", input.GetAttribute("max"));

        input.Change("2026-04-30");
        Assert.Equal(new DateOnly(2026, 4, 30), value);

        cut.Find("input").Change("");
        Assert.Null(value);
    }

    [Fact]
    public void A_date_time_keeps_its_time_of_day()
    {
        var value = new DateTime(2026, 3, 15, 8, 30, 0);
        var cut = Render<DateInput<DateTime>>(p => p
            .Add(x => x.Value, value)
            .Add(x => x.ValueChanged, (DateTime v) => value = v));

        cut.Find("input").Change("2026-03-20");

        Assert.Equal(new DateTime(2026, 3, 20, 8, 30, 0), value);
    }

    [Fact]
    public void The_month_variant_binds_the_first_day_of_the_month()
    {
        DateOnly? value = new DateOnly(2026, 3, 15);
        var cut = Render<DateInput<DateOnly?>>(p => p
            .Add(x => x.Value, value)
            .Add(x => x.MonthOnly, true)
            .Add(x => x.Min, new DateOnly(2026, 1, 1))
            .Add(x => x.ValueChanged, (DateOnly? v) => value = v));

        var input = cut.Find("input");
        Assert.Equal("month", input.GetAttribute("type"));
        Assert.Equal("2026-03", input.GetAttribute("value"));
        Assert.Equal("2026-01", input.GetAttribute("min"));

        input.Change("2026-07");
        Assert.Equal(new DateOnly(2026, 7, 1), value);
    }

    [Fact]
    public void Inside_an_edit_form_it_shows_the_validation_message()
    {
        var model = new PayrollModel { Salary = 1 };
        var cut = Render<PayrollForm>(p => p.Add(x => x.Model, model));

        cut.Find("form").Submit();
        Assert.Equal("Enter the start date.", cut.Find("#start-error").TextContent);

        cut.Find("#start").Change("2026-02-01");
        Assert.Equal(new DateOnly(2026, 2, 1), model.StartDate);
        Assert.Empty(cut.FindAll("#start-error"));
    }
}
