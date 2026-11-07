import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './Badge.css';

/** Mirrors `Trazos.UI.Components.BadgeVariant`. */
export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'lavender' | 'cream' | 'neutral';

export interface BadgeProps extends ComponentPropsWithRef<'span'> {
  variant?: BadgeVariant;
  leadingIcon?: ReactNode;
  /** Set to `false` to keep the original case, for values such as `C#` or `lazytsql`. */
  uppercase?: boolean;
}

export function Badge({ variant = 'neutral', leadingIcon, uppercase = true, className, children, ...rest }: BadgeProps) {
  return (
    <span {...rest} className={cx('trazos-badge-box', `trazos-badge-${variant}`, !uppercase && 'trazos-badge-keep-case', className)}>
      {leadingIcon != null && <span className="trazos-badge-icon">{leadingIcon}</span>}
      <span>{children}</span>
    </span>
  );
}
