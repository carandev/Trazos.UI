import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { MonthCalendar, getGridEndExclusive, getGridStart } from './index';
import type { CalendarItemTone, MonthCalendarProps } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  tone?: CalendarItemTone;
}

// Wednesday, 4 November 2026.
const today = new Date(2026, 10, 4);
const november = new Date(2026, 10, 1);

const baseProps: MonthCalendarProps<CalendarEvent> = {
  startSelector: (e) => e.start,
  endSelector: (e) => e.end,
  titleSelector: (e) => e.title,
  today,
  defaultMonth: november,
};

function renderCalendar(props: Partial<MonthCalendarProps<CalendarEvent>> = {}) {
  return render(<MonthCalendar<CalendarEvent> {...baseProps} {...props} />);
}

function dayCells(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>('.trazos-calendar-day'));
}

function cellFor(label: RegExp | string) {
  const button = screen.getByRole('button', { name: label });
  const cell = button.closest<HTMLElement>('.trazos-calendar-day');
  if (cell === null) throw new Error('day cell not found');
  return cell;
}

describe('getGridStart / getGridEndExclusive', () => {
  it('cover whole weeks starting on Monday by default', () => {
    // 1 Nov 2026 is a Sunday: grid starts Monday 26 Oct and ends (exclusive) Monday 7 Dec.
    expect(getGridStart(new Date(2026, 10, 15))).toEqual(new Date(2026, 9, 26));
    expect(getGridEndExclusive(new Date(2026, 10, 15))).toEqual(new Date(2026, 11, 7));
  });

  it('honour a Sunday week start', () => {
    expect(getGridStart(november, 0)).toEqual(new Date(2026, 10, 1));
    expect(getGridEndExclusive(november, 0)).toEqual(new Date(2026, 11, 6));
  });
});

