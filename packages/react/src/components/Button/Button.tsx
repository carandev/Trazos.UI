import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './Button.css';

/** Mirrors `Trazos.UI.Components.ButtonVariant`. */
export type ButtonVariant = 'primary' | 'wine' | 'secondary' | 'outline' | 'cream' | 'lavender' | 'ghost';

/** Mirrors `Trazos.UI.Components.ButtonSize`. */
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner, disables the button and hides both icons. */
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const sizeClass: Record<ButtonSize, string> = {
  small: 'sm',
  medium: 'md',
  large: 'lg',
};

/** The classes shared by every element styled as a button. */
export function buttonClasses(variant: ButtonVariant, size: ButtonSize, className?: string): string {
  return cx('trazos-btn', `trazos-btn-${variant}`, `trazos-btn-${sizeClass[size]}`, className);
}

export function Button({
  variant = 'primary',
  size = 'medium',
  type = 'button',
  disabled = false,
  loading = false,
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <span className="trazos-btn-spinner" aria-hidden="true" />
      ) : (
        leadingIcon != null && <span className="trazos-btn-leading-icon">{leadingIcon}</span>
      )}
      <span className="trazos-btn-text">{children}</span>
      {!loading && trailingIcon != null && <span className="trazos-btn-trailing-icon">{trailingIcon}</span>}
    </button>
  );
}
