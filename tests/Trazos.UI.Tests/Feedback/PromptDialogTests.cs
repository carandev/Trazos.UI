using Microsoft.Extensions.DependencyInjection;
using Trazos.UI.Components;
using Trazos.UI.Extensions;
using Trazos.UI.Services;

namespace Trazos.UI.Tests.Feedback;

public class PromptDialogTests : BunitContext
{
    public PromptDialogTests()
    {
        JSInterop.Mode = JSRuntimeMode.Loose;
        Services.AddTrazosUI();
    }

    private static PromptDialogOptions Options => new(
        Message: "The payroll will go back to draft.",
        Title: "Reject payroll",
        InputLabel: "Reason",
        ConfirmText: "Reject",
        MinLength: 10,
        RequiredMessage: "Write a reason.",
        MinLengthMessage: "Use at least {0} characters.");

    [Fact]
    public async Task The_prompt_requires_valid_text_before_confirming()
    {
        var cut = Render<ConfirmDialogContainer>();
        var service = Services.GetRequiredService<IPromptDialogService>();

        Task<PromptResult> pending = null!;
        await cut.InvokeAsync(() => { pending = service.PromptAsync(Options); });
        cut.WaitForElement("textarea");
        Assert.Equal("The payroll will go back to draft.", cut.Find(".trazos-confirm-message").TextContent);

        cut.Find("button.trazos-prompt-confirm").Click();
        Assert.Equal("Write a reason.", cut.Find(".trazos-input-error").TextContent);
        Assert.False(pending.IsCompleted);

        cut.Find("textarea").Input("too short");
        cut.Find("button.trazos-prompt-confirm").Click();
        Assert.Equal("Use at least 10 characters.", cut.Find(".trazos-input-error").TextContent);

        cut.Find("textarea").Input("  Wrong overtime hours  ");
        cut.Find("button.trazos-prompt-confirm").Click();

        var result = await pending;
        Assert.True(result.Confirmed);
        Assert.Equal("Wrong overtime hours", result.Text);
    }

    [Fact]
    public async Task Cancelling_returns_an_unconfirmed_result()
    {
        var cut = Render<ConfirmDialogContainer>();
        var service = Services.GetRequiredService<IPromptDialogService>();

        Task<PromptResult> pending = null!;
        await cut.InvokeAsync(() => { pending = service.PromptAsync(Options); });
        cut.WaitForElement("textarea");
        cut.Find("button.trazos-prompt-cancel").Click();

        var result = await pending;
        Assert.False(result.Confirmed);
        Assert.Null(result.Text);
    }

    [Fact]
    public void The_same_service_instance_handles_confirm_and_prompt()
    {
        Assert.Same(Services.GetRequiredService<IDialogService>(), Services.GetRequiredService<IPromptDialogService>());
    }
}
