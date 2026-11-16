using Trazos.UI.Components;

namespace Trazos.UI.Tests.Forms;

public class TextInputAffixTests : BunitContext
{
    [Fact]
    public void Prefix_and_suffix_render_as_decorative_text_around_the_control()
    {
        var cut = Render<TextInput>(p => p
            .Add(x => x.Prefix, "COP")
            .Add(x => x.Suffix, "/ month"));

        var prefix = cut.Find(".trazos-input-affix.leading");
        var suffix = cut.Find(".trazos-input-affix.trailing");
        Assert.Equal("COP", prefix.TextContent);
        Assert.Equal("/ month", suffix.TextContent);
        Assert.Equal("true", prefix.GetAttribute("aria-hidden"));
        Assert.Equal("INPUT", prefix.NextElementSibling?.TagName);
    }

    [Fact]
    public void Without_affixes_no_affix_element_is_rendered()
    {
        var cut = Render<TextInput>();

        Assert.Empty(cut.FindAll(".trazos-input-affix"));
    }
}
