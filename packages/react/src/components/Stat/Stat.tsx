import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import type { IconBoxVariant } from '../IconBox';
import { VisuallyHidden } from '../VisuallyHidden';
import './Stat.css';

/** Direction of a delta. It sets the arrow and color only; it does not judge good or bad. Mirrors `StatTrend`. */
export type StatTrend = 'none' | 'up' | 'down' | 'flat';

/** Color of the icon well, the same names as IconBox. */
export type StatTone = IconBoxVariant;

export interface StatProps extends ComponentPropsWithRef<'div'> {
  label: ReactNode;
  /** The number, already formatted, such as `$ 148M` or `42`. */
  value: ReactNode;
  /** Change against a reference, such as `+4.2%`. */
  delta?: ReactNode;
  trend?: StatTrend;
  /** Colors a rise as bad and a fall as good, for costs or absences. */
  inverted?: boolean;
  /** Screen-reader text for the delta, such as "up from last month". */
  trendLabel?: string;
  /** Small muted line at the bottom. */
  hint?: ReactNode;
  icon?: ReactNode;
  /** Color of the icon well. */
  tone?: StatTone;
}

const arrowPath: Record<Exclude<StatTrend, 'none'>, string> = {
  up: 'm4.5 15.75 7.5-7.5 7.5 7.5',
  down: 'm19.5 8.25-7.5 7.5-7.5-7.5',
  flat: 'M5 12h14',
};

/** Dashboard number tile. */
export function Stat({
  label,
  value,
  delta,
  trend = 'none',
  inverted = false,
  trendLabel,
  hint,
  icon,
  tone = 'primary',
  className,
  ...rest
}: StatProps) {
  return (
    <div {...rest} className={cx('trazos-stat', className)}>
      <div className="trazos-stat-text">
        <p className="trazos-stat-label">{label}</p>
        <p className="trazos-stat-value">{value}</p>
        {delta != null && delta !== '' && (
          <p className={cx('trazos-stat-delta', `trazos-stat-delta-${trend}`, inverted && 'trazos-stat-delta-inverted')}>
            {trend !== 'none' && (
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={arrowPath[trend]} />
              </svg>
            )}
            <span>{delta}</span>
            {trendLabel != null && trendLabel !== '' && <VisuallyHidden>{trendLabel}</VisuallyHidden>}
          </p>
        )}
        {hint != null && hint !== '' && <p className="trazos-stat-hint">{hint}</p>}
      </div>
      {icon != null && (
        <span className={cx('trazos-stat-icon', `trazos-stat-icon-${tone}`)} aria-hidden="true">
          {icon}
        </span>
      )}
    </div>
  );
}
