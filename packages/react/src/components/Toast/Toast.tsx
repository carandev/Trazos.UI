import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './Toast.css';

/** Mirrors `Trazos.UI.Components.Toast.ToastType`. */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/** Same methods and payloads as the Razor static `Toast.ShowXxx(message, title?)`. */
export interface ToastApi {
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

/** Time a toast stays visible before it starts leaving (Razor: 5000 ms). */
export const TOAST_DURATION_MS = 5000;
/** Duration of the exit animation before the toast is removed (Razor: 300 ms). */
export const TOAST_EXIT_MS = 300;

interface ToastItem {
  id: number;
  message: string;
  title: string | undefined;
  type: ToastType;
  exiting: boolean;
}

/** Without a provider there is no stack to render; like the Razor static API, calls are no-ops. */
const noop = () => undefined;
const noProvider: ToastApi = { showSuccess: noop, showError: noop, showWarning: noop, showInfo: noop };

const ToastContext = createContext<ToastApi>(noProvider);

export interface ToastProviderProps {
  children?: ReactNode;
  /** Accessible label of each toast's dismiss button. */
  closeButtonAriaLabel?: string;
}

const svgProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  fill: 'none',
  viewBox: '0 0 24 24',
  strokeWidth: '2.5',
  stroke: 'currentColor',
  'aria-hidden': true,
} as const;

const iconPaths: Record<ToastType, string> = {
  success: 'm4.5 12.75 6 6 9-13.5',
  error: 'M6 18 18 6M6 6l12 12',
  warning:
    'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z',
  info: 'm11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z',
};

/**
 * Renders the toast stack (Razor `<Toast />`) and provides `useToast()` to its descendants.
 */
export function ToastProvider({ children, closeButtonAriaLabel = 'Cerrar notificación' }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  const schedule = useCallback((callback: () => void, delay: number) => {
    const handle = setTimeout(() => {
      timers.current.delete(handle);
      callback();
    }, delay);
    timers.current.add(handle);
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const handle of pending) clearTimeout(handle);
      pending.clear();
    };
  }, []);

  const remove = useCallback(
    (id: number) => {
      setToasts((list) => list.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
      schedule(() => {
        setToasts((list) => list.filter((t) => t.id !== id));
      }, TOAST_EXIT_MS);
    },
    [schedule],
  );

  const add = useCallback(
    (type: ToastType, message: string, title?: string) => {
      const id = nextId.current++;
      setToasts((list) => [...list, { id, message, title, type, exiting: false }]);
      schedule(() => {
        remove(id);
      }, TOAST_DURATION_MS);
    },
    [schedule, remove],
  );

  const api = useMemo<ToastApi>(
    () => ({
      showSuccess: (message, title) => {
        add('success', message, title);
      },
      showError: (message, title) => {
        add('error', message, title);
      },
      showWarning: (message, title) => {
        add('warning', message, title);
      },
      showInfo: (message, title) => {
        add('info', message, title);
      },
    }),
    [add],
  );

  return (
    <ToastContext value={api}>
      {children}
      <div className="trazos-toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            aria-atomic="true"
            className={cx('trazos-toast', `trazos-toast-${toast.type}`, toast.exiting && 'trazos-toast-exit')}
          >
            <div className="trazos-toast-icon">
              <svg {...svgProps} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[toast.type]} />
              </svg>
            </div>
            <div className="trazos-toast-content">
              {toast.title != null && toast.title !== '' && <strong className="trazos-toast-title">{toast.title}</strong>}
              <p className="trazos-toast-message">{toast.message}</p>
            </div>
            <button
              type="button"
              className="trazos-toast-close"
              onClick={() => {
                remove(toast.id);
              }}
              aria-label={closeButtonAriaLabel}
            >
              <svg {...svgProps} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths.error} />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

/** Returns the toast API of the nearest `ToastProvider`; its methods are no-ops outside one. */
export function useToast(): ToastApi {
  return useContext(ToastContext);
}
