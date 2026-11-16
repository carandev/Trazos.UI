import { useId, type ComponentPropsWithRef } from 'react';
import { cx } from '../../internal/cx';
import './ProgressBar.css';

/** Fill color. Mirrors `Trazos.UI.Components.ProgressTone`. */
export type ProgressTone = 'olive' | 'gold' | 'wine' | 'sky';

export interface ProgressBarProps extends ComponentPropsWithRef<'div'> {
  value?: number;
  max?: number;
  /** Visible label, also the accessible name. */
  label?: string;
  /** Accessible name when there is no visible label. */
  ariaLabel?: string;
  /** Text for the value, such as "3 of 7". Defaults to a percentage. */
  valueText?: string;
  /** Shows the value next to the label. */
  showValue?: boolean;
  /** Unknown duration: an animated bar with no value. Static with reduced motion. */
  indeterminate?: boolean;
  tone?: ProgressTone;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function ProgressBar({
  value = 0,
  max = 100,
  label,
  ariaLabel,
  valueText,
  showValue = true,
  indeterminate = false,
  tone = 'olive',
  className,
  ...rest
}: ProgressBarProps) {
  const labelId = `trazos-progress-${useId()}`;
  const hasLabel = label != null && label !== '';
  const upper = max <= 0 ? 0 : max;
  const clamped = Math.min(Math.max(value, 0), upper);
  const percent = max <= 0 ? 0 : round2((clamped / max) * 100);
  const display = valueText ?? `${Math.round(percent)}%`;

  return (
    <div
      {...rest}
      className={cx('trazos-progress', `trazos-progress-${tone}`, indeterminate && 'trazos-progress-indeterminate', className)}
    >
      {(hasLabel || showValue) && (
        <div className="trazos-progress-header">
          {hasLabel && (
            <span id={labelId} className="trazos-progress-label">
              {label}
            </span>
          )}
          {showValue && !indeterminate && (
            <span className="trazos-progress-value" aria-hidden="true">
              {display}
            </span>
          )}
        </div>
      )}
      <div
        className="trazos-progress-track"
        role="progressbar"
        aria-labelledby={hasLabel ? labelId : undefined}
        aria-label={hasLabel ? undefined : ariaLabel}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : upper}
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-valuetext={indeterminate ? undefined : valueText}
      >
        <div className="trazos-progress-fill" style={indeterminate ? undefined : { width: `${percent}%` }} />
      </div>
    </div>
  );
}
