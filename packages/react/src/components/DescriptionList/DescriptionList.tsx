import type { ComponentPropsWithRef, CSSProperties, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './DescriptionList.css';

/** Mirrors `Trazos.UI.Components.DescriptionListVariant`. */
export type DescriptionListVariant = 'tiles' | 'plain';

/** Mirrors `Trazos.UI.Components.DescriptionTone`. Matches the Card tones. */
export type DescriptionTone = 'default' | 'olive' | 'gold' | 'wine' | 'sky';

export interface DescriptionListProps extends ComponentPropsWithRef<'dl'> {
  /** `tiles` (default) draws each item as its own small card; `plain` is a compact label/value grid. */
  variant?: DescriptionListVariant;
  /** Maximum columns, 1 to 4. Items auto-fit by `minItemWidth`, so narrow screens show fewer and phones one. */
  columns?: number;
  /** Minimum width of an item before the grid drops a column, as a CSS length. Defaults to `12rem`. */
  minItemWidth?: string;
  /** Draws a dashed divider under each item in the `plain` variant, for dense detail pages. */
  bordered?: boolean;
}

/** Read-only detail view. Its children are `DescriptionItem` elements. */
export function DescriptionList({
  variant = 'tiles',
  columns = 2,
  minItemWidth,
  bordered = false,
  className,
  style,
  ...rest
}: DescriptionListProps) {
  const cols = Math.min(4, Math.max(1, Math.trunc(columns)));
  const custom =
    minItemWidth || style ? ({ ...(minItemWidth && { '--trazos-dl-min': minItemWidth }), ...style } as CSSProperties) : undefined;
  return (
    <dl
      {...rest}
      className={cx('trazos-dl', `trazos-dl-${variant}`, `trazos-dl-cols-${cols}`, bordered && 'trazos-dl-bordered', className)}
      style={custom}
    />
  );
}

export interface DescriptionItemProps extends ComponentPropsWithRef<'div'> {
  label: ReactNode;
  /** Plain text value. `children` take precedence. */
  value?: ReactNode;
  /** Shown when there is no value. */
  emptyText?: ReactNode;
  /** Small note under the value. */
  hint?: ReactNode;
  /** Decorative icon before the label. It is hidden from screen readers. */
  icon?: ReactNode;
  /** Buttons or links for this value, such as a CopyButton. Shown in the top-right corner, focused after the value. */
  actions?: ReactNode;
  /** Columns to span on wide lists, 1 to 4, never more than the list's `columns`. Phones show one column. */
  span?: number;
  /** Spans every column. */
  fullWidth?: boolean;
  /** Emphasizes a key value, such as net pay, with a larger value and an olive tint unless a `tone` is set. */
  highlight?: boolean;
  /** Accent color, matching the Card tones. */
  tone?: DescriptionTone;
}

export function DescriptionItem({
  label,
  value,
  emptyText = '—',
  hint,
  icon,
  actions,
  span = 1,
  fullWidth = false,
  highlight = false,
  tone = 'default',
  className,
  children,
  ...rest
}: DescriptionItemProps) {
  const content = children ?? (value === '' ? null : value);
  const isEmpty = content == null || content === false;
  const spanCols = Math.min(4, Math.max(1, Math.trunc(span)));
  const toneName = tone === 'default' && highlight ? 'olive' : tone;

  return (
    <div
      {...rest}
      className={cx(
        'trazos-dl-item',
        fullWidth && 'trazos-dl-item-full',
        spanCols > 1 && `trazos-dl-span-${spanCols}`,
        highlight && 'trazos-dl-highlight',
        toneName !== 'default' && `trazos-dl-tone-${toneName}`,
        className,
      )}
    >
      <dt className="trazos-dl-label">
        {icon != null && icon !== false && (
          <span className="trazos-dl-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="trazos-dl-label-text">{label}</span>
      </dt>
      <dd className={cx('trazos-dl-value', isEmpty && 'trazos-dl-value-empty')}>{isEmpty ? emptyText : content}</dd>
      {hint != null && hint !== '' && <dd className="trazos-dl-hint">{hint}</dd>}
      {actions != null && actions !== false && <dd className="trazos-dl-actions">{actions}</dd>}
    </div>
  );
}
