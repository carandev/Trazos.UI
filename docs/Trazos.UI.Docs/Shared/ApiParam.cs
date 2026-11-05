namespace Trazos.UI.Docs.Shared;

/// <summary>
/// One row of a component API table.
/// </summary>
public sealed record ApiParam(string Name, string Type, string? Default, string Description);
