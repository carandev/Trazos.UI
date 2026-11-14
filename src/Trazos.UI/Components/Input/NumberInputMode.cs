namespace Trazos.UI.Components;

/// <summary>How a <see cref="NumberInput{TValue}"/> presents its value.</summary>
public enum NumberInputMode
{
    /// <summary>A plain number.</summary>
    Number,

    /// <summary>An amount of money. The currency symbol is shown as a prefix.</summary>
    Currency,

    /// <summary>A fraction shown as a percentage: the value 0.15 reads 15 %.</summary>
    Percent,
}
