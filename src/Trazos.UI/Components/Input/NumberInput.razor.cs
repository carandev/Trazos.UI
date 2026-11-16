using System;
using System.Globalization;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace Trazos.UI.Components;

/// <summary>
/// Numeric field for <c>int</c>, <c>long</c>, <c>short</c>, <c>decimal</c>,
/// <c>double</c> and <c>float</c>, and their nullable forms. It formats with a
/// culture (group separators, decimal comma or point), has currency and
/// percent modes, clamps to <see cref="Min"/> and <see cref="Max"/>, and steps
/// with the arrow keys. Works standalone or bound inside an EditForm.
/// </summary>
public partial class NumberInput<TValue> : FormFieldBase<TValue>
{
    private static readonly Type UnderlyingType = Nullable.GetUnderlyingType(typeof(TValue)) ?? typeof(TValue);

    private static readonly bool IsIntegerType =
        UnderlyingType == typeof(int) || UnderlyingType == typeof(long) || UnderlyingType == typeof(short);

    public NumberInput() : base("trazos-number")
    {
        if (!IsIntegerType && UnderlyingType != typeof(decimal) && UnderlyingType != typeof(double) && UnderlyingType != typeof(float))
        {
            throw new InvalidOperationException(
                $"NumberInput does not support {typeof(TValue)}. Use int, long, short, decimal, double or float, or their nullable forms.");
        }

        ParseErrorMessage = "Enter a valid number.";
    }

    [Parameter]
    public NumberInputMode Mode { get; set; } = NumberInputMode.Number;

    /// <summary>Smallest allowed value. Typed and stepped values are clamped to it.</summary>
    [Parameter]
    public decimal? Min { get; set; }

    /// <summary>Largest allowed value. Typed and stepped values are clamped to it.</summary>
    [Parameter]
    public decimal? Max { get; set; }

    /// <summary>Amount added or removed by the ArrowUp and ArrowDown keys. In percent mode it counts percentage points.</summary>
    [Parameter]
    public decimal Step { get; set; } = 1;

    /// <summary>
    /// Fixed number of decimals. Defaults to 0 for integer types, to the
    /// culture's currency digits in currency mode, and to as many as needed otherwise.
    /// </summary>
    [Parameter]
    public int? Decimals { get; set; }

    /// <summary>Shows group separators (1,234,567). On by default.</summary>
    [Parameter]
    public bool Grouping { get; set; } = true;

    /// <summary>Culture used to format and parse. Defaults to the current culture.</summary>
    [Parameter]
    public CultureInfo? Culture { get; set; }

    /// <summary>Currency mode prefix, such as <c>COP</c> or <c>US$</c>. Defaults to the culture's symbol.</summary>
    [Parameter]
    public string? CurrencySymbol { get; set; }

    /// <summary>Text before the value. Overrides the currency symbol.</summary>
    [Parameter]
    public string? Prefix { get; set; }

    /// <summary>Text after the value. Overrides the percent sign.</summary>
    [Parameter]
    public string? Suffix { get; set; }

    [Parameter]
    public string? Placeholder { get; set; }

    [Parameter]
    public bool ReadOnly { get; set; }

    [Parameter]
    public RenderFragment? LeadingIcon { get; set; }

    [Parameter]
    public RenderFragment? TrailingIcon { get; set; }

    protected override CultureInfo FormatCulture => Culture ?? CultureInfo.CurrentCulture;

    // Text shown instead of the formatted value for one render. See OnChanged.
    private string? _displayOverride;

    private string? DisplayText => _displayOverride ?? CurrentValueAsString;

    protected override void OnParametersSet()
    {
        base.OnParametersSet();
        if (Mode == NumberInputMode.Percent && IsIntegerType)
        {
            throw new InvalidOperationException(
                $"NumberInput Percent mode needs a fractional type (decimal, double or float), not {typeof(TValue)}: 15 % is stored as 0.15.");
        }
    }

    private bool IsInteger => IsIntegerType;

    private decimal Scale => Mode == NumberInputMode.Percent ? 100m : 1m;

    private string? EffectivePrefix => Prefix ?? (Mode == NumberInputMode.Currency
        ? CurrencySymbol ?? FormatCulture.NumberFormat.CurrencySymbol
        : null);

