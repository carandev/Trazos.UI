import { useMemo, useState } from 'react';
import type { ComponentPropsWithRef, Key, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { Skeleton } from '../Skeleton';
import { VisuallyHidden } from '../VisuallyHidden';
import { DataTableSortContext } from './sortContext';
import type { DataTableSortContextValue, TableSort } from './sortContext';
import './DataTable.css';

export interface DataTableProps<T> extends ComponentPropsWithRef<'div'> {
  items?: readonly T[] | null;
  /** Header cells (`<th>` or `SortHeader` elements) rendered inside the `<thead>` row. */
  tableHeader?: ReactNode;
  /** Cells (`<td>` elements) for one row. */
  rowTemplate: (item: T) => ReactNode;
  /** Buttons for each row, in a last column. Clicks and keys there do not call `onRowClick`. */
  rowActions?: (item: T) => ReactNode;
  /** Screen-reader name of the row actions column. */
  actionsLabel?: string;
  /** Footer cells (`<td>` elements), such as a totals row, rendered inside the `<tfoot>` row. */
  tableFooter?: ReactNode;
  /** Content above the table, such as a search box or filters. */
  toolbar?: ReactNode;
  /** Content below the table, normally a `Pagination`. */
  pagination?: ReactNode;
  /** Current sort (controlled). The table does not sort `items`; the app does, so server-side sorting works too. */
  sort?: TableSort | null;
  /** Initial sort when uncontrolled. */
  defaultSort?: TableSort | null;
  /** Called when a `SortHeader` is clicked: a new column sorts ascending, the same column flips. */
  onSortChange?: (sort: TableSort) => void;
  /** Accessible name of the `<table>`. */
  ariaLabel?: string;
  /** Replaces the default empty message. */
  emptyContent?: ReactNode;
  emptyMessage?: string;
  loading?: boolean;
  /** Number of skeleton rows shown while loading. */
  loadingRows?: number;
  /** Makes rows interactive (pointer cursor, focusable, Enter/Space activate). */
  onRowClick?: (item: T) => void;
  /** Accessible name for each interactive row, e.g. `(item) => `Ver detalle de ${item.name}``. */
  rowAriaLabel?: (item: T) => string;
  /** Row key; defaults to the row index. */
  getRowKey?: (item: T, index: number) => Key;
}

/** True when the event started inside this row's actions cell. */
function fromActions(event: MouseEvent<HTMLTableRowElement> | KeyboardEvent<HTMLTableRowElement>): boolean {
  if (!(event.target instanceof Element)) return false;
  const cell = event.target.closest('.trazos-table-actions');
  return cell !== null && event.currentTarget.contains(cell);
}

export function DataTable<T>({
  items,
  tableHeader,
  rowTemplate,
  rowActions,
  actionsLabel = 'Actions',
  tableFooter,
  toolbar,
  pagination,
  sort,
  defaultSort = null,
  onSortChange,
  ariaLabel,
  emptyContent,
  emptyMessage = 'No hay registros disponibles.',
  loading = false,
  loadingRows = 3,
  onRowClick,
  rowAriaLabel,
  getRowKey,
  className,
  ...rest
}: DataTableProps<T>) {
  const interactive = onRowClick !== undefined;
  const hasActions = rowActions !== undefined;
  const [innerSort, setInnerSort] = useState<TableSort | null>(defaultSort);
  const currentSort = sort === undefined ? innerSort : sort;

  const sortContext = useMemo<DataTableSortContextValue>(
    () => ({
      sort: currentSort,
      toggleSort: (field) => {
        const next: TableSort =
          currentSort?.field === field
            ? { field, descending: !currentSort.descending }
            : { field, descending: false };
        if (sort === undefined) setInnerSort(next);
        onSortChange?.(next);
      },
    }),
    [currentSort, sort, onSortChange],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, item: T) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRowClick?.(item);
    }
  };

  let body: ReactNode;
  if (loading) {
    body = Array.from({ length: Math.max(0, loadingRows) }, (_, i) => (
      <tr key={i} className="trazos-table-loading-row">
        <td colSpan={100}>
          <Skeleton variant="text" height="1.25rem" />
        </td>
      </tr>
    ));
  } else if (items == null || items.length === 0) {
    body = (
      <tr>
        <td colSpan={100} className="trazos-table-empty">
          {emptyContent ?? <p className="trazos-table-empty-text">{emptyMessage}</p>}
        </td>
      </tr>
    );
  } else {
    body = items.map((item, index) => (
      <tr
        key={getRowKey ? getRowKey(item, index) : index}
        className={cx('trazos-table-row', interactive && 'trazos-table-row-interactive')}
        tabIndex={interactive ? 0 : undefined}
        aria-label={interactive ? rowAriaLabel?.(item) : undefined}
        onClick={
          interactive
            ? (event) => {
                if (!fromActions(event)) onRowClick(item);
              }
            : undefined
        }
        onKeyDown={
          interactive
            ? (event) => {
                handleKeyDown(event, item);
              }
            : undefined
        }
      >
        {rowTemplate(item)}
        {hasActions && (
          <td className="trazos-table-actions">
            <div className="trazos-table-actions-inner">{rowActions(item)}</div>
          </td>
        )}
      </tr>
    ));
  }

  return (
    <div {...rest} className={cx('trazos-table-wrapper', className)}>
      {toolbar != null && <div className="trazos-table-toolbar">{toolbar}</div>}
      <div className="trazos-table-container">
        <DataTableSortContext value={sortContext}>
          <table className="trazos-table" aria-label={ariaLabel}>
            {tableHeader != null && (
              <thead className="trazos-table-head">
                <tr>
                  {tableHeader}
                  {hasActions && (
                    <th className="trazos-table-actions-head" scope="col">
                      <VisuallyHidden>{actionsLabel}</VisuallyHidden>
                    </th>
                  )}
                </tr>
              </thead>
            )}
            <tbody className="trazos-table-body">{body}</tbody>
            {tableFooter != null && (
              <tfoot className="trazos-table-foot">
                <tr>
                  {tableFooter}
                  {hasActions && <td />}
                </tr>
              </tfoot>
            )}
          </table>
        </DataTableSortContext>
      </div>
      {pagination != null && <div className="trazos-table-pagination">{pagination}</div>}
    </div>
  );
}
