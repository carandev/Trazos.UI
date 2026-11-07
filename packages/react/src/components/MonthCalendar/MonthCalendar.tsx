import { useState } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './MonthCalendar.css';

/** Mirrors `Trazos.UI.Components.CalendarItemTone`. */
export type CalendarItemTone = 'olive' | 'lavender' | 'gold' | 'wine' | 'sky' | 'neutral';

/** Day of the week as returned by `Date.prototype.getDay()` (Sunday = 0), like .NET `DayOfWeek`. */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface MonthCalendarProps<T> extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** Items to show in the calendar. */
  items?: readonly T[];
  /** Start date and time of an item (local time). */
  startSelector: (item: T) => Date;
  /** End date and time of an item (local time). An end at exactly midnight does not occupy that day. */
  endSelector: (item: T) => Date;
  /** Visible title of an item. */
  titleSelector: (item: T) => string;
  /** Color tone of an item. Defaults to olive. */
  toneSelector?: (item: T) => CalendarItemTone;
  /** Controlled visible month (normalized to the first day of the month). */
  month?: Date;
  /** Initial visible month when uncontrolled. Defaults to the month of `today`. */
  defaultMonth?: Date;
  /** Called with the first day of the new visible month. */
  onMonthChange?: (month: Date) => void;
  /** Controlled selected day (`null` for none). */
  selectedDate?: Date | null;
  /** Initial selected day when uncontrolled. */
  defaultSelectedDate?: Date | null;
  /** Called with the selected day (local midnight). */
  onSelectedDateChange?: (date: Date) => void;
  /** Called when an item chip is clicked. */
  onItemClick?: (item: T) => void;
  /** First day of the week. Defaults to Monday. */
  firstDayOfWeek?: DayOfWeek;
  /** Maximum visible items per day before showing "+N más". */
  maxItemsPerDay?: number;
  /** Dims the grid while data loads. */
  loading?: boolean;
  /** Extra content in the toolbar (filters, buttons). */
  toolbarContent?: ReactNode;
  /** Month names (12 items, January first). */
  monthNames?: readonly string[];
  /** Short day names (7 items, Sunday first). */
  dayNames?: readonly string[];
  todayText?: string;
  previousMonthText?: string;
  nextMonthText?: string;
  /** Overflow button text. `{0}` is the hidden count. */
  moreTextFormat?: string;
  /** The current day. Defaults to the system date; pass it to make rendering deterministic. */
  today?: Date;
}

const DAYS_PER_WEEK = 7;

const defaultMonthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// Ordered like Date.getDay() (Sunday = 0).
const defaultDayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/** Local midnight of the given date. */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function addMonths(month: Date, months: number): Date {
  return new Date(month.getFullYear(), month.getMonth() + months, 1);
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isMidnight(date: Date): boolean {
  return date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0 && date.getMilliseconds() === 0;
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/** Normalizes a date to the first day of its month (local midnight). */
export function firstOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * First visible day of the grid for a month (it may belong to the previous month).
 * Useful to ask the server only for the range that will be rendered.
 */
export function getGridStart(month: Date, firstDayOfWeek: DayOfWeek = 1): Date {
  const first = firstOfMonth(month);
  const offset = (first.getDay() - firstDayOfWeek + DAYS_PER_WEEK) % DAYS_PER_WEEK;
  return addDays(first, -offset);
}

/** The day after the last visible day of the grid for a month (exclusive). */
export function getGridEndExclusive(month: Date, firstDayOfWeek: DayOfWeek = 1): Date {
  const first = firstOfMonth(month);
  const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const start = getGridStart(month, firstDayOfWeek);
  // Days from the grid start to the end of the month (inclusive).
  const totalDays = Math.round((first.getTime() - start.getTime()) / 86_400_000) + lastDay;
  const weeks = Math.ceil(totalDays / DAYS_PER_WEEK);
  return addDays(start, weeks * DAYS_PER_WEEK);
}

function buildWeeks(gridStart: Date, gridEnd: Date): Date[][] {
  const weeks: Date[][] = [];
  let cursor = gridStart;
  while (cursor < gridEnd) {
    const week: Date[] = [];
    for (let i = 0; i < DAYS_PER_WEEK; i++) {
      week.push(cursor);
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function indexItems<T>(
  items: readonly T[],
  startSelector: (item: T) => Date,
  endSelector: (item: T) => Date,
  gridStart: Date,
  gridEnd: Date,
): Map<string, T[]> {
  const index = new Map<string, T[]>();
  const sorted = [...items].sort((a, b) => startSelector(a).getTime() - startSelector(b).getTime());

  for (const item of sorted) {
    const startDay = startOfDay(startSelector(item));
    const end = endSelector(item);
    let endDay = startOfDay(end);

    // An item that ends exactly at midnight does not occupy the next day.
    if (isMidnight(end) && endDay > startDay) {
      endDay = addDays(endDay, -1);
    }

    const from = startDay < gridStart ? gridStart : startDay;
    const to = endDay >= gridEnd ? addDays(gridEnd, -1) : endDay;

    for (let day = from; day <= to; day = addDays(day, 1)) {
      const key = dayKey(day);
      const list = index.get(key) ?? [];
      list.push(item);
      index.set(key, list);
    }
  }

  return index;
}

function formatTime(value: Date): string {
  const hours = value.getHours();
  const minutes = value.getMinutes();
  const hour = hours % 12 === 0 ? 12 : hours % 12;
  const suffix = hours < 12 ? 'a' : 'p';
  return minutes === 0 ? `${hour}${suffix}` : `${hour}:${String(minutes).padStart(2, '0')}${suffix}`;
}

/**
 * Generic month calendar. Renders items on every day they span, lets the user
 * select a day and navigate between months. On small screens items are
 * summarized as colored dots to keep the grid readable.
 */
export function MonthCalendar<T>({
  items = [],
  startSelector,
  endSelector,
  titleSelector,
  toneSelector,
  month,
  defaultMonth,
  onMonthChange,
  selectedDate,
  defaultSelectedDate = null,
  onSelectedDateChange,
  onItemClick,
  firstDayOfWeek = 1,
  maxItemsPerDay = 3,
  loading = false,
  toolbarContent,
  monthNames = defaultMonthNames,
  dayNames = defaultDayNames,
  todayText = 'Hoy',
  previousMonthText = 'Mes anterior',
  nextMonthText = 'Mes siguiente',
  moreTextFormat = '+{0} más',
  today: todayProp,
  className,
  ...rest
}: MonthCalendarProps<T>) {
  const today = startOfDay(todayProp ?? new Date());

  const [internalMonth, setInternalMonth] = useState(() => firstOfMonth(defaultMonth ?? today));
  const [internalSelected, setInternalSelected] = useState<Date | null>(() =>
    defaultSelectedDate ? startOfDay(defaultSelectedDate) : null,
  );

  const visibleMonth = firstOfMonth(month ?? internalMonth);
  const selectedRaw = selectedDate !== undefined ? selectedDate : internalSelected;
  const selected = selectedRaw ? startOfDay(selectedRaw) : null;

  const gridStart = getGridStart(visibleMonth, firstDayOfWeek);
  const gridEnd = getGridEndExclusive(visibleMonth, firstDayOfWeek);
  const weeks = buildWeeks(gridStart, gridEnd);
  const itemsByDay = indexItems(items, startSelector, endSelector, gridStart, gridEnd);

  const monthTitle = `${monthNames[visibleMonth.getMonth()] ?? ''} ${visibleMonth.getFullYear()}`;
  const isCurrentMonthAndTodaySelected =
    isSameDay(visibleMonth, firstOfMonth(today)) && (selected === null || isSameDay(selected, today));
  const orderedDayNames = Array.from(
    { length: DAYS_PER_WEEK },
    (_, i) => dayNames[(firstDayOfWeek + i) % DAYS_PER_WEEK] ?? '',
  );

  const toneOf = (item: T): CalendarItemTone => toneSelector?.(item) ?? 'olive';

  const dayAriaLabel = (day: Date, count: number) => {
    const label = `${dayNames[day.getDay()] ?? ''} ${day.getDate()} de ${monthNames[day.getMonth()] ?? ''} de ${day.getFullYear()}`;
    if (count === 0) return label;
    return count === 1 ? `${label}, 1 evento` : `${label}, ${count} eventos`;
  };

  const changeMonth = (next: Date) => {
    if (isSameDay(next, visibleMonth)) return;
    if (month === undefined) setInternalMonth(next);
    onMonthChange?.(next);
  };

  const selectDay = (day: Date) => {
    if (selectedDate === undefined) setInternalSelected(day);
    onSelectedDateChange?.(day);
    if (day.getMonth() !== visibleMonth.getMonth() || day.getFullYear() !== visibleMonth.getFullYear()) {
      changeMonth(firstOfMonth(day));
    }
  };

  const goToToday = () => {
    if (selectedDate === undefined) setInternalSelected(today);
    onSelectedDateChange?.(today);
    changeMonth(firstOfMonth(today));
  };

  return (
    <div {...rest} className={cx('trazos-calendar', loading && 'trazos-calendar--loading', className)}>
      <div className="trazos-calendar-toolbar">
        <h2 className="trazos-calendar-title" aria-live="polite">
          {monthTitle}
        </h2>

        <div className="trazos-calendar-nav">
          {toolbarContent != null && <div className="trazos-calendar-extra">{toolbarContent}</div>}
          <button
            type="button"
            className="trazos-calendar-today"
            onClick={goToToday}
            disabled={isCurrentMonthAndTodaySelected}
          >
            {todayText}
          </button>
          <div className="trazos-calendar-arrows">
            <button
              type="button"
              className="trazos-calendar-arrow"
              onClick={() => { changeMonth(addMonths(visibleMonth, -1)); }}
              aria-label={previousMonthText}
              title={previousMonthText}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              type="button"
              className="trazos-calendar-arrow"
              onClick={() => { changeMonth(addMonths(visibleMonth, 1)); }}
              aria-label={nextMonthText}
              title={nextMonthText}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="trazos-calendar-grid" role="grid" aria-label={monthTitle}>
        <div className="trazos-calendar-weekdays" role="row">
          {orderedDayNames.map((dayName, i) => (
            <div key={i} className="trazos-calendar-weekday" role="columnheader">
              {dayName}
            </div>
          ))}
        </div>

        {weeks.map((week) => (
          <div key={dayKey(week[0] ?? gridStart)} className="trazos-calendar-week" role="row">
            {week.map((day) => {
              const dayItems = itemsByDay.get(dayKey(day)) ?? [];
              const isOutside = day.getMonth() !== visibleMonth.getMonth();
              const isToday = isSameDay(day, today);
              const isSelected = selected !== null && isSameDay(selected, day);

              return (
                <div
                  key={dayKey(day)}
                  className={cx(
                    'trazos-calendar-day',
                    isOutside && 'trazos-calendar-day-outside',
                    isToday && 'trazos-calendar-day-today',
                    isSelected && 'trazos-calendar-day-selected',
                  )}
                  role="gridcell"
                  aria-selected={isSelected}
                >
                  <button
                    type="button"
                    className="trazos-calendar-day-btn"
                    aria-label={dayAriaLabel(day, dayItems.length)}
                    onClick={() => { selectDay(day); }}
                  >
                    <span className="trazos-calendar-day-number">{day.getDate()}</span>
                    {dayItems.length > 0 && (
                      <span className="trazos-calendar-dots" aria-hidden="true">
                        {dayItems.slice(0, 3).map((item, i) => (
                          <span key={i} className={`trazos-calendar-dot trazos-calendar-tone-${toneOf(item)}`} />
                        ))}
                      </span>
                    )}
                  </button>

                  {dayItems.length > 0 && (
                    <ul className="trazos-calendar-chips">
                      {dayItems.slice(0, maxItemsPerDay).map((item, i) => {
                        const start = startSelector(item);
                        const showTime = isSameDay(start, day) && !isMidnight(start);
                        return (
                          <li key={i}>
                            <button
                              type="button"
                              className={`trazos-calendar-chip trazos-calendar-tone-${toneOf(item)}`}
                              title={titleSelector(item)}
                              onClick={(event) => {
                                event.stopPropagation();
                                onItemClick?.(item);
                              }}
                            >
                              {showTime && <span className="trazos-calendar-chip-time">{formatTime(start)}</span>}
                              <span className="trazos-calendar-chip-title">{titleSelector(item)}</span>
                            </button>
                          </li>
                        );
                      })}
                      {dayItems.length > maxItemsPerDay && (
                        <li>
                          <button type="button" className="trazos-calendar-more" onClick={() => { selectDay(day); }}>
                            {moreTextFormat.replace('{0}', String(dayItems.length - maxItemsPerDay))}
                          </button>
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
