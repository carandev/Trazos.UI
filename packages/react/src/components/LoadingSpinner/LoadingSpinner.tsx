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
      className={cx('loading-spinner', overlay && 'loading-overlay', className)}
    >
      <div className="spinner-container">
        <div className="spinner" aria-hidden="true">
          <div className="spinner-inner" />
        </div>
        {message ? <p id={messageId} className="loading-message">{message}</p> : null}
      </div>
    </div>
  );
}
