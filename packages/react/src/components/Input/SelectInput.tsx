import { Children, useId, useRef, useState } from 'react';
import type {
  ChangeEvent,
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from 'react';
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
  /** Controlled value; `''` or `null` shows the placeholder. */
  value?: T | null;
  /** Initial value for uncontrolled use. */
  defaultValue?: T | null;
  /**
   * Called with the selected value. A typed option reports its own `value`
   * (a number stays a number); an `<option>` child reports its string value.
   */
  onValueChange?: (value: T) => void;
  /**
   * Typed options. Alone, they render the library list (a combobox trigger
   * and a listbox that follow the theme). Mixed with `<option>` children they
   * render first inside a native select.
   */
  options?: readonly SelectOption<T>[];
  /** Text shown while there is no value. It is never a choosable option. */
  placeholder?: string;
  helperText?: string;
  /** Error message; when set it replaces the helper text and flags the field. */
  error?: string;
  /** Shows the required marker next to the label. */
  required?: boolean;
  leadingIcon?: ReactNode;
  /** The `<option>` elements. They keep the native select. */
  children?: ReactNode;
}

const toOptionValue = (value: SelectInputValue | null | undefined): string | undefined =>
  value === undefined ? undefined : value === null ? '' : String(value);

// Letters typed within this window build one type-ahead prefix.
const TYPE_AHEAD_WINDOW_MS = 500;

const arrow = (
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
);

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
  const labelId = `${selectId}-label`;
  const describedBy =
    cx(ariaDescribedBy, showHelper && helperId, hasError && errorId) || undefined;
  const useListbox = options !== undefined && Children.toArray(children).length === 0;

  const header = label && (
    <label id={labelId} className="trazos-input-label" htmlFor={selectId}>
      {label}
      {required && (
        <span className="trazos-input-required" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );

  const footer = (
    <>
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
    </>
  );

  if (useListbox) {
    return (
      <div className={cx('trazos-input-group', className)}>
        {header}
        <SelectListbox<T>
          {...rest}
          triggerId={selectId}
          labelId={label ? labelId : undefined}
          options={options}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          placeholder={placeholder}
          hasError={hasError}
          disabled={disabled}
          required={required}
          describedBy={describedBy}
          leadingIcon={leadingIcon}
        />
        {footer}
      </div>
    );
  }

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
      {header}

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

        {arrow}
      </div>

      {footer}
    </div>
  );
}

type ListboxRest = Omit<
  SelectInputProps,
  | 'id'
  | 'label'
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'onChange'
  | 'placeholder'
  | 'helperText'
  | 'error'
  | 'required'
  | 'disabled'
  | 'leadingIcon'
  | 'options'
  | 'className'
  | 'children'
  | 'aria-describedby'
>;

interface SelectListboxProps<T extends SelectInputValue> extends ListboxRest {
  triggerId: string;
  labelId: string | undefined;
  options: readonly SelectOption<T>[];
  value: T | null | undefined;
  defaultValue: T | null | undefined;
  onValueChange: ((value: T) => void) | undefined;
  placeholder: string | undefined;
  hasError: boolean;
  disabled: boolean;
  required: boolean;
  describedBy: string | undefined;
  leadingIcon: ReactNode;
}

/**
 * The library-drawn list: a combobox trigger that keeps focus while
 * aria-activedescendant points at the active option. A hidden native select
 * carries `ref`, `name` and `form`, so forms and refs keep working.
 */
