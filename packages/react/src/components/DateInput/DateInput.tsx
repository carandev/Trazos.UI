import {
  useState,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type FocusEvent,
  type ReactNode,
} from 'react';
import { FieldShell, useFieldIds } from '../../internal/field/FieldShell';

export interface DateInputProps
  extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type' | 'min' | 'max' | 'prefix'> {
  label?: string;
  /** Controlled value as an ISO date string, `'yyyy-MM-dd'`; `null` is an empty field. */
  value?: string | null;
  /** Initial value for uncontrolled use, as `'yyyy-MM-dd'`. */
  defaultValue?: string | null;
  /** Called with the picked date as `'yyyy-MM-dd'`, or `null` when the field is cleared. */
  onValueChange?: (value: string | null) => void;
  /** Picks a month instead of a day. The reported value is the first day of that month. */
  monthOnly?: boolean;
  /** Earliest date the picker offers, as `'yyyy-MM-dd'`. */
  min?: string;
  /** Latest date the picker offers, as `'yyyy-MM-dd'`. */
  max?: string;
  helperText?: string;
  /** Error message; when set it replaces the helper text and the parse error. */
  error?: string;
  /** Shown when the text is not a date (browsers without a native picker show a text box). */
  parseErrorMessage?: string;
  /** Shows the required marker next to the label. */
  required?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

function isRealDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** The ISO date for text from the control, or undefined when it is not a date. */
function parseDate(text: string, monthOnly: boolean): string | undefined {
  const match = monthOnly ? /^(\d{4})-(\d{2})$/.exec(text) : /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) return undefined;
  const day = monthOnly ? 1 : Number(match[3]);
  if (!isRealDate(Number(match[1]), Number(match[2]), day)) return undefined;
  return monthOnly ? `${text}-01` : text;
}

/**
 * Date field built on the native date picker, so it follows the browser's
 * locale and works with the keyboard and mobile pickers. Values are ISO date
 * strings, `'yyyy-MM-dd'`. `monthOnly` turns it into a month picker that
 * reports the first day of the month.
 */
export function DateInput({
  id,
  label,
  value,
  defaultValue = null,
  onValueChange,
  onChange,
  onBlur,
  monthOnly = false,
  min,
  max,
  helperText,
  error,
  parseErrorMessage = 'Enter a valid date.',
  required = false,
  disabled = false,
  readOnly = false,
  leadingIcon,
  trailingIcon,
  className,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: DateInputProps) {
  const [inner, setInner] = useState<string | null>(defaultValue);
  // Text that is not a date yet; shown until it becomes one or is cleared.
  const [draft, setDraft] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const current = value !== undefined ? value : inner;

  const shownError = error || parseError || undefined;
  const ids = useFieldIds('trazos-date', id, helperText, shownError, ariaDescribedBy);

  const toControl = (date: string | null | undefined): string | undefined =>
    date ? date.slice(0, monthOnly ? 7 : 10) : date === undefined ? undefined : '';

  const commit = (next: string | null) => {
    setDraft(null);
    setParseError(null);
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    const text = event.target.value.trim();
    if (text.length === 0) {
      commit(null);
      return;
    }
    const parsed = parseDate(text, monthOnly);
    if (parsed === undefined) setDraft(event.target.value);
    else commit(parsed);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (draft !== null) setParseError(parseErrorMessage);
    onBlur?.(event);
  };

  return (
    <FieldShell
      ids={ids}
      label={label}
      required={required}
      disabled={disabled}
      helperText={helperText}
      error={shownError}
      className={className}
      leadingIcon={leadingIcon}
      trailingIcon={trailingIcon}
    >
      <input
        {...rest}
        id={ids.inputId}
        type={monthOnly ? 'month' : 'date'}
        className="trazos-input-control"
        disabled={disabled}
        readOnly={readOnly}
        min={toControl(min)}
        max={toControl(max)}
        value={draft ?? toControl(current) ?? ''}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-required={required || undefined}
        aria-invalid={ids.hasError || undefined}
        aria-describedby={ids.describedBy}
      />
    </FieldShell>
  );
}
