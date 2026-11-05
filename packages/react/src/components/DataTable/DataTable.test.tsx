import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DataTable } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

interface Person {
  id: number;
  name: string;
}

const people: Person[] = [
  { id: 1, name: 'Ana' },
  { id: 2, name: 'Luis' },
];

const header = (
  <>
    <th>Id</th>
    <th>Name</th>
  </>
);

const row = (p: Person) => (
  <>
    <td>{p.id}</td>
    <td>{p.name}</td>
  </>
);

describe('DataTable', () => {
  it('renders wrapper, container, table, header and one row per item', () => {
    const { container } = render(<DataTable items={people} tableHeader={header} rowTemplate={row} />);
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveClass('trazos-table-wrapper');
    expect(wrapper?.firstElementChild).toHaveClass('trazos-table-container');
    const table = screen.getByRole('table');
    expect(table).toHaveClass('trazos-table');
    expect(container.querySelector('thead')).toHaveClass('trazos-table-head');
    expect(container.querySelector('tbody')).toHaveClass('trazos-table-body');
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Id', 'Name']);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveClass('trazos-table-row');
    expect(rows[0]).not.toHaveClass('interactive');
    expect(rows[0]).not.toHaveAttribute('tabindex');
    expect(within(rows[1] as HTMLElement).getByText('Luis')).toBeInTheDocument();
  });

  it('omits the thead when no header is given', () => {
    const { container } = render(<DataTable items={people} rowTemplate={row} />);
    expect(container.querySelector('thead')).toBeNull();
  });

  it('shows the default Spanish empty message when items are missing or empty', () => {
    const { container, rerender } = render(<DataTable<Person> rowTemplate={row} />);
    const cell = container.querySelector('td.trazos-table-empty');
    expect(cell).toHaveAttribute('colspan', '100');
    expect(cell?.querySelector('p.trazos-table-empty-text')).toHaveTextContent('No hay registros disponibles.');
    rerender(<DataTable items={[]} rowTemplate={row} emptyMessage="Nothing here" />);
    expect(screen.getByText('Nothing here')).toHaveClass('trazos-table-empty-text');
  });

  it('renders custom empty content instead of the message', () => {
    const { container } = render(
      <DataTable items={[]} rowTemplate={row} emptyContent={<strong>Empty!</strong>} />,
    );
    expect(container.querySelector('.trazos-table-empty')).toContainElement(screen.getByText('Empty!'));
    expect(container.querySelector('.trazos-table-empty-text')).toBeNull();
  });

  it('renders loadingRows skeleton rows while loading, ignoring items', () => {
    const { container, rerender } = render(<DataTable items={people} rowTemplate={row} loading />);
    let rows = container.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(3);
    for (const r of rows) {
      expect(r).toHaveClass('trazos-table-loading-row');
      const td = r.querySelector('td');
      expect(td).toHaveAttribute('colspan', '100');
      const skeleton = td?.querySelector<HTMLElement>('.trazos-skeleton');
      expect(skeleton).toHaveClass('trazos-skeleton-text');
      expect(skeleton?.style.height).toBe('1.25rem');
    }
    expect(screen.queryByText('Ana')).toBeNull();
    rerender(<DataTable items={people} rowTemplate={row} loading loadingRows={5} />);
    rows = container.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(5);
  });

  it('makes rows interactive and calls onRowClick with the item on click, Enter and Space', async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<DataTable items={people} rowTemplate={row} onRowClick={onRowClick} />);
    const rows = container.querySelectorAll<HTMLElement>('tbody tr');
    expect(rows[0]).toHaveClass('trazos-table-row', 'interactive');
    expect(rows[0]).toHaveAttribute('tabindex', '0');
    await user.click(screen.getByText('Luis'));
    expect(onRowClick).toHaveBeenLastCalledWith(people[1]);
    rows[0]?.focus();
    await user.keyboard('{Enter}');
    expect(onRowClick).toHaveBeenLastCalledWith(people[0]);
    await user.keyboard(' ');
    expect(onRowClick).toHaveBeenCalledTimes(3);
    expect(onRowClick).toHaveBeenLastCalledWith(people[0]);
  });

  it('uses getRowKey for row keys without warnings', () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<DataTable items={people} rowTemplate={row} getRowKey={(p) => p.id} />);
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });

  it('forwards ref, class and native attributes to the wrapper', () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <DataTable ref={ref} items={people} rowTemplate={row} className="extra" data-x="1" />,
    );
    const wrapper = container.firstElementChild;
    expect(ref.current).toBe(wrapper);
    expect(wrapper).toHaveClass('trazos-table-wrapper', 'extra');
    expect(wrapper).toHaveAttribute('data-x', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <DataTable items={people} tableHeader={header} rowTemplate={row} onRowClick={() => undefined} />,
    );
    await expectNoA11yViolations(container);
  });
});