describe('MonthCalendar', () => {
  it('renders the Spanish month title, Monday-first weekdays and full weeks', () => {
    const { container } = renderCalendar();
    expect(container.firstElementChild).toHaveClass('trazos-calendar');
    expect(screen.getByRole('heading', { level: 2, name: 'Noviembre 2026' })).toHaveClass('trazos-calendar-title');
    const grid = screen.getByRole('grid', { name: 'Noviembre 2026' });
    expect(within(grid).getAllByRole('columnheader').map((h) => h.textContent)).toEqual([
      'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom',
    ]);
    // 6 weeks x 7 days.
    expect(dayCells(container)).toHaveLength(42);
    expect(container.querySelectorAll('.trazos-calendar-week')).toHaveLength(6);
    expect(dayCells(container)[0]).toHaveClass('is-outside');
    expect(dayCells(container)[0]).toHaveTextContent('26');
  });

  it('starts the week on Sunday and accepts custom names', () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const { container } = renderCalendar({ firstDayOfWeek: 0, monthNames, dayNames });
    expect(screen.getByRole('heading', { name: 'Nov 2026' })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')[0]).toHaveTextContent('Sun');
    expect(dayCells(container)).toHaveLength(35);
    expect(dayCells(container)[0]).not.toHaveClass('is-outside');
  });

  it('marks today and gives every day button an accessible name with the full date', () => {
    renderCalendar();
    const todayCell = cellFor('Mié 4 de Noviembre de 2026');
    expect(todayCell).toHaveClass('is-today');
    expect(todayCell).toHaveAttribute('role', 'gridcell');
    expect(todayCell).toHaveAttribute('aria-selected', 'false');
    expect(cellFor('Lun 26 de Octubre de 2026')).toHaveClass('is-outside');
  });

  it('normalises the visible month and keeps time of day out of comparisons', () => {
    renderCalendar({ defaultMonth: new Date(2026, 10, 20, 23, 59), today: new Date(2026, 10, 4, 18, 30) });
    expect(screen.getByRole('heading', { name: 'Noviembre 2026' })).toBeInTheDocument();
    expect(cellFor('Mié 4 de Noviembre de 2026')).toHaveClass('is-today');
  });

  it('selects a day (uncontrolled) and emits the date', async () => {
    const onSelectedDateChange = vi.fn();
    const onMonthChange = vi.fn();
    renderCalendar({ onSelectedDateChange, onMonthChange });
    await userEvent.click(screen.getByRole('button', { name: 'Mar 10 de Noviembre de 2026' }));
    expect(onSelectedDateChange).toHaveBeenCalledWith(new Date(2026, 10, 10));
    expect(onMonthChange).not.toHaveBeenCalled();
    const cell = cellFor('Mar 10 de Noviembre de 2026');
    expect(cell).toHaveClass('is-selected');
    expect(cell).toHaveAttribute('aria-selected', 'true');
  });

  it('moves to the month of an outside day when it is selected', async () => {
    const onMonthChange = vi.fn();
    renderCalendar({ onMonthChange });
    await userEvent.click(screen.getByRole('button', { name: 'Lun 26 de Octubre de 2026' }));
    expect(onMonthChange).toHaveBeenCalledWith(new Date(2026, 9, 1));
    expect(screen.getByRole('heading', { name: 'Octubre 2026' })).toBeInTheDocument();
    expect(cellFor('Lun 26 de Octubre de 2026')).toHaveClass('is-selected');
  });

  it('navigates months with the Spanish-labelled arrows', async () => {
    const onMonthChange = vi.fn();
    renderCalendar({ onMonthChange });
    const previous = screen.getByRole('button', { name: 'Mes anterior' });
    const next = screen.getByRole('button', { name: 'Mes siguiente' });
    expect(previous).toHaveAttribute('title', 'Mes anterior');
    expect(next).toHaveClass('trazos-calendar-arrow');
    await userEvent.click(next);
    expect(onMonthChange).toHaveBeenLastCalledWith(new Date(2026, 11, 1));
    expect(screen.getByRole('heading', { name: 'Diciembre 2026' })).toBeInTheDocument();
    await userEvent.click(next);
    expect(onMonthChange).toHaveBeenLastCalledWith(new Date(2027, 0, 1));
    expect(screen.getByRole('heading', { name: 'Enero 2027' })).toBeInTheDocument();
    await userEvent.click(previous);
    await userEvent.click(previous);
    await userEvent.click(previous);
    expect(screen.getByRole('heading', { name: 'Octubre 2026' })).toBeInTheDocument();
  });

  it('goes to today and disables "Hoy" when today is already shown and selected', async () => {
    const onSelectedDateChange = vi.fn();
    const onMonthChange = vi.fn();
    renderCalendar({ onSelectedDateChange, onMonthChange });
    const todayButton = screen.getByRole('button', { name: 'Hoy' });
    expect(todayButton).toHaveClass('trazos-calendar-today');
    expect(todayButton).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Mes siguiente' }));
    expect(todayButton).toBeEnabled();
    onMonthChange.mockClear();
    await userEvent.click(todayButton);
    expect(onSelectedDateChange).toHaveBeenCalledWith(new Date(2026, 10, 4));
    expect(onMonthChange).toHaveBeenCalledWith(new Date(2026, 10, 1));
    expect(screen.getByRole('heading', { name: 'Noviembre 2026' })).toBeInTheDocument();
    expect(todayButton).toBeDisabled();
  });

  it('enables "Hoy" when another day of the current month is selected', () => {
    renderCalendar({ defaultSelectedDate: new Date(2026, 10, 9), todayText: 'Today' });
    expect(screen.getByRole('button', { name: 'Today' })).toBeEnabled();
  });

  it('is controlled through month and selectedDate', async () => {
    const onSelectedDateChange = vi.fn();
    const onMonthChange = vi.fn();
    const { rerender } = render(
      <MonthCalendar<CalendarEvent>
        {...baseProps}
        defaultMonth={undefined}
        month={november}
        selectedDate={new Date(2026, 10, 9)}
        onSelectedDateChange={onSelectedDateChange}
        onMonthChange={onMonthChange}
      />,
    );
    expect(cellFor('Lun 9 de Noviembre de 2026')).toHaveClass('is-selected');
    await userEvent.click(screen.getByRole('button', { name: 'Mes siguiente' }));
    expect(onMonthChange).toHaveBeenCalledWith(new Date(2026, 11, 1));
    expect(screen.getByRole('heading', { name: 'Noviembre 2026' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Mar 10 de Noviembre de 2026' }));
    expect(onSelectedDateChange).toHaveBeenCalledWith(new Date(2026, 10, 10));
    expect(cellFor('Mar 10 de Noviembre de 2026')).not.toHaveClass('is-selected');
    rerender(
      <MonthCalendar<CalendarEvent> {...baseProps} defaultMonth={undefined} month={new Date(2026, 11, 1)} selectedDate={null} />,
    );
    expect(screen.getByRole('heading', { name: 'Diciembre 2026' })).toBeInTheDocument();
    expect(document.querySelector('.is-selected')).toBeNull();
  });

  it('renders item chips with time, tone, dots and the event count in the day name', async () => {
    const onItemClick = vi.fn();
    const onSelectedDateChange = vi.fn();
    const items: CalendarEvent[] = [
      { id: 2, title: 'Lunch', start: new Date(2026, 10, 10, 13, 30), end: new Date(2026, 10, 10, 14, 0), tone: 'wine' },
      { id: 1, title: 'Standup', start: new Date(2026, 10, 10, 9, 0), end: new Date(2026, 10, 10, 9, 15) },
      { id: 3, title: 'Holiday', start: new Date(2026, 10, 10), end: new Date(2026, 10, 11) },
    ];
    const { container } = renderCalendar({
      items,
      toneSelector: (e) => e.tone ?? 'olive',
      onItemClick,
      onSelectedDateChange,
    });
    const cell = cellFor('Mar 10 de Noviembre de 2026, 3 eventos');
    const chips = within(cell).getAllByRole('button', { name: /Standup|Lunch|Holiday/ });
    expect(chips.map((c) => c.textContent)).toEqual(['Holiday', '9aStandup', '1:30pLunch']);
    expect(chips[1]).toHaveClass('trazos-calendar-chip', 'tone-olive');
    expect(chips[1]).toHaveAttribute('title', 'Standup');
    expect(chips[2]).toHaveClass('tone-wine');
    expect(chips[1]?.querySelector('.trazos-calendar-chip-time')).toHaveTextContent('9a');
    expect(chips[0]?.querySelector('.trazos-calendar-chip-time')).toBeNull();
    const dots = cell.querySelectorAll('.trazos-calendar-dots .trazos-calendar-dot');
    expect(Array.from(dots).map((d) => d.className)).toEqual([
      'trazos-calendar-dot tone-olive',
      'trazos-calendar-dot tone-olive',
      'trazos-calendar-dot tone-wine',
    ]);
    // A midnight end does not spill into the next day.
    expect(screen.getByRole('button', { name: 'Mié 11 de Noviembre de 2026' })).toBeInTheDocument();
    const [, standup] = chips;
    if (standup === undefined) throw new Error('missing chip');
    await userEvent.click(standup);
    expect(onItemClick).toHaveBeenCalledWith(items[1]);
    expect(onSelectedDateChange).not.toHaveBeenCalled();
    expect(container.querySelector('.trazos-calendar-chips')).toBeInTheDocument();
  });

  it('spreads multi-day items across days, clipped to the grid, and says "1 evento"', () => {
    const items: CalendarEvent[] = [
      { id: 1, title: 'Trip', start: new Date(2026, 9, 1), end: new Date(2026, 9, 27, 12, 0) },
    ];
    renderCalendar({ items });
    expect(screen.getByRole('button', { name: 'Lun 26 de Octubre de 2026, 1 evento' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mar 27 de Octubre de 2026, 1 evento' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mié 28 de Octubre de 2026' })).toBeInTheDocument();
  });

  it('limits visible chips and shows the "+N más" button that selects the day', async () => {
    const onSelectedDateChange = vi.fn();
    const items: CalendarEvent[] = [1, 2, 3, 4, 5].map((id) => ({
      id,
      title: `E${id}`,
      start: new Date(2026, 10, 12, 8 + id),
      end: new Date(2026, 10, 12, 9 + id),
    }));
    const { rerender } = renderCalendar({ items, onSelectedDateChange });
    const cell = cellFor(/Jue 12 de Noviembre de 2026/);
    expect(cell.querySelectorAll('.trazos-calendar-chip')).toHaveLength(3);
    const more = within(cell).getByRole('button', { name: '+2 más' });
    expect(more).toHaveClass('trazos-calendar-more');
    await userEvent.click(more);
    expect(onSelectedDateChange).toHaveBeenCalledWith(new Date(2026, 10, 12));
    rerender(
      <MonthCalendar<CalendarEvent> {...baseProps} items={items} maxItemsPerDay={4} moreTextFormat="and {0} more" />,
    );
    expect(within(cellFor(/Jue 12/)).getByRole('button', { name: 'and 1 more' })).toBeInTheDocument();
  });

  it('renders toolbar content and the loading modifier', () => {
    const { container } = renderCalendar({ loading: true, toolbarContent: <span>Filters</span> });
    expect(container.firstElementChild).toHaveClass('trazos-calendar--loading');
    expect(container.querySelector('.trazos-calendar-extra')).toHaveTextContent('Filters');
  });

  it('defaults "today" to the system date', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2027, 1, 14, 10, 0));
    try {
      render(<MonthCalendar<CalendarEvent> {...baseProps} today={undefined} defaultMonth={undefined} />);
      expect(screen.getByRole('heading', { name: 'Febrero 2027' })).toBeInTheDocument();
      expect(cellFor('Dom 14 de Febrero de 2027')).toHaveClass('is-today');
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps day buttons reachable with the keyboard', async () => {
    renderCalendar();
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Mes anterior' })).toHaveFocus();
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Lun 26 de Octubre de 2026' })).toHaveFocus();
  });

  it('forwards the ref, extra classes and native attributes', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = renderCalendar({ ref, className: 'extra', id: 'cal' });
    const root = container.firstElementChild;
    expect(ref.current).toBe(root);
    expect(root).toHaveClass('trazos-calendar', 'extra');
    expect(root).toHaveAttribute('id', 'cal');
  });

  it('has no accessibility violations', async () => {
    const items: CalendarEvent[] = [
      { id: 1, title: 'Standup', start: new Date(2026, 10, 10, 9, 0), end: new Date(2026, 10, 10, 9, 15) },
    ];
    const { container } = renderCalendar({ items, defaultSelectedDate: new Date(2026, 10, 10) });
    await expectNoA11yViolations(container);
  });
});
