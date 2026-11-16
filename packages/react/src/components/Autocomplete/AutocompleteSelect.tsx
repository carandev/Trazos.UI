import { useEffect, useRef, useState } from 'react';
import { Autocomplete, type AutocompleteProps } from './Autocomplete';

/**
 * Loads the item of a value that is not in `items`. Receives an `AbortSignal`
 * that is aborted when the value changes or the component unmounts.
 */
export type AutocompleteResolveFn<T, V> = (
  value: V,
  signal: AbortSignal,
) => T | null | undefined | Promise<T | null | undefined>;

export interface AutocompleteSelectProps<T, V>
  extends Omit<
    AutocompleteProps<T>,
    'selectedItem' | 'defaultSelectedItem' | 'onSelectedItemChange' | 'clearOnSelect' | 'defaultValue'
  > {
  /** Controlled value (normally an id); `null` for none. */
  value?: V | null;
  /** Initial value for uncontrolled use. */
  defaultValue?: V | null;
  /** Called with `valueSelector(item)` on select, and with `null` on clear. */
  onValueChange?: (value: V | null) => void;
  /** The value bound for an item, normally its id. Values are compared with `Object.is`. */
  valueSelector: (item: T) => V;
  /**
   * Loads the item of an existing value that is not in `items`, such as an id
   * when the list comes from `searchFn`.
   */
  resolveItem?: AutocompleteResolveFn<T, V>;
}

/**
 * Searchable select bound to a value such as an id: an Autocomplete over a
 * preloaded list (or a search function) whose value is `valueSelector(item)`.
 * The list opens on focus, because `minChars` defaults to 0.
 */
export function AutocompleteSelect<T, V>({
  value,
  defaultValue = null,
  onValueChange,
  valueSelector,
  resolveItem,
  items,
  minChars = 0,
  debounceMs = 150,
  maxResults = 50,
  noResultsText = 'No results',
  searchingText = 'Searching…',
  clearText = 'Clear selection',
  ...rest
}: AutocompleteSelectProps<T, V>) {
  const [internalValue, setInternalValue] = useState<V | null>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internalValue;
  // The last item chosen or resolved: it shows the value when the item is not in `items`.
  const [picked, setPicked] = useState<T | null>(null);

  const matches = (item: T) => current !== null && Object.is(valueSelector(item), current);
  const selectedItem =
    current === null
      ? null
      : picked !== null && matches(picked)
        ? picked
        : (items?.find(matches) ?? null);

  const resolveRef = useRef(resolveItem);
  const selectorRef = useRef(valueSelector);
  useEffect(() => {
    resolveRef.current = resolveItem;
    selectorRef.current = valueSelector;
  });

  const needsResolve = current !== null && selectedItem === null && resolveItem !== undefined;
  useEffect(() => {
    const resolve = resolveRef.current;
    if (!needsResolve || !resolve) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const item = await resolve(current, controller.signal);
        if (controller.signal.aborted || item == null) return;
        if (Object.is(selectorRef.current(item), current)) setPicked(item);
      } catch {
        // The value stays without an item; the field shows an empty search box.
      }
    })();
    return () => {
      controller.abort();
    };
  }, [needsResolve, current]);

  const emit = (next: V | null) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  const handleSelected = (item: T | null) => {
    setPicked(item);
    emit(item === null ? null : valueSelector(item));
  };

  return (
    <Autocomplete<T>
      {...rest}
      items={items}
      minChars={minChars}
      debounceMs={debounceMs}
      maxResults={maxResults}
      noResultsText={noResultsText}
      searchingText={searchingText}
      clearText={clearText}
      selectedItem={selectedItem}
      onSelectedItemChange={handleSelected}
    />
  );
}
