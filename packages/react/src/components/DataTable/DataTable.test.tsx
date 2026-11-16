import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DataTable, SortHeader } from './index';
import type { TableSort } from './index';
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
    expect(rows[0]).not.toHaveClass('trazos-table-row-interactive');
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
    expect(rows[0]).toHaveClass('trazos-table-row', 'trazos-table-row-interactive');
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

interface Employee {
  name: string;
  salary: number;
}

const employees: Employee[] = [
  { name: 'Ada', salary: 10 },
  { name: 'Grace', salary: 20 },
];

function EmployeeTable({
  onSortChange,
  onRowClick,
  onEdit,
  initialSort = null,
}: {
  onSortChange?: (sort: TableSort) => void;
  onRowClick?: (item: Employee) => void;
  onEdit?: (item: Employee) => void;
  initialSort?: TableSort | null;
}) {
  const [sort, setSort] = useState<TableSort | null>(initialSort);
  return (
    <DataTable
      items={employees}
      ariaLabel="Employees"
      sort={sort}
      onSortChange={(next) => {
        setSort(next);
        onSortChange?.(next);
      }}
      onRowClick={onRowClick}
      actionsLabel="Acciones"
      toolbar={<input aria-label="Filter" className="filter" />}
      tableHeader={
        <>
          <SortHeader field="name">Name</SortHeader>
          <SortHeader field="salary" align="end">
            Salary
          </SortHeader>
        </>
      }
      rowTemplate={(e) => (
        <>
          <td>{e.name}</td>
          <td className="trazos-cell-numeric">{e.salary}</td>
        </>
      )}
      rowActions={(e) => (
        <button type="button" className="edit" onClick={() => onEdit?.(e)}>
          Edit {e.name}
        </button>
      )}
      tableFooter={
        <>
          <td>Total</td>
          <td className="trazos-cell-numeric">30</td>
        </>
      }
      pagination={<nav aria-label="Pager" className="pager" />}
    />
  );
}

