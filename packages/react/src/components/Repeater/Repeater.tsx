import { useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import './Repeater.css';

/** What a Repeater row receives. Mirrors `RepeaterContext<TItem>` in Blazor. */
export interface RepeaterContext<T> {
  /** The row's item. */
  item: T;
  /** Zero-based position. */
  index: number;
  /** The last row. Use it for an open-ended last tier, such as "and above". */
  isLast: boolean;
}

export interface RepeaterProps<T> extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** Controlled rows. Pair it with onItemsChange. */
  items?: readonly T[];
  /** Initial rows for uncontrolled use. */
  defaultItems?: readonly T[];
  /** Called with a new array after a row is added or removed. */
  onItemsChange?: (items: T[]) => void;
  /** Renders the cells of a row. */
  renderItem: (context: RepeaterContext<T>) => ReactNode;
  /** Builds the item added by the add button. No add button when absent. */
  createItem?: (items: readonly T[]) => T;
  /** Column titles above the rows, laid out like the row cells. Hidden on phones. */
  header?: ReactNode;
  /** Shown when there are no rows. */
  emptyContent?: ReactNode;
  /** Remove buttons are disabled at this count. */
  minItems?: number;
  /** The add button is disabled at this count. */
  maxItems?: number;
  disabled?: boolean;
  /** Accessible name of the list of rows. */
  label?: string;
  addText?: string;
  /** Accessible name of each remove button. `{0}` is the row number, from 1. */
  removeLabelFormat?: string;
}

interface RowKeys {
  keys: number[];
  next: number;
}

function fitKeys(rows: RowKeys, count: number): RowKeys {
  if (rows.keys.length > count) return { keys: rows.keys.slice(0, count), next: rows.next };
  const added = Array.from({ length: count - rows.keys.length }, (_, i) => rows.next + i);
  return { keys: [...rows.keys, ...added], next: rows.next + added.length };
}

const noItems: readonly never[] = [];

/**
 * Editable list of rows: each row renders `renderItem` with a remove button,
 * and an add button appends `createItem(items)`. Built for tiered tables such
 * as rate brackets, price tiers or schedules. Row keys live apart from the
 * items, so a row keeps its state when an earlier row is removed.
 */
export function Repeater<T>({
  items,
  defaultItems = noItems,
  onItemsChange,
  renderItem,
  createItem,
  header,
  emptyContent,
  minItems = 0,
  maxItems,
  disabled = false,
  label,
  addText = 'Add row',
  removeLabelFormat = 'Remove row {0}',
  className,
  ...rest
}: RepeaterProps<T>) {
  const [internalItems, setInternalItems] = useState<readonly T[]>(defaultItems);
  const isControlled = items !== undefined;
  const current = isControlled ? items : internalItems;

  const [rows, setRows] = useState<RowKeys>(() => fitKeys({ keys: [], next: 0 }, current.length));
  let keys = rows.keys;
  if (keys.length !== current.length) {
    // The parent changed the list by itself: keep the existing keys in order.
    const fitted = fitKeys(rows, current.length);
    setRows(fitted);
    keys = fitted.keys;
  }

  const emit = (next: T[]) => {
    if (!isControlled) setInternalItems(next);
    onItemsChange?.(next);
  };

  const canAdd = !disabled && (maxItems === undefined || current.length < maxItems);
  const canRemove = !disabled && current.length > minItems;

  const add = () => {
    if (!createItem || !canAdd) return;
    setRows({ keys: [...keys, rows.next], next: rows.next + 1 });
    emit([...current, createItem(current)]);
  };

  const removeAt = (index: number) => {
    if (!canRemove) return;
    setRows({ keys: keys.filter((_, i) => i !== index), next: rows.next });
    emit(current.filter((_, i) => i !== index));
  };

  return (
    <div {...rest} className={cx('trazos-repeater', className)}>
      {header != null && (
        <div className="trazos-repeater-header" aria-hidden="true">
          <div className="trazos-repeater-cells">{header}</div>
          <span className="trazos-repeater-spacer" />
        </div>
      )}

      <ol className="trazos-repeater-rows" aria-label={label}>
        {current.map((item, index) => (
          <li key={keys[index]} className="trazos-repeater-row">
            <div className="trazos-repeater-cells">
              {renderItem({ item, index, isLast: index === current.length - 1 })}
            </div>
            <button
              type="button"
              className="trazos-repeater-remove"
              aria-label={removeLabelFormat.replace('{0}', String(index + 1))}
              disabled={!canRemove}
              onClick={() => {
                removeAt(index);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </button>
          </li>
        ))}
      </ol>

      {current.length === 0 && emptyContent != null && <div className="trazos-repeater-empty">{emptyContent}</div>}

      {createItem && (
        <button type="button" className="trazos-repeater-add" disabled={!canAdd} onClick={add}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {addText}
        </button>
      )}
    </div>
  );
}
