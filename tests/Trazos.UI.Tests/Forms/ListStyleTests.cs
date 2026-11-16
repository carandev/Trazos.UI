using Trazos.UI.Tests.Fixtures;

namespace Trazos.UI.Tests.Forms;

public class ListStyleTests
{
    // The hover and keyboard highlight of an option must span the whole width
    // of the popup, so the list has no horizontal padding and options no inset.
    [Theory]
    [InlineData("src/Trazos.UI/Components/Input/SelectInput.razor.css", ".trazos-select-listbox {", ".trazos-select-option {")]
    [InlineData("src/Trazos.UI/Components/Autocomplete/Autocomplete.razor.css", ".trazos-autocomplete-list {", ".trazos-autocomplete-option {")]
    [InlineData("packages/react/src/components/Input/SelectInput.css", ".trazos-select-listbox {", ".trazos-select-option {")]
    [InlineData("packages/react/src/components/Autocomplete/Autocomplete.css", ".trazos-autocomplete-list {", ".trazos-autocomplete-option {")]
    public void Option_highlights_span_the_full_width_of_the_list(string path, string listRule, string optionRule)
    {
        var css = File.ReadAllText(RepoPaths.File(path));

        Assert.Contains("padding: 0.35rem 0;", Rule(css, listRule));
        Assert.Contains("border-radius: 0;", Rule(css, optionRule));
    }

    private static string Rule(string css, string selector)
    {
        var start = css.IndexOf(selector, StringComparison.Ordinal);
        Assert.True(start >= 0, $"missing {selector}");
        return css[start..css.IndexOf('}', start)];
    }
}
