using AngleSharp.Dom;
using Microsoft.AspNetCore.Components.Web;
using Trazos.UI.Components;
using Trazos.UI.Tests.Fixtures;

namespace Trazos.UI.Tests.Forms;

/// <summary>
/// SelectInput with typed Options draws its own listbox instead of the native
/// select, so the popup follows the theme (dark mode included).
/// </summary>
public class SelectListboxTests : BunitContext
{
    private static readonly SelectOption<string>[] Fruits =
    [
        new("apple", "Apple"),
        new("banana", "Banana", Disabled: true),
        new("cherry", "Cherry"),
        new("blueberry", "Blueberry"),
    ];

    private IRenderedComponent<SelectInput<string>> RenderFruits(Action<string>? changed = null, string? value = null) =>
        Render<SelectInput<string>>(p => p
            .Add(x => x.Id, "fruit")
            .Add(x => x.Label, "Fruit")
            .Add(x => x.Placeholder, "Choose")
            .Add(x => x.Options, Fruits)
            .Add(x => x.Value, value!)
            .Add(x => x.ValueChanged, (string v) => changed?.Invoke(v)));

    private static void Key(IRenderedComponent<SelectInput<string>> cut, string key) =>
        cut.Find("#fruit").KeyDown(new KeyboardEventArgs { Key = key });

    private static IReadOnlyList<IElement> Options<T>(IRenderedComponent<T> cut)
        where T : Microsoft.AspNetCore.Components.IComponent =>
        cut.FindAll("[role=option]");

    [Fact]
    public void Typed_options_render_a_combobox_trigger_instead_of_a_native_select()
    {
        var cut = RenderFruits();

        Assert.Empty(cut.FindAll("select"));
        var trigger = cut.Find("#fruit");
        Assert.Equal("combobox", trigger.GetAttribute("role"));
        Assert.Equal("listbox", trigger.GetAttribute("aria-haspopup"));
        Assert.Equal("false", trigger.GetAttribute("aria-expanded"));
        Assert.Equal("fruit-listbox", trigger.GetAttribute("aria-controls"));
        Assert.Equal("fruit-label", trigger.GetAttribute("aria-labelledby"));
        Assert.Equal("fruit-label", cut.Find("label").Id);
        Assert.Equal("Choose", cut.Find(".trazos-select-value").TextContent.Trim());
        Assert.Contains("is-placeholder", cut.Find(".trazos-select-value").ClassList);
        Assert.Empty(cut.FindAll("[role=listbox]"));
    }

    [Fact]
    public void Clicking_the_trigger_opens_the_list_and_clicking_an_option_selects_it()
    {
        string? picked = null;
        var cut = RenderFruits(v => picked = v);

        cut.Find("#fruit").Click();

        Assert.Equal("true", cut.Find("#fruit").GetAttribute("aria-expanded"));
        var listbox = cut.Find("#fruit-listbox");
        Assert.Equal("listbox", listbox.GetAttribute("role"));
        Assert.Equal(["Apple", "Banana", "Cherry", "Blueberry"], Options(cut).Select(o => o.TextContent.Trim()));
        Assert.Equal("true", Options(cut)[1].GetAttribute("aria-disabled"));

        Options(cut)[2].MouseDown();

        Assert.Equal("cherry", picked);
        Assert.Empty(cut.FindAll("[role=listbox]"));
        Assert.Equal("false", cut.Find("#fruit").GetAttribute("aria-expanded"));
    }

    [Fact]
    public void Clicking_a_disabled_option_does_nothing()
    {
        string? picked = null;
        var cut = RenderFruits(v => picked = v);
        cut.Find("#fruit").Click();

        Options(cut)[1].MouseDown();

        Assert.Null(picked);
        Assert.NotEmpty(cut.FindAll("[role=listbox]"));
    }

