using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

public partial class LoadingSpinner
{
    [Parameter]
    public string? Message { get; set; }

    [Parameter]
    public bool Overlay { get; set; }
}
