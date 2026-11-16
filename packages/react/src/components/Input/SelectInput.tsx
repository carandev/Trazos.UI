import { useId, type ChangeEvent, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
// Shared field rules (group, label, required marker, helper, error).
import './TextInput.css';
import './SelectInput.css';

/** Value types a SelectInput can bind. */
export type SelectInputValue = string | number;

/** One typed option of a SelectInput. */
export interface SelectOption<T extends SelectInputValue = string> {
  /** Value reported by onValueChange when the option is chosen. */
  value: T;
  /** Visible text. */
  label: string;
  /** Shows the option but does not let the user choose it. */
  disabled?: boolean;
}

export interface SelectInputProps<T extends SelectInputValue = string>
  extends Omit<ComponentPropsWithRef<'select'>, 'value' | 'defaultValue' | 'multiple'> {
  label?: string;
  /** Controlled value; `''` or `null` selects the placeholder. */
  value?: T | null;
  /** Initial value for uncontrolled use. */
  defaultValue?: T | null;
  /**
   * Called with the selected value. A typed option reports its own `value`
   * (a number stays a number); an `<option>` child reports its string value.
   */
  onValueChange?: (value: T) => void;
  /** Typed options, rendered before any `<option>` children. */
  options?: readonly SelectOption<T>[];
  /** Text of a disabled, empty-valued first option selected while there is no value. */
  placeholder?: string;
  helperText?: string;
  /** Error message; when set it replaces the helper text and flags the field. */
  error?: string;
  /** Shows the required marker next to the label. */
  required?: boolean;
  leadingIcon?: ReactNode;
  /** The `<option>` elements. */
  children?: ReactNode;
}

const toOptionValue = (value: SelectInputValue | null | undefined): string | undefined =>
  value === undefined ? undefined : value === null ? '' : String(value);

export function SelectInput<T extends SelectInputValue = string>({
  id,
  label,
  value,
  defaultValue,
  onValueChange,
  onChange,
  placeholder,
  helperText,
  error,
  required = false,
  disabled = false,
  leadingIcon,
  options,
  className,
  children,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: SelectInputProps<T>) {
  const generatedId = `trazos-select-${useId()}`;
  const selectId = id ?? generatedId;
  const hasError = Boolean(error);
  const showHelper = Boolean(helperText) && !hasError;
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;
  const describedBy =
    cx(ariaDescribedBy, showHelper && helperId, hasError && errorId) || undefined;
  // Razor selects the placeholder while the value is empty; uncontrolled use does the same.
  const initialValue = toOptionValue(defaultValue) ?? (placeholder ? '' : undefined);
  const selectedValue = toOptionValue(value);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange?.(event);
    const raw = event.target.value;
    const typed = options?.find((option) => String(option.value) === raw);
    // <option> children carry string values; T is string unless typed options are used.
    onValueChange?.(typed ? typed.value : (raw as T));
  };

  return (
    <div className={cx('trazos-input-group', className)}>
      {label && (
        <label className="trazos-input-label" htmlFor={selectId}>
          {label}
          {required && (
            <span className="trazos-input-required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className={cx('trazos-select-wrapper', hasError && 'trazos-input-has-error', disabled && 'trazos-input-is-disabled')}>
        {leadingIcon != null && <div className="trazos-select-icon leading">{leadingIcon}</div>}

        <select
          {...rest}
          id={selectId}
          className="trazos-select-control"
          disabled={disabled}
          {...(selectedValue !== undefined ? { value: selectedValue } : { defaultValue: initialValue })}
          onChange={handleChange}
          aria-required={required || undefined}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options?.map((option) => (
            <option key={String(option.value)} value={String(option.value)} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
          {children}
        </select>

        <div className="trazos-select-arrow" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>

      {showHelper && (
        <p id={helperId} className="trazos-input-helper">
          {helperText}
        </p>
      )}

      {hasError && (
        <p id={errorId} className="trazos-input-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
