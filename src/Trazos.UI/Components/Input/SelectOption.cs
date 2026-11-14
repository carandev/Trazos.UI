using System;
using System.Collections.Generic;
using System.Linq;

namespace Trazos.UI.Components;

/// <summary>One option of a <see cref="SelectInput{TValue}"/>.</summary>
/// <param name="Value">Value bound when the option is chosen.</param>
/// <param name="Text">Visible text.</param>
/// <param name="Disabled">Shows the option but does not let the user choose it.</param>
public sealed record SelectOption<TValue>(TValue Value, string Text, bool Disabled = false);

/// <summary>Helpers to build <see cref="SelectOption{TValue}"/> lists.</summary>
public static class SelectOption
{
    /// <summary>
    /// One option per member of <typeparamref name="TEnum"/>, in declaration order.
    /// The text is the member name unless <paramref name="text"/> is given, so
    /// apps can translate it. Use <see cref="ForNullableEnum{TEnum}"/> for a <c>TEnum?</c> binding.
    /// </summary>
    public static IReadOnlyList<SelectOption<TEnum>> ForEnum<TEnum>(Func<TEnum, string>? text = null)
        where TEnum : struct, Enum =>
        Enum.GetValues<TEnum>().Select(v => new SelectOption<TEnum>(v, text?.Invoke(v) ?? v.ToString())).ToList();

    /// <summary>Same as <see cref="ForEnum{TEnum}"/>, typed for a <c>TEnum?</c> binding.</summary>
    public static IReadOnlyList<SelectOption<TEnum?>> ForNullableEnum<TEnum>(Func<TEnum, string>? text = null)
        where TEnum : struct, Enum =>
        Enum.GetValues<TEnum>().Select(v => new SelectOption<TEnum?>(v, text?.Invoke(v) ?? v.ToString())).ToList();
}
