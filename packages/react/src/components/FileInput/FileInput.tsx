import { useId, useState, type ChangeEvent, type ComponentPropsWithRef } from 'react';
import { cx } from '../../internal/cx';
import './FileInput.css';

export interface FileInputProps
  extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type' | 'multiple' | 'accept' | 'prefix'> {
  label?: string;
  /** Controlled list of chosen files. */
  value?: readonly File[];
  /** Initial files for uncontrolled use. */
  defaultValue?: readonly File[];
  /** Called with the new list when files are added or removed. An empty selection is `[]`. */
  onValueChange?: (files: File[]) => void;
  /** Accepted types, as in the HTML accept attribute: `'.pdf,image/*'`. Also checked for dropped files. */
  accept?: string;
  /** Largest allowed file in bytes. No limit when not set. */
  maxFileSize?: number;
  /** Lets the user add several files; new files are added to the list. */
  multiple?: boolean;
  /** Largest number of files kept when multiple is on. */
  maxFiles?: number;
  /** Bold call to action in the drop zone. */
  buttonText?: string;
  /** Text after the call to action. */
  dropText?: string;
  /** Small line in the drop zone, such as "PDF up to 5 MB". */
  hint?: string;
  /** Accessible name of each remove button. `{0}` is the file name. */
  removeLabelFormat?: string;
  /** `{0}` is the file name and `{1}` the size limit. */
  tooLargeMessage?: string;
  /** `{0}` is the file name. */
  notAcceptedMessage?: string;
  /** `{0}` is the file name and `{1}` the file limit. */
  tooManyMessage?: string;
  helperText?: string;
  /** Error message; when set it replaces the helper text and flags the drop zone. */
  error?: string;
  /** Shows the required marker next to the label. */
  required?: boolean;
}

const fill = (template: string, ...args: (string | number)[]): string =>
  template.replace(/\{(\d+)\}/g, (match, index: string) => {
    const arg = args[Number(index)];
    return arg === undefined ? match : String(arg);
  });

const oneDecimal = (n: number): string => String(Math.round(n * 10) / 10);

/** 512 B, 1.5 KB, 5.3 MB. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${String(bytes)} B`;
  if (bytes < 1024 * 1024) return `${oneDecimal(bytes / 1024)} KB`;
  return `${oneDecimal(bytes / (1024 * 1024))} MB`;
}

function isAccepted(file: File, accept: string | undefined): boolean {
  if (!accept?.trim()) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(',')
    .map((raw) => raw.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) =>
      rule.startsWith('.') ? name.endsWith(rule) : rule.endsWith('/*') ? type.startsWith(rule.slice(0, -1)) : type === rule,
    );
}

/**
 * File picker and drop zone over a native file input. It checks the accepted
 * types and the maximum size, lists the chosen files with a remove button,
 * and reports them as File[]. Reading the content stays in the app.
 * Messages are props, so the component stays language-neutral.
 */
export function FileInput({
  id,
  label,
  value,
  defaultValue = [],
  onValueChange,
  onChange,
  accept,
  maxFileSize,
  multiple = false,
  maxFiles = 10,
  buttonText = 'Choose a file',
  dropText = 'or drag it here',
  hint,
  removeLabelFormat = 'Remove {0}',
  tooLargeMessage = '{0} is larger than {1}.',
  notAcceptedMessage = '{0} is not an accepted file type.',
  tooManyMessage = '{0} was not added: the limit is {1} files.',
  helperText,
  error,
  required = false,
  disabled = false,
  className,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: FileInputProps) {
  const generatedId = `trazos-file-${useId()}`;
  const inputId = id ?? generatedId;
  const [inner, setInner] = useState<readonly File[]>(defaultValue);
  const [rejected, setRejected] = useState<string[]>([]);
  const files = value ?? inner;

  const hasError = Boolean(error);
  const showHelper = Boolean(helperText) && !hasError;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const describedBy = cx(ariaDescribedBy, showHelper && helperId, hasError && errorId) || undefined;

  const setFiles = (next: File[]) => {
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    const incoming = Array.from(event.target.files ?? []);
    // Clear the native selection so choosing the same file again fires change.
    event.target.value = '';
    const messages: string[] = [];
    let accepted: File[] = multiple ? [...files] : [];
    const limit = multiple ? Math.max(1, maxFiles) : 1;
    let added = 0;

    for (const file of incoming) {
      if (!isAccepted(file, accept)) {
        messages.push(fill(notAcceptedMessage, file.name));
      } else if (maxFileSize !== undefined && file.size > maxFileSize) {
        messages.push(fill(tooLargeMessage, file.name, formatFileSize(maxFileSize)));
      } else if (multiple && accepted.length >= limit) {
        messages.push(fill(tooManyMessage, file.name, limit));
      } else {
        if (!multiple) accepted = [];
        accepted.push(file);
        added++;
      }
    }

    setRejected(messages);
    // When every new file was rejected, the previous selection stays.
    if (added > 0) setFiles(accepted);
  };

  const remove = (file: File) => {
    setRejected([]);
    setFiles(files.filter((f) => f !== file));
  };

  return (
    <div className={cx('trazos-file', className)}>
      {label && (
        <label className="trazos-file-label" htmlFor={inputId}>
          {label}
          {required && (
            <span className="trazos-file-required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className={cx('trazos-file-zone', hasError && 'trazos-file-zone-error', disabled && 'trazos-file-zone-disabled')}>
        <input
          {...rest}
          id={inputId}
          type="file"
          className="trazos-file-native"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleChange}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
        />
        <span className="trazos-file-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
            />
          </svg>
        </span>
        <span className="trazos-file-prompt">
          <strong>{buttonText}</strong> {dropText}
        </span>
        {hint && <span className="trazos-file-hint">{hint}</span>}
      </div>

      {files.length > 0 && (
        <ul className="trazos-file-list">
          {files.map((file, index) => (
            <li key={`${file.name}-${String(index)}`} className="trazos-file-item">
              <span className="trazos-file-item-name">{file.name}</span>
              <span className="trazos-file-item-size">{formatFileSize(file.size)}</span>
              <button
                type="button"
                className="trazos-file-remove"
                aria-label={fill(removeLabelFormat, file.name)}
                disabled={disabled}
                onClick={() => {
                  remove(file);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {rejected.length > 0 && (
        <ul className="trazos-file-rejected" role="alert">
          {rejected.map((message, index) => (
            <li key={`${message}-${String(index)}`}>{message}</li>
          ))}
        </ul>
      )}

      {showHelper && (
        <p id={helperId} className="trazos-file-helper">
          {helperText}
        </p>
      )}
      {hasError && (
        <p id={errorId} className="trazos-file-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
