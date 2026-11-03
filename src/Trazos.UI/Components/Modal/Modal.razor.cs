using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

public partial class Modal
{
    [Parameter]
    public bool IsOpen { get; set; }

    [Parameter]
    public EventCallback<bool> IsOpenChanged { get; set; }

    [Parameter]
    public string Title { get; set; } = string.Empty;

    [Parameter]
    public RenderFragment? ChildContent { get; set; }

    [Parameter]
    public RenderFragment? Footer { get; set; }

    [Parameter]
    public string Size { get; set; } = "medium";

    [Parameter]
    public bool ShowCloseButton { get; set; } = true;

    [Parameter]
    public bool CloseOnBackdropClick { get; set; } = true;

    [Parameter]
    public EventCallback OnClose { get; set; }

    private string SizeClass => Size.ToLower() switch
    {
        "small" => "modal-small",
        "large" => "modal-large",
        _ => "modal-medium"
    };

    private async Task OnBackdropClick()
    {
        if (CloseOnBackdropClick)
        {
            await Close();
        }
    }

    public async Task Close()
    {
        IsOpen = false;
        await IsOpenChanged.InvokeAsync(false);
        await OnClose.InvokeAsync();
    }

    public async Task Open()
    {
        IsOpen = true;
        await IsOpenChanged.InvokeAsync(true);
    }
}
