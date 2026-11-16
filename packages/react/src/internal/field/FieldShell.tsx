import { useId, type ReactNode } from 'react';
import { cx } from '../cx';
// The shared field rules (group, label, wrapper, affixes, helper, error) live in
// TextInput.css, the stylesheet that owns the trazos-input-* classes.
import '../../components/Input/TextInput.css';

export interface FieldIds {
  /** Id of the native control: the caller's id or a generated one. */
  inputId: string;
  helperId: string;
  errorId: string;
  hasError: boolean;
  showHelper: boolean;
  /** Value for the control's aria-describedby, or undefined. */
  describedBy: string | undefined;
}

/**
 * Ids and description wiring shared by every single-line field: the caller's
 * aria-describedby comes first, then the helper text or the error.
 */
export function useFieldIds(
  prefix: string,
  id: string | undefined,
  helperText: string | undefined,
  error: string | undefined,
  ariaDescribedBy: string | undefined,
): FieldIds {
  const generatedId = `${prefix}-${useId()}`;
  const inputId = id ?? generatedId;
  const hasError = Boolean(error);
  const showHelper = Boolean(helperText) && !hasError;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const describedBy = cx(ariaDescribedBy, showHelper && helperId, hasError && errorId) || undefined;
  return { inputId, helperId, errorId, hasError, showHelper, describedBy };
}

export interface FieldShellProps {
  ids: FieldIds;
  label?: string | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  helperText?: string | undefined;
  error?: string | undefined;
  className?: string | undefined;
  /** Text inside the field before the control, such as $ or COP. */
  prefix?: string | undefined;
  /** Text inside the field after the control, such as % or kg. */
  suffix?: string | undefined;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** The control. It must use the trazos-input-control class. */
  children: ReactNode;
}

/**
 * Frame of the single-line fields (TextInput, NumberInput, DateInput,
 * SearchInput, PhoneInput): label, bordered wrapper with icons and text
 * affixes, helper text and error. Mirrors the Blazor FieldShell.
 */
export function FieldShell({
  ids,
  label,
  required = false,
  disabled = false,
  helperText,
  error,
  className,
  prefix,
  suffix,
  leadingIcon,
  trailingIcon,
  children,
}: FieldShellProps) {
  return (
    <div className={cx('trazos-input-group', className)}>
      {label && (
        <label className="trazos-input-label" htmlFor={ids.inputId}>
          {label}
          {required && (
            <span className="trazos-input-required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className={cx('trazos-input-wrapper', ids.hasError && 'trazos-input-has-error', disabled && 'trazos-input-is-disabled')}>
        {leadingIcon != null && <div className="trazos-input-icon leading">{leadingIcon}</div>}
        {prefix && (
          <span className="trazos-input-affix trazos-input-affix-leading" aria-hidden="true">
            {prefix}
          </span>
        )}

        {children}

        {suffix && (
          <span className="trazos-input-affix trazos-input-affix-trailing" aria-hidden="true">
            {suffix}
          </span>
        )}
        {trailingIcon != null && <div className="trazos-input-icon trailing">{trailingIcon}</div>}
      </div>

      {ids.showHelper && (
        <p id={ids.helperId} className="trazos-input-helper">
          {helperText}
        </p>
      )}

      {ids.hasError && (
        <p id={ids.errorId} className="trazos-input-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
