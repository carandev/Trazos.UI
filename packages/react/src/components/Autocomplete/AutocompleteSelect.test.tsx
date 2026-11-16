import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AutocompleteSelect } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

interface Employee {
  id: number;
  name: string;
}

const employees: Employee[] = [
  { id: 1, name: 'Ana María Restrepo' },
  { id: 2, name: 'Julián Ospina' },
  { id: 3, name: 'Luisa Fernanda Gil' },
];

function Picker(props: { initial?: number | null; onValue?: (v: number | null) => void; error?: string }) {
  const [value, setValue] = useState<number | null>(props.initial ?? null);
  return (
    <>
      <AutocompleteSelect<Employee, number>
        id="employee"
        label="Employee"
        items={employees}
        itemText={(e) => e.name}
        valueSelector={(e) => e.id}
        value={value}
        error={props.error}
        onValueChange={(v) => {
          props.onValue?.(v);
          setValue(v);
        }}
      />
      <output>{value ?? 'none'}</output>
    </>
  );
}

describe('AutocompleteSelect', () => {
  it('lists every preloaded item on focus (minChars defaults to 0)', async () => {
    render(<Picker />);
    await userEvent.click(screen.getByRole('combobox', { name: 'Employee' }));
    expect(await screen.findAllByRole('option')).toHaveLength(3);
  });

  it('filters the preloaded list and binds the id of the chosen item', async () => {
    const onValue = vi.fn();
    render(<Picker onValue={onValue} />);
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.type(input, 'ospi');
    await waitFor(() => {
      expect(screen.getAllByRole('option')).toHaveLength(1);
    });
    await userEvent.click(screen.getByRole('option'));
    expect(onValue).toHaveBeenCalledWith(2);
    expect(screen.getByRole('status')).toHaveTextContent('2');
    expect(screen.getByText('Julián Ospina')).toHaveClass('trazos-autocomplete-selected-content');
  });

  it('shows the item of an existing value and clearing resets the value to null', async () => {
    const onValue = vi.fn();
    render(<Picker initial={3} onValue={onValue} />);
    expect(screen.getByText('Luisa Fernanda Gil')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(onValue).toHaveBeenCalledWith(null);
    expect(screen.getByRole('status')).toHaveTextContent('none');
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('uses English default texts', async () => {
    render(
      <AutocompleteSelect<Employee, number>
        label="Employee"
        items={employees}
        itemText={(e) => e.name}
        valueSelector={(e) => e.id}
      />,
    );
    await userEvent.type(screen.getByRole('combobox'), 'zzz');
    expect(await screen.findByText('No results')).toBeInTheDocument();
  });

  it('works uncontrolled from defaultValue', async () => {
    const onValueChange = vi.fn();
    render(
      <AutocompleteSelect<Employee, number>
        label="Employee"
        items={employees}
        itemText={(e) => e.name}
        valueSelector={(e) => e.id}
        defaultValue={1}
        onValueChange={onValueChange}
      />,
    );
    expect(screen.getByText('Ana María Restrepo')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(screen.queryByText('Ana María Restrepo')).not.toBeInTheDocument();
  });

  it('uses a search function and resolves an existing value that is not in the items', async () => {
    const resolveItem = vi.fn((id: number) => Promise.resolve(employees.find((e) => e.id === id) ?? null));
    const searchFn = vi.fn((q: string) => employees.filter((e) => e.name.toLowerCase().includes(q.toLowerCase())));
    function Remote() {
      const [value, setValue] = useState<number | null>(2);
      return (
        <AutocompleteSelect<Employee, number>
          label="Employee"
          searchFn={searchFn}
          resolveItem={resolveItem}
          itemText={(e) => e.name}
          valueSelector={(e) => e.id}
          value={value}
          onValueChange={setValue}
          debounceMs={0}
        />
      );
    }
    render(<Remote />);
    expect(await screen.findByText('Julián Ospina')).toBeInTheDocument();
    expect(resolveItem).toHaveBeenCalledWith(2, expect.any(AbortSignal));

    await userEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'gil');
    await waitFor(() => {
      expect(searchFn).toHaveBeenLastCalledWith('gil', expect.any(AbortSignal));
    });
    await userEvent.click(await screen.findByRole('option', { name: 'Luisa Fernanda Gil' }));
    expect(screen.getByText('Luisa Fernanda Gil')).toHaveClass('trazos-autocomplete-selected-content');
    expect(resolveItem).toHaveBeenCalledTimes(1);
  });

  it('ignores a resolved item whose value does not match', async () => {
    render(
      <AutocompleteSelect<Employee, number>
        label="Employee"
        items={[]}
        resolveItem={() => employees[0]}
        itemText={(e) => e.name}
        valueSelector={(e) => e.id}
        value={9}
      />,
    );
    await new Promise((r) => setTimeout(r, 10));
    expect(screen.queryByText('Ana María Restrepo')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('shows the error and passes field props through', () => {
    const { container } = render(<Picker error="Choose an employee." />);
    expect(container.querySelector('.trazos-autocomplete-error')).toHaveTextContent('Choose an employee.');
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('id', 'employee');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Picker initial={1} />);
    await expectNoA11yViolations(container);
  });
});
