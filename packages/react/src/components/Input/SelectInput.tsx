import { useId, type ChangeEvent, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
// Shared field rules (group, label, required marker, helper, error).
import './TextInput.css';
import './SelectInput.css';

export interface SelectInputProps
  extends Omit<ComponentPropsWithRef<'select'>, 'value' | 'defaultValue' | 'multiple'> {
  label?: string;
  /** Controlled value; `''` selects the placeholder. */
  value?: string;
  /** Initial value for uncontrolled use. */
  defaultValue?: string;
  /** Called with the selected option value. */
  onValueChange?: (value: string) => void;
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

export function SelectInput({
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
  className,
  children,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: SelectInputProps) {
  const generatedId = `trazos-select-${useId()}`;
  const selectId = id ?? generatedId;
  const hasError = Boolean(error);
  const showHelper = Boolean(helperText) && !hasError;
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;
  const describedBy =
    cx(ariaDescribedBy, showHelper && helperId, hasError && errorId) || undefined;
  // Razor selects the placeholder while the value is empty; uncontrolled use does the same.
  const initialValue = defaultValue ?? (placeholder ? '' : undefined);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange?.(event);
    onValueChange?.(event.target.value);
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

      <div className={cx('trazos-select-wrapper', hasError && 'has-error', disabled && 'disabled')}>
        {leadingIcon != null && <div className="trazos-select-icon leading">{leadingIcon}</div>}

        <select
          {...rest}
          id={selectId}
          className="trazos-select-control"
          disabled={disabled}
          {...(value !== undefined ? { value } : { defaultValue: initialValue })}
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