function SelectListbox<T extends SelectInputValue>({
  triggerId,
  labelId,
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  hasError,
  disabled,
  required,
  describedBy,
  leadingIcon,
  ref,
  name,
  form,
  onKeyDown,
  onBlur,
  onClick,
  ...rest
}: SelectListboxProps<T>) {
  const listboxId = `${triggerId}-listbox`;
  const optionId = (index: number) => `${triggerId}-option-${index}`;

  const [internalValue, setInternalValue] = useState<T | null>(defaultValue ?? null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const typeAhead = useRef({ text: '', at: 0 });

  const isControlled = value !== undefined;
  const current = isControlled ? value : internalValue;
  const selectedIndex = current === null || current === '' ? -1 : options.findIndex((o) => o.value === current);
  const selected = options[selectedIndex];

  const isEnabled = (index: number) => options[index] !== undefined && !options[index].disabled;
  const firstEnabled = () => options.findIndex((o) => !o.disabled);
  const lastEnabled = () => {
    for (let i = options.length - 1; i >= 0; i--) {
      if (isEnabled(i)) return i;
    }
    return -1;
  };
  const nextEnabled = (from: number, step: 1 | -1) => {
    for (let i = from + step; i >= 0 && i < options.length; i += step) {
      if (isEnabled(i)) return i;
    }
    return from;
  };

  const open = (index: number) => {
    if (disabled || options.length === 0) return false;
    setIsOpen(true);
    setActiveIndex(index);
    return true;
  };

  const openOnSelected = (fromEnd = false) =>
    open(isEnabled(selectedIndex) ? selectedIndex : fromEnd ? lastEnabled() : firstEnabled());

  const close = () => {
    setIsOpen(false);
    setActiveIndex(-1);
    typeAhead.current.text = '';
  };

  const choose = (index: number) => {
    const option = options[index];
    if (option === undefined || option.disabled) return;
    close();
    if (option.value === current) return;
    if (!isControlled) setInternalValue(option.value);
    onValueChange?.(option.value);
  };

  /** Moves to the next enabled option whose text starts with the letters typed so far. */
  const runTypeAhead = (key: string) => {
    const now = Date.now();
    const buffer = typeAhead.current;
    buffer.text = now - buffer.at > TYPE_AHEAD_WINDOW_MS ? key : buffer.text + key;
    buffer.at = now;

    const from = isOpen ? activeIndex : -1;
    if (!isOpen && !open(-1)) return;

    // The same letter repeated cycles through the options that start with it.
    const lower = buffer.text.toLocaleLowerCase();
    const repeated = lower.split('').every((c) => c === lower[0]);
    const prefix = repeated ? lower.slice(0, 1) : lower;
    const origin = from < 0 ? 0 : from + (prefix.length === 1 ? 1 : 0);
    for (let i = 0; i < options.length; i++) {
      const index = (origin + i) % options.length;
      const option = options[index];
      if (option && !option.disabled && option.label.toLocaleLowerCase().startsWith(prefix)) {
        setActiveIndex(index);
        return;
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    (onKeyDown as ((e: KeyboardEvent<HTMLButtonElement>) => void) | undefined)?.(event);
    if (disabled || event.defaultPrevented) return;

    const handled = () => { event.preventDefault(); };
    switch (event.key) {
      case 'ArrowDown':
        handled();
        if (isOpen) setActiveIndex(nextEnabled(activeIndex, 1));
        else openOnSelected();
        break;
      case 'ArrowUp':
        handled();
        if (isOpen) setActiveIndex(nextEnabled(activeIndex, -1));
        else openOnSelected(true);
        break;
      case 'Home':
        handled();
        if (isOpen) setActiveIndex(firstEnabled());
        else open(firstEnabled());
        break;
      case 'End':
        handled();
        if (isOpen) setActiveIndex(lastEnabled());
        else open(lastEnabled());
        break;
      case 'Enter':
      case ' ':
        handled();
        if (isOpen) choose(activeIndex);
        else openOnSelected();
        break;
      case 'Escape':
        if (isOpen) {
          handled();
          close();
        }
        break;
      case 'Tab':
        // Focus moves on; the list just closes.
        close();
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
          handled();
          runTypeAhead(event.key);
        }
    }
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    (onClick as ((e: MouseEvent<HTMLButtonElement>) => void) | undefined)?.(event);
    // A click with detail 0 comes from Enter or Space, which handleKeyDown already handled.
    if (disabled || event.detail === 0) return;
    if (isOpen) {
      close();
      return;
    }
    openOnSelected();
    // Some browsers (Safari) do not focus a clicked button; focus is what closes the list on blur.
    triggerRef.current?.focus();
  };

  const handleBlur = (event: FocusEvent<HTMLButtonElement>) => {
    (onBlur as ((e: FocusEvent<HTMLButtonElement>) => void) | undefined)?.(event);
    close();
  };

  return (
    <div
      className={cx(
        'trazos-select-wrapper',
        hasError && 'trazos-input-has-error',
        disabled && 'trazos-input-is-disabled',
        isOpen && 'trazos-select-is-open',
      )}
    >
      {leadingIcon != null && <div className="trazos-select-icon leading">{leadingIcon}</div>}

      {/* Keeps ref, name and form working; the trigger is what people use. */}
      <select
        ref={ref}
        name={name}
        form={form}
        hidden
        aria-hidden="true"
        tabIndex={-1}
        disabled={disabled}
        value={selected === undefined ? '' : String(selected.value)}
        onChange={() => undefined}
      >
        <option value="" />
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>

      <button
        {...(rest as ComponentPropsWithoutRef<'button'>)}
        ref={triggerRef}
        type="button"
        id={triggerId}
        className="trazos-select-control trazos-select-trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-labelledby={labelId}
        aria-activedescendant={isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        aria-required={required || undefined}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      >
        <span className={cx('trazos-select-value', selected === undefined && 'trazos-select-value-placeholder')}>
          {selected === undefined ? placeholder : selected.label}
        </span>
      </button>

      {arrow}

      {isOpen && (
        <ul id={listboxId} className="trazos-select-listbox" role="listbox" aria-labelledby={labelId}>
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            return (
              <li
                key={String(option.value)}
                id={optionId(index)}
                role="option"
                aria-selected={index === activeIndex}
                aria-disabled={option.disabled || undefined}
                className={cx(
                  'trazos-select-option',
                  index === activeIndex && 'trazos-select-option-active',
                  isSelected && 'trazos-select-option-selected',
                  option.disabled && 'trazos-select-option-disabled',
                )}
                onMouseDown={(event) => {
                  // Keeps focus on the trigger.
                  event.preventDefault();
                  choose(index);
                }}
                onMouseEnter={() => {
                  if (!option.disabled) setActiveIndex(index);
                }}
              >
                <span className="trazos-select-option-text">{option.label}</span>
                {isSelected && (
                  <svg
                    className="trazos-select-check"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
