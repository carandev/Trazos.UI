namespace Trazos.UI.Docs.Search;

/// <summary>A piece of result text; <paramref name="M"/> marks a match of the query.</summary>
public sealed record SearchSegment(string T, bool M);

/// <summary>One matching place in a page: a section (null for the page itself) and an excerpt.</summary>
public sealed record SearchHit(string? Section, SearchSegment[] Heading, SearchSegment[] Excerpt);

/// <summary>The hits of one page, as returned by <c>trazosDocsSearch.query</c> in js/docs-search.js.</summary>
public sealed record SearchGroup(string Href, string Title, string? Category, SearchHit[] Hits);
