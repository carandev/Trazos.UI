import { type ChangeEvent, type ComponentPropsWithRef, type ReactNode } from 'react';
import { FieldShell, useFieldIds } from '../../internal/field/FieldShell';
import './TextInput.css';

export interface TextInputProps
  extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'prefix'> {
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
  /** Text shown inside the field before the value, such as `$` or `COP`. Hidden from assistive tech. */
  prefix?: string;
  /** Text shown inside the field after the value, such as `%` or `kg`. Hidden from assistive tech. */
  suffix?: string;
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
  prefix,
  suffix,
  leadingIcon,
  trailingIcon,
  className,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: TextInputProps) {
  const ids = useFieldIds('trazos-input', id, helperText, error, ariaDescribedBy);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    onValueChange?.(event.target.value);
  };

  return (
    <FieldShell
      ids={ids}
      label={label}
      required={required}
      disabled={disabled}
      helperText={helperText}
      error={error}
      className={className}
      prefix={prefix}
      suffix={suffix}
      leadingIcon={leadingIcon}
      trailingIcon={trailingIcon}
    >
      <input
        {...rest}
        id={ids.inputId}
        type={type}
        className="trazos-input-control"
        disabled={disabled}
        readOnly={readOnly}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        aria-required={required || undefined}
        aria-invalid={ids.hasError || undefined}
        aria-describedby={ids.describedBy}
      />
    </FieldShell>
  );
}
