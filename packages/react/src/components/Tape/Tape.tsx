import type { ComponentPropsWithRef, CSSProperties } from 'react';
import { cx } from '../../internal/cx';
import './Tape.css';

export type TapePosition = 'top' | 'top-left' | 'top-right';

export interface TapeProps extends Omit<ComponentPropsWithRef<'span'>, 'color'> {
  /** Any CSS color. Defaults to translucent gold. */
  color?: string;
  /** Rotation in degrees. Defaults to -3. */
  rotate?: number;
  position?: TapePosition;
}

/**
 * A strip of translucent tape. Its parent must be positioned, since the tape is
 * placed against the parent's top edge.
 */
export function Tape({ color, rotate, position = 'top', className, style, ...rest }: TapeProps) {
  const custom = {
    ...(color !== undefined && { '--trazos-tape-color': color }),
    ...(rotate !== undefined && { '--trazos-tape-rotate': `${rotate}deg` }),
    ...style,
  } as CSSProperties;

  return (
    <span aria-hidden="true" {...rest} className={cx('trazos-tape', `trazos-tape-${position}`, className)} style={custom} />
  );
}
