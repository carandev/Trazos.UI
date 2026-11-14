using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Trazos.UI.Components;

public partial class DataTable<TItem> : IDataTableSortContext
{
    [Parameter]
    public IEnumerable<TItem>? Items { get; set; }

    /// <summary>Header cells: <c>&lt;th&gt;</c> or <see cref="SortHeader"/>.</summary>
    [Parameter]
    public RenderFragment? TableHeader { get; set; }

    [Parameter]
    public RenderFragment<TItem> RowTemplate { get; set; } = null!;

    /// <summary>Buttons for each row, in a last column. Clicks there do not raise <see cref="OnRowClick"/>.</summary>
    [Parameter]
    public RenderFragment<TItem>? RowActions { get; set; }

    /// <summary>Screen-reader name of the row actions column.</summary>
    [Parameter]
    public string ActionsLabel { get; set; } = "Actions";

    /// <summary>Footer cells, such as a totals row.</summary>
    [Parameter]
    public RenderFragment? TableFooter { get; set; }

    /// <summary>Content above the table, such as a search box or filters.</summary>
    [Parameter]
    public RenderFragment? Toolbar { get; set; }

    /// <summary>Content below the table, normally a <see cref="Components.Pagination"/>.</summary>
    [Parameter]
    public RenderFragment? Pagination { get; set; }

    /// <summary>Current sort. The table does not sort <see cref="Items"/>; the app does, so server-side sorting works too.</summary>
    [Parameter]
    public TableSort? Sort { get; set; }

    /// <summary>Raised when a <see cref="SortHeader"/> is clicked: a new column sorts ascending, the same column flips.</summary>
    [Parameter]
    public EventCallback<TableSort?> SortChanged { get; set; }

    /// <summary>Accessible name of the table.</summary>
    [Parameter]
    public string? AriaLabel { get; set; }

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

    /// <summary>Makes rows clickable. Rows also become focusable and open with Enter.</summary>
    [Parameter]
    public EventCallback<TItem> OnRowClick { get; set; }

    private bool IsInteractive => OnRowClick.HasDelegate;

    async Task IDataTableSortContext.ToggleSortAsync(string field)
    {
        var next = Sort is { } current && current.Field == field
            ? current with { Descending = !current.Descending }
            : new TableSort(field);
        Sort = next;
        await SortChanged.InvokeAsync(next);
    }

    private async Task HandleRowClick(TItem item)
    {
        if (IsInteractive)
        {
            await OnRowClick.InvokeAsync(item);
        }
    }

    private async Task HandleRowKeyDown(KeyboardEventArgs e, TItem item)
    {
        if (IsInteractive && e.Key == "Enter")
        {
            await OnRowClick.InvokeAsync(item);
        }
    }
}
