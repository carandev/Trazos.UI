import { useId, type ChangeEvent, type ComponentPropsWithRef } from 'react';
import { cx } from '../../internal/cx';
// Shared field rules (group, label, required marker, helper, error).
import './TextInput.css';
import './TextArea.css';

export interface TextAreaProps
  extends Omit<ComponentPropsWithRef<'textarea'>, 'value' | 'defaultValue'> {
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
}

export function TextArea({
  id,
  label,
  value,
  defaultValue,
  onValueChange,
  onChange,
  rows = 4,
  helperText,
  error,
  required = false,
  disabled = false,
  readOnly = false,
  className,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: TextAreaProps) {
  const generatedId = `trazos-textarea-${useId()}`;
  const textareaId = id ?? generatedId;
  const hasError = Boolean(error);
  const showHelper = Boolean(helperText) && !hasError;
  const helperId = `${textareaId}-helper`;
  const errorId = `${textareaId}-error`;
  const describedBy =
    cx(ariaDescribedBy, showHelper && helperId, hasError && errorId) || undefined;

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(event);
    onValueChange?.(event.target.value);
  };

  return (
    <div className={cx('trazos-input-group', className)}>
      {label && (
        <label className="trazos-input-label" htmlFor={textareaId}>
          {label}
          {required && (
            <span className="trazos-input-required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className={cx('trazos-textarea-wrapper', hasError && 'trazos-input-has-error', disabled && 'trazos-input-is-disabled')}>
        <textarea
          {...rest}
          id={textareaId}
          rows={rows}
          className="trazos-textarea-control"
          disabled={disabled}
          readOnly={readOnly}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-required={required || undefined}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
        />
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
