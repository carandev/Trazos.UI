using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;

namespace Trazos.UI.Components;

/// <summary>
/// File picker and drop zone built on <see cref="InputFile"/>. It checks the
/// accepted types and the maximum size, lists the chosen files with a remove
/// button, and binds them as <c>IReadOnlyList&lt;IBrowserFile&gt;</c>. Reading
/// the content (<c>OpenReadStream</c>) stays in the app. Messages are
/// parameters, so the component stays language-neutral.
/// </summary>
public partial class FileInput : FormFieldBase<IReadOnlyList<IBrowserFile>?>
{
    private readonly List<string> _rejected = [];

    public FileInput() : base("trazos-file")
    {
    }

    /// <summary>Accepted types, as in the HTML <c>accept</c> attribute: <c>.pdf,image/*</c>.</summary>
    [Parameter]
    public string? Accept { get; set; }

    /// <summary>Largest allowed file in bytes. No limit when null.</summary>
    [Parameter]
    public long? MaxFileSize { get; set; }

    [Parameter]
    public bool Multiple { get; set; }

    /// <summary>Largest number of files kept when <see cref="Multiple"/> is on.</summary>
    [Parameter]
    public int MaxFiles { get; set; } = 10;

    [Parameter]
    public string ButtonText { get; set; } = "Choose a file";

    [Parameter]
    public string DropText { get; set; } = "or drag it here";

    /// <summary>Small line in the drop zone, such as "PDF up to 5 MB".</summary>
    [Parameter]
    public string? Hint { get; set; }

    /// <summary>Accessible name of each remove button. <c>{0}</c> is the file name.</summary>
    [Parameter]
    public string RemoveLabelFormat { get; set; } = "Remove {0}";

    /// <summary><c>{0}</c> is the file name and <c>{1}</c> the size limit.</summary>
    [Parameter]
    public string TooLargeMessage { get; set; } = "{0} is larger than {1}.";

    /// <summary><c>{0}</c> is the file name.</summary>
    [Parameter]
    public string NotAcceptedMessage { get; set; } = "{0} is not an accepted file type.";

    /// <summary><c>{0}</c> is the file name and <c>{1}</c> the file limit.</summary>
    [Parameter]
    public string TooManyMessage { get; set; } = "{0} was not added: the limit is {1} files.";

    private IReadOnlyList<IBrowserFile> Files => Value ?? [];

    private async Task OnFilesSelected(InputFileChangeEventArgs e)
    {
        _rejected.Clear();
        var incoming = e.FileCount > 0 ? e.GetMultipleFiles(Math.Max(1, e.FileCount)) : [];
        var accepted = new List<IBrowserFile>(Multiple ? Files : []);
        var limit = Multiple ? Math.Max(1, MaxFiles) : 1;
        var added = 0;

        foreach (var file in incoming)
        {
            if (!IsAccepted(file))
            {
                _rejected.Add(string.Format(CultureInfo.CurrentCulture, NotAcceptedMessage, file.Name));
            }
            else if (MaxFileSize is { } max && file.Size > max)
            {
                _rejected.Add(string.Format(CultureInfo.CurrentCulture, TooLargeMessage, file.Name, FormatSize(max)));
            }
            else if (Multiple && accepted.Count >= limit)
            {
                _rejected.Add(string.Format(CultureInfo.CurrentCulture, TooManyMessage, file.Name, limit));
            }
            else
            {
                if (!Multiple)
                {
                    accepted.Clear();
                }

                accepted.Add(file);
                added++;
            }
        }

        // When every new file was rejected, the previous selection stays.
        if (added > 0)
        {
            await SetValueAsync(accepted);
        }
    }

    private async Task RemoveAsync(IBrowserFile file)
    {
        _rejected.Clear();
        var remaining = Files.Where(f => !ReferenceEquals(f, file)).ToList();
        await SetValueAsync(remaining.Count == 0 ? null : remaining);
    }

    private bool IsAccepted(IBrowserFile file)
    {
        if (string.IsNullOrWhiteSpace(Accept))
        {
            return true;
        }

        foreach (var raw in Accept.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            if (raw.StartsWith('.') && file.Name.EndsWith(raw, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            if (raw.EndsWith("/*", StringComparison.Ordinal)
                && file.ContentType.StartsWith(raw[..^1], StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            if (string.Equals(raw, file.ContentType, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        return false;
    }

    private static string FormatSize(long bytes) => bytes switch
    {
        < 1024 => $"{bytes} B",
        < 1024 * 1024 => $"{bytes / 1024d:0.#} KB",
        _ => $"{bytes / (1024d * 1024d):0.#} MB",
    };
}
