import { useEffect, useId, useRef, useState } from 'react';
import type { ChangeEvent, ComponentPropsWithRef, KeyboardEvent, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './Autocomplete.css';

/**
 * Search function. Receives the trimmed query and an `AbortSignal` that is
 * aborted when a newer query (or a reset) replaces this search.
 * It may return the items synchronously or as a promise.
 */
export type AutocompleteSearchFn<T> = (
  query: string,
  signal: AbortSignal,
) => Iterable<T> | Promise<Iterable<T>>;

export interface AutocompleteProps<T> extends Omit<ComponentPropsWithRef<'div'>, 'id' | 'children'> {
  /** Id of the input. Defaults to a generated id. */
  id?: string;
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  /** Queried while the user types, after `debounceMs` of inactivity. */
  searchFn: AutocompleteSearchFn<T>;
  /** Text that represents an item (used when there is no `renderItem`). */
  itemText: (item: T) => string;
  /** Renders each suggestion and the selected item. */
  renderItem?: (item: T) => ReactNode;
  /** Controlled selected item (`null` for none). */
  selectedItem?: T | null;
  /** Initial selected item when uncontrolled. */
  defaultSelectedItem?: T | null;
  /** Called with the chosen item, or `null` when the selection is cleared. */
  onSelectedItemChange?: (item: T | null) => void;
  /**
   * When true the field is cleared after choosing (useful to add several items in a row).
   * When false the chosen item stays visible with a button to remove it.
   */
  clearOnSelect?: boolean;
  /** Minimum characters before searching. */
  minChars?: number;
  /** Wait in milliseconds after the last keystroke before searching. */
  debounceMs?: number;
  noResultsText?: string;
  searchingText?: string;
  clearText?: string;
}

export function Autocomplete<T>({
  id,
  label,
  placeholder,
  helperText,
  error,
  required = false,
  disabled = false,
  searchFn,
  itemText,
  renderItem,
  selectedItem,
  defaultSelectedItem = null,
  onSelectedItemChange,
  clearOnSelect = false,
  minChars = 2,
  debounceMs = 300,
  noResultsText = 'Sin resultados',
  searchingText = 'Buscando…',
  clearText = 'Quitar selección',
  className,
  ...rest
}: AutocompleteProps<T>) {
  const generatedId = useId();
  const inputId = id ?? `trazos-autocomplete-${generatedId}`;
  const listId = `${inputId}-list`;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const optionId = (index: number) => `${inputId}-option-${index}`;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [internalSelected, setInternalSelected] = useState<T | null>(defaultSelectedItem);

  const isControlled = selectedItem !== undefined;
  const currentSelected = isControlled ? selectedItem : internalSelected;

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  const cancelSearch = () => {
    clearTimeout(timerRef.current);
    timerRef.current = undefined;
    abortRef.current?.abort();
    abortRef.current = null;
  };

  useEffect(() => cancelSearch, []);

  const hasError = error != null && error !== '';
  const isOpen = hasFocus && query.trim().length >= minChars && (hasSearched || isSearching);

  const resetQuery = () => {
    cancelSearch();
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setIsSearching(false);
    setActiveIndex(-1);
  };

  const runSearch = async (term: string, controller: AbortController) => {
    const isCurrent = () => abortRef.current === controller && !controller.signal.aborted;
    try {
      const found = Array.from(await searchFn(term, controller.signal));
      if (!isCurrent()) return;
      setResults(found);
      setActiveIndex(found.length > 0 ? 0 : -1);
      setHasSearched(true);
    } catch {
      if (!isCurrent()) return;
      setResults([]);
      setHasSearched(true);
    }
    setIsSearching(false);
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    setHasFocus(true);
    setActiveIndex(-1);
    cancelSearch();

    const term = value.trim();
    if (term.length < minChars) {
      setResults([]);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setIsSearching(true);
    timerRef.current = setTimeout(() => {
      timerRef.current = undefined;
      void runSearch(term, controller);
    }, debounceMs);
  };

  const select = (item: T) => {
    resetQuery();
    if (!clearOnSelect && !isControlled) setInternalSelected(item);
    onSelectedItemChange?.(item);
  };

  const clearSelection = () => {
    if (!isControlled) setInternalSelected(null);
    onSelectedItemChange?.(null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (event.key === 'Escape') resetQuery();
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((activeIndex + 1) % results.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(activeIndex <= 0 ? results.length - 1 : activeIndex - 1);
        break;
      case 'Enter': {
        const item = results[activeIndex];
        if (activeIndex >= 0 && item !== undefined) {
          event.preventDefault();
          select(item);
        }
        break;
      }
      case 'Escape':
        resetQuery();
        break;
    }
  };

  const renderContent = (item: T) => (renderItem ? renderItem(item) : itemText(item));
  const describedBy = hasError ? errorId : helperText ? helperId : undefined;

  return (
    <div {...rest} className={cx('trazos-autocomplete', className)}>
      {label != null && label !== '' && (
        <label className="trazos-autocomplete-label" htmlFor={inputId}>
          {label}
          {required && (
            <span className="trazos-autocomplete-required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {currentSelected != null && !clearOnSelect ? (
        <div className="trazos-autocomplete-selected">
          <span className="trazos-autocomplete-selected-content">{renderContent(currentSelected)}</span>
          <button
            type="button"
            className="trazos-autocomplete-clear"
            disabled={disabled}
            onClick={clearSelection}
            aria-label={clearText}
            title={clearText}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <>
          <div
            className={cx(
              'trazos-autocomplete-field',
              hasError && 'trazos-autocomplete-has-error',
              disabled && 'trazos-autocomplete-disabled',
            )}
          >
            <span className="trazos-autocomplete-icon" aria-hidden="true">
              {isSearching ? (
                <span className="trazos-autocomplete-spinner" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              )}
            </span>
            <input
              id={inputId}
              type="text"
              className="trazos-autocomplete-input"
              role="combobox"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={isOpen}
              aria-controls={listId}
              aria-activedescendant={isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined}
              aria-required={required || undefined}
              aria-invalid={hasError || undefined}
              aria-describedby={describedBy}
              placeholder={placeholder}
              disabled={disabled}
              value={query}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => { setHasFocus(true); }}
              onBlur={() => { setHasFocus(false); }}
            />
          </div>

          {isOpen && (
            <ul id={listId} className="trazos-autocomplete-list" role="listbox">
              {results.length === 0 ? (
                <li className="trazos-autocomplete-empty" role="presentation">
                  {isSearching ? searchingText : noResultsText}
                </li>
              ) : (
                results.map((item, index) => (
                  <li
                    // Results have no intrinsic key; the Razor version also renders by position.
                    key={index}
                    id={optionId(index)}
                    role="option"
                    aria-selected={index === activeIndex}
                    className={cx('trazos-autocomplete-option', index === activeIndex && 'trazos-autocomplete-option-active')}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      select(item);
                    }}
                    onMouseEnter={() => { setActiveIndex(index); }}
                  >
                    {renderContent(item)}
                  </li>
                ))
              )}
            </ul>
          )}
        </>
      )}

      {hasError ? (
        <p id={errorId} className="trazos-autocomplete-error" role="alert">
          {error}
        </p>
      ) : (
        helperText != null &&
        helperText !== '' && (
          <p id={helperId} className="trazos-autocomplete-helper">
            {helperText}
          </p>
        )
      )}
    </div>
  );
}
