import { useState } from 'react';
import { MonthCalendar, firstOfMonth, type CalendarItemTone } from '@carandev/trazos-ui';
import { t } from '../../i18n';

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  tone: CalendarItemTone;
}

// Sample data relative to the displayed month, so the demo always has content.
function buildEvents(month: Date): CalendarEvent[] {
  const at = (day: number, hour: number) => new Date(month.getFullYear(), month.getMonth(), day, hour);

  return [
    { title: t('Team sync', 'Reunión de equipo'), start: at(3, 9), end: at(3, 10), tone: 'olive' },
    { title: t('Design review', 'Revisión de diseño'), start: at(5, 18), end: at(5, 20), tone: 'lavender' },
    { title: t('Team offsite', 'Jornada de equipo'), start: at(9, 8), end: at(11, 17), tone: 'gold' },
    { title: t('Team sync', 'Reunión de equipo'), start: at(10, 9), end: at(10, 10), tone: 'olive' },
    { title: t('Budget review', 'Revisión de presupuesto'), start: at(10, 15), end: at(10, 16), tone: 'wine' },
    { title: t('Customer call', 'Llamada con cliente'), start: at(10, 16), end: at(10, 18), tone: 'sky' },
    { title: t('Workshop', 'Taller'), start: at(10, 19), end: at(10, 20), tone: 'neutral' },
    { title: t('Team sync', 'Reunión de equipo'), start: at(17, 9), end: at(17, 10), tone: 'olive' },
    { title: t('Product demo', 'Demo de producto'), start: at(21, 17), end: at(21, 18), tone: 'lavender' },
    { title: t('Team sync', 'Reunión de equipo'), start: at(24, 9), end: at(24, 10), tone: 'olive' },
  ];
}

export default function Demo() {
  const monthNames = t(
    'January,February,March,April,May,June,July,August,September,October,November,December',
    'Enero,Febrero,Marzo,Abril,Mayo,Junio,Julio,Agosto,Septiembre,Octubre,Noviembre,Diciembre',
  ).split(',');
  // Ordered like Date.getDay(), so the list starts on Sunday.
  const dayNames = t('Sun,Mon,Tue,Wed,Thu,Fri,Sat', 'Dom,Lun,Mar,Mié,Jue,Vie,Sáb').split(',');

  const [month, setMonth] = useState(() => firstOfMonth(new Date()));
  const [events, setEvents] = useState(() => buildEvents(month));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [clicked, setClicked] = useState<CalendarEvent | null>(null);

  return (
    <div className="docs-stack">
      <MonthCalendar
        items={events}
        startSelector={(e) => e.start}
        endSelector={(e) => e.end}
        titleSelector={(e) => e.title}
        toneSelector={(e) => e.tone}
        month={month}
        onMonthChange={(next) => {
          setMonth(next);
          setEvents(buildEvents(next));
        }}
        selectedDate={selectedDay}
        onSelectedDateChange={setSelectedDay}
        onItemClick={setClicked}
        monthNames={monthNames}
        dayNames={dayNames}
        todayText={t('Today', 'Hoy')}
        previousMonthText={t('Previous month', 'Mes anterior')}
        nextMonthText={t('Next month', 'Mes siguiente')}
        moreTextFormat={t('+{0} more', '+{0} más')}
      />

      <p className="docs-demo-output">
        {t('Selected day:', 'Día seleccionado:')}{' '}
        <strong>{selectedDay?.toLocaleDateString('en-CA') ?? t('none', 'ninguno')}</strong>
        {' · '}
        {t('Clicked item:', 'Elemento con clic:')} <strong>{clicked?.title ?? t('none', 'ninguno')}</strong>
      </p>
    </div>
  );
}
