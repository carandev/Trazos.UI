using Microsoft.AspNetCore.Components;
using Trazos.UI.Components;

namespace Trazos.UI.Tests.Display;

public class DataDisplayTests : BunitContext
{
    [Fact]
    public void Description_list_renders_label_value_pairs_with_hints_and_empty_text()
    {
        var cut = Render<DescriptionList>(p => p
            .Add(x => x.Columns, 3)
            .AddChildContent<DescriptionItem>(i => i.Add(x => x.Label, "Salary").Add(x => x.Value, "$ 3.500.000").Add(x => x.Hint, "Before deductions"))
            .AddChildContent<DescriptionItem>(i => i.Add(x => x.Label, "Bank").Add(x => x.EmptyText, "Not set"))
            .AddChildContent<DescriptionItem>(i => i.Add(x => x.Label, "Address").Add(x => x.FullWidth, true)
                .AddChildContent("<strong>Calle 1</strong>")));

        Assert.Contains("trazos-dl-cols-3", cut.Find("dl").ClassList);
        var terms = cut.FindAll("dt").Select(t => t.TextContent).ToList();
        Assert.Equal(["Salary", "Bank", "Address"], terms);
        var values = cut.FindAll("dd.trazos-dl-value");
        Assert.Equal("$ 3.500.000", values[0].TextContent);
        Assert.Equal("Before deductions", cut.Find(".trazos-dl-hint").TextContent);
        Assert.Equal("Not set", values[1].TextContent);
        Assert.Contains("is-empty", values[1].ClassList);
        Assert.Equal("Calle 1", values[2].QuerySelector("strong")!.TextContent);
        Assert.Contains("is-full", cut.FindAll(".trazos-dl-item")[2].ClassList);
    }

    [Fact]
    public void Stat_shows_label_value_delta_and_trend()
    {
        var cut = Render<Stat>(p => p
            .Add(x => x.Label, "Net payroll")
            .Add(x => x.Value, "$ 148M")
            .Add(x => x.Delta, "+4.2%")
            .Add(x => x.Trend, StatTrend.Up)
            .Add(x => x.TrendLabel, "Up from last month")
            .Add(x => x.Icon, (RenderFragment)(b => b.AddMarkupContent(0, "<svg></svg>"))));

        Assert.Equal("Net payroll", cut.Find(".trazos-stat-label").TextContent);
        Assert.Equal("$ 148M", cut.Find(".trazos-stat-value").TextContent);
        var delta = cut.Find(".trazos-stat-delta");
        Assert.Contains("is-up", delta.ClassList);
        Assert.Contains("+4.2%", delta.TextContent);
        Assert.Equal("Up from last month", cut.Find(".trazos-stat-delta .trazos-visually-hidden-text").TextContent);
        Assert.Equal("true", cut.Find(".trazos-stat-icon").GetAttribute("aria-hidden"));
    }

    [Fact]
    public void Progress_bar_exposes_progressbar_semantics()
    {
        var cut = Render<ProgressBar>(p => p
            .Add(x => x.Value, 3)
            .Add(x => x.Max, 7)
            .Add(x => x.Label, "Calculating payroll")
            .Add(x => x.ValueText, "3 of 7 employees"));

        var bar = cut.Find("[role='progressbar']");
        Assert.Equal("3", bar.GetAttribute("aria-valuenow"));
        Assert.Equal("0", bar.GetAttribute("aria-valuemin"));
        Assert.Equal("7", bar.GetAttribute("aria-valuemax"));
        Assert.Equal("3 of 7 employees", bar.GetAttribute("aria-valuetext"));
        Assert.Equal(cut.Find(".trazos-progress-label").Id, bar.GetAttribute("aria-labelledby"));
        Assert.Contains("width: 42.86%", cut.Find(".trazos-progress-fill").GetAttribute("style"));
        Assert.Equal("3 of 7 employees", cut.Find(".trazos-progress-value").TextContent);
    }

    [Fact]
    public void Indeterminate_progress_has_no_value_and_values_are_clamped()
    {
        var indeterminate = Render<ProgressBar>(p => p.Add(x => x.Indeterminate, true).Add(x => x.Label, "Loading"));
        var over = Render<ProgressBar>(p => p.Add(x => x.Value, 150).Add(x => x.Label, "Done"));

        Assert.Null(indeterminate.Find("[role='progressbar']").GetAttribute("aria-valuenow"));
        Assert.Contains("is-indeterminate", indeterminate.Find(".trazos-progress").ClassList);
        Assert.Equal("100", over.Find("[role='progressbar']").GetAttribute("aria-valuenow"));
        Assert.Contains("width: 100%", over.Find(".trazos-progress-fill").GetAttribute("style"));
    }

    [Fact]
    public void Stepper_marks_completed_current_and_upcoming_steps()
    {
        var cut = Render<Stepper>(p => p
            .Add(x => x.Steps, [new StepperStep("Employee"), new StepperStep("Contract", "Type and dates"), new StepperStep("Review")])
            .Add(x => x.Current, 1)
            .Add(x => x.Label, "New employee"));

        Assert.Equal("New employee", cut.Find("ol").GetAttribute("aria-label"));
        var steps = cut.FindAll("li.trazos-stepper-step");
        Assert.Contains("is-complete", steps[0].ClassList);
        Assert.Contains("is-current", steps[1].ClassList);
        Assert.Contains("is-upcoming", steps[2].ClassList);
        Assert.Equal("step", steps[1].GetAttribute("aria-current"));
        Assert.Null(steps[0].GetAttribute("aria-current"));
        Assert.Equal("Type and dates", steps[1].QuerySelector(".trazos-stepper-description")!.TextContent);
        Assert.Equal("Completed", steps[0].QuerySelector(".trazos-visually-hidden-text")!.TextContent);
    }
}
