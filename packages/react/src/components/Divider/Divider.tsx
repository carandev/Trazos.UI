import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../internal/cx';
import './Divider.css';

export interface DividerProps extends ComponentPropsWithRef<'div'> {
  /** Text in the middle of a horizontal divider, such as a form section name. Also its accessible name. */
  label?: string;
  /** Separates items in a row. Stretches to the height of the row and ignores `label`. */
  vertical?: boolean;
  /** Draws a dashed line, like a cut mark. */
  dashed?: boolean;
}

export function Divider({ label, vertical = false, dashed = false, className, ...rest }: DividerProps) {
  const hasLabel = !vertical && label != null && label !== '';

  return (
    <div
      role="separator"
      aria-orientation={vertical ? 'vertical' : undefined}
      aria-label={hasLabel ? label : undefined}
      {...rest}
      className={cx(
        'trazos-divider',
        vertical ? 'trazos-divider-vertical' : 'trazos-divider-horizontal',
        dashed && 'trazos-divider-dashed',
        hasLabel && 'trazos-divider-labeled',
        className,
      )}
    >
      {hasLabel && (
        <>
          <span className="trazos-divider-line" aria-hidden="true" />
          <span className="trazos-divider-label" aria-hidden="true">
            {label}
          </span>
          <span className="trazos-divider-line" aria-hidden="true" />
        </>
      )}
    </div>
  );
}
