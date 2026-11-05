import { useId, type ChangeEvent, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './TextInput.css';

export interface TextInputProps
  extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue'> {
  label?: string;
  /** Controlled value. */
  value?: string;
  /** Initial value for uncontrolled use. */
  defaultValue?: string;
  /** Called with the new value on every input. */
  onValueChange?: (value: string) => void;
  helperText?: string;
  /** Error message; when set it replaces the helper text and flags the field. */
  error?: string;
  /** Shows the required marker next to the label. */
  required?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function TextInput({
  id,
  label,
  value,
  defaultValue,
  onValueChange,
  onChange,
  type = 'text',
  helperText,
  error,
  required = false,
  disabled = false,
  readOnly = false,
  leadingIcon,
  trailingIcon,
  className,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: TextInputProps) {
  const generatedId = `trazos-input-${useId()}`;
  const inputId = id ?? generatedId;
  const hasError = Boolean(error);
  const showHelper = Boolean(helperText) && !hasError;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const describedBy =
    cx(ariaDescribedBy, showHelper && helperId, hasError && errorId) || undefined;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    onValueChange?.(event.target.value);
  };

  return (
    <div className={cx('trazos-input-group', className)}>
      {label && (
        <label className="trazos-input-label" htmlFor={inputId}>
          {label}
          {required && (
            <span className="trazos-input-required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className={cx('trazos-input-wrapper', hasError && 'has-error', disabled && 'disabled')}>
        {leadingIcon != null && <div className="trazos-input-icon leading">{leadingIcon}</div>}

        <input
          {...rest}
          id={inputId}
          type={type}
          className="trazos-input-control"
          disabled={disabled}
          readOnly={readOnly}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-required={required || undefined}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
        />

        {trailingIcon != null && <div className="trazos-input-icon trailing">{trailingIcon}</div>}
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
