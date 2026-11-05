import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '../Button';
import type { ButtonVariant } from '../Button';
import { Modal } from '../Modal';
import type { ModalSize } from '../Modal';
import './ConfirmDialog.css';

/** Mirrors the Razor `ConfirmDialogOptions` record; omitted fields take its defaults. */
export interface ConfirmDialogOptions {
  message: string;
  /** Defaults to "Confirmar acción". */
  title?: string;
  /** Defaults to "Confirmar". */
  confirmText?: string;
  /** Defaults to "Cancelar". */
  cancelText?: string;
  /** Defaults to `'primary'`. */
  confirmVariant?: ButtonVariant;
  /** Defaults to `'small'`. */
  size?: ModalSize;
}

/** Everything but the message, for the `confirm(message, overrides)` overload. */
export type ConfirmOverrides = Omit<ConfirmDialogOptions, 'message'>;

/** Asks the user to confirm; resolves `true` on confirm and `false` on cancel, close or Escape. */
export interface ConfirmFn {
  (options: ConfirmDialogOptions): Promise<boolean>;
  (message: string, overrides?: ConfirmOverrides): Promise<boolean>;
}

export const confirmDialogDefaults = {
  title: 'Confirmar acción',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  confirmVariant: 'primary',
  size: 'small',
} as const satisfies Required<ConfirmOverrides>;

type ResolvedOptions = Required<ConfirmDialogOptions>;

/** Without a provider there is no dialog to show: resolve `false` for safety, like the Razor service. */
const noProvider: ConfirmFn = () => Promise.resolve(false);

const ConfirmContext = createContext<ConfirmFn>(noProvider);

export interface ConfirmDialogProviderProps {
  children?: ReactNode;
}

interface Pending {
  options: ResolvedOptions;
  resolve: (value: boolean) => void;
}

/**
 * Renders the confirm dialog (Razor `ConfirmDialogContainer`) and provides
 * `useConfirm()` to its descendants (Razor `IDialogService`).
 */
export function ConfirmDialogProvider({ children }: ConfirmDialogProviderProps) {
  const [pending, setPending] = useState<Pending | null>(null);
  const pendingRef = useRef<Pending | null>(null);

  const settle = useCallback((value: boolean) => {
    const current = pendingRef.current;
    pendingRef.current = null;
    setPending(null);
    current?.resolve(value);
  }, []);

  const confirm = useCallback<ConfirmFn>(
    (optionsOrMessage: ConfirmDialogOptions | string, overrides?: ConfirmOverrides) => {
      const options =
        typeof optionsOrMessage === 'string' ? { ...overrides, message: optionsOrMessage } : optionsOrMessage;
      // A newer request replaces the open one; the replaced request resolves false.
      pendingRef.current?.resolve(false);
      return new Promise<boolean>((resolve) => {
        const next: Pending = {
          options: {
            message: options.message,
            title: options.title ?? confirmDialogDefaults.title,
            confirmText: options.confirmText ?? confirmDialogDefaults.confirmText,
            cancelText: options.cancelText ?? confirmDialogDefaults.cancelText,
            confirmVariant: options.confirmVariant ?? confirmDialogDefaults.confirmVariant,
            size: options.size ?? confirmDialogDefaults.size,
          },
          resolve,
        };
        pendingRef.current = next;
        setPending(next);
      });
    },
    [],
  );

  // Never leave a caller awaiting forever when the provider goes away.
  useEffect(() => () => pendingRef.current?.resolve(false), []);

  const cancel = useCallback(() => {
    settle(false);
  }, [settle]);

  return (
    <ConfirmContext value={confirm}>
      {children}
      {pending !== null && (
        <Modal
          open
          title={pending.options.title}
          size={pending.options.size}
          closeOnBackdropClick={false}
          showCloseButton
          onClose={cancel}
          footer={
            <>
              <Button variant="outline" onClick={cancel}>
                {pending.options.cancelText}
              </Button>
              <Button
                variant={pending.options.confirmVariant}
                onClick={() => {
                  settle(true);
                }}
              >
                {pending.options.confirmText}
              </Button>
            </>
          }
        >
          <p className="trazos-confirm-message">{pending.options.message}</p>
        </Modal>
      )}
    </ConfirmContext>
  );
}

/** Returns `confirm(...)` from the nearest `ConfirmDialogProvider`; resolves `false` outside one. */
export function useConfirm(): ConfirmFn {
  return useContext(ConfirmContext);
}
