import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { NumberInput, type NumberInputProps } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

function Controlled({ initial = null, ...props }: Omit<NumberInputProps, 'value'> & { initial?: number | null }) {
  const [value, setValue] = useState<number | null>(initial);
  return (
    <>
      <NumberInput
        label="Amount"
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

const input = () => screen.getByLabelText('Amount');

describe('NumberInput', () => {
  it('renders a text field with spinbutton semantics inside the shared field frame', () => {
    const { container } = render(<NumberInput label="Amount" locale="en-US" />);
    expect(input()).toHaveAttribute('type', 'text');
    expect(input()).toHaveAttribute('role', 'spinbutton');
    expect(input()).toHaveAttribute('autocomplete', 'off');
    expect(input()).toHaveAttribute('inputmode', 'decimal');
    expect(input()).toHaveClass('trazos-input-control', 'trazos-input-numeric');
    expect(input().id).toMatch(/^trazos-number-/);
    expect(input()).toHaveValue('');
    expect(input()).not.toHaveAttribute('aria-valuenow');
    expect(container.firstElementChild).toHaveClass('trazos-input-group');
  });

  it('formats currency with the locale and shows the currency symbol as prefix', () => {
    const { container } = render(
      <NumberInput label="Amount" mode="currency" currency="COP" decimals={2} locale="es-CO" value={1234567.5} />,
    );
    expect(input()).toHaveValue('1.234.567,50');
    expect(container.querySelector('.trazos-input-affix-leading')).toHaveTextContent('$');
    expect(input()).toHaveAttribute('inputmode', 'decimal');
  });

  it('uses currencySymbol instead of the locale symbol', () => {
    const { container } = render(
      <NumberInput label="Amount" mode="currency" currencySymbol="COP" decimals={0} locale="es-CO" value={2500} />,
    );
    expect(input()).toHaveValue('2.500');
    expect(container.querySelector('.trazos-input-affix-leading')).toHaveTextContent('COP');
    expect(input()).toHaveAttribute('inputmode', 'numeric');
  });

  it('defaults currency decimals to the currency digits', () => {
    render(<NumberInput label="Amount" mode="currency" currency="USD" locale="en-US" value={12} />);
    expect(input()).toHaveValue('12.00');
  });

  it('parses typed text with the locale when the field loses focus, not on every key', async () => {
    const onValueChange = vi.fn();
    render(<Controlled locale="es-CO" onValueChange={onValueChange} />);
    await userEvent.type(input(), '$ 2.500,75');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input()).toHaveValue('$ 2.500,75');
    await userEvent.tab();
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(2500.75);
    expect(input()).toHaveValue('2.500,75');
  });

  it('commits on Enter', async () => {
    render(<Controlled locale="en-US" />);
    await userEvent.type(input(), '1234.5{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('1234.5');
    expect(input()).toHaveValue('1,234.5');
  });

  it('rounds to decimals and clears to null on empty text', async () => {
    render(<Controlled locale="en-US" decimals={0} initial={1} />);
    await userEvent.clear(input());
    await userEvent.type(input(), '12.6');
    await userEvent.tab();
    expect(screen.getByRole('status')).toHaveTextContent('13');
    await userEvent.clear(input());
    await userEvent.tab();
    expect(screen.getByRole('status')).toHaveTextContent('null');
    expect(input()).toHaveValue('');
  });

  it('shows a fraction as a percentage in percent mode and binds the fraction', async () => {
    const { container } = render(<Controlled locale="en-US" mode="percent" initial={0.15} />);
    expect(input()).toHaveValue('15');
    expect(container.querySelector('.trazos-input-affix-trailing')).toHaveTextContent('%');
    await userEvent.clear(input());
    await userEvent.type(input(), '20.5');
    await userEvent.tab();
    expect(screen.getByRole('status')).toHaveTextContent('0.205');
    expect(input()).toHaveValue('20.5');
  });

  it('clamps typed values to min and max', async () => {
    render(<Controlled locale="en-US" min={0} max={100} />);
    await userEvent.type(input(), '150');
    await userEvent.tab();
    expect(screen.getByRole('status')).toHaveTextContent('100');
    expect(input()).toHaveValue('100');
    await userEvent.clear(input());
    await userEvent.type(input(), '-4');
    await userEvent.tab();
    expect(screen.getByRole('status')).toHaveTextContent('0');
  });

  it('steps with the arrow keys within min and max and exposes the range', async () => {
    render(<Controlled locale="en-US" initial={90} step={5} min={0} max={100} />);
    expect(input()).toHaveAttribute('aria-valuenow', '90');
    expect(input()).toHaveAttribute('aria-valuemin', '0');
    expect(input()).toHaveAttribute('aria-valuemax', '100');
    expect(input()).toHaveAttribute('aria-valuetext', '90');
    input().focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getByRole('status')).toHaveTextContent('95');
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    expect(screen.getByRole('status')).toHaveTextContent('100');
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('status')).toHaveTextContent('95');
    expect(input()).toHaveValue('95');
    expect(input()).toHaveAttribute('aria-valuenow', '95');
  });

  it('steps percentage points in percent mode and starts from min when empty', async () => {
    render(<Controlled locale="en-US" mode="percent" decimals={1} step={0.5} min={0.01} />);
    input().focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getByRole('status')).toHaveTextContent('0.015');
    expect(input()).toHaveValue('1.5');
    expect(input()).toHaveAttribute('aria-valuetext', '1.5 %');
  });

  it('does not step when disabled or read-only', async () => {
    const onValueChange = vi.fn();
    render(<Controlled locale="en-US" initial={1} readOnly onValueChange={onValueChange} />);
    input().focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('keeps the typed text and shows the parse error until a valid number is entered', async () => {
    const onValueChange = vi.fn();
    render(<Controlled locale="en-US" initial={5} onValueChange={onValueChange} />);
    await userEvent.clear(input());
    await userEvent.type(input(), 'abc');
    await userEvent.tab();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input()).toHaveValue('abc');
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid number.');
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    expect(input()).toHaveAccessibleDescription('Enter a valid number.');
    await userEvent.clear(input());
    await userEvent.type(input(), '7');
    await userEvent.tab();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('7');
  });

  it('uses parseErrorMessage, and the error prop wins over it', async () => {
    const { rerender } = render(<NumberInput label="Amount" locale="en-US" parseErrorMessage="Numbers only." />);
    await userEvent.type(input(), 'x');
    await userEvent.tab();
    expect(screen.getByRole('alert')).toHaveTextContent('Numbers only.');
    rerender(<NumberInput label="Amount" locale="en-US" parseErrorMessage="Numbers only." error="Required." />);
    expect(screen.getByRole('alert')).toHaveTextContent('Required.');
  });

  it('works uncontrolled with defaultValue', async () => {
    const onValueChange = vi.fn();
    render(<NumberInput label="Amount" locale="en-US" defaultValue={1000} onValueChange={onValueChange} />);
    expect(input()).toHaveValue('1,000');
    await userEvent.clear(input());
    await userEvent.type(input(), '2500');
    await userEvent.tab();
    expect(onValueChange).toHaveBeenCalledWith(2500);
    expect(input()).toHaveValue('2,500');
  });

  it('can turn grouping off and shows prefix and suffix over the mode affixes', () => {
    const { container } = render(
      <NumberInput label="Amount" locale="en-US" grouping={false} mode="percent" suffix="pts" prefix="~" value={12.5} />,
    );
    expect(input()).toHaveValue('1250');
    expect(container.querySelector('.trazos-input-affix-trailing')).toHaveTextContent('pts');
    expect(container.querySelector('.trazos-input-affix-leading')).toHaveTextContent('~');
  });

  it('shows a new controlled value from the parent', () => {
    const { rerender } = render(<NumberInput label="Amount" locale="en-US" value={1} />);
    rerender(<NumberInput label="Amount" locale="en-US" value={42000} />);
    expect(input()).toHaveValue('42,000');
  });

  it('wires helper text, required, disabled and forwards ref and attributes', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <NumberInput ref={ref} id="salary" name="salary" label="Amount" helperText="Monthly" required disabled />,
    );
    const field = screen.getByRole('spinbutton', { name: 'Amount' });
    expect(ref.current).toBe(field);
    expect(field).toHaveAttribute('id', 'salary');
    expect(field).toHaveAttribute('name', 'salary');
    expect(field).toHaveAccessibleDescription('Monthly');
    expect(field).toHaveAttribute('aria-required', 'true');
    expect(field).toBeDisabled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <NumberInput label="Amount" locale="en-US" mode="currency" value={10} min={0} helperText="Help" required />,
    );
    await expectNoA11yViolations(container);
  });
});
