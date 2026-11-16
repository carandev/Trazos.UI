import { useState } from 'react';
import type { ChangeEvent, ComponentPropsWithRef } from 'react';
import { cx } from '../../internal/cx';
import './Pagination.css';

export interface PaginationProps extends Omit<ComponentPropsWithRef<'nav'>, 'children'> {
  /** Current page, starting at 1 (controlled). */
  page?: number;
  /** Initial page when uncontrolled. */
  defaultPage?: number;
  /** Called with the new page (Razor `PageChanged`). */
  onPageChange?: (page: number) => void;
  /** Items per page (controlled). */
  pageSize?: number;
  /** Initial page size when uncontrolled. */
  defaultPageSize?: number;
  /** Called when the user picks a page size; `onPageChange(1)` follows (Razor `PageSizeChanged`). */
  onPageSizeChange?: (pageSize: number) => void;
  /** Total number of items across every page. */
  totalCount: number;
  /** Choices for the page-size selector. No selector when empty. */
  pageSizeOptions?: readonly number[];
  /** Pages shown on each side of the current one before an ellipsis. */
  siblings?: number;
  /** Accessible name of the navigation. */
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
  /** Accessible name of each page button. `{0}` is the page number. */
  pageLabelFormat?: string;
  pageSizeLabel?: string;
  /** Summary text. `{0}` is the first item, `{1}` the last and `{2}` the total. */
  summaryFormat?: string;
}

/** Replaces `{0}`, `{1}`… with the given values, like .NET `string.Format`. */
function format(template: string, ...values: (string | number)[]): string {
  return template.replace(/\{(\d+)\}/g, (match, index: string) => {
    const value = values[Number(index)];
    return value === undefined ? match : String(value);
  });
}

/** Page numbers to show; `null` marks an ellipsis. Same rules as the Razor component. */
function visiblePages(current: number, count: number, siblingCount: number): (number | null)[] {
  const siblings = Math.max(0, siblingCount);
  // First, last, current with its siblings, and two ellipses.
  if (count <= 5 + siblings * 2) {
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  let start = Math.max(2, current - siblings);
  let end = Math.min(count - 1, current + siblings);
  if (start <= 3) {
    start = 2;
    end = Math.max(end, 3 + siblings * 2);
  }
  if (end >= count - 2) {
    end = count - 1;
    start = Math.min(start, count - 2 - siblings * 2);
  }

  const pages: (number | null)[] = [1];
  if (start > 2) pages.push(null);
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < count - 1) pages.push(null);
  pages.push(count);
  return pages;
}

/**
 * Page navigation with a page-size selector and a "11–20 of 95" summary.
 * Pages are 1-based. It only reports changes, so it works for client-side
 * lists and server-side paging alike, standalone or in a DataTable's
 * `pagination` slot.
 */
export function Pagination({
  page,
  defaultPage = 1,
  onPageChange,
  pageSize,
  defaultPageSize = 10,
  onPageSizeChange,
  totalCount,
  pageSizeOptions,
  siblings = 1,
  label = 'Pagination',
  previousLabel = 'Previous page',
  nextLabel = 'Next page',
  pageLabelFormat = 'Page {0}',
  pageSizeLabel = 'Rows per page',
  summaryFormat = '{0}–{1} of {2}',
  className,
  ...rest
}: PaginationProps) {
  const [innerPage, setInnerPage] = useState(defaultPage);
  const [innerSize, setInnerSize] = useState(defaultPageSize);

  const size = Math.max(1, pageSize ?? innerSize);
  const total = Math.max(0, totalCount);
  const pageCount = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(page ?? innerPage, 1), pageCount);

  const first = total === 0 ? 0 : (current - 1) * size + 1;
  const last = Math.min(total, current * size);

  const goTo = (target: number) => {
    const next = Math.min(Math.max(target, 1), pageCount);
    if (next === current) return;
    if (page === undefined) setInnerPage(next);
    onPageChange?.(next);
  };

  const changeSize = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = Number.parseInt(event.target.value, 10);
    if (!Number.isInteger(next) || next < 1) return;
    if (pageSize === undefined) setInnerSize(next);
    onPageSizeChange?.(next);
    if (page === undefined) setInnerPage(1);
    onPageChange?.(1);
  };

  return (
    <nav {...rest} className={cx('trazos-pagination', className)} aria-label={label}>
      <p className="trazos-pagination-summary">{format(summaryFormat, first, last, total)}</p>

      <div className="trazos-pagination-controls">
        {pageSizeOptions != null && pageSizeOptions.length > 0 && (
          <label className="trazos-pagination-size">
            <span>{pageSizeLabel}</span>
            <select className="trazos-pagination-select" value={size} onChange={changeSize}>
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}

        <button
          type="button"
          className="trazos-pagination-button trazos-pagination-previous"
          aria-label={previousLabel}
          disabled={current <= 1}
          onClick={() => {
            goTo(current - 1);
          }}
        >
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>

        <ol className="trazos-pagination-pages">
          {visiblePages(current, pageCount, siblings).map((number, index) =>
            number === null ? (
              <li key={`gap-${index}`} className="trazos-pagination-gap" aria-hidden="true">
                …
              </li>
            ) : (
              <li key={number}>
                <button
                  type="button"
                  className={cx(
                    'trazos-pagination-button',
                    'trazos-pagination-page',
                    number === current && 'trazos-pagination-page-current',
                  )}
                  aria-current={number === current ? 'page' : undefined}
                  aria-label={format(pageLabelFormat, number)}
                  onClick={() => {
                    goTo(number);
                  }}
                >
                  {number}
                </button>
              </li>
            ),
          )}
        </ol>

        <button
          type="button"
          className="trazos-pagination-button trazos-pagination-next"
          aria-label={nextLabel}
          disabled={current >= pageCount}
          onClick={() => {
            goTo(current + 1);
          }}
        >
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
