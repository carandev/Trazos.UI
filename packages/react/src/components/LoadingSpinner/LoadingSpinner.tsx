import { useId, type ComponentPropsWithRef } from 'react';
import { cx } from '../../internal/cx';
import './LoadingSpinner.css';

export interface LoadingSpinnerProps extends ComponentPropsWithRef<'div'> {
  /** Visible text under the spinner; it also names the status region. */
  message?: string;
  /** Covers the whole viewport with a veil. */
  overlay?: boolean;
  /** Accessible name used when there is no `message`. */
  label?: string;
}

export function LoadingSpinner({
  message,
  overlay = false,
  label = 'Cargando',
  className,
  ...rest
}: LoadingSpinnerProps) {
  const messageId = useId();
  return (
    <div
      role="status"
      aria-label={message ? undefined : label}
      aria-labelledby={message ? messageId : undefined}
      {...rest}
      className={cx('trazos-loading-spinner', overlay && 'trazos-loading-overlay', className)}
    >
      <div className="trazos-spinner-container">
        <div className="trazos-spinner" aria-hidden="true">
          <div className="trazos-spinner-inner" />
        </div>
        {message ? <p id={messageId} className="trazos-loading-message">{message}</p> : null}
      </div>
    </div>
  );
}
