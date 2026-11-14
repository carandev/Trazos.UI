using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

/// <summary>
/// Page navigation with a page-size selector and a "11–20 of 95" summary.
/// Pages are 1-based. It only raises events, so it works for client-side
/// lists and server-side paging alike, standalone or in a DataTable's
/// <c>Pagination</c> slot. Labels are parameters, so it stays language-neutral.
/// </summary>
public partial class Pagination
{
    /// <summary>Current page, starting at 1. Supports <c>@bind-Page</c>.</summary>
    [Parameter]
    public int Page { get; set; } = 1;

    [Parameter]
    public EventCallback<int> PageChanged { get; set; }

    /// <summary>Items per page. Supports <c>@bind-PageSize</c>.</summary>
    [Parameter]
    public int PageSize { get; set; } = 10;

    /// <summary>Raised when the user picks a page size. <see cref="PageChanged"/> then goes back to page 1.</summary>
    [Parameter]
    public EventCallback<int> PageSizeChanged { get; set; }

    /// <summary>Total number of items across every page.</summary>
    [Parameter, EditorRequired]
    public int TotalCount { get; set; }

    /// <summary>Choices for the page-size selector. No selector when empty.</summary>
    [Parameter]
    public IReadOnlyList<int>? PageSizeOptions { get; set; }

    /// <summary>Pages shown on each side of the current one before an ellipsis.</summary>
    [Parameter]
    public int Siblings { get; set; } = 1;

    [Parameter]
    public string Label { get; set; } = "Pagination";

    [Parameter]
    public string PreviousLabel { get; set; } = "Previous page";

    [Parameter]
    public string NextLabel { get; set; } = "Next page";

    /// <summary>Accessible name of each page button. <c>{0}</c> is the page number.</summary>
    [Parameter]
    public string PageLabelFormat { get; set; } = "Page {0}";

    [Parameter]
    public string PageSizeLabel { get; set; } = "Rows per page";

    /// <summary>Summary text. <c>{0}</c> is the first item, <c>{1}</c> the last and <c>{2}</c> the total.</summary>
    [Parameter]
    public string SummaryFormat { get; set; } = "{0}–{1} of {2}";

    [Parameter]
    public string? Class { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    private int SafePageSize => Math.Max(1, PageSize);

    private int PageCount => Math.Max(1, (int)Math.Ceiling(Math.Max(0, TotalCount) / (double)SafePageSize));

    private int CurrentPage => Math.Clamp(Page, 1, PageCount);

    private string Summary
    {
        get
        {
            var total = Math.Max(0, TotalCount);
            var first = total == 0 ? 0 : (CurrentPage - 1) * SafePageSize + 1;
            var last = Math.Min(total, CurrentPage * SafePageSize);
            return string.Format(CultureInfo.CurrentCulture, SummaryFormat, first, last, total);
        }
    }

    /// <summary>Page numbers to show; <c>null</c> marks an ellipsis.</summary>
    private IEnumerable<int?> VisiblePages
    {
        get
        {
            var count = PageCount;
            var siblings = Math.Max(0, Siblings);
            // First, last, current with its siblings, and two ellipses.
            if (count <= 5 + siblings * 2)
            {
                for (var i = 1; i <= count; i++) yield return i;
                yield break;
            }

            var start = Math.Max(2, CurrentPage - siblings);
            var end = Math.Min(count - 1, CurrentPage + siblings);
            if (start <= 3) { start = 2; end = Math.Max(end, 3 + siblings * 2); }
            if (end >= count - 2) { end = count - 1; start = Math.Min(start, count - 2 - siblings * 2); }

            yield return 1;
            if (start > 2) yield return null;
            for (var i = start; i <= end; i++) yield return i;
            if (end < count - 1) yield return null;
            yield return count;
        }
    }

    private async Task GoToAsync(int page)
    {
        var target = Math.Clamp(page, 1, PageCount);
        if (target == CurrentPage)
        {
            return;
        }

        Page = target;
        await PageChanged.InvokeAsync(target);
    }

    private async Task OnPageSizeChanged(ChangeEventArgs e)
    {
        if (!int.TryParse(e.Value?.ToString(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var size) || size < 1)
        {
            return;
        }

        PageSize = size;
        await PageSizeChanged.InvokeAsync(size);
        Page = 1;
        await PageChanged.InvokeAsync(1);
    }
}
