using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;

namespace Trazos.UI.Components;

/// <summary>
/// Calendario mensual genérico. Pinta los elementos en cada día que abarcan,
/// permite seleccionar un día y navegar entre meses. En pantallas pequeñas
/// los elementos se resumen como puntos de color para mantener la cuadrícula legible.
/// </summary>
public partial class MonthCalendar<TItem>
{
    private const int DaysPerWeek = 7;

    private static readonly string[] DefaultMonthNames =
    [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    // Ordenados según DayOfWeek (domingo = 0).
    private static readonly string[] DefaultDayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    private readonly List<List<DateOnly>> _weeks = [];
    private Dictionary<DateOnly, List<TItem>> _itemsByDay = [];

    /// <summary>Elementos a mostrar en el calendario.</summary>
    [Parameter]
    public IEnumerable<TItem> Items { get; set; } = [];

    /// <summary>Obtiene la fecha y hora de inicio de un elemento.</summary>
    [Parameter, EditorRequired]
    public Func<TItem, DateTime> StartSelector { get; set; } = null!;

    /// <summary>Obtiene la fecha y hora de fin de un elemento.</summary>
    [Parameter, EditorRequired]
    public Func<TItem, DateTime> EndSelector { get; set; } = null!;

    /// <summary>Obtiene el título visible de un elemento.</summary>
    [Parameter, EditorRequired]
    public Func<TItem, string> TitleSelector { get; set; } = null!;

    /// <summary>Obtiene el tono de color de un elemento. Por defecto, oliva.</summary>
    [Parameter]
    public Func<TItem, CalendarItemTone>? ToneSelector { get; set; }

    /// <summary>Mes visible. Se normaliza al primer día del mes.</summary>
    [Parameter]
    public DateOnly Month { get; set; } = FirstOfMonth(DateOnly.FromDateTime(DateTime.Today));

    [Parameter]
    public EventCallback<DateOnly> MonthChanged { get; set; }

    /// <summary>Día seleccionado actualmente.</summary>
    [Parameter]
    public DateOnly? SelectedDate { get; set; }

    [Parameter]
    public EventCallback<DateOnly?> SelectedDateChanged { get; set; }

    /// <summary>Se dispara al hacer clic sobre un elemento del calendario.</summary>
    [Parameter]
    public EventCallback<TItem> OnItemClick { get; set; }

    /// <summary>Primer día de la semana. Por defecto, lunes.</summary>
    [Parameter]
    public DayOfWeek FirstDayOfWeek { get; set; } = DayOfWeek.Monday;

    /// <summary>Máximo de elementos visibles por día antes de mostrar "+N más".</summary>
    [Parameter]
    public int MaxItemsPerDay { get; set; } = 3;

    /// <summary>Atenúa la cuadrícula mientras se cargan datos.</summary>
    [Parameter]
    public bool Loading { get; set; }

    /// <summary>Contenido adicional en la barra superior (filtros, botones).</summary>
    [Parameter]
    public RenderFragment? ToolbarContent { get; set; }

    /// <summary>Nombres de los meses (12 elementos, enero primero).</summary>
    [Parameter]
    public IReadOnlyList<string> MonthNames { get; set; } = DefaultMonthNames;

    /// <summary>Nombres cortos de los días (7 elementos, domingo primero).</summary>
    [Parameter]
    public IReadOnlyList<string> DayNames { get; set; } = DefaultDayNames;

    [Parameter]
    public string TodayText { get; set; } = "Hoy";

    [Parameter]
    public string PreviousMonthText { get; set; } = "Mes anterior";

    [Parameter]
    public string NextMonthText { get; set; } = "Mes siguiente";

    /// <summary>Formato del enlace de desbordamiento. {0} es la cantidad oculta.</summary>
    [Parameter]
    public string MoreTextFormat { get; set; } = "+{0} más";

    [Parameter]
    public string? Class { get; set; }

    [Parameter(CaptureUnmatchedValues = true)]
    public Dictionary<string, object>? AdditionalAttributes { get; set; }

    private static DateOnly Today => DateOnly.FromDateTime(DateTime.Today);

    private string MonthTitle => $"{MonthNames[Month.Month - 1]} {Month.Year}";

    private bool IsCurrentMonthAndTodaySelected =>
        Month == FirstOfMonth(Today) && (SelectedDate is null || SelectedDate == Today);

    private IEnumerable<string> OrderedDayNames =>
        Enumerable.Range(0, DaysPerWeek).Select(i => DayNames[((int)FirstDayOfWeek + i) % DaysPerWeek]);

    /// <summary>
    /// Primer día visible de la cuadrícula (puede pertenecer al mes anterior).
    /// </summary>
    public DateOnly GridStart => GetGridStart(Month, FirstDayOfWeek);

    /// <summary>
    /// Día siguiente al último visible de la cuadrícula (exclusivo).
    /// </summary>
    public DateOnly GridEndExclusive => GetGridEndExclusive(Month, FirstDayOfWeek);

    /// <summary>
    /// Calcula el primer día visible de la cuadrícula para un mes dado.
    /// Útil para pedir al servidor solo el rango que se va a pintar.
    /// </summary>
    public static DateOnly GetGridStart(DateOnly month, DayOfWeek firstDayOfWeek = DayOfWeek.Monday)
    {
        var first = FirstOfMonth(month);
        var offset = ((int)first.DayOfWeek - (int)firstDayOfWeek + DaysPerWeek) % DaysPerWeek;
        return first.AddDays(-offset);
    }

    /// <summary>
    /// Calcula el día siguiente al último visible de la cuadrícula para un mes dado.
    /// </summary>
    public static DateOnly GetGridEndExclusive(DateOnly month, DayOfWeek firstDayOfWeek = DayOfWeek.Monday)
    {
        var first = FirstOfMonth(month);
        var last = first.AddMonths(1).AddDays(-1);
        var start = GetGridStart(month, firstDayOfWeek);
        var totalDays = last.DayNumber - start.DayNumber + 1;
        var weeks = (int)Math.Ceiling(totalDays / (double)DaysPerWeek);
        return start.AddDays(weeks * DaysPerWeek);
    }

    /// <summary>Normaliza una fecha al primer día de su mes.</summary>
    public static DateOnly FirstOfMonth(DateOnly date) => new(date.Year, date.Month, 1);

    protected override void OnParametersSet()
    {
        Month = FirstOfMonth(Month);
        BuildWeeks();
        IndexItems();
    }

    private void BuildWeeks()
    {
        _weeks.Clear();
        var cursor = GridStart;
        var end = GridEndExclusive;

        while (cursor < end)
        {
            var week = new List<DateOnly>(DaysPerWeek);
            for (var i = 0; i < DaysPerWeek; i++)
            {
                week.Add(cursor);
                cursor = cursor.AddDays(1);
            }
            _weeks.Add(week);
        }
    }

    private void IndexItems()
    {
        var gridStart = GridStart;
        var gridEnd = GridEndExclusive;
        var index = new Dictionary<DateOnly, List<TItem>>();

        foreach (var item in Items.OrderBy(StartSelector))
        {
            var startDay = DateOnly.FromDateTime(StartSelector(item));
            var end = EndSelector(item);
            var endDay = DateOnly.FromDateTime(end);

            // Un evento que termina exactamente a medianoche no ocupa el día siguiente.
            if (end.TimeOfDay == TimeSpan.Zero && endDay > startDay)
            {
                endDay = endDay.AddDays(-1);
            }

            var from = startDay < gridStart ? gridStart : startDay;
            var to = endDay >= gridEnd ? gridEnd.AddDays(-1) : endDay;

            for (var day = from; day <= to; day = day.AddDays(1))
            {
                if (!index.TryGetValue(day, out var list))
                {
                    list = [];
                    index[day] = list;
                }
                list.Add(item);
            }
        }

        _itemsByDay = index;
    }

    private List<TItem> GetItemsForDay(DateOnly day) =>
        _itemsByDay.TryGetValue(day, out var items) ? items : [];

    private bool ShowTime(TItem item, DateOnly day)
    {
        var start = StartSelector(item);
        return DateOnly.FromDateTime(start) == day && start.TimeOfDay != TimeSpan.Zero;
    }

    private static string FormatTime(DateTime value)
    {
        var hour = value.Hour % 12 == 0 ? 12 : value.Hour % 12;
        var suffix = value.Hour < 12 ? "a" : "p";
        return value.Minute == 0 ? $"{hour}{suffix}" : $"{hour}:{value.Minute:00}{suffix}";
    }

    private string GetToneClass(TItem item)
    {
        var tone = ToneSelector?.Invoke(item) ?? CalendarItemTone.Olive;
        return tone switch
        {
            CalendarItemTone.Lavender => "lavender",
            CalendarItemTone.Gold => "gold",
            CalendarItemTone.Wine => "wine",
            CalendarItemTone.Sky => "sky",
            CalendarItemTone.Neutral => "neutral",
            _ => "olive"
        };
    }

    private string GetDayAriaLabel(DateOnly day, int count)
    {
        var dayName = DayNames[(int)day.DayOfWeek];
        var label = $"{dayName} {day.Day} de {MonthNames[day.Month - 1]}";
        return count switch
        {
            0 => label,
            1 => $"{label}, 1 evento",
            _ => $"{label}, {count} eventos"
        };
    }

    private async Task SelectDayAsync(DateOnly day)
    {
        SelectedDate = day;
        await SelectedDateChanged.InvokeAsync(day);

        if (day.Month != Month.Month || day.Year != Month.Year)
        {
            await ChangeMonthAsync(FirstOfMonth(day));
        }
    }

    private Task ShiftMonthAsync(int delta) => ChangeMonthAsync(Month.AddMonths(delta));

    private async Task GoToTodayAsync()
    {
        SelectedDate = Today;
        await SelectedDateChanged.InvokeAsync(Today);
        await ChangeMonthAsync(FirstOfMonth(Today));
    }

    private async Task ChangeMonthAsync(DateOnly month)
    {
        if (month == Month)
        {
            return;
        }

        Month = month;
        BuildWeeks();
        IndexItems();
        await MonthChanged.InvokeAsync(month);
    }
}
