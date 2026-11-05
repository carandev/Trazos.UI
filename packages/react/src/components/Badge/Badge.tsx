import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './Badge.css';

/** Mirrors `Trazos.UI.Components.BadgeVariant`. */
export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'lavender' | 'cream' | 'neutral';

export interface BadgeProps extends ComponentPropsWithRef<'span'> {
  variant?: BadgeVariant;
  leadingIcon?: ReactNode;
}

export function Badge({ variant = 'neutral', leadingIcon, className, children, ...rest }: BadgeProps) {
  return (
    <span {...rest} className={cx('trazos-badge', `trazos-badge-${variant}`, className)}>
      {leadingIcon != null && <span className="trazos-badge-icon">{leadingIcon}</span>}
      <span>{children}</span>
    </span>
  );
}
