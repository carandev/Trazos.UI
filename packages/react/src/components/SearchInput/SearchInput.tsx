import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type KeyboardEvent,
} from 'react';
import { cx } from '../../internal/cx';
import { FieldShell, useFieldIds } from '../../internal/field/FieldShell';
import { mergeRefs } from '../../internal/field/mergeRefs';
import './SearchInput.css';

export interface SearchInputProps
  extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type' | 'prefix'> {
  label?: string;
  /** Controlled value. A new value from the parent replaces the text in the box. */
  value?: string;
  /** Initial value for uncontrolled use. */
  defaultValue?: string;
  /** Called with the text once the user pauses typing (see debounce), and at once when it is cleared. */
  onValueChange?: (value: string) => void;
  /** Milliseconds to wait after the last key before calling onValueChange. 0 calls it on every key. */
  debounce?: number;
  /** Accessible name when there is no visible label. */
  ariaLabel?: string;
  /** Accessible name of the clear button. */
  clearLabel?: string;
  helperText?: string;
  /** Error message; when set it replaces the helper text and flags the field. */
  error?: string;
}

/**
 * Search box for filtering lists: type="search", a search icon, a clear
 * button and Escape to clear. onValueChange is debounced, so a list is
 * filtered once the user pauses instead of on every key.
 */
export function SearchInput({
  id,
  label,
  value,
  defaultValue = '',
  onValueChange,
  onChange,
  onKeyDown,
  debounce = 300,
  ariaLabel = 'Search',
  clearLabel = 'Clear search',
  helperText,
  error,
  disabled = false,
  className,
  ref,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: SearchInputProps) {
  const [text, setText] = useState(value ?? defaultValue);
  const [lastValue, setLastValue] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const callback = useRef(onValueChange);
  const ids = useFieldIds('trazos-search', id, helperText, error, ariaDescribedBy);

  // A new value from the parent replaces the text, like the Blazor component.
  if (value !== undefined && value !== lastValue) {
    setLastValue(value);
    setText(value);
  }

  useEffect(() => {
    callback.current = onValueChange;
  });

  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    [],
  );

  const commit = (next: string) => {
    clearTimeout(timer.current);
    timer.current = undefined;
    setLastValue(value === undefined ? undefined : next);
    callback.current?.(next);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    const next = event.target.value;
    setText(next);
    if (debounce <= 0) {
      commit(next);
      return;
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      commit(next);
    }, debounce);
  };

  const clear = () => {
    setText('');
    commit('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'Escape' && text.length > 0) {
      event.preventDefault();
      clear();
    }
  };

  const clearButton = (
    <button
      type="button"
      className="trazos-search-clear"
      aria-label={clearLabel}
      onClick={() => {
        clear();
        inputRef.current?.focus();
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </button>
  );

  return (
    <FieldShell
      ids={ids}
      label={label}
      disabled={disabled}
      helperText={helperText}
      error={error}
      className={cx('trazos-search', className)}
      leadingIcon={
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="18" height="18" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      }
      trailingIcon={text.length > 0 && !disabled ? clearButton : undefined}
    >
      <input
        autoComplete="off"
        {...rest}
        ref={mergeRefs(ref, inputRef)}
        id={ids.inputId}
        type="search"
        className="trazos-input-control trazos-search-control"
        disabled={disabled}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        aria-label={label ? undefined : ariaLabel}
        aria-invalid={ids.hasError || undefined}
        aria-describedby={ids.describedBy}
      />
    </FieldShell>
  );
}