    private string? EffectiveSuffix => Suffix ?? (Mode == NumberInputMode.Percent ? "%" : null);

    private int? EffectiveDecimals => Decimals
        ?? (Mode == NumberInputMode.Currency ? FormatCulture.NumberFormat.CurrencyDecimalDigits
        : IsInteger && Mode == NumberInputMode.Number ? 0
        : null);

    private string? AriaValueNow => ToDecimal(Value) is { } number ? AriaNumber(number) : null;

    private static string? AriaNumber(decimal? number) => number?.ToString(CultureInfo.InvariantCulture);

    protected override string? FormatValueAsString(TValue value)
    {
        if (ToDecimal(value) is not { } number)
        {
            return string.Empty;
        }

        var shown = number * Scale;
        var group = Grouping ? "#,0" : "0";
        var format = EffectiveDecimals is { } digits
            ? digits > 0 ? $"{group}.{new string('0', digits)}" : group
            : $"{group}.############";
        return shown.ToString(format, FormatCulture);
    }

    protected override bool TryParseValueFromString(string? text, out TValue value)
    {
        value = default!;
        var cleaned = Clean(text);
        if (cleaned.Length == 0)
        {
            return default(TValue) is null;
        }

        if (!decimal.TryParse(cleaned, NumberStyles.Number, FormatCulture, out var number))
        {
            return false;
        }

        return TryFromDecimal(number / Scale, out value);
    }

    private string Clean(string? text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return string.Empty;
        }

        var cleaned = text;
        foreach (var affix in new[] { EffectivePrefix, EffectiveSuffix, FormatCulture.NumberFormat.CurrencySymbol, "%" })
        {
            if (!string.IsNullOrEmpty(affix))
            {
                cleaned = cleaned.Replace(affix, string.Empty, StringComparison.Ordinal);
            }
        }

        return cleaned.Trim();
    }

    private bool TryFromDecimal(decimal number, out TValue value)
    {
        value = default!;
        if (Min is { } min && number < min)
        {
            number = min;
        }

        if (Max is { } max && number > max)
        {
            number = max;
        }

        var digits = IsInteger ? 0 : EffectiveDecimals is { } d ? d + (Mode == NumberInputMode.Percent ? 2 : 0) : (int?)null;
        if (digits is { } places)
        {
            number = Math.Round(number, places, MidpointRounding.AwayFromZero);
        }

        try
        {
            value = (TValue)Convert.ChangeType(number, UnderlyingType, CultureInfo.InvariantCulture);
            return true;
        }
        catch (OverflowException)
        {
            return false;
        }
    }

    private static decimal? ToDecimal(TValue value)
    {
        if (value is null)
        {
            return null;
        }

        try
        {
            return Convert.ToDecimal(value, CultureInfo.InvariantCulture);
        }
        catch (OverflowException)
        {
            return null;
        }
    }

    private async Task OnChanged(ChangeEventArgs e)
    {
        var typed = e.Value?.ToString();
        await SetValueFromStringAsync(typed);

        if (HasError)
        {
            // Keep the text the user typed visible next to the conversion error.
            _displayOverride = typed;
            return;
        }

        var formatted = CurrentValueAsString;
        if (!string.Equals(typed, formatted, StringComparison.Ordinal))
        {
            // Blazor only writes the value attribute when it differs from the last
            // render. When clamping or formatting lands on the value already shown
            // (typing 70 with Max 48 while 48 is shown), render the typed text once
            // and then the formatted value, so the field is rewritten.
            _displayOverride = typed;
            StateHasChanged();
            await Task.Yield();
        }

        _displayOverride = null;
    }

    private async Task OnKeyDown(KeyboardEventArgs e)
    {
        if (Disabled || ReadOnly || (e.Key != "ArrowUp" && e.Key != "ArrowDown"))
        {
            return;
        }

        var current = ToDecimal(Value) ?? Min ?? 0m;
        var step = Step / Scale;
        var next = e.Key == "ArrowUp" ? current + step : current - step;
        if (TryFromDecimal(next, out var value))
        {
            await SetValueAsync(value);
        }
    }
}
