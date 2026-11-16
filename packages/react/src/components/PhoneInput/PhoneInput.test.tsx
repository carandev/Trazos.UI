import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PhoneInput, defaultPhoneCountries, type PhoneInputProps } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

function Controlled({ initial = null, ...props }: Omit<PhoneInputProps, 'value'> & { initial?: string | null }) {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <>
      <PhoneInput
        label="Phone"
        {...props}
        value={value}
        onValueChange={(v) => {
          props.onValueChange?.(v);
          setValue(v);
        }}
      />
      <output>{JSON.stringify(value)}</output>
    </>
  );
}

const number = () => screen.getByRole('textbox', { name: 'Phone' });
const country = () => screen.getByRole('combobox', { name: 'Country code' });

describe('PhoneInput', () => {
  it('renders a country picker and a tel input inside the shared field frame', () => {
    const { container } = render(<PhoneInput label="Phone" placeholder="300 123 4567" />);
    expect(number()).toHaveAttribute('type', 'tel');
    expect(number()).toHaveAttribute('inputmode', 'tel');
    expect(number()).toHaveAttribute('autocomplete', 'tel-national');
    expect(number()).toHaveAttribute('placeholder', '300 123 4567');
    expect(number()).toHaveClass('trazos-input-control');
    expect(number().id).toMatch(/^trazos-phone-/);
    expect(country()).toHaveClass('trazos-phone-country');
    expect(country()).toHaveValue('+57');
    expect(container.querySelector('.trazos-input-wrapper')?.firstElementChild).toBe(country());
  });

  it('lists the default countries as "dial code · name"', () => {
    render(<PhoneInput label="Phone" />);
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(defaultPhoneCountries.length);
    expect(options[0]).toHaveTextContent('+57 · Colombia');
    expect(defaultPhoneCountries.map((c) => c.dialCode)).toEqual([
      '+57', '+52', '+54', '+56', '+51', '+593', '+58', '+507', '+34', '+1',
    ]);
  });

  it('reports "dial code, space, digits", dropping anything that is not a digit', async () => {
    render(<Controlled />);
    await userEvent.type(number(), '300-123 45a67');
    expect(number()).toHaveValue('3001234567');
    expect(screen.getByRole('status')).toHaveTextContent('"+57 3001234567"');
  });

  it('changes the dial code and reports null for an empty number', async () => {
    render(<Controlled initial="+57 3001234567" />);
    await userEvent.selectOptions(country(), '+52');
    expect(screen.getByRole('status')).toHaveTextContent('"+52 3001234567"');
    await userEvent.clear(number());
    expect(screen.getByRole('status')).toHaveTextContent('null');
    expect(country()).toHaveValue('+52');
  });

  it('splits a bound value and keeps an unknown dial code selectable', () => {
    render(<PhoneInput label="Phone" value="+44 7700900123" />);
    expect(country()).toHaveValue('+44');
    expect(screen.getAllByRole('option')[0]).toHaveTextContent('+44');
    expect(number()).toHaveValue('7700900123');
  });

  it('uses defaultDialCode for a value without a dial code and for an empty value', () => {
    const { unmount } = render(<PhoneInput label="Phone" defaultDialCode="+34" value="600 11 22 33" />);
    expect(country()).toHaveValue('+34');
    expect(number()).toHaveValue('600112233');
    unmount();
    render(<PhoneInput label="Phone" defaultDialCode="+34" />);
    expect(country()).toHaveValue('+34');
  });

  it('takes custom countries, falls back to the first one and names the picker with countryLabel', () => {
    render(
      <PhoneInput
        label="Phone"
        countryLabel="Indicativo"
        countries={[
          { dialCode: '+1', name: 'Canada' },
          { dialCode: '+33', name: 'France' },
        ]}
      />,
    );
    const picker = screen.getByRole('combobox', { name: 'Indicativo' });
    expect(picker).toHaveValue('+1');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['+1 · Canada', '+33 · France']);
  });

  it('works uncontrolled with defaultValue and shows a new controlled value', async () => {
    const onValueChange = vi.fn();
    const { unmount } = render(<PhoneInput label="Phone" defaultValue="+56 912345678" onValueChange={onValueChange} />);
    expect(country()).toHaveValue('+56');
    await userEvent.type(number(), '9');
    expect(onValueChange).toHaveBeenCalledWith('+56 9123456789');
    unmount();
    const { rerender } = render(<PhoneInput label="Phone" value="+57 1" />);
    rerender(<PhoneInput label="Phone" value="+51 987654321" />);
    expect(country()).toHaveValue('+51');
    expect(number()).toHaveValue('987654321');
  });

  it('disables both controls and wires helper, error, ref and attributes', () => {
    const ref = createRef<HTMLInputElement>();
    render(<PhoneInput ref={ref} id="cell" name="cell" label="Phone" disabled error="Enter a phone" />);
    expect(ref.current).toBe(number());
    expect(number()).toHaveAttribute('id', 'cell');
    expect(number()).toHaveAttribute('name', 'cell');
    expect(number()).toBeDisabled();
    expect(country()).toBeDisabled();
    expect(number()).toHaveAttribute('aria-invalid', 'true');
    expect(number()).toHaveAccessibleDescription('Enter a phone');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<PhoneInput label="Phone" value="+57 3001234567" helperText="Mobile" required />);
    await expectNoA11yViolations(container);
  });
});
