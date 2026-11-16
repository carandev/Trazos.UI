using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

/// <summary>
/// Phone field with a country code picker and the national number. The bound
/// value is one string, <c>"+57 3001234567"</c>: the dial code, a space and
/// the digits. Spaces and dashes typed by the user are dropped. An empty
/// number binds <c>null</c>.
/// </summary>
public partial class PhoneInput : FormFieldBase<string?>
{
    private string _dial = string.Empty;
    private string _digits = string.Empty;
    private string? _lastValue;
    private bool _initialized;

    public PhoneInput() : base("trazos-phone")
    {
    }

    /// <summary>Country choices. Defaults to <see cref="PhoneCountry.Defaults"/>.</summary>
    [Parameter]
    public IReadOnlyList<PhoneCountry>? Countries { get; set; }

    /// <summary>Dial code selected while the value is empty. Defaults to the first country.</summary>
    [Parameter]
    public string? DefaultDialCode { get; set; }

    /// <summary>Accessible name of the country picker.</summary>
    [Parameter]
    public string CountryLabel { get; set; } = "Country code";

    [Parameter]
    public string? Placeholder { get; set; }

    private IReadOnlyList<PhoneCountry> AvailableCountries
    {
        get
        {
            var list = Countries ?? PhoneCountry.Defaults;
            // Keep an unknown code from the bound value selectable.
            return _dial.Length > 0 && list.All(c => c.DialCode != _dial)
                ? [new PhoneCountry(_dial, _dial), .. list]
                : list;
        }
    }

    protected override void OnParametersSet()
    {
        base.OnParametersSet();
        if (_initialized && string.Equals(Value, _lastValue, StringComparison.Ordinal))
        {
            return;
        }

        _initialized = true;
        _lastValue = Value;
        var fallback = DefaultDialCode ?? (Countries ?? PhoneCountry.Defaults).FirstOrDefault()?.DialCode ?? "+1";
        if (string.IsNullOrWhiteSpace(Value))
        {
            _dial = _dial.Length > 0 ? _dial : fallback;
            _digits = string.Empty;
            return;
        }

        var text = Value.Trim();
        var space = text.IndexOf(' ');
        if (text.StartsWith('+') && space > 0)
        {
            _dial = text[..space];
            _digits = OnlyDigits(text[(space + 1)..]);
        }
        else
        {
            _dial = fallback;
            _digits = OnlyDigits(text);
        }
    }

    private Task OnNumberInput(ChangeEventArgs e)
    {
        _digits = OnlyDigits(e.Value?.ToString());
        return CommitAsync();
    }

    private Task OnCountryChanged(ChangeEventArgs e)
    {
        _dial = e.Value?.ToString() ?? _dial;
        return CommitAsync();
    }

    private Task CommitAsync()
    {
        var value = _digits.Length == 0 ? null : $"{_dial} {_digits}";
        _lastValue = value;
        return SetValueAsync(value);
    }

    private static string OnlyDigits(string? text) =>
        string.IsNullOrEmpty(text) ? string.Empty : new string(text.Where(char.IsAsciiDigit).ToArray());
}