    [Fact]
    public void Arrow_keys_open_and_move_skipping_disabled_options_and_enter_selects()
    {
        string? picked = null;
        var cut = RenderFruits(v => picked = v);

        Key(cut, "ArrowDown");
        Assert.Equal("true", cut.Find("#fruit").GetAttribute("aria-expanded"));
        Assert.Equal("fruit-option-0", cut.Find("#fruit").GetAttribute("aria-activedescendant"));
        Assert.Equal("true", Options(cut)[0].GetAttribute("aria-selected"));

        Key(cut, "ArrowDown");
        Assert.Equal("fruit-option-2", cut.Find("#fruit").GetAttribute("aria-activedescendant"));

        Key(cut, "ArrowUp");
        Assert.Equal("fruit-option-0", cut.Find("#fruit").GetAttribute("aria-activedescendant"));

        Key(cut, "End");
        Assert.Equal("fruit-option-3", cut.Find("#fruit").GetAttribute("aria-activedescendant"));
        Key(cut, "Home");
        Assert.Equal("fruit-option-0", cut.Find("#fruit").GetAttribute("aria-activedescendant"));

        Key(cut, "ArrowDown");
        Key(cut, "Enter");

        Assert.Equal("cherry", picked);
        Assert.Empty(cut.FindAll("[role=listbox]"));
        Assert.Null(cut.Find("#fruit").GetAttribute("aria-activedescendant"));
    }

    [Fact]
    public void Space_selects_the_active_option()
    {
        string? picked = null;
        var cut = RenderFruits(v => picked = v);

        Key(cut, " ");
        Key(cut, "End");
        Key(cut, " ");

        Assert.Equal("blueberry", picked);
        Assert.Empty(cut.FindAll("[role=listbox]"));
    }

    [Fact]
    public void Escape_closes_without_changing_the_value()
    {
        string? picked = null;
        var cut = RenderFruits(v => picked = v, value: "apple");

        Key(cut, "ArrowDown");
        Key(cut, "ArrowDown");
        Key(cut, "Escape");

        Assert.Null(picked);
        Assert.Empty(cut.FindAll("[role=listbox]"));
        Assert.Equal("Apple", cut.Find(".trazos-select-value").TextContent.Trim());
    }

    [Fact]
    public void Tab_and_blur_close_the_list()
    {
        var cut = RenderFruits();

        Key(cut, "ArrowDown");
        Key(cut, "Tab");
        Assert.Empty(cut.FindAll("[role=listbox]"));

        Key(cut, "ArrowDown");
        cut.Find("#fruit").Blur();
        Assert.Empty(cut.FindAll("[role=listbox]"));
    }

    [Fact]
    public void Opening_starts_on_the_selected_option_which_carries_a_check()
    {
        var cut = RenderFruits(value: "cherry");

        Key(cut, "ArrowDown");

        Assert.Equal("fruit-option-2", cut.Find("#fruit").GetAttribute("aria-activedescendant"));
        Assert.Contains("is-selected", Options(cut)[2].ClassList);
        Assert.NotNull(Options(cut)[2].QuerySelector(".trazos-select-check"));
        Assert.Null(Options(cut)[0].QuerySelector(".trazos-select-check"));
    }

    [Fact]
    public void Typing_letters_moves_to_the_first_matching_enabled_option()
    {
        var cut = RenderFruits();

        Key(cut, "c");
        Assert.Equal("true", cut.Find("#fruit").GetAttribute("aria-expanded"));
        Assert.Equal("fruit-option-2", cut.Find("#fruit").GetAttribute("aria-activedescendant"));

        // "b" skips the disabled Banana.
        Key(cut, "Escape");
        Key(cut, "b");
        Assert.Equal("fruit-option-3", cut.Find("#fruit").GetAttribute("aria-activedescendant"));

        // Several letters typed quickly match a prefix.
        Key(cut, "Escape");
        Key(cut, "b");
        Key(cut, "l");
        Assert.Equal("fruit-option-3", cut.Find("#fruit").GetAttribute("aria-activedescendant"));
    }

