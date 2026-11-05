import { useId, useState, type ChangeEvent, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './Checkbox.css';

export interface CheckboxProps
  extends Omit<ComponentPropsWithRef<'input'>, 'type' | 'checked' | 'defaultChecked' | 'children'> {
  label?: string;
  /** Controlled checked state. */
  checked?: boolean;
  /** Initial checked state for uncontrolled use. */
  defaultChecked?: boolean;
  /** Called with the new checked state. */
  onCheckedChange?: (checked: boolean) => void;
  helperText?: string;
  /** Error message; when set it replaces the helper text and flags the box. */
  error?: string;
  /** Rich label content; takes precedence over `label`. */
  children?: ReactNode;
}

export function Checkbox({
  id,
  label,
  checked,
  defaultChecked = false,
  onCheckedChange,
  onChange,
  helperText,
  error,
  disabled = false,
  className,
  children,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: CheckboxProps) {
  const generatedId = `trazos-chk-${useId()}`;
  const inputId = id ?? generatedId;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;
  const hasError = Boolean(error);
  const showHelper = Boolean(helperText) && !hasError;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const describedBy =
    cx(ariaDescribedBy, showHelper && helperId, hasError && errorId) || undefined;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    if (!isControlled) setInternalChecked(event.target.checked);
    onCheckedChange?.(event.target.checked);
  };

  return (
    <div className={cx('trazos-checkbox-group', className)}>
      <label className={cx('trazos-checkbox-container', disabled && 'disabled')} htmlFor={inputId}>
        <input
          {...rest}
          id={inputId}
          type="checkbox"
          className="trazos-checkbox-control"
          checked={isChecked}
          disabled={disabled}
          onChange={handleChange}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
        />

        <span
          className={cx('trazos-checkbox-box', isChecked && 'checked', hasError && 'has-error')}
          aria-hidden="true"
        >
          <svg
            className="trazos-checkbox-check"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>

        {(label || children != null) && (
          <span className="trazos-checkbox-label">{children ?? label}</span>
        )}
      </label>

      {showHelper && (
        <p id={helperId} className="trazos-checkbox-helper">
          {helperText}
        </p>
      )}

      {hasError && (
        <p id={errorId} className="trazos-checkbox-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
