import { useId, useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './RadioCardGroup.css';

/** Mirrors `Trazos.UI.Components.RadioCardOption<TValue>`. */
export interface RadioCardOption<TValue> {
  /** Value the option represents. */
  value: TValue;
  /** Main text of the option. */
  title: string;
  /** Short explanation of what choosing it implies. */
  description?: string;
  /** Optional icon shown on the left. */
  icon?: ReactNode;
}

/** Columns on medium or large screens; mobile always uses one. */
export type RadioCardGroupColumns = 1 | 2;

export interface RadioCardGroupProps<TValue>
  extends Omit<ComponentPropsWithRef<'fieldset'>, 'defaultValue' | 'children'> {
  options: RadioCardOption<TValue>[];
  /** Controlled selected value. */
  value?: TValue;
  /** Initial selected value for uncontrolled use. */
  defaultValue?: TValue;
  /** Called with the value of the option the user selects. */
  onValueChange?: (value: TValue) => void;
  label?: string;
  helperText?: string;
  /** Error message; when set it replaces the helper text. */
  error?: string;
  /** Shows the required marker next to the legend. */
  required?: boolean;
  disabled?: boolean;
  columns?: RadioCardGroupColumns;
}

/**
 * Mutually exclusive options shown as cards with a title and description,
 * for decisions where the user needs to understand what each option implies.
 * Uses native radios, so it works with the keyboard and screen readers.
 * Options are matched to the value with `Object.is`.
 */
export function RadioCardGroup<TValue>({
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  helperText,
  error,
  required = false,
  disabled = false,
  columns = 2,
  className,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: RadioCardGroupProps<TValue>) {
  const name = `trazos-radio-cards-${useId()}`;
  const [internalValue, setInternalValue] = useState<TValue | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const selected = isControlled ? value : internalValue;
  const hasError = Boolean(error);
  const showHelper = Boolean(helperText) && !hasError;
  const helperId = `${name}-helper`;
  const errorId = `${name}-error`;
  const describedBy =
    cx(ariaDescribedBy, showHelper && helperId, hasError && errorId) || undefined;

  const select = (option: RadioCardOption<TValue>) => {
    if (!isControlled) setInternalValue(option.value);
    onValueChange?.(option.value);
  };

  return (
    <fieldset
      {...rest}
      className={cx('trazos-radio-cards', className)}
      aria-invalid={hasError || undefined}
      aria-describedby={describedBy}
    >
      {label && (
        <legend className="trazos-radio-cards-label">
          {label}
          {required && (
            <span className="trazos-radio-cards-required" aria-hidden="true">
              *
            </span>
          )}
        </legend>
      )}

      <div className={`trazos-radio-cards-grid trazos-radio-cards-cols-${columns}`}>
        {options.map((option, i) => {
          const isChecked = selected !== undefined && Object.is(option.value, selected);
          const inputId = `${name}-${i}`;
          return (
            <label
              key={inputId}
              htmlFor={inputId}
              className={cx('trazos-radio-card', isChecked && 'trazos-radio-card-is-checked', disabled && 'trazos-radio-card-is-disabled')}
            >
              <input
                type="radio"
                id={inputId}
                name={name}
                className="trazos-radio-card-input"
                checked={isChecked}
                disabled={disabled}
                onChange={() => {
                  select(option);
                }}
              />

              {option.icon != null && (
                <span className="trazos-radio-card-icon" aria-hidden="true">
                  {option.icon}
                </span>
              )}

              <span className="trazos-radio-card-text">
                <span className="trazos-radio-card-title">{option.title}</span>
                {option.description && (
                  <span className="trazos-radio-card-description">{option.description}</span>
                )}
              </span>

              <span className="trazos-radio-card-check" aria-hidden="true">
                {isChecked && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="3"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
              </span>
            </label>
          );
        })}
      </div>

      {hasError ? (
        <p id={errorId} className="trazos-radio-cards-error" role="alert">
          {error}
        </p>
      ) : (
        showHelper && (
          <p id={helperId} className="trazos-radio-cards-helper">
            {helperText}
          </p>
        )
      )}
    </fieldset>
  );
}
