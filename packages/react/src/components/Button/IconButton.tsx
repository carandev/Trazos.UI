import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../internal/cx';
import type { ButtonVariant } from './Button';

export type IconButtonSize = 'medium' | 'large';

export interface IconButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'aria-label'> {
  /** Accessible name. An icon alone has none, so this is required. */
  label: string;
  variant?: ButtonVariant;
  size?: IconButtonSize;
  /** Shows a spinner in place of the icon and disables the button. */
  loading?: boolean;
}

/** A square button that only shows an icon. Its hit area is never below 44px. */
export function IconButton({
  label,
  variant = 'ghost',
  size = 'medium',
  type = 'button',
  disabled = false,
  loading = false,
  className,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      aria-label={label}
      className={cx(
        'trazos-btn',
        'trazos-icon-btn',
        `trazos-btn-${variant}`,
        size === 'large' && 'trazos-icon-btn-lg',
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? <span className="trazos-btn-spinner" aria-hidden="true" /> : children}
    </button>
  );
}
