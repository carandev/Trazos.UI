using System.Collections.Generic;

namespace Trazos.UI.Components;

/// <summary>One link of a <see cref="SiteHeader"/>.</summary>
public sealed record SiteHeaderLink(string Href, string Label)
{
    public string? Class { get; init; }

    /// <summary>Extra attributes for the link, such as <c>target</c>.</summary>
    public IReadOnlyDictionary<string, object>? Attributes { get; init; }
}

public enum SiteHeaderCurrentType
{
    Page,
    Location
}
