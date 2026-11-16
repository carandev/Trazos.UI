import { useState, type ChangeEvent, type ComponentPropsWithRef } from 'react';
import { FieldShell, useFieldIds } from '../../internal/field/FieldShell';
import './PhoneInput.css';

/** A country choice of a PhoneInput. */
export interface PhoneCountry {
  /** International prefix, such as `+57`. */
  dialCode: string;
  /** Text shown in the list. Pass translated names from the app. */
  name: string;
}

/** A short default list, the same as the Blazor PhoneCountry.Defaults. Apps usually pass their own, translated and ordered. */
export const defaultPhoneCountries: readonly PhoneCountry[] = [
  { dialCode: '+57', name: 'Colombia' },
  { dialCode: '+52', name: 'México' },
  { dialCode: '+54', name: 'Argentina' },
  { dialCode: '+56', name: 'Chile' },
  { dialCode: '+51', name: 'Perú' },
  { dialCode: '+593', name: 'Ecuador' },
  { dialCode: '+58', name: 'Venezuela' },
  { dialCode: '+507', name: 'Panamá' },
  { dialCode: '+34', name: 'España' },
  { dialCode: '+1', name: 'United States / Canada' },
];

export interface PhoneInputProps
  extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'type' | 'prefix'> {
  label?: string;
  /** Controlled value: the dial code, a space and the digits, such as `'+57 3001234567'`. `null` is empty. */
  value?: string | null;
  /** Initial value for uncontrolled use. */
  defaultValue?: string | null;
  /** Called with `'+57 3001234567'` on every change, or `null` when the number is empty. */
  onValueChange?: (value: string | null) => void;
  /** Country choices. Defaults to defaultPhoneCountries. */
  countries?: readonly PhoneCountry[];
  /** Dial code selected while the value is empty. Defaults to the first country. */
  defaultDialCode?: string;
  /** Accessible name of the country picker. */
  countryLabel?: string;
  helperText?: string;
  /** Error message; when set it replaces the helper text and flags the field. */
  error?: string;
  /** Shows the required marker next to the label. */
  required?: boolean;
}

interface PhoneParts {
  dial: string;
  digits: string;
}

const onlyDigits = (text: string): string => text.replace(/[^0-9]/g, '');

/** Splits "+57 3001234567" into its dial code and digits; an empty value keeps the current dial code. */
function split(value: string | null | undefined, fallback: string, currentDial: string | undefined): PhoneParts {
  const text = value?.trim() ?? '';
  if (text.length === 0) return { dial: currentDial ?? fallback, digits: '' };
  const space = text.indexOf(' ');
  if (text.startsWith('+') && space > 0) {
    return { dial: text.slice(0, space), digits: onlyDigits(text.slice(space + 1)) };
  }
  return { dial: fallback, digits: onlyDigits(text) };
}

/**
 * Phone field with a country code picker and the national number. The value
 * is one string, `'+57 3001234567'`: the dial code, a space and the digits.
 * Spaces and dashes typed by the user are dropped. An empty number is `null`.
 */
export function PhoneInput({
  id,
  label,
  value,
  defaultValue = null,
  onValueChange,
  onChange,
  countries = defaultPhoneCountries,
  defaultDialCode,
  countryLabel = 'Country code',
  helperText,
  error,
  required = false,
  disabled = false,
  className,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: PhoneInputProps) {
  const fallback = defaultDialCode ?? countries[0]?.dialCode ?? '+1';
  const [parts, setParts] = useState<PhoneParts>(() => split(value ?? defaultValue, fallback, undefined));
  const [lastValue, setLastValue] = useState(value);
  const ids = useFieldIds('trazos-phone', id, helperText, error, ariaDescribedBy);

  // A new value from the parent is split again, like the Blazor component.
  if (value !== undefined && value !== lastValue) {
    setLastValue(value);
    setParts(split(value, fallback, parts.dial));
  }

  // Keep an unknown code from the bound value selectable.
  const available = countries.some((c) => c.dialCode === parts.dial)
    ? countries
    : [{ dialCode: parts.dial, name: parts.dial }, ...countries];

  const commit = (next: PhoneParts) => {
    setParts(next);
    const text = next.digits.length === 0 ? null : `${next.dial} ${next.digits}`;
    if (value !== undefined) setLastValue(text);
    onValueChange?.(text);
  };

  const handleNumber = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    commit({ dial: parts.dial, digits: onlyDigits(event.target.value) });
  };

  const handleCountry = (event: ChangeEvent<HTMLSelectElement>) => {
    commit({ dial: event.target.value, digits: parts.digits });
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
    >
      <select
        className="trazos-phone-country"
        aria-label={countryLabel}
        disabled={disabled}
        value={parts.dial}
        onChange={handleCountry}
      >
        {available.map((country) => (
          <option key={country.dialCode} value={country.dialCode}>
            {country.dialCode === country.name ? country.dialCode : `${country.dialCode} · ${country.name}`}
          </option>
        ))}
      </select>
      <input
        autoComplete="tel-national"
        {...rest}
        id={ids.inputId}
        type="tel"
        inputMode="tel"
        className="trazos-input-control"
        disabled={disabled}
        value={parts.digits}
        onChange={handleNumber}
        aria-required={required || undefined}
        aria-invalid={ids.hasError || undefined}
        aria-describedby={ids.describedBy}
      />
    </FieldShell>
  );
}
