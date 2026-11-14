using System.Collections.Generic;

namespace Trazos.UI.Components;

/// <summary>A country choice of a <see cref="PhoneInput"/>.</summary>
/// <param name="DialCode">International prefix, such as <c>+57</c>.</param>
/// <param name="Name">Text shown in the list. Pass translated names from the app.</param>
public sealed record PhoneCountry(string DialCode, string Name)
{
    /// <summary>A short default list. Apps usually pass their own, translated and ordered.</summary>
    public static IReadOnlyList<PhoneCountry> Defaults { get; } =
    [
        new("+57", "Colombia"),
        new("+52", "México"),
        new("+54", "Argentina"),
        new("+56", "Chile"),
        new("+51", "Perú"),
        new("+593", "Ecuador"),
        new("+58", "Venezuela"),
        new("+507", "Panamá"),
        new("+34", "España"),
        new("+1", "United States / Canada"),
    ];
}
