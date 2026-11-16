namespace Trazos.UI.Components;

/// <summary>How a <see cref="DescriptionList"/> draws its items.</summary>
public enum DescriptionListVariant
{
    /// <summary>Each item is its own small card, so every value reads on its own.</summary>
    Tiles,

    /// <summary>A compact label/value grid without cards, for dense data. Supports <c>Bordered</c>.</summary>
    Plain
}
