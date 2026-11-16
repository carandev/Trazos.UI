import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../internal/cx';
import './Ribbon.css';

/** Color of a ribbon. Mirrors `Trazos.UI.Components.RibbonTone`. */
export type RibbonTone = 'olive' | 'wine' | 'gold' | 'sky' | 'neutral';

/** Corner of a ribbon. Mirrors `Trazos.UI.Components.RibbonPosition`. */
export type RibbonPosition = 'top-right' | 'top-left';

export interface RibbonProps extends ComponentPropsWithRef<'span'> {
  /** Short status text, such as DRAFT or PAID. */
  text: string;
  tone?: RibbonTone;
  position?: RibbonPosition;
}

/**
 * A diagonal status band across a corner. Place it inside an element with
 * `position: relative`, such as a Card with `style={{ position: 'relative' }}`.
 */
export function Ribbon({ text, tone = 'olive', position = 'top-right', className, ...rest }: RibbonProps) {
  return (
    <span
      {...rest}
      className={cx('trazos-ribbon', `trazos-ribbon-${tone}`, `trazos-ribbon-${position}`, 'trazos-print-exact', className)}
    >
      <span className="trazos-ribbon-band">{text}</span>
    </span>
  );
}
