import type { ComponentPropsWithRef, Key, KeyboardEvent, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { Skeleton } from '../Skeleton';
import './DataTable.css';

export interface DataTableProps<T> extends ComponentPropsWithRef<'div'> {
  items?: readonly T[] | null;
  /** Header cells (`<th>` elements) rendered inside the `<thead>` row. */
  tableHeader?: ReactNode;
  /** Cells (`<td>` elements) for one row. */
  rowTemplate: (item: T) => ReactNode;
  /** Replaces the default empty message. */
  emptyContent?: ReactNode;
  emptyMessage?: string;
  loading?: boolean;
  /** Number of skeleton rows shown while loading. */
  loadingRows?: number;
  /** Makes rows interactive (pointer cursor, focusable, Enter/Space activate). */
  onRowClick?: (item: T) => void;
  /** Row key; defaults to the row index. */
  getRowKey?: (item: T, index: number) => Key;
}

export function DataTable<T>({
  items,
  tableHeader,
  rowTemplate,
  emptyContent,
  emptyMessage = 'No hay registros disponibles.',
  loading = false,
  loadingRows = 3,
  onRowClick,
  getRowKey,
  className,
  ...rest
}: DataTableProps<T>) {
  const interactive = onRowClick !== undefined;

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
        className={cx('trazos-table-row', interactive && 'interactive')}
        tabIndex={interactive ? 0 : undefined}
        onClick={
          interactive
            ? () => {
                onRowClick(item);
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
      </tr>
    ));
  }

  return (
    <div {...rest} className={cx('trazos-table-wrapper', className)}>
      <div className="trazos-table-container">
        <table className="trazos-table">
          {tableHeader != null && (
            <thead className="trazos-table-head">
              <tr>{tableHeader}</tr>
            </thead>
          )}
          <tbody className="trazos-table-body">{body}</tbody>
        </table>
      </div>
    </div>
  );
}
