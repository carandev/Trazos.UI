import { useId, useState } from 'react';
import type { ComponentPropsWithRef, MouseEvent, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { useFocusTrap } from '../../internal/useFocusTrap';
import './Modal.css';

/** Mirrors the `Size` string accepted by the Razor `Modal` ("small" | "medium" | "large"). */
export type ModalSize = 'small' | 'medium' | 'large';

export interface ModalProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  /** Controlled open state (Razor `@bind-IsOpen`). */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called with the new open state (Razor `IsOpenChanged`). */
  onOpenChange?: (open: boolean) => void;
  /** Called after the modal closes (Razor `OnClose`). */
  onClose?: () => void;
  title?: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  /** Accessible label of the close button. */
  closeButtonAriaLabel?: string;
}

const sizeClass: Record<ModalSize, string> = {
  small: 'trazos-modal-small',
  medium: 'trazos-modal-medium',
  large: 'trazos-modal-large',
};

export function Modal({
  open,
  defaultOpen = false,
  onOpenChange,
  onClose,
  title = '',
  footer,
  size = 'medium',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeButtonAriaLabel = 'Cerrar',
  className,
  children,
  ref,
  ...rest
}: ModalProps) {
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const isOpen = open ?? innerOpen;
  const titleId = useId();

  const close = () => {
    if (open === undefined) setInnerOpen(false);
    onOpenChange?.(false);
    onClose?.();
  };

  const containerRef = useFocusTrap<HTMLDivElement>(isOpen, { onEscape: close, forwardedRef: ref });

  if (!isOpen) return null;

  const onBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    // Razor stops propagation on the container; only direct backdrop clicks close.
    if (closeOnBackdropClick && event.target === event.currentTarget) close();
  };

  const hasTitle = title !== '' && title != null;

  return (
    // Pointer-only affordance: keyboard users close with Escape or the close button.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="trazos-modal-backdrop" onClick={onBackdropClick}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={hasTitle ? titleId : undefined}
        tabIndex={-1}
        {...rest}
        ref={containerRef}
        className={cx('trazos-modal-container', sizeClass[size], className)}
      >
        <div className="trazos-modal-header">
          <h3 className="trazos-modal-title" id={titleId}>
            {title}
          </h3>
          {showCloseButton && (
            <button type="button" className="trazos-modal-close" onClick={close} aria-label={closeButtonAriaLabel}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-5 h-5"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="trazos-modal-body">{children}</div>
        {footer != null && <div className="trazos-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
