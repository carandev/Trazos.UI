using System.Collections.Generic;

namespace Trazos.UI.Internal;

internal static class StyleAttribute
{
    /// <summary>
    /// Joins a component's own inline style with the host's. The host's comes last, so
    /// it can override any custom property the component sets.
    /// </summary>
    public static string? Merge(string? own, IReadOnlyDictionary<string, object>? attributes)
    {
        var host = attributes is not null && attributes.TryGetValue("style", out var value) ? value?.ToString() : null;
        if (string.IsNullOrWhiteSpace(own)) return host;
        return string.IsNullOrWhiteSpace(host) ? own : $"{own}; {host}";
    }
}
