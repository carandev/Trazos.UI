using Microsoft.AspNetCore.Components;
using Trazos.UI.Components;
using Trazos.UI.Tests.Fixtures;

namespace Trazos.UI.Tests.Forms;

public class EditFormIntegrationTests : BunitContext
{
    [Fact]
    public void Submitting_an_invalid_form_shows_each_field_error_from_the_edit_context()
    {
        var cut = Render<ProfileForm>();

        cut.Find("form").Submit();

        Assert.False(cut.Instance.Submitted);
        Assert.Equal("Name is required.", cut.Find("#name-error").TextContent);
        Assert.Equal("Notes are required.", cut.Find("#notes-error").TextContent);
        Assert.Equal("You must accept the terms.", cut.Find("#accept-error").TextContent);
        Assert.Equal("true", cut.Find("#name").GetAttribute("aria-invalid"));
        Assert.Contains("name-error", cut.Find("#name").GetAttribute("aria-describedby"));
        Assert.Contains("invalid", cut.Find("#name").Closest(".trazos-input-group")!.ClassList);
        Assert.Contains("has-error", cut.Find("#name").Closest(".trazos-input-wrapper")!.ClassList);
    }

    [Fact]
    public void Fixing_a_field_clears_its_error_and_updates_the_model()
    {
        var model = new ProfileModel();
        var cut = Render<ProfileForm>(p => p.Add(x => x.Model, model));
        cut.Find("form").Submit();

        cut.Find("#name").Input("Ada");
        cut.Find("#notes").Input("Payroll");
        cut.Find("#accept").Change(true);

        Assert.Equal("Ada", model.Name);
        Assert.Equal("Payroll", model.Notes);
        Assert.True(model.Accept);
        Assert.Empty(cut.FindAll("#name-error"));
        Assert.Empty(cut.FindAll("#accept-error"));
        Assert.Null(cut.Find("#name").GetAttribute("aria-invalid"));
        Assert.Contains("valid", cut.Find("#name").Closest(".trazos-input-group")!.ClassList);
        Assert.Contains("modified", cut.Find("#name").Closest(".trazos-input-group")!.ClassList);

        cut.Find("form").Submit();
        Assert.True(cut.Instance.Submitted);
    }

    [Fact]
    public void An_explicit_error_takes_precedence_over_the_edit_context_message()
    {
        var cut = Render<ProfileForm>(p => p.Add(x => x.NameError, "Server says no."));

        cut.Find("form").Submit();

        Assert.Equal("Server says no.", cut.Find("#name-error").TextContent);
    }

    [Fact]
    public void The_helper_text_is_linked_to_the_control_while_there_is_no_error()
    {
        var cut = Render<ProfileForm>();

        Assert.Equal("Your full name", cut.Find("#name-hint").TextContent);
        Assert.Equal("name-hint", cut.Find("#name").GetAttribute("aria-describedby"));
    }

    [Fact]
    public void Inputs_keep_working_without_an_edit_form()
    {
        string? text = null;
        string? area = null;
        var isChecked = false;

        var input = Render<TextInput>(p => p
            .Add(x => x.Error, "Manual error")
            .Add(x => x.ValueChanged, (string? v) => text = v));
        var textArea = Render<TextArea>(p => p.Add(x => x.ValueChanged, (string? v) => area = v));
        var checkbox = Render<Checkbox>(p => p.Add(x => x.ValueChanged, (bool v) => isChecked = v));

        input.Find("input").Input("hello");
        textArea.Find("textarea").Input("notes");
        checkbox.Find("input").Change(true);

        Assert.Equal("hello", text);
        Assert.Equal("notes", area);
        Assert.True(isChecked);
        Assert.Equal("Manual error", input.Find(".trazos-input-error").TextContent);
        Assert.Empty(textArea.FindAll(".trazos-input-error"));
    }
}
