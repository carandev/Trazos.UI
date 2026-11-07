import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { IconButton, type IconButtonProps } from '../Button';
import { VisuallyHidden } from '../VisuallyHidden';
import './CopyButton.css';

const NOTE_DURATION_MS = 2000;

export interface CopyButtonProps extends Omit<IconButtonProps, 'children' | 'value'> {
  /** The text to copy. */
  value: string;
  /** Shown and announced after copying. There is no default, so the library stays language-neutral. */
  copiedLabel: string;
  /** Shown and announced when copying fails and there is no `fallback`. */
  errorLabel?: string;
  /** Runs when the clipboard API is missing or refuses, such as opening a `mailto:` link. */
  fallback?: (value: string) => void | Promise<void>;
  /** Runs after the value reached the clipboard. */
  onCopied?: (value: string) => void;
  icon?: ReactNode;
  checkIcon?: ReactNode;
}

type Status = 'idle' | 'copied' | 'failed';

const defaultIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const defaultCheckIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

async function writeToClipboard(value: string): Promise<void> {
  // Missing on insecure origins, despite what the DOM types say.
  const clipboard = navigator.clipboard as Clipboard | undefined;
  if (clipboard === undefined) throw new Error('Clipboard API unavailable');
  await clipboard.writeText(value);
}

/** Copies a value to the clipboard, with a handwritten note and a screen-reader announcement. */
export function CopyButton({
  value,
  copiedLabel,
  errorLabel,
  fallback,
  onCopied,
  icon = defaultIcon,
  checkIcon = defaultCheckIcon,
  onClick,
  ...rest
}: CopyButtonProps) {
  const [status, setStatus] = useState<Status>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => { clearTimeout(timer.current); }, []);

  function show(next: Status) {
    setStatus(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setStatus('idle'); }, NOTE_DURATION_MS);
  }

  async function copy() {
    try {
      await writeToClipboard(value);
    } catch {
      try {
        if (fallback === undefined) throw new Error('No fallback');
        await fallback(value);
      } catch {
        show('failed');
      }
      return;
    }
    show('copied');
    onCopied?.(value);
  }

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    void copy();
  }

  const message = status === 'copied' ? copiedLabel : status === 'failed' ? errorLabel : undefined;

  return (
    <span className="trazos-copy-button">
      <IconButton {...rest} onClick={handleClick}>
        {status === 'copied' ? checkIcon : icon}
      </IconButton>
      {message !== undefined && (
        <span className="trazos-handwriting trazos-copy-button-note" aria-hidden="true">
          {message}
        </span>
      )}
      <VisuallyHidden role="status" aria-live="polite">
        {message}
      </VisuallyHidden>
    </span>
  );
}
