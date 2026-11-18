using System;
using System.Linq.Expressions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using Trazos.UI.Components;
using Trazos.UI.Tests.Fixtures;

namespace Trazos.UI.Tests.Forms;

public class TrazosFormTests : BunitContext
{
    /// <summary>A single TextInput bound to <see cref="ProfileModel.Name"/>, built by hand since
    /// <c>ChildContent</c> is a <c>RenderFragment&lt;EditContext&gt;</c> and this file has no .razor markup.</summary>
    private static RenderFragment<EditContext> NameField(ProfileModel model) => _ => builder =>
    {
        builder.OpenComponent<TextInput>(0);
        builder.AddAttribute(1, "Id", "name");
        builder.AddAttribute(2, "Value", model.Name);
        builder.AddAttribute(3, "ValueChanged", EventCallback.Factory.Create<string?>(model, v => model.Name = v));
        builder.AddAttribute(4, "ValueExpression", (Expression<Func<string?>>)(() => model.Name));
        builder.CloseComponent();
    };

    [Fact]
    public void Renders_a_form_with_the_trazos_form_class_and_any_extra_class()
    {
        var model = new ProfileModel();
        var cut = Render<TrazosForm>(p => p
            .Add(x => x.Model, model)
            .Add(x => x.Class, "extra")
            .Add(x => x.ChildContent, NameField(model)));

        var form = cut.Find("form");
        Assert.Contains("trazos-form", form.ClassList);
        Assert.Contains("extra", form.ClassList);
    }

    [Fact]
    public void An_invalid_submit_shows_the_field_error_from_the_edit_context_and_the_validation_summary()
    {
        var model = new ProfileModel();
        var cut = Render<TrazosForm>(p => p
            .Add(x => x.Model, model)
            .Add(x => x.ChildContent, NameField(model)));

        cut.Find("form").Submit();

        // DataAnnotationsValidator is wired: the field reads its message from the EditContext.
        Assert.Equal("Name is required.", cut.Find("#name-error").TextContent);
        // ValidationSummary is wired (default ShowValidationSummary=true) and renders before ChildContent.
        var summary = cut.Find("ul.validation-errors");
        Assert.Contains("Name is required.", summary.TextContent);
        Assert.True(cut.Markup.IndexOf("validation-errors", StringComparison.Ordinal) < cut.Markup.IndexOf("id=\"name\"", StringComparison.Ordinal));
    }

    [Fact]
    public void Omits_the_validation_summary_when_ShowValidationSummary_is_false()
    {
        var model = new ProfileModel();
        var cut = Render<TrazosForm>(p => p
            .Add(x => x.Model, model)
            .Add(x => x.ShowValidationSummary, false)
            .Add(x => x.ChildContent, NameField(model)));

        cut.Find("form").Submit();

        Assert.Equal("Name is required.", cut.Find("#name-error").TextContent);
        Assert.Empty(cut.FindAll("ul.validation-errors"));
    }

    [Fact]
    public void Forwards_the_submit_callbacks_to_the_underlying_EditForm()
    {
        var model = new ProfileModel { Name = "Ada", Notes = "Payroll", Accept = true };
        var validSubmits = 0;
        var invalidSubmits = 0;
        var cut = Render<TrazosForm>(p => p
            .Add(x => x.Model, model)
            .Add(x => x.OnValidSubmit, (EditContext _) => validSubmits++)
            .Add(x => x.OnInvalidSubmit, (EditContext _) => invalidSubmits++)
            .Add(x => x.ChildContent, NameField(model)));

        cut.Find("form").Submit();

        Assert.Equal(1, validSubmits);
        Assert.Equal(0, invalidSubmits);
    }

    [Fact]
    public void An_input_bound_inside_ChildContent_updates_the_model_through_the_edit_context()
    {
        var model = new ProfileModel();
        var cut = Render<TrazosForm>(p => p
            .Add(x => x.Model, model)
            .Add(x => x.ChildContent, NameField(model)));

        cut.Find("form").Submit();
        Assert.NotEmpty(cut.FindAll("#name-error"));

        cut.Find("#name").Input("Ada");

        Assert.Equal("Ada", model.Name);
        Assert.Empty(cut.FindAll("#name-error"));
    }
}