    [Fact]
    public void Disabled_field_does_not_open()
    {
        var cut = Render<SelectInput<string>>(p => p
            .Add(x => x.Id, "fruit")
            .Add(x => x.Options, Fruits)
            .Add(x => x.Disabled, true));

        Assert.NotNull(cut.Find("#fruit").GetAttribute("disabled"));
        Assert.Contains("disabled", cut.Find(".trazos-select-wrapper").ClassList);
        cut.Find("#fruit").KeyDown(new KeyboardEventArgs { Key = "ArrowDown" });
        Assert.Empty(cut.FindAll("[role=listbox]"));
    }

    [Fact]
    public void Error_and_helper_are_wired_to_the_trigger()
    {
        var cut = Render<SelectInput<string>>(p => p
            .Add(x => x.Id, "fruit")
            .Add(x => x.Options, Fruits)
            .Add(x => x.Required, true)
            .Add(x => x.Error, "Pick one"));

        var trigger = cut.Find("#fruit");
        Assert.Equal("true", trigger.GetAttribute("aria-invalid"));
        Assert.Equal("true", trigger.GetAttribute("aria-required"));
        Assert.Equal("fruit-error", trigger.GetAttribute("aria-describedby"));
        Assert.Contains("has-error", cut.Find(".trazos-select-wrapper").ClassList);
    }

    [Fact]
    public void Guid_and_nullable_values_round_trip_and_the_placeholder_is_not_an_option()
    {
        var first = Guid.Parse("0b4c7f5e-1a2b-4c3d-8e9f-001122334455");
        var second = Guid.Parse("9f8e7d6c-5b4a-4321-8fed-cba987654321");
        Guid? picked = null;
        var cut = Render<SelectInput<Guid?>>(p => p
            .Add(x => x.Id, "owner")
            .Add(x => x.Placeholder, "Nobody")
            .Add(x => x.Options, [new(first, "Ada"), new(second, "Grace")])
            .Add(x => x.ValueChanged, (Guid? v) => picked = v));

        cut.Find("#owner").Click();
        Assert.Equal(["Ada", "Grace"], cut.FindAll("[role=option]").Select(o => o.TextContent.Trim()));

        cut.FindAll("[role=option]")[1].MouseDown();

        Assert.Equal(second, picked);
    }

    [Fact]
    public void A_nullable_enum_bound_in_an_edit_form_round_trips_and_validates()
    {
        var model = new AssignmentModel();
        var cut = Render<AssignmentForm>(p => p.Add(x => x.Model, model));

        cut.Find("form").Submit();
        Assert.Equal("Choose a frequency.", cut.Find("#frequency-error").TextContent);
        Assert.Equal("frequency-error", cut.Find("#frequency").GetAttribute("aria-describedby"));

        cut.Find("#frequency").KeyDown(new KeyboardEventArgs { Key = "ArrowDown" });
        cut.Find("#frequency").KeyDown(new KeyboardEventArgs { Key = "ArrowDown" });
        cut.Find("#frequency").KeyDown(new KeyboardEventArgs { Key = "Enter" });

        Assert.Equal(PayFrequency.Biweekly, model.Frequency);
        Assert.Empty(cut.FindAll("#frequency-error"));
        Assert.Contains("modified", cut.Find("#frequency").Closest(".trazos-input-group")!.ClassList);
    }

    [Fact]
    public void Option_children_keep_the_native_select()
    {
        var cut = Render<SelectInput<string>>(p => p
            .Add(x => x.Id, "team")
            .AddChildContent("<option value=\"design\">Design</option>"));

        Assert.Equal("SELECT", cut.Find("#team").TagName);
        Assert.Empty(cut.FindAll("[role=combobox]"));
    }

    [Fact]
    public void Options_mixed_with_children_keep_the_native_select()
    {
        var cut = Render<SelectInput<string>>(p => p
            .Add(x => x.Id, "fruit")
            .Add(x => x.Options, Fruits)
            .AddChildContent("<option value=\"other\">Other</option>"));

        Assert.Equal("SELECT", cut.Find("#fruit").TagName);
        Assert.Equal(5, cut.FindAll("#fruit option").Count);
    }
}
