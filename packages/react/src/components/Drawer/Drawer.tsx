import { useId, useRef, useState } from 'react';
import type { ComponentPropsWithRef, ReactNode, TouchEvent } from 'react';
import { cx } from '../../internal/cx';
import { useBodyScrollLock } from '../../internal/useBodyScrollLock';
import { useFocusTrap } from '../../internal/useFocusTrap';
import './Drawer.css';

/** Body class toggled while the drawer is open (same as the Razor `Drawer`). */
const BODY_CLASS = 'trazos-drawer-open';

/** Horizontal swipe distance, in pixels, that opens the drawer from the touch area. */
const SWIPE_OPEN_THRESHOLD = 100;

export interface DrawerProps extends Omit<ComponentPropsWithRef<'aside'>, 'title'> {
  /** Controlled open state (Razor `@bind-IsOpen`). */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  /** Called with the new open state (Razor `IsOpenChanged`), including swipe-to-open. */
  onOpenChange?: (open: boolean) => void;
  /** Called after the drawer closes (Razor `OnClose`). */
  onClose?: () => void;
  title?: ReactNode;
  /** Replaces the title in the drawer header. */
  header?: ReactNode;
  showCloseButton?: boolean;
  closeButtonAriaLabel?: string;
}

export function Drawer({
  open,
  defaultOpen = false,
  onOpenChange,
  onClose,
  title,
  header,
  showCloseButton = true,
  closeButtonAriaLabel = 'Cerrar menú',
  className,
  children,
  ref,
  ...rest
}: DrawerProps) {
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const isOpen = open ?? innerOpen;
  const titleId = useId();
  const touchStartX = useRef(0);
  const dragging = useRef(false);

  const setOpen = (next: boolean) => {
    if (open === undefined) setInnerOpen(next);
    onOpenChange?.(next);
  };

  const close = () => {
    setOpen(false);
    onClose?.();
  };

  useBodyScrollLock(isOpen, BODY_CLASS);
  const asideRef = useFocusTrap<HTMLElement>(isOpen, { onEscape: close, forwardedRef: ref });

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (touch === undefined) return;
    touchStartX.current = touch.clientX;
    dragging.current = true;
  };

  const onTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!dragging.current || isOpen || touch === undefined) return;
    if (touch.clientX - touchStartX.current > SWIPE_OPEN_THRESHOLD) {
      dragging.current = false;
      setOpen(true);
    }
  };

  const onTouchEnd = () => {
    dragging.current = false;
  };

  const hasTitle = title != null && title !== '';

  return (
    <div className="trazos-touch-area" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {isOpen && (
        // Pointer-only affordance: keyboard users close with Escape or the close button.
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div className="trazos-drawer-overlay" onClick={close} />
      )}

      <aside
        aria-labelledby={header == null && hasTitle ? titleId : undefined}
        tabIndex={-1}
        {...rest}
        ref={asideRef}
        className={cx('trazos-drawer', isOpen && 'open', className)}
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="trazos-drawer-header">
          {header ??
            (hasTitle && (
              <h2 className="trazos-drawer-title" id={titleId}>
                {title}
              </h2>
            ))}

          {showCloseButton && (
            <button type="button" className="trazos-drawer-close" onClick={close} aria-label={closeButtonAriaLabel}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="trazos-close-icon"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="trazos-drawer-body">{children}</div>
      </aside>
    </div>
  );
}
