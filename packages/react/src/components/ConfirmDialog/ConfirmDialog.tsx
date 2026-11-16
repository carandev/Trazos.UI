import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '../Button';
import type { ButtonVariant } from '../Button';
import { TextArea } from '../Input';
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

/** Mirrors the Razor `PromptDialogOptions` record: a confirmation that asks for a typed reason or comment. */
export interface PromptDialogOptions {
  /** Explanation shown above the field. */
  message: string;
  /** Defaults to "Confirm action". */
  title?: string;
  /** Label of the text field. Defaults to "Reason". */
  inputLabel?: string;
  /** Defaults to "Confirm". */
  confirmText?: string;
  /** Defaults to "Cancel". */
  cancelText?: string;
  /** Defaults to `'primary'`; use `'wine'` for a rejection. */
  confirmVariant?: ButtonVariant;
  placeholder?: string;
  /** The text cannot be empty. Defaults to `true`. */
  required?: boolean;
  /** Minimum length after trimming; `0` (default) turns the check off. */
  minLength?: number;
  /** Maximum length, enforced by the field. Defaults to 500. */
  maxLength?: number;
  /** Shown when the text is empty and `required` is on. */
  requiredMessage?: string;
  /** Shown when the text is too short. `{0}` is `minLength`. */
  minLengthMessage?: string;
  /** Text already in the field when the dialog opens. */
  initialText?: string;
  /** Defaults to `'small'`. */
  size?: ModalSize;
}

/** Answer of a prompt dialog (Razor `PromptResult`). */
export interface PromptResult {
  /** The user confirmed with valid text. */
  confirmed: boolean;
  /** The trimmed text; `null` when cancelled or left empty. */
  text: string | null;
}

/** Opens the prompt; resolves when the user confirms with valid text or cancels. */
export type PromptFn = (options: PromptDialogOptions) => Promise<PromptResult>;

export const promptDialogDefaults = {
  title: 'Confirm action',
  inputLabel: 'Reason',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  confirmVariant: 'primary',
  placeholder: '',
  required: true,
  minLength: 0,
  maxLength: 500,
  requiredMessage: 'This field is required.',
  minLengthMessage: 'Write at least {0} characters.',
  initialText: '',
  size: 'small',
} as const satisfies Required<Omit<PromptDialogOptions, 'message'>>;

type ResolvedPrompt = Required<PromptDialogOptions>;

const cancelled: PromptResult = { confirmed: false, text: null };

const noPromptProvider: PromptFn = () => Promise.resolve(cancelled);

const PromptContext = createContext<PromptFn>(noPromptProvider);

interface PendingPrompt {
  id: number;
  options: ResolvedPrompt;
  resolve: (value: PromptResult) => void;
}

function validate(options: ResolvedPrompt, text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.length === 0) return options.required ? options.requiredMessage : null;
  return options.minLength > 0 && trimmed.length < options.minLength
    ? options.minLengthMessage.replace(/\{0\}/g, String(options.minLength))
    : null;
}

interface PromptDialogProps {
  options: ResolvedPrompt;
  onSettle: (result: PromptResult) => void;
}

/** The prompt modal; mounted fresh (by key) for every request. */
function PromptDialog({ options, onSettle }: PromptDialogProps) {
  const [text, setText] = useState(options.initialText);
  const [error, setError] = useState<string | null>(null);

  const cancel = () => {
    onSettle(cancelled);
  };

  const confirm = () => {
    const problem = validate(options, text);
    setError(problem);
    if (problem !== null) return;
    const trimmed = text.trim();
    onSettle({ confirmed: true, text: trimmed.length === 0 ? null : trimmed });
  };

  return (
    <Modal
      open
      title={options.title}
      size={options.size}
      closeOnBackdropClick={false}
      showCloseButton
      onClose={cancel}
      footer={
        <>
          <Button variant="outline" className="trazos-prompt-cancel" onClick={cancel}>
            {options.cancelText}
          </Button>
          <Button variant={options.confirmVariant} className="trazos-prompt-confirm" onClick={confirm}>
            {options.confirmText}
          </Button>
        </>
      }
    >
      <div className="trazos-prompt-body">
        <p className="trazos-confirm-message">{options.message}</p>
        <TextArea
          label={options.inputLabel}
          placeholder={options.placeholder || undefined}
          rows={3}
          required={options.required}
          maxLength={options.maxLength}
          error={error ?? undefined}
          value={text}
          onValueChange={(value) => {
            setText(value);
            // Once an error shows, it follows the text as the user fixes it.
            if (error !== null) setError(validate(options, value));
          }}
        />
      </div>
    </Modal>
  );
}

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

/** Drops `undefined` fields so they do not override the defaults when spread. */
function withoutUndefined<O extends object>(options: O): Partial<O> {
  return Object.fromEntries(Object.entries(options).filter(([, value]) => value !== undefined)) as Partial<O>;
}

/**
 * Renders the confirm and prompt dialogs (Razor `ConfirmDialogContainer`) and
 * provides `useConfirm()` (Razor `IDialogService`) and `usePrompt()` (Razor
 * `IPromptDialogService`) to its descendants.
 */
export function ConfirmDialogProvider({ children }: ConfirmDialogProviderProps) {
  const [pending, setPending] = useState<Pending | null>(null);
  const pendingRef = useRef<Pending | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<PendingPrompt | null>(null);
  const promptRef = useRef<PendingPrompt | null>(null);
  const promptId = useRef(0);

  const settlePrompt = useCallback((result: PromptResult) => {
    const current = promptRef.current;
    promptRef.current = null;
    setPendingPrompt(null);
    current?.resolve(result);
  }, []);

  const prompt = useCallback<PromptFn>((options) => {
    // A newer prompt replaces the open one; the replaced one resolves cancelled.
    promptRef.current?.resolve(cancelled);
    return new Promise<PromptResult>((resolve) => {
      promptId.current += 1;
      const next: PendingPrompt = {
        id: promptId.current,
        options: { ...promptDialogDefaults, ...withoutUndefined(options), message: options.message },
        resolve,
      };
      promptRef.current = next;
      setPendingPrompt(next);
    });
  }, []);

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
  useEffect(
    () => () => {
      pendingRef.current?.resolve(false);
      promptRef.current?.resolve(cancelled);
    },
    [],
  );

  const cancel = useCallback(() => {
    settle(false);
  }, [settle]);

  return (
    <ConfirmContext value={confirm}>
      <PromptContext value={prompt}>{children}</PromptContext>
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
      {pendingPrompt !== null && (
        <PromptDialog key={pendingPrompt.id} options={pendingPrompt.options} onSettle={settlePrompt} />
      )}
    </ConfirmContext>
  );
}

/** Returns `confirm(...)` from the nearest `ConfirmDialogProvider`; resolves `false` outside one. */
export function useConfirm(): ConfirmFn {
  return useContext(ConfirmContext);
}

/**
 * Returns `prompt(options)` from the nearest `ConfirmDialogProvider`: a
 * confirmation that requires a typed reason, for approve, reject and cancel
 * flows. Resolves `{ confirmed: false, text: null }` outside a provider.
 */
export function usePrompt(): PromptFn {
  return useContext(PromptContext);
}
