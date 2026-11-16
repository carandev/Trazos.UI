using Microsoft.AspNetCore.Components;
using Trazos.UI.Components;

namespace Trazos.UI.Tests.Feedback;

public class AlertTests : BunitContext
{
    [Theory]
    [InlineData(AlertTone.Info, "status", "trazos-alert-info")]
    [InlineData(AlertTone.Success, "status", "trazos-alert-success")]
    [InlineData(AlertTone.Warning, "alert", "trazos-alert-warning")]
    [InlineData(AlertTone.Danger, "alert", "trazos-alert-danger")]
    public void Each_tone_has_its_class_and_live_role(AlertTone tone, string role, string cssClass)
    {
        var cut = Render<Alert>(p => p
            .Add(x => x.Tone, tone)
            .Add(x => x.Title, "Heads up")
            .AddChildContent("Body text"));

        var root = cut.Find(".trazos-alert");
        Assert.Equal(role, root.GetAttribute("role"));
        Assert.Contains(cssClass, root.ClassList);
        Assert.Equal("Heads up", cut.Find(".trazos-alert-title").TextContent);
        Assert.Equal("Body text", cut.Find(".trazos-alert-body").TextContent.Trim());
        Assert.Equal("true", cut.Find(".trazos-alert-icon").GetAttribute("aria-hidden"));
    }

    [Fact]
    public void Actions_render_in_their_own_area()
    {
        var cut = Render<Alert>(p => p
            .Add(x => x.Actions, (RenderFragment)(b => b.AddMarkupContent(0, "<button>Undo</button>"))));

        Assert.Equal("Undo", cut.Find(".trazos-alert-actions button").TextContent);
        Assert.Empty(cut.FindAll(".trazos-alert-dismiss"));
    }

    [Fact]
    public void Dismissing_hides_the_alert_and_raises_the_callback()
    {
        var dismissed = false;
        var cut = Render<Alert>(p => p
            .Add(x => x.Dismissible, true)
            .Add(x => x.DismissLabel, "Cerrar aviso")
            .Add(x => x.OnDismiss, () => dismissed = true));

        var button = cut.Find(".trazos-alert-dismiss");
        Assert.Equal("Cerrar aviso", button.GetAttribute("aria-label"));
        Assert.Equal("button", button.GetAttribute("type"));

        button.Click();

        Assert.True(dismissed);
        Assert.Empty(cut.FindAll(".trazos-alert"));
    }
}
