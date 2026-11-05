import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../internal/cx';
import './IconBox.css';

/** Mirrors `Trazos.UI.Components.IconBoxVariant`. */
export type IconBoxVariant = 'primary' | 'lavender' | 'cream' | 'wine' | 'neutral';

/** Mirrors `Trazos.UI.Components.IconBoxSize`. */
export type IconBoxSize = 'small' | 'medium' | 'large';

export interface IconBoxProps extends ComponentPropsWithRef<'div'> {
  variant?: IconBoxVariant;
  size?: IconBoxSize;
}

const sizeClass: Record<IconBoxSize, string> = {
  small: 'sm',
  medium: 'md',
  large: 'lg',
};

/** Decorative frame for an icon; hidden from assistive technology, as in Razor. */
export function IconBox({ variant = 'primary', size = 'medium', className, children, ...rest }: IconBoxProps) {
  return (
    <div
      aria-hidden="true"
      {...rest}
      className={cx('trazos-icon-box', `trazos-icon-box-${variant}`, `trazos-icon-box-${sizeClass[size]}`, className)}
    >
      {children}
    </div>
  );
}
