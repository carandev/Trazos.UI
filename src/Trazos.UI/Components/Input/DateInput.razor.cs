using System;
using System.Globalization;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

/// <summary>
/// Date field for <c>DateOnly</c>, <c>DateTime</c> and their nullable forms,
/// built on the native date picker, so it follows the browser's locale and
/// works with the keyboard and mobile pickers. <see cref="MonthOnly"/> turns it
/// into a month picker that binds the first day of the month. A
/// <c>DateTime</c> keeps its time of day when the date changes.
/// Works standalone or bound inside an EditForm.
/// </summary>
public partial class DateInput<TValue> : FormFieldBase<TValue>
{
    private static readonly Type UnderlyingType = Nullable.GetUnderlyingType(typeof(TValue)) ?? typeof(TValue);

    public DateInput() : base("trazos-date")
    {
        if (UnderlyingType != typeof(DateOnly) && UnderlyingType != typeof(DateTime))
        {
            throw new InvalidOperationException(
                $"DateInput does not support {typeof(TValue)}. Use DateOnly or DateTime, or their nullable forms.");
        }

        ParseErrorMessage = "Enter a valid date.";
    }

    /// <summary>Picks a month instead of a day. The bound value is the first day of that month.</summary>
    [Parameter]
    public bool MonthOnly { get; set; }

    /// <summary>Earliest date the picker offers.</summary>
    [Parameter]
    public DateOnly? Min { get; set; }

    /// <summary>Latest date the picker offers.</summary>
    [Parameter]
    public DateOnly? Max { get; set; }

    [Parameter]
    public bool ReadOnly { get; set; }

    [Parameter]
    public RenderFragment? LeadingIcon { get; set; }

    [Parameter]
    public RenderFragment? TrailingIcon { get; set; }

    private string Format => MonthOnly ? "yyyy-MM" : "yyyy-MM-dd";

    private string? FormatDate(DateOnly? date) => date?.ToString(Format, CultureInfo.InvariantCulture);

    protected override string? FormatValueAsString(TValue value) => value switch
    {
        DateOnly date => FormatDate(date),
        DateTime dateTime => FormatDate(DateOnly.FromDateTime(dateTime)),
        _ => string.Empty,
    };

    protected override bool TryParseValueFromString(string? text, out TValue value)
    {
        value = default!;
        if (string.IsNullOrWhiteSpace(text))
        {
            return default(TValue) is null;
        }

        if (!DateOnly.TryParseExact(text, Format, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
        {
            return false;
        }

        if (UnderlyingType == typeof(DateOnly))
        {
            value = (TValue)(object)date;
            return true;
        }

        var time = Value is DateTime current ? current.TimeOfDay : TimeSpan.Zero;
        var kind = Value is DateTime previous ? previous.Kind : DateTimeKind.Unspecified;
        value = (TValue)(object)DateTime.SpecifyKind(date.ToDateTime(TimeOnly.FromTimeSpan(time)), kind);
        return true;
    }

    private Task OnChanged(ChangeEventArgs e) => SetValueFromStringAsync(e.Value?.ToString());
}
