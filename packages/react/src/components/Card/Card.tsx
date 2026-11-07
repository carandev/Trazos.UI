import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './Card.css';

/**
 * Mirrors `Trazos.UI.Components.CardVariant`. `white` renders like `default`, as in Razor.
 */
export type CardVariant = 'default' | 'white' | 'lavender' | 'interactive' | 'olive' | 'gold' | 'wine' | 'sky';

export interface CardProps extends ComponentPropsWithRef<'div'> {
  variant?: CardVariant;
  /** Rendered above the header and body, such as a cover image. It keeps its own aspect ratio. */
  media?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  /** Makes the body fill the card height, so `margin-top: auto` pins a row to the bottom in an equal-height grid. */
  fill?: boolean;
}

const variantClass: Record<CardVariant, string> = {
  default: 'default',
  white: 'default',
  lavender: 'lavender',
  interactive: 'interactive',
  olive: 'olive',
  gold: 'gold',
  wine: 'wine',
  sky: 'sky',
};

export function Card({ variant = 'default', media, header, footer, fill = false, className, children, ...rest }: CardProps) {
  return (
    <div {...rest} className={cx('trazos-card-box', `trazos-card-${variantClass[variant]}`, fill && 'trazos-card-fill', className)}>
      {media != null && <div className="trazos-card-media">{media}</div>}
      {header != null && <div className="trazos-card-header">{header}</div>}
      <div className="trazos-card-body">{children}</div>
      {footer != null && <div className="trazos-card-footer">{footer}</div>}
    </div>
  );
}
