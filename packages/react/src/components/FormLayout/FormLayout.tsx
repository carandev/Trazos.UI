import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './FormLayout.css';

export interface FormGridProps extends ComponentPropsWithRef<'div'> {
  /**
   * Columns on wide screens, 1 to 4. Phones show one; tablets at most two.
   * Give a child the `trazos-form-full` class to span the row.
   */
  columns?: number;
}

/** Places form fields in 1 to 4 responsive columns. */
export function FormGrid({ columns = 2, className, ...rest }: FormGridProps) {
  const count = Math.min(4, Math.max(1, Math.trunc(columns) || 1));
  return <div {...rest} className={cx('trazos-form-grid', `trazos-form-grid-cols-${count}`, className)} />;
}

export type FormActionsAlign = 'end' | 'start' | 'between';

export interface FormActionsProps extends ComponentPropsWithRef<'div'> {
  /** `end` (default), `start`, or `between` to push the first child to the left. */
  align?: FormActionsAlign;
  /** On phones, keeps the bar at the bottom of the screen while the form scrolls. */
  sticky?: boolean;
}

/** The bar of form buttons, below a dashed rule. */
export function FormActions({ align = 'end', sticky = false, className, ...rest }: FormActionsProps) {
  return (
    <div
      {...rest}
      className={cx('trazos-form-actions', `trazos-form-actions-${align}`, sticky && 'trazos-form-actions-sticky', className)}
    />
  );
}

export interface FilterBarProps extends Omit<ComponentPropsWithRef<'div'>, 'role'> {
  /** Accessible name of the search landmark, such as "Filter employees". */
  label?: string;
  /** Buttons on the right, such as a reset action. */
  actions?: ReactNode;
}

/** Groups filter fields above a list. The fields grow to fill the row and wrap on narrow screens. */
export function FilterBar({ label, actions, className, children, ...rest }: FilterBarProps) {
  return (
    <div {...rest} className={cx('trazos-filter-bar', className)} role="search" aria-label={label}>
      <div className="trazos-filter-bar-fields">{children}</div>
      {actions != null && <div className="trazos-filter-bar-actions">{actions}</div>}
    </div>
  );
}
