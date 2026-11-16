import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './DescriptionList.css';

export interface DescriptionListProps extends ComponentPropsWithRef<'dl'> {
  /** Columns on wide screens, 1 to 4. Phones show one column and tablets at most two. */
  columns?: number;
  /** Draws a dashed divider under each item, for dense detail pages. */
  bordered?: boolean;
}

/** Label and value grid for read-only detail views. Its children are `DescriptionItem` elements. */
export function DescriptionList({ columns = 2, bordered = false, className, ...rest }: DescriptionListProps) {
  const cols = Math.min(4, Math.max(1, Math.trunc(columns)));
  return <dl {...rest} className={cx('trazos-dl', `trazos-dl-cols-${cols}`, bordered && 'trazos-dl-bordered', className)} />;
}

export interface DescriptionItemProps extends ComponentPropsWithRef<'div'> {
  label: ReactNode;
  /** Plain text value. `children` take precedence. */
  value?: ReactNode;
  /** Shown when there is no value. */
  emptyText?: ReactNode;
  /** Small note under the value. */
  hint?: ReactNode;
  /** Spans every column. */
  fullWidth?: boolean;
}

export function DescriptionItem({
  label,
  value,
  emptyText = '—',
  hint,
  fullWidth = false,
  className,
  children,
  ...rest
}: DescriptionItemProps) {
  const content = children ?? (value === '' ? null : value);
  const isEmpty = content == null || content === false;

  return (
    <div {...rest} className={cx('trazos-dl-item', fullWidth && 'trazos-dl-item-full', className)}>
      <dt className="trazos-dl-label">{label}</dt>
      <dd className={cx('trazos-dl-value', isEmpty && 'trazos-dl-value-empty')}>{isEmpty ? emptyText : content}</dd>
      {hint != null && hint !== '' && <dd className="trazos-dl-hint">{hint}</dd>}
    </div>
  );
}
