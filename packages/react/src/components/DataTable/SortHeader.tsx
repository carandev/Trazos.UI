import { useContext } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../internal/cx';
import { DataTableSortContext } from './sortContext';
import type { TableAlign } from './sortContext';
import './SortHeader.css';

export interface SortHeaderProps extends Omit<ComponentPropsWithRef<'th'>, 'align'> {
  /** Name of the column reported in `TableSort.field`. */
  field: string;
  align?: TableAlign;
}

const alignClass: Record<TableAlign, string | undefined> = {
  start: undefined,
  center: 'trazos-cell-center',
  end: 'trazos-cell-end',
};

/**
 * A sortable `<th>` for `DataTable`'s `tableHeader`. Clicking it asks the
 * table to toggle the sort; the table reports it through `onSortChange`.
 */
export function SortHeader({ field, align = 'start', className, children, ...rest }: SortHeaderProps) {
  const table = useContext(DataTableSortContext);
  const sort = table?.sort;
  const state = sort != null && sort.field === field ? (sort.descending ? 'descending' : 'ascending') : 'none';

  return (
    <th {...rest} className={cx('trazos-sort-header', alignClass[align], className)} aria-sort={state} scope="col">
      <button
        type="button"
        className="trazos-sort-button"
        onClick={() => {
          table?.toggleSort(field);
        }}
      >
        <span>{children}</span>
        <svg
          className={cx('trazos-sort-icon', `trazos-sort-icon-${state}`)}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.25}
          stroke="currentColor"
        >
          {state === 'none' ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
          )}
        </svg>
      </button>
    </th>
  );
}
