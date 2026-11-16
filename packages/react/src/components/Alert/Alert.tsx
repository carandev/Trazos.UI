import { useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './Alert.css';

/** Mirrors `Trazos.UI.Components.AlertTone`. */
export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  /** Warning and danger use `role="alert"`; info and success use `role="status"`. */
  tone?: AlertTone;
  /** Bold first line. */
  title?: ReactNode;
  /** Buttons or links shown below the body. */
  actions?: ReactNode;
  /** Replaces the tone's default icon. */
  icon?: ReactNode;
  /** Shows a close button. The alert hides itself and calls `onDismiss`. */
  dismissible?: boolean;
  /** Accessible name of the close button. */
  dismissLabel?: string;
  onDismiss?: () => void;
}

const iconPath: Record<AlertTone, string> = {
  info: 'm11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z',
  success: 'm4.5 12.75 6 6 9-13.5',
  warning:
    'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z',
  danger: 'M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z',
};

/**
 * Inline, persistent message. Unlike a toast it stays in the page until the
 * user or the app removes it, so it also fits inside a Modal.
 */
export function Alert({
  tone = 'info',
  title,
  actions,
  icon,
  dismissible = false,
  dismissLabel = 'Dismiss',
  onDismiss,
  className,
  children,
  ...rest
}: AlertProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const role = tone === 'warning' || tone === 'danger' ? 'alert' : 'status';

  return (
    <div role={role} {...rest} className={cx('trazos-alert', `trazos-alert-${tone}`, className)}>
      <span className="trazos-alert-icon" aria-hidden="true">
        {icon ?? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath[tone]} />
          </svg>
        )}
      </span>

      <div className="trazos-alert-content">
        {title != null && title !== '' && <p className="trazos-alert-title">{title}</p>}
        {children != null && <div className="trazos-alert-body">{children}</div>}
        {actions != null && <div className="trazos-alert-actions">{actions}</div>}
      </div>

      {dismissible && (
        <button
          type="button"
          className="trazos-alert-dismiss"
          aria-label={dismissLabel}
          onClick={() => {
            setDismissed(true);
            onDismiss?.();
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
