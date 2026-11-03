using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

public partial class DataTable<TItem>
{
    [Parameter]
    public IEnumerable<TItem>? Items { get; set; }

    [Parameter]
    public RenderFragment? TableHeader { get; set; }

    [Parameter]
    public RenderFragment<TItem> RowTemplate { get; set; } = null!;

    [Parameter]
    public RenderFragment? EmptyContent { get; set; }

    [Parameter]
    public string EmptyMessage { get; set; } = "No hay registros disponibles.";

    [Parameter]
    public bool Loading { get; set; }

    [Parameter]
    public int LoadingRows { get; set; } = 3;

    [Parameter]
    public string? Class { get; set; }

    [Parameter]
    public EventCallback<TItem> OnRowClick { get; set; }

    private async Task HandleRowClick(TItem item)
    {
        if (OnRowClick.HasDelegate)
        {
            await OnRowClick.InvokeAsync(item);
        }
    }
}
