import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Autocomplete } from './index';
import type { AutocompleteSearchFn } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

interface Fruit {
  id: number;
  name: string;
}

const fruits: Fruit[] = [
  { id: 1, name: 'Apple' },
  { id: 2, name: 'Apricot' },
  { id: 3, name: 'Banana' },
];

const filterFruits: AutocompleteSearchFn<Fruit> = (query) =>
  fruits.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));

const fruitText = (f: Fruit) => f.name;

function setup() {
  return userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTime(ms) });
}

async function flush(ms = 300) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

describe('Autocomplete', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Testing Library only advances fake timers inside its async helpers when it
    // detects Jest; expose the Vitest equivalent so user-event does not hang.
    vi.stubGlobal('jest', { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders a labelled combobox with search icon and closed popup by default', () => {
    const { container } = render(
      <Autocomplete label="Fruit" placeholder="Search…" searchFn={filterFruits} itemText={fruitText} />,
    );
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    expect(input).toHaveClass('trazos-autocomplete-input');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('autocomplete', 'off');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-controls', `${input.id}-list`);
    expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(input).toHaveAttribute('placeholder', 'Search…');
    expect(container.firstElementChild).toHaveClass('trazos-autocomplete');
    expect(container.querySelector('.trazos-autocomplete-field')).toContainElement(input);
    expect(container.querySelector('.trazos-autocomplete-icon svg')).toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('marks required with an asterisk and uses a custom id', () => {
    const { container } = render(
      <Autocomplete id="fruit" label="Fruit" required searchFn={filterFruits} itemText={fruitText} />,
    );
    const input = screen.getByRole('combobox', { name: /Fruit/ });
    expect(input).toHaveAttribute('id', 'fruit');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(container.querySelector('.trazos-autocomplete-required')).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not search below minChars (default 2)', async () => {
    const search = vi.fn(filterFruits);
    const user = setup();
    render(<Autocomplete label="Fruit" searchFn={search} itemText={fruitText} />);
    await user.type(screen.getByRole('combobox'), 'a');
    await flush();
    expect(search).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('debounces the search, shows a spinner while waiting and lists the results', async () => {
    const search = vi.fn(filterFruits);
    const user = setup();
    const { container } = render(<Autocomplete label="Fruit" searchFn={search} itemText={fruitText} />);
    const input = screen.getByRole('combobox');
    await user.type(input, 'ap');
    expect(search).not.toHaveBeenCalled();
    expect(container.querySelector('.trazos-autocomplete-spinner')).toBeInTheDocument();
    expect(screen.getByRole('listbox')).toHaveTextContent('Buscando…');
    await flush(299);
    expect(search).not.toHaveBeenCalled();
    await flush(1);
    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith('ap', expect.any(AbortSignal));
    const options = screen.getAllByRole('option');
    expect(options.map((o) => o.textContent)).toEqual(['Apple', 'Apricot']);
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toHaveAttribute('id', `${input.id}-list`);
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[0]).toHaveClass('trazos-autocomplete-option', 'trazos-autocomplete-option-active');
    expect(input).toHaveAttribute('aria-activedescendant', options[0]?.id);
    expect(container.querySelector('.trazos-autocomplete-spinner')).not.toBeInTheDocument();
  });

  it('honours custom minChars, debounceMs and trims the query', async () => {
    const search = vi.fn(filterFruits);
    const user = setup();
    render(<Autocomplete label="Fruit" minChars={1} debounceMs={50} searchFn={search} itemText={fruitText} />);
    await user.type(screen.getByRole('combobox'), ' b ');
    await flush(50);
    expect(search).toHaveBeenCalledWith('b', expect.any(AbortSignal));
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Banana']);
  });

  it('shows the no-results text', async () => {
    const user = setup();
    render(<Autocomplete label="Fruit" searchFn={filterFruits} itemText={fruitText} noResultsText="Nothing" />);
    await user.type(screen.getByRole('combobox'), 'zz');
    await flush();
    expect(screen.getByRole('listbox')).toHaveTextContent('Nothing');
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('shows the Spanish no-results text by default and treats a failing search as empty', async () => {
    const user = setup();
    render(
      <Autocomplete<Fruit>
        label="Fruit"
        searchFn={() => Promise.reject(new Error('boom'))}
        itemText={fruitText}
      />,
    );
    await user.type(screen.getByRole('combobox'), 'ap');
    await flush();
    expect(screen.getByRole('listbox')).toHaveTextContent('Sin resultados');
  });

  it('ignores stale async responses: the latest query wins', async () => {
    const resolvers = new Map<string, (items: Fruit[]) => void>();
    const signals = new Map<string, AbortSignal>();
    const search: AutocompleteSearchFn<Fruit> = (query, signal) => {
      signals.set(query, signal);
      return new Promise<Fruit[]>((resolve) => resolvers.set(query, resolve));
    };
    const user = setup();
    render(<Autocomplete label="Fruit" debounceMs={0} searchFn={search} itemText={fruitText} />);
    const input = screen.getByRole('combobox');
    await user.type(input, 'ap');
    await flush(0);
    await user.type(input, 'r');
    await flush(0);
    expect(signals.get('ap')?.aborted).toBe(true);
    await act(async () => {
      resolvers.get('apr')?.([{ id: 2, name: 'Apricot' }]);
      await Promise.resolve();
    });
    await act(async () => {
      resolvers.get('ap')?.([{ id: 1, name: 'Apple' }]);
      await Promise.resolve();
    });
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Apricot']);
  });

  it('moves the active option with ArrowDown/ArrowUp (wrapping) and selects with Enter', async () => {
    const onChange = vi.fn();
    const user = setup();
    const { container } = render(
      <Autocomplete label="Fruit" searchFn={filterFruits} itemText={fruitText} onSelectedItemChange={onChange} />,
    );
    const input = screen.getByRole('combobox');
    await user.type(input, 'ap');
    await flush();
    await user.keyboard('{ArrowDown}');
    let options = screen.getAllByRole('option');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    expect(input).toHaveAttribute('aria-activedescendant', options[1]?.id);
    await user.keyboard('{ArrowDown}');
    options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowUp}');
    options = screen.getAllByRole('option');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(fruits[1]);
    expect(container.querySelector('.trazos-autocomplete-selected-content')).toHaveTextContent('Apricot');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('closes and clears the query with Escape', async () => {
    const user = setup();
    render(<Autocomplete label="Fruit" searchFn={filterFruits} itemText={fruitText} />);
    const input = screen.getByRole('combobox');
    await user.type(input, 'ap');
    await flush();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on blur and reopens on focus', async () => {
    const user = setup();
    render(
      <>
        <Autocomplete label="Fruit" searchFn={filterFruits} itemText={fruitText} />
        <button type="button">Other</button>
      </>,
    );
    const input = screen.getByRole('combobox');
    await user.type(input, 'ap');
    await flush();
    await user.click(screen.getByRole('button', { name: 'Other' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    await user.click(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('selects with the mouse, keeps focus, highlights on hover and renders with the item template', async () => {
    const onChange = vi.fn();
    const user = setup();
    const { container } = render(
      <Autocomplete
        label="Fruit"
        searchFn={filterFruits}
        itemText={fruitText}
        renderItem={(f) => <strong>#{f.id} {f.name}</strong>}
        onSelectedItemChange={onChange}
      />,
    );
    await user.type(screen.getByRole('combobox'), 'ap');
    await flush();
    const second = screen.getAllByRole('option')[1];
    expect(second).toHaveTextContent('#2 Apricot');
    if (second === undefined) throw new Error('missing option');
    await user.hover(second);
    expect(second).toHaveAttribute('aria-selected', 'true');
    await user.click(second);
    expect(onChange).toHaveBeenCalledWith(fruits[1]);
    expect(container.querySelector('.trazos-autocomplete-selected-content strong')).toHaveTextContent('#2 Apricot');
  });

  it('clears the selection with the clear button (Spanish default label)', async () => {
    const onChange = vi.fn();
    const user = setup();
    render(
      <Autocomplete
        label="Fruit"
        searchFn={filterFruits}
        itemText={fruitText}
        defaultSelectedItem={fruits[0]}
        onSelectedItemChange={onChange}
      />,
    );
    const clear = screen.getByRole('button', { name: 'Quitar selección' });
    expect(clear).toHaveClass('trazos-autocomplete-clear');
    expect(clear).toHaveAttribute('title', 'Quitar selección');
    await user.click(clear);
    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('is controlled through selectedItem', async () => {
    const onChange = vi.fn();
    const user = setup();
    const { rerender } = render(
      <Autocomplete
        label="Fruit"
        searchFn={filterFruits}
        itemText={fruitText}
        selectedItem={fruits[2]}
        onSelectedItemChange={onChange}
        clearText="Remove"
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onChange).toHaveBeenCalledWith(null);
    // Still controlled: the parent did not change the value.
    expect(screen.getByText('Banana')).toBeInTheDocument();
    rerender(
      <Autocomplete
        label="Fruit"
        searchFn={filterFruits}
        itemText={fruitText}
        selectedItem={null}
        onSelectedItemChange={onChange}
      />,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('works with a parent that stores the selection', async () => {
    function Host() {
      const [fruit, setFruit] = useState<Fruit | null>(null);
      return (
        <>
          <Autocomplete label="Fruit" searchFn={filterFruits} itemText={fruitText} selectedItem={fruit} onSelectedItemChange={setFruit} />
          <output>{fruit?.name ?? 'none'}</output>
        </>
      );
    }
    const user = setup();
    render(<Host />);
    await user.type(screen.getByRole('combobox'), 'ban');
    await flush();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('Banana');
  });

  it('with clearOnSelect emits the item but keeps the empty search field', async () => {
    const onChange = vi.fn();
    const user = setup();
    render(
      <Autocomplete label="Fruit" clearOnSelect searchFn={filterFruits} itemText={fruitText} onSelectedItemChange={onChange} />,
    );
    const input = screen.getByRole('combobox');
    await user.type(input, 'ap');
    await flush();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(fruits[0]);
    expect(screen.getByRole('combobox')).toHaveValue('');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows the error (instead of helper text) and wires aria attributes', () => {
    const { container, rerender } = render(
      <Autocomplete label="Fruit" helperText="Pick one" searchFn={filterFruits} itemText={fruitText} />,
    );
    const input = screen.getByRole('combobox');
    const helper = container.querySelector('.trazos-autocomplete-helper');
    expect(helper).toHaveTextContent('Pick one');
    expect(input).toHaveAttribute('aria-describedby', helper?.id);
    expect(input).not.toHaveAttribute('aria-invalid');
    rerender(
      <Autocomplete label="Fruit" helperText="Pick one" error="Required" searchFn={filterFruits} itemText={fruitText} />,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('trazos-autocomplete-error');
    expect(alert).toHaveTextContent('Required');
    expect(container.querySelector('.trazos-autocomplete-helper')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', alert.id);
    expect(container.querySelector('.trazos-autocomplete-field')).toHaveClass('trazos-autocomplete-has-error');
  });

  it('disables the input and the clear button', () => {
    const { container, unmount } = render(
      <Autocomplete label="Fruit" disabled searchFn={filterFruits} itemText={fruitText} />,
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(container.querySelector('.trazos-autocomplete-field')).toHaveClass('trazos-autocomplete-disabled');
    unmount();
    render(
      <Autocomplete label="Fruit" disabled defaultSelectedItem={fruits[0]} searchFn={filterFruits} itemText={fruitText} />,
    );
    expect(screen.getByRole('button', { name: 'Quitar selección' })).toBeDisabled();
  });

  it('forwards the ref, extra classes and native attributes to the root', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Autocomplete ref={ref} className="extra" data-x="1" label="Fruit" searchFn={filterFruits} itemText={fruitText} />,
    );
    const root = container.firstElementChild;
    expect(ref.current).toBe(root);
    expect(root).toHaveClass('trazos-autocomplete', 'extra');
    expect(root).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations when closed, open and with a selection', async () => {
    const user = setup();
    const { container, unmount } = render(
      <Autocomplete label="Fruit" helperText="Pick one" searchFn={filterFruits} itemText={fruitText} />,
    );
    vi.useRealTimers();
    await expectNoA11yViolations(container);
    vi.useFakeTimers();
    await user.type(screen.getByRole('combobox'), 'ap');
    await flush();
    vi.useRealTimers();
    await expectNoA11yViolations(container);
    unmount();
    const selected = render(
      <Autocomplete label="Fruit" defaultSelectedItem={fruits[0]} searchFn={filterFruits} itemText={fruitText} />,
    );
    await expectNoA11yViolations(selected.container);
  });
});
