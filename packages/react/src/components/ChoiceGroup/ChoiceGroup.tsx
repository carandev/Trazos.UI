import { useId, useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './ChoiceGroup.css';

/** One choice of a RadioGroup or CheckboxGroup. Mirrors `SelectOption<T>` in Blazor. */
export interface ChoiceOption<T> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface ChoiceGroupBaseProps<T>
  extends Omit<ComponentPropsWithRef<'fieldset'>, 'defaultValue' | 'children' | 'onChange'> {
  options: readonly ChoiceOption<T>[];
  /** Legend of the fieldset. */
  label?: string;
  helperText?: string;
  /** Error message; when set it replaces the helper text and flags the group. */
  error?: string;
  /** Shows the required marker next to the legend. */
  required?: boolean;
  /** Disables every option. */
  disabled?: boolean;
  /** Lays the options out in a row that wraps. */
  inline?: boolean;
}

export interface RadioGroupProps<T> extends ChoiceGroupBaseProps<T> {
  /** Controlled chosen value; `null` for none. */
  value?: T | null;
  /** Initial chosen value for uncontrolled use. */
  defaultValue?: T | null;
  /** Called with the value of the option the user picks. */
  onValueChange?: (value: T) => void;
  /** Name shared by the radios. Defaults to the group id. */
  name?: string;
}

export interface CheckboxGroupProps<T> extends ChoiceGroupBaseProps<T> {
  /** Controlled chosen values. */
  value?: readonly T[];
  /** Initial chosen values for uncontrolled use. */
  defaultValue?: readonly T[];
  /** Called with a new array of the chosen values, in option order. */
  onValueChange?: (value: T[]) => void;
}

interface ShellProps extends Omit<ChoiceGroupBaseProps<unknown>, 'options' | 'disabled'> {
  groupId: string;
  role: 'radiogroup' | 'group';
  children: ReactNode;
}

function ChoiceShell({
  groupId,
  role,
  label,
  helperText,
  error,
  required = false,
  inline = false,
  className,
  children,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: ShellProps) {
  const hasError = Boolean(error);
  const showHelper = Boolean(helperText) && !hasError;
  const helperId = `${groupId}-helper`;
  const errorId = `${groupId}-error`;
  const describedBy = cx(ariaDescribedBy, showHelper && helperId, hasError && errorId) || undefined;

  return (
    <fieldset
      {...rest}
      id={groupId}
      role={role}
      className={cx('trazos-choice-group', inline && 'trazos-choice-group-inline', className)}
      aria-invalid={hasError || undefined}
      aria-required={(role === 'radiogroup' && required) || undefined}
      aria-describedby={describedBy}
    >
      {label && (
        <legend className="trazos-choice-legend">
          {label}
          {required && (
            <span className="trazos-choice-required" aria-hidden="true">
              *
            </span>
          )}
        </legend>
      )}
      <div className="trazos-choice-options">{children}</div>
      {hasError ? (
        <p id={errorId} className="trazos-choice-error" role="alert">
          {error}
        </p>
      ) : (
        showHelper && (
          <p id={helperId} className="trazos-choice-helper">
            {helperText}
          </p>
        )
      )}
    </fieldset>
  );
}

interface ChoiceItemProps {
  inputId: string;
  type: 'radio' | 'checkbox';
  name?: string;
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}

function ChoiceItem({ inputId, type, name, label, checked, disabled, onChange }: ChoiceItemProps) {
  return (
    <label htmlFor={inputId} className={cx('trazos-choice', disabled && 'trazos-choice-is-disabled')}>
      <input
        type={type}
        id={inputId}
        name={name}
        className={cx('trazos-choice-input', `trazos-choice-input-${type}`)}
        checked={checked}
        disabled={disabled}
        onChange={(event) => {
          onChange(event.target.checked);
        }}
      />
      <span className="trazos-choice-text">{label}</span>
    </label>
  );
}

/**
 * A compact list of native radios built from typed options. Binds one value;
 * options are matched with `Object.is`. Arrow keys move between the radios,
 * as with any native radio group.
 */
export function RadioGroup<T>({
  id,
  options,
  value,
  defaultValue = null,
  onValueChange,
  name,
  disabled = false,
  ...rest
}: RadioGroupProps<T>) {
  const generatedId = useId();
  const groupId = id ?? `trazos-radio-${generatedId}`;
  const [internalValue, setInternalValue] = useState<T | null>(defaultValue);
  const isControlled = value !== undefined;
  const selected = isControlled ? value : internalValue;

  const pick = (next: T) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  return (
    <ChoiceShell {...rest} groupId={groupId} role="radiogroup">
      {options.map((option, i) => (
        <ChoiceItem
          key={`${groupId}-${i}`}
          inputId={`${groupId}-${i}`}
          type="radio"
          name={name ?? groupId}
          label={option.label}
          checked={selected !== null && Object.is(option.value, selected)}
          disabled={disabled || Boolean(option.disabled)}
          onChange={() => {
            pick(option.value);
          }}
        />
      ))}
    </ChoiceShell>
  );
}

const noValues: readonly never[] = [];

/**
 * A compact list of native checkboxes built from typed options. The value is
 * an array of the chosen option values, always in option order, and every
 * change emits a new array.
 */
export function CheckboxGroup<T>({
  id,
  options,
  value,
  defaultValue = noValues,
  onValueChange,
  disabled = false,
  ...rest
}: CheckboxGroupProps<T>) {
  const generatedId = useId();
  const groupId = id ?? `trazos-checks-${generatedId}`;
  const [internalValue, setInternalValue] = useState<readonly T[]>(defaultValue);
  const isControlled = value !== undefined;
  const selected = isControlled ? value : internalValue;
  const has = (item: T) => selected.some((v) => Object.is(v, item));

  const toggle = (item: T, checked: boolean) => {
    const next = options
      .map((o) => o.value)
      .filter((v) => (Object.is(v, item) ? checked : has(v)));
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  return (
    <ChoiceShell {...rest} groupId={groupId} role="group">
      {options.map((option, i) => (
        <ChoiceItem
          key={`${groupId}-${i}`}
          inputId={`${groupId}-${i}`}
          type="checkbox"
          label={option.label}
          checked={has(option.value)}
          disabled={disabled || Boolean(option.disabled)}
          onChange={(checked) => {
            toggle(option.value, checked);
          }}
        />
      ))}
    </ChoiceShell>
  );
}
