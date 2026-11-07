import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SelectInput } from './index';
import { expectNoA11yViolations } from '../../../test/a11y';

function Options() {
  return (
    <>
      <option value="co">Colombia</option>
      <option value="mx">Mexico</option>
    </>
  );
}

describe('SelectInput', () => {
  it('renders the Razor structure with the arrow hidden from assistive tech', () => {
    const { container } = render(
      <SelectInput label="Country">
        <Options />
      </SelectInput>,
    );
    const select = screen.getByLabelText('Country');
    expect(select.tagName).toBe('SELECT');
    expect(select).toHaveClass('trazos-select-control');
    expect(select.id).toMatch(/^trazos-select-/);
    expect(select.parentElement).toHaveClass('trazos-select-wrapper');
    expect(container.firstElementChild).toHaveClass('trazos-input-group');
    expect(container.querySelector('.trazos-input-label')).toHaveAttribute('for', select.id);
    expect(container.querySelector('.trazos-select-arrow')).toHaveAttribute('aria-hidden', 'true');
    expect(select).toHaveValue('co');
  });

  it('selects a disabled empty placeholder option when there is no value', () => {
    render(
      <SelectInput label="Country" placeholder="Choose one">
        <Options />
      </SelectInput>,
    );
    const placeholder = screen.getByRole('option', { name: 'Choose one' });
    expect(placeholder).toHaveAttribute('value', '');
    expect(placeholder).toBeDisabled();
    expect((placeholder as HTMLOptionElement).selected).toBe(true);
    expect(screen.getByLabelText('Country')).toHaveValue('');
  });

  it('renders the leading icon in its slot', () => {
    const { container } = render(
      <SelectInput label="Country" leadingIcon={<svg data-testid="lead" />}>
        <Options />
      </SelectInput>,
    );
    expect(container.querySelector('.trazos-select-icon.leading')).toContainElement(screen.getByTestId('lead'));
  });

  it('shows the required marker', () => {
    const { container } = render(
      <SelectInput label="Country" required>
        <Options />
      </SelectInput>,
    );
    expect(container.querySelector('.trazos-input-required')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('combobox', { name: 'Country' })).toHaveAttribute('aria-required', 'true');
  });

  it('wires helper and error text', () => {
    const { container, rerender } = render(
      <SelectInput label="Country" helperText="Where you live">
        <Options />
      </SelectInput>,
    );
    expect(screen.getByLabelText('Country')).toHaveAccessibleDescription('Where you live');
    rerender(
      <SelectInput label="Country" helperText="Where you live" error="Pick one">
        <Options />
      </SelectInput>,
    );
    const select = screen.getByLabelText('Country');
    expect(container.querySelector('.trazos-input-helper')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Pick one');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAccessibleDescription('Pick one');
    expect(select.parentElement).toHaveClass('trazos-input-has-error');
  });

  it('applies disabled', () => {
    render(
      <SelectInput label="Country" disabled>
        <Options />
      </SelectInput>,
    );
    expect(screen.getByLabelText('Country')).toBeDisabled();
    expect(screen.getByLabelText('Country').parentElement).toHaveClass('trazos-input-is-disabled');
  });

  it('works uncontrolled and calls onValueChange and onChange', async () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    render(
      <SelectInput label="Country" placeholder="Choose" onValueChange={onValueChange} onChange={onChange}>
        <Options />
      </SelectInput>,
    );
    await userEvent.selectOptions(screen.getByLabelText('Country'), 'mx');
    expect(screen.getByLabelText('Country')).toHaveValue('mx');
    expect(onValueChange).toHaveBeenCalledWith('mx');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('works controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState('');
      return (
        <SelectInput label="Country" placeholder="Choose" value={value} onValueChange={setValue}>
          <Options />
        </SelectInput>
      );
    }
    render(<Controlled />);
    expect(screen.getByLabelText('Country')).toHaveValue('');
    await userEvent.selectOptions(screen.getByLabelText('Country'), 'co');
    expect(screen.getByLabelText('Country')).toHaveValue('co');
  });

  it('forwards the ref, id, classes and native attributes', () => {
    const ref = createRef<HTMLSelectElement>();
    const { container } = render(
      <SelectInput ref={ref} id="country" label="Country" className="extra" name="country" defaultValue="mx">
        <Options />
      </SelectInput>,
    );
    const select = screen.getByLabelText('Country');
    expect(ref.current).toBe(select);
    expect(select).toHaveAttribute('id', 'country');
    expect(select).toHaveAttribute('name', 'country');
    expect(select).toHaveValue('mx');
    expect(container.firstElementChild).toHaveClass('extra');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <SelectInput label="Country" placeholder="Choose" helperText="Help" required>
        <Options />
      </SelectInput>,
    );
    await expectNoA11yViolations(container);
  });
});