describe('DataTable sorting and slots', () => {
  it('exposes aria-sort and reports a new column ascending and the same column flipped', async () => {
    const onSortChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<EmployeeTable onSortChange={onSortChange} />);
    const headers = () => [...container.querySelectorAll('th.trazos-sort-header')];
    expect(headers().map((h) => h.getAttribute('aria-sort'))).toEqual(['none', 'none']);
    expect(headers()[0]).toHaveAttribute('scope', 'col');

    await user.click(screen.getByRole('button', { name: 'Name' }));
    expect(onSortChange).toHaveBeenLastCalledWith({ field: 'name', descending: false });
    expect(headers()[0]).toHaveAttribute('aria-sort', 'ascending');
    expect(headers()[0]?.querySelector('svg')).toHaveClass('trazos-sort-icon', 'trazos-sort-icon-ascending');

    await user.click(screen.getByRole('button', { name: 'Name' }));
    expect(onSortChange).toHaveBeenLastCalledWith({ field: 'name', descending: true });
    expect(headers()[0]).toHaveAttribute('aria-sort', 'descending');

    await user.click(screen.getByRole('button', { name: 'Salary' }));
    expect(onSortChange).toHaveBeenLastCalledWith({ field: 'salary', descending: false });
    expect(onSortChange).toHaveBeenCalledTimes(3);
    expect(headers().map((h) => h.getAttribute('aria-sort'))).toEqual(['none', 'ascending']);
    expect(headers()[1]).toHaveClass('trazos-cell-end');
    expect(headers()[0]?.querySelector('svg')).toHaveClass('trazos-sort-icon-none');
  });

  it('does not sort the items itself', async () => {
    const user = userEvent.setup();
    render(<EmployeeTable initialSort={{ field: 'name', descending: false }} />);
    await user.click(screen.getByRole('button', { name: 'Name' }));
    const cells = screen.getAllByRole('row').slice(1, 3).map((r) => r.querySelector('td')?.textContent);
    expect(cells).toEqual(['Ada', 'Grace']);
  });

  it('keeps its own sort when uncontrolled', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DataTable
        items={people}
        defaultSort={{ field: 'name', descending: false }}
        tableHeader={<SortHeader field="name">Name</SortHeader>}
        rowTemplate={(p) => <td>{p.name}</td>}
      />,
    );
    const th = container.querySelector('th.trazos-sort-header');
    expect(th).toHaveAttribute('aria-sort', 'ascending');
    await user.click(screen.getByRole('button', { name: 'Name' }));
    expect(th).toHaveAttribute('aria-sort', 'descending');
  });

  it('renders a SortHeader outside a table as an unsorted header', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <table>
        <thead>
          <tr>
            <SortHeader field="name" align="center" className="x">
              Name
            </SortHeader>
          </tr>
        </thead>
      </table>,
    );
    const th = container.querySelector('th');
    expect(th).toHaveClass('trazos-sort-header', 'trazos-cell-center', 'x');
    await user.click(screen.getByRole('button', { name: 'Name' }));
    expect(th).toHaveAttribute('aria-sort', 'none');
  });

  it('renders toolbar, footer, actions and pagination in their slots', () => {
    const { container } = render(<EmployeeTable />);
    expect(screen.getByRole('table', { name: 'Employees' })).toBeInTheDocument();
    const wrapper = container.firstElementChild;
    expect(wrapper?.firstElementChild).toHaveClass('trazos-table-toolbar');
    expect(container.querySelector('.trazos-table-toolbar input.filter')).not.toBeNull();
    expect(wrapper?.lastElementChild).toHaveClass('trazos-table-pagination');
    expect(container.querySelector('.trazos-table-pagination .pager')).not.toBeNull();
    expect(container.querySelector('tfoot.trazos-table-foot td')).toHaveTextContent('Total');
    expect(container.querySelectorAll('td.trazos-table-actions button.edit')).toHaveLength(2);
    expect(container.querySelector('td.trazos-table-actions > .trazos-table-actions-inner')).not.toBeNull();
    const actionsHead = container.querySelector('th.trazos-table-actions-head');
    expect(actionsHead).toHaveAttribute('scope', 'col');
    expect(actionsHead?.querySelector('.trazos-visually-hidden')).toHaveTextContent('Acciones');
    // The footer row gets an empty cell under the actions column.
    expect(container.querySelectorAll('tfoot tr > *')).toHaveLength(3);
  });

  it('defaults the actions column name to English', () => {
    const { container } = render(
      <DataTable items={people} tableHeader={header} rowTemplate={row} rowActions={() => <button type="button">Go</button>} />,
    );
    expect(container.querySelector('th.trazos-table-actions-head')).toHaveTextContent('Actions');
  });

  it('does not trigger the row click from row actions, by mouse or keyboard', async () => {
    const onRowClick = vi.fn();
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<EmployeeTable onRowClick={onRowClick} onEdit={onEdit} />);
    await user.click(screen.getByRole('button', { name: 'Edit Grace' }));
    expect(onEdit).toHaveBeenLastCalledWith(employees[1]);
    screen.getByRole('button', { name: 'Edit Ada' }).focus();
    await user.keyboard('{Enter}');
    expect(onEdit).toHaveBeenLastCalledWith(employees[0]);
    expect(onRowClick).not.toHaveBeenCalled();
    await user.click(screen.getByText('Grace'));
    expect(onRowClick).toHaveBeenCalledExactlyOnceWith(employees[1]);
  });

  it('makes clickable rows reachable and opens them with Enter', async () => {
    const onRowClick = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<EmployeeTable onRowClick={onRowClick} />);
    const first = container.querySelector<HTMLElement>('tbody tr.trazos-table-row');
    expect(first).toHaveAttribute('tabindex', '0');
    first?.focus();
    await user.keyboard('{Enter}');
    expect(onRowClick).toHaveBeenCalledExactlyOnceWith(employees[0]);
  });

  it('keeps the previous markup for a plain table', () => {
    const { container } = render(<DataTable items={people} tableHeader={header} rowTemplate={row} />);
    expect(container.querySelector('.trazos-table-toolbar')).toBeNull();
    expect(container.querySelector('.trazos-table-pagination')).toBeNull();
    expect(container.querySelector('tfoot')).toBeNull();
    expect(container.querySelector('.trazos-table-actions-head')).toBeNull();
    expect(container.querySelector('.trazos-table-actions')).toBeNull();
    expect(screen.getByRole('table')).not.toHaveAttribute('aria-label');
    expect(container.querySelector('thead tr')?.children).toHaveLength(2);
  });

  it('styles header, body and footer cells written by the consumer', () => {
    const { container } = render(<EmployeeTable />);
    const th = container.querySelector('thead th');
    const td = container.querySelector('tbody td');
    const foot = container.querySelector('tfoot td');
    if (!th || !td || !foot) throw new Error('cells missing');
    expect(getComputedStyle(th).paddingTop).toBe('14px');
    expect(getComputedStyle(th).textTransform).toBe('uppercase');
    expect(getComputedStyle(td).paddingTop).toBe('16px');
    expect(getComputedStyle(foot).fontWeight).toBe('700');
    const numeric = container.querySelector('tbody td.trazos-cell-numeric');
    if (!numeric) throw new Error('numeric cell missing');
    expect(getComputedStyle(numeric).textAlign).toBe('right');
  });

  it('has no accessibility violations with every slot', async () => {
    const { container } = render(<EmployeeTable onRowClick={() => undefined} />);
    await expectNoA11yViolations(container);
  });
});
