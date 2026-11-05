import { Autocomplete, MonthCalendar, type CalendarItemTone } from '@carandev/trazos-ui';
import { useState } from 'react';
import { Demo } from '../Demo';

interface City {
  id: number;
  name: string;
  country: string;
}

const cities: City[] = [
  { id: 1, name: 'Bogotá', country: 'Colombia' },
  { id: 2, name: 'Barcelona', country: 'Spain' },
  { id: 3, name: 'Buenos Aires', country: 'Argentina' },
  { id: 4, name: 'Lima', country: 'Peru' },
  { id: 5, name: 'Lisbon', country: 'Portugal' },
  { id: 6, name: 'Mexico City', country: 'Mexico' },
  { id: 7, name: 'Medellín', country: 'Colombia' },
];

// Simulates an API call; the signal aborts stale requests.
function searchCities(query: string, signal: AbortSignal): Promise<City[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      resolve(cities.filter((c) => c.name.toLowerCase().includes(q)));
    }, 400);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

export function AutocompletePage() {
  const [city, setCity] = useState<City | null>(null);
  return (
    <>
      <Demo
        title="Async search"
        description={`Type at least 2 letters (try "li"). Selected: ${city?.name ?? 'none'}`}
        code={`<Autocomplete<City> label="City" searchFn={searchCities} itemText={(c) => c.name}\n  selectedItem={city} onSelectedItemChange={setCity} />`}
      >
        <div className="pg-stack">
          <Autocomplete<City>
            label="City"
            placeholder="Search a city"
            searchFn={searchCities}
            itemText={(c) => c.name}
            renderItem={(c) => (
              <span>
                <strong>{c.name}</strong> · {c.country}
              </span>
            )}
            selectedItem={city}
            onSelectedItemChange={setCity}
          />
        </div>
      </Demo>
      <Demo title="Clear on select" description="Picks an item and resets the field, useful for adding tags.">
        <div className="pg-stack">
          <Autocomplete<City> label="Add a city" clearOnSelect searchFn={searchCities} itemText={(c) => c.name} />
        </div>
      </Demo>
    </>
  );
}

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  tone: CalendarItemTone;
}

function at(dayOffset: number, hours: number, durationHours: number): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, hours);
  return { start, end: new Date(start.getTime() + durationHours * 3_600_000) };
}

const events: CalendarEvent[] = [
  { title: 'Team sync', ...at(0, 9, 1), tone: 'olive' },
  { title: 'Product demo', ...at(0, 15, 1), tone: 'lavender' },
  { title: 'Workshop', ...at(2, 10, 3), tone: 'gold' },
  { title: 'Release', ...at(5, 18, 1), tone: 'wine' },
  { title: 'Offsite', ...at(8, 8, 50), tone: 'sky' },
  { title: 'Retro', ...at(-3, 16, 1), tone: 'neutral' },
];

export function MonthCalendarPage() {
  const [selected, setSelected] = useState<Date | null>(null);
  const [clicked, setClicked] = useState('none');
  return (
    <Demo
      title="Events by tone"
      description={`Selected: ${selected?.toDateString() ?? 'none'} · Last item clicked: ${clicked}`}
      code={`<MonthCalendar items={events} startSelector={(e) => e.start} endSelector={(e) => e.end}\n  titleSelector={(e) => e.title} toneSelector={(e) => e.tone} />`}
    >
      <MonthCalendar
        items={events}
        startSelector={(e) => e.start}
        endSelector={(e) => e.end}
        titleSelector={(e) => e.title}
        toneSelector={(e) => e.tone}
        selectedDate={selected}
        onSelectedDateChange={setSelected}
        onItemClick={(e) => {
          setClicked(e.title);
        }}
      />
    </Demo>
  );
}
