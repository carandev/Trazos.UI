import { fireEvent, render, screen } from '@testing-library/react';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DateInput, type DateInputProps } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

function Controlled({ initial = null, ...props }: Omit<DateInputProps, 'value'> & { initial?: string | null }) {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <>
      <DateInput
        label="Start"
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

const input = () => screen.getByLabelText('Start');

describe('DateInput', () => {
  it('renders a native date input with min and max inside the shared field frame', () => {
    const { container } = render(<DateInput label="Start" min="2026-01-01" max="2026-12-31" value="2026-03-15" />);
    expect(input()).toHaveAttribute('type', 'date');
    expect(input()).toHaveAttribute('min', '2026-01-01');
    expect(input()).toHaveAttribute('max', '2026-12-31');
    expect(input()).toHaveValue('2026-03-15');
    expect(input()).toHaveClass('trazos-input-control');
    expect(input().id).toMatch(/^trazos-date-/);
    expect(container.firstElementChild).toHaveClass('trazos-input-group');
  });

  it('reports the picked date as a yyyy-MM-dd string and clears to null', () => {
    render(<Controlled />);
    fireEvent.change(input(), { target: { value: '2026-05-04' } });
    expect(screen.getByRole('status')).toHaveTextContent('"2026-05-04"');
    fireEvent.change(input(), { target: { value: '' } });
    expect(screen.getByRole('status')).toHaveTextContent('null');
  });

  it('picks a month in monthOnly mode and binds the first day of that month', () => {
    render(<Controlled monthOnly initial="2026-03-15" min="2026-01-20" max="2026-12-31" />);
    expect(input()).toHaveAttribute('type', 'month');
    expect(input()).toHaveValue('2026-03');
    expect(input()).toHaveAttribute('min', '2026-01');
    expect(input()).toHaveAttribute('max', '2026-12');
    fireEvent.change(input(), { target: { value: '2026-07' } });
    expect(screen.getByRole('status')).toHaveTextContent('"2026-07-01"');
  });

  it('shows the parse error for text that is not a date and keeps the previous value', () => {
    const onValueChange = vi.fn();
    // Browsers without a native date picker fall back to a text box.
    render(<DateInput label="Start" defaultValue="2026-01-02" onValueChange={onValueChange} parseErrorMessage="Use yyyy-mm-dd." />);
    input().setAttribute('type', 'text');
    fireEvent.change(input(), { target: { value: '2026-13-45' } });
    fireEvent.blur(input());
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Use yyyy-mm-dd.');
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    fireEvent.change(input(), { target: { value: '2026-02-03' } });
    expect(onValueChange).toHaveBeenCalledWith('2026-02-03');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('uses the default parse error message and the error prop wins', () => {
    const { rerender } = render(<DateInput label="Start" />);
    input().setAttribute('type', 'text');
    fireEvent.change(input(), { target: { value: 'tomorrow' } });
    fireEvent.blur(input());
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid date.');
    rerender(<DateInput label="Start" error="Pick a start date." />);
    expect(screen.getByRole('alert')).toHaveTextContent('Pick a start date.');
  });

  it('works uncontrolled with defaultValue', () => {
    render(<DateInput label="Start" defaultValue="2026-04-01" />);
    expect(input()).toHaveValue('2026-04-01');
    fireEvent.change(input(), { target: { value: '2026-04-09' } });
    expect(input()).toHaveValue('2026-04-09');
  });

  it('wires helper text, required, read-only, ref and attributes', () => {
    const ref = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    render(
      <DateInput ref={ref} id="start" name="start" label="Start" helperText="Monday" required readOnly onChange={onChange} />,
    );
    const field = screen.getByLabelText(/Start/);
    expect(ref.current).toBe(field);
    expect(field).toHaveAttribute('id', 'start');
    expect(field).toHaveAttribute('name', 'start');
    expect(field).toHaveAttribute('readonly');
    expect(field).toHaveAttribute('aria-required', 'true');
    expect(field).toHaveAccessibleDescription('Monday');
    fireEvent.change(field, { target: { value: '2026-01-01' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<DateInput label="Start" value="2026-01-01" helperText="Help" required />);
    await expectNoA11yViolations(container);
  });
});
