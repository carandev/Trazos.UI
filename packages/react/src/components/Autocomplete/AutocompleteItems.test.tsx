import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Autocomplete } from './index';

const cities = ['Bogotá', 'Medellín', 'Cali', 'Cartagena'];
const text = (s: string) => s;

function setup() {
  return userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
}

async function flush(ms = 300) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

// The first fake-timer typing test warms up user-event; allow for a loaded machine.
describe('Autocomplete with preloaded items', { timeout: 15_000 }, () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('jest', { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('filters the items in memory by item text, case-insensitive contains', async () => {
    const onChange = vi.fn();
    const user = setup();
    render(<Autocomplete label="City" items={cities} itemText={text} minChars={1} onSelectedItemChange={onChange} />);
    await user.type(screen.getByRole('combobox'), 'MED');
    await flush();
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Medellín']);
    await user.click(screen.getByRole('option'));
    expect(onChange).toHaveBeenCalledWith('Medellín');
  });

  it('matches inside the text and keeps the item order', async () => {
    const user = setup();
    render(<Autocomplete label="City" items={cities} itemText={text} minChars={1} />);
    await user.type(screen.getByRole('combobox'), 'A');
    await flush();
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Cali', 'Cartagena']);
  });

  it('shows at most maxResults items (default 50)', async () => {
    const many = Array.from({ length: 60 }, (_, i) => `Item ${i}`);
    const user = setup();
    const { rerender } = render(<Autocomplete label="Item" items={many} itemText={text} />);
    await user.type(screen.getByRole('combobox'), 'item');
    await flush();
    expect(screen.getAllByRole('option')).toHaveLength(50);

    rerender(<Autocomplete label="Item" items={many} itemText={text} maxResults={5} />);
    await user.type(screen.getByRole('combobox'), ' ');
    await flush();
    expect(screen.getAllByRole('option')).toHaveLength(5);
  });

  it('opens the whole list on focus when minChars is 0', async () => {
    const user = setup();
    render(<Autocomplete label="City" items={cities} itemText={text} minChars={0} />);
    const input = screen.getByRole('combobox');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.click(input);
    await flush(0);
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(cities);
  });

  it('does not open on focus with the default minChars', async () => {
    const user = setup();
    render(<Autocomplete label="City" items={cities} itemText={text} />);
    await user.click(screen.getByRole('combobox'));
    await flush();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('prefers searchFn over items', async () => {
    const search = vi.fn(() => ['Remote']);
    const user = setup();
    render(<Autocomplete label="City" items={cities} searchFn={search} itemText={text} />);
    await user.type(screen.getByRole('combobox'), 'ca');
    await flush();
    expect(search).toHaveBeenCalledWith('ca', expect.any(AbortSignal));
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Remote']);
  });

  it('keeps the previous async search behavior: minChars 2, debounce, latest query, no search on focus', async () => {
    const terms: string[] = [];
    const search = (term: string) => {
      terms.push(term);
      return Promise.resolve(['Bogotá']);
    };
    const user = setup();
    render(<Autocomplete label="City" searchFn={search} itemText={text} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await flush();
    expect(terms).toEqual([]);
    await user.type(input, 'b');
    await flush();
    expect(terms).toEqual([]);
    await user.type(input, 'o');
    await flush(299);
    expect(terms).toEqual([]);
    await flush(1);
    expect(terms).toEqual(['bo']);
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Bogotá']);
    expect(screen.getByRole('listbox')).not.toHaveTextContent('Sin resultados');
  });
});
