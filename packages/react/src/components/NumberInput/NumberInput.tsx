import {
  useMemo,
  useState,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { FieldShell, useFieldIds } from '../../internal/field/FieldShell';

/** How a NumberInput presents its value. */
export type NumberInputMode = 'number' | 'currency' | 'percent';

export interface NumberInputProps
  extends Omit<
    ComponentPropsWithRef<'input'>,
    'value' | 'defaultValue' | 'prefix' | 'type' | 'min' | 'max' | 'step' | 'inputMode'
  > {
  label?: string;
  /** Controlled value; `null` is an empty field. */
  value?: number | null;
  /** Initial value for uncontrolled use. */
  defaultValue?: number | null;
  /**
   * Called with the new value when the field loses focus or Enter is pressed
   * after typing, and on every ArrowUp or ArrowDown. Empty text reports `null`.
   */
  onValueChange?: (value: number | null) => void;
  /** `'number'`, `'currency'` or `'percent'`. Percent binds the fraction: 0.15 shows 15 %. */
  mode?: NumberInputMode;
  /** BCP 47 locale used to format and parse, such as `'es-CO'`. Defaults to the browser's locale. */
  locale?: string;
  /** ISO 4217 currency code for currency mode: its symbol and digits are the defaults. */
  currency?: string;
  /** Currency mode prefix, such as `COP` or `US$`. Defaults to the currency's symbol. */
  currencySymbol?: string;
  /** Smallest allowed value, in bound units (a fraction in percent mode). Typed and stepped values are clamped. */
  min?: number;
  /** Largest allowed value, in bound units (a fraction in percent mode). Typed and stepped values are clamped. */
  max?: number;
  /** Added or removed by ArrowUp and ArrowDown. Percentage points in percent mode. */
  step?: number;
  /** Fixed number of decimals. Defaults to the currency digits in currency mode, and to as many as needed otherwise. */
  decimals?: number;
  /** Shows group separators (1,234,567). On by default. */
  grouping?: boolean;
  /** Text before the value. Overrides the currency symbol. */
  prefix?: string;
  /** Text after the value. Overrides the percent sign. */
  suffix?: string;
  helperText?: string;
  /** Error message; when set it replaces the helper text and the parse error. */
  error?: string;
  /** Shown when the typed text is not a number. */
  parseErrorMessage?: string;
  /** Shows the required marker next to the label. */
  required?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

// Enough digits for any value a person types, without float noise such as 0.30000000000000004.
const FREE_DECIMALS = 12;

/** Rounds half away from zero, like .NET MidpointRounding.AwayFromZero. */
function round(value: number, places: number): number {
  const abs = Math.abs(value);
  const text = String(abs);
  const scaled = text.includes('e') ? Math.round(abs * 10 ** places) : Math.round(Number(`${text}e${String(places)}`));
  const result = Number(`${String(scaled)}e-${String(places)}`);
  return value < 0 ? -result : result;
}

export function NumberInput({
  id,
  label,
  value,
  defaultValue = null,
  onValueChange,
  onChange,
  onBlur,
  onKeyDown,
  mode = 'number',
  locale,
  currency = 'USD',
  currencySymbol,
  min,
  max,
  step = 1,
  decimals,
  grouping = true,
  prefix,
  suffix,
  helperText,
  error,
  parseErrorMessage = 'Enter a valid number.',
  required = false,
  disabled = false,
  readOnly = false,
  leadingIcon,
  trailingIcon,
  className,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: NumberInputProps) {
  const [inner, setInner] = useState<number | null>(defaultValue);
  // Text typed since the last commit; while set it is shown instead of the formatted value.
  const [draft, setDraft] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const current = value !== undefined ? value : inner;

  const shownError = error || parseError || undefined;
  const ids = useFieldIds('trazos-number', id, helperText, shownError, ariaDescribedBy);

  const format = useMemo(() => {
    const currencyFormat = new Intl.NumberFormat(locale, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' });
    const separators = new Intl.NumberFormat(locale).formatToParts(12345.6);
    const effectiveDecimals =
      decimals ?? (mode === 'currency' ? currencyFormat.resolvedOptions().maximumFractionDigits : undefined);
    return {
      decimals: effectiveDecimals,
      number: new Intl.NumberFormat(locale, {
        minimumFractionDigits: effectiveDecimals ?? 0,
        maximumFractionDigits: effectiveDecimals ?? FREE_DECIMALS,
        useGrouping: grouping,
      }),
      currencySymbol: currencyFormat.formatToParts(0).find((part) => part.type === 'currency')?.value ?? currency,
      group: separators.find((part) => part.type === 'group')?.value ?? ',',
      decimal: separators.find((part) => part.type === 'decimal')?.value ?? '.',
    };
  }, [locale, currency, decimals, mode, grouping]);

  const scale = mode === 'percent' ? 100 : 1;
  const effectivePrefix = prefix ?? (mode === 'currency' ? (currencySymbol ?? format.currencySymbol) : undefined);
  const effectiveSuffix = suffix ?? (mode === 'percent' ? '%' : undefined);

  const formatValue = (number: number | null): string =>
    number === null || !Number.isFinite(number) ? '' : format.number.format(number * scale);

  /** Clamps to min/max and rounds to the stored precision. */
  const normalize = (number: number): number => {
    let next = number;
    if (min !== undefined && next < min) next = min;
    if (max !== undefined && next > max) next = max;
    const places = (format.decimals ?? FREE_DECIMALS) + (mode === 'percent' ? 2 : 0);
    return round(next, places);
  };

  /** The bound value for typed text: a number, null for empty text, or undefined when it is not a number. */
  const parse = (text: string): number | null | undefined => {
    let cleaned = text;
    for (const affix of [effectivePrefix, effectiveSuffix, format.currencySymbol, '%']) {
      if (affix) cleaned = cleaned.split(affix).join('');
    }
    cleaned = cleaned.replace(/\s/g, '');
    if (cleaned.length === 0) return null;
    cleaned = cleaned.split(format.group).join('').split(format.decimal).join('.').replace(/−/g, '-');
    if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(cleaned)) return undefined;
    return normalize(Number(cleaned) / scale);
  };

  const setValue = (next: number | null) => {
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };

  const commit = () => {
    if (draft === null) return;
    const parsed = parse(draft);
    if (parsed === undefined) {
      setParseError(parseErrorMessage);
      return;
    }
    setParseError(null);
    setDraft(null);
    setValue(parsed);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    setDraft(event.target.value);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    commit();
    onBlur?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'Enter') {
      commit();
      return;
    }
    if (disabled || readOnly || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return;
    event.preventDefault();
    const typed = draft === null ? undefined : parse(draft);
    const base = (typed ?? current) ?? min ?? 0;
    const delta = step / scale;
    setParseError(null);
    setDraft(null);
    setValue(normalize(event.key === 'ArrowUp' ? base + delta : base - delta));
  };

  const formatted = formatValue(current);
  const valueText =
    current === null ? undefined : [effectivePrefix, formatted, effectiveSuffix].filter(Boolean).join(' ');

  return (
    <FieldShell
      ids={ids}
      label={label}
      required={required}
      disabled={disabled}
      helperText={helperText}
      error={shownError}
      className={className}
      prefix={effectivePrefix}
      suffix={effectiveSuffix}
      leadingIcon={leadingIcon}
      trailingIcon={trailingIcon}
    >
      <input
        autoComplete="off"
        {...rest}
        id={ids.inputId}
        type="text"
        role="spinbutton"
        inputMode={format.decimals === 0 && mode !== 'percent' ? 'numeric' : 'decimal'}
        className="trazos-input-control trazos-input-numeric"
        disabled={disabled}
        readOnly={readOnly}
        value={draft ?? formatted}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        aria-valuenow={current ?? undefined}
        aria-valuetext={valueText}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-required={required || undefined}
        aria-invalid={ids.hasError || undefined}
        aria-describedby={ids.describedBy}
      />
    </FieldShell>
  );
}
