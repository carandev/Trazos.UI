using Trazos.UI.Components;

namespace Trazos.UI.Tests.Structure;

public class PrintAndRibbonTests : BunitContext
{
    [Fact]
    public void Print_wrappers_use_the_print_utility_classes()
    {
        var noPrint = Render<NoPrint>(p => p.AddChildContent("<button>Print</button>"));
        var printOnly = Render<PrintOnly>(p => p.AddChildContent("<p>Signature</p>"));

        Assert.Contains("trazos-no-print", noPrint.Find("div").ClassList);
        Assert.Contains("trazos-print-only", printOnly.Find("div").ClassList);
        Assert.Equal("Print", noPrint.Find("button").TextContent);
    }

    [Fact]
    public void Ribbon_shows_its_text_in_a_corner_with_a_tone()
    {
        var cut = Render<Ribbon>(p => p
            .Add(x => x.Text, "PAID")
            .Add(x => x.Tone, RibbonTone.Olive)
            .Add(x => x.Position, RibbonPosition.TopLeft));

        var ribbon = cut.Find(".trazos-ribbon");
        Assert.Contains("is-top-left", ribbon.ClassList);
        Assert.Contains("trazos-ribbon-olive", ribbon.ClassList);
        Assert.Equal("PAID", cut.Find(".trazos-ribbon-band").TextContent);
    }
}
