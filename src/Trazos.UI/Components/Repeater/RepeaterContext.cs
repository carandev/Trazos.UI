namespace Trazos.UI.Components;

/// <summary>What a <see cref="Repeater{TItem}"/> row template receives.</summary>
/// <param name="Item">The row's item.</param>
/// <param name="Index">Zero-based position.</param>
/// <param name="IsLast">The last row. Use it for an open-ended last tier, such as "and above".</param>
public sealed record RepeaterContext<TItem>(TItem Item, int Index, bool IsLast);
