import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './Card.css';

/** Mirrors `Trazos.UI.Components.CardVariant`. `white` renders like `default`, as in Razor. */
export type CardVariant = 'default' | 'white' | 'lavender' | 'interactive';

export interface CardProps extends ComponentPropsWithRef<'div'> {
  variant?: CardVariant;
  header?: ReactNode;
  footer?: ReactNode;
}

const variantClass: Record<CardVariant, string> = {
  default: 'default',
  white: 'default',
  lavender: 'lavender',
  interactive: 'interactive',
};

export function Card({ variant = 'default', header, footer, className, children, ...rest }: CardProps) {
  return (
    <div {...rest} className={cx('trazos-card-box', `trazos-card-${variantClass[variant]}`, className)}>
      {header != null && <div className="trazos-card-header">{header}</div>}
      <div className="trazos-card-body">{children}</div>
      {footer != null && <div className="trazos-card-footer">{footer}</div>}
    </div>
  );
}
