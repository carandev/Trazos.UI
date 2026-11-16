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

  it('renders typed options before the children, with their labels and disabled state', () => {
    render(
      <SelectInput
        label="Country"
        options={[
          { value: 'co', label: 'Colombia' },
          { value: 'pe', label: 'Peru', disabled: true },
        ]}
      >
        <option value="other">Other</option>
      </SelectInput>,
    );
    const options = screen.getAllByRole('option');
    expect(options.map((o) => o.textContent)).toEqual(['Colombia', 'Peru', 'Other']);
    expect(options.map((o) => o.getAttribute('value'))).toEqual(['co', 'pe', 'other']);
    expect(options[1]).toBeDisabled();
    expect(options[0]).not.toBeDisabled();
  });

  it('binds numeric option values as numbers', async () => {
    const onValueChange = vi.fn<(value: number) => void>();
    function Controlled() {
      const [value, setValue] = useState<number | null>(null);
      return (
        <>
          <SelectInput<number>
            label="Plan"
            placeholder="Choose"
            value={value}
            onValueChange={(v) => {
              onValueChange(v);
              setValue(v);
            }}
            options={[
              { value: 1, label: 'Basic' },
              { value: 2, label: 'Pro' },
            ]}
          />
          <output>{JSON.stringify(value)}</output>
        </>
      );
    }
    render(<Controlled />);
    const trigger = screen.getByRole('combobox', { name: 'Plan' });
    expect(trigger).toHaveTextContent('Choose');
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('option', { name: 'Pro' }));
    expect(onValueChange).toHaveBeenCalledWith(2);
    expect(screen.getByRole('status')).toHaveTextContent('2');
    expect(trigger).toHaveTextContent('Pro');
  });

  it('selects the option matching a typed defaultValue', () => {
    render(
      <SelectInput<number>
        label="Plan"
        defaultValue={2}
        options={[
          { value: 1, label: 'Basic' },
          { value: 2, label: 'Pro' },
        ]}
      />,
    );
    expect(screen.getByRole('combobox', { name: 'Plan' })).toHaveTextContent('Pro');
  });

  it('still reports the raw string of children options when options are also given', async () => {
    const onValueChange = vi.fn();
    render(
      <SelectInput label="Country" options={[{ value: 'co', label: 'Colombia' }]} onValueChange={onValueChange}>
        <option value="other">Other</option>
      </SelectInput>,
    );
    await userEvent.selectOptions(screen.getByLabelText('Country'), 'other');
    expect(onValueChange).toHaveBeenCalledWith('other');
  });

  it('keeps the children-only string API: a null value selects the placeholder', () => {
    render(
      <SelectInput label="Country" placeholder="Choose" value={null} onValueChange={() => undefined}>
        <Options />
      </SelectInput>,
    );
    expect(screen.getByLabelText('Country')).toHaveValue('');
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

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
  { value: 'blueberry', label: 'Blueberry' },
] as const;

function Fruit(props: { initial?: string | null; onValue?: (v: string) => void; disabled?: boolean; error?: string }) {
  const [value, setValue] = useState<string | null>(props.initial ?? null);
  return (
    <>
      <SelectInput
        id="fruit"
        label="Fruit"
        placeholder="Choose"
        options={fruits}
        value={value}
        disabled={props.disabled}
        error={props.error}
        onValueChange={(v) => {
          props.onValue?.(v);
          setValue(v);
        }}
      />
      <button type="button">Elsewhere</button>
    </>
  );
}

describe('SelectInput with typed options (library list)', () => {
  const trigger = () => screen.getByRole('combobox', { name: 'Fruit' });
  const active = () => trigger().getAttribute('aria-activedescendant');

  it('renders a combobox trigger instead of a native select', () => {
    const { container } = render(<Fruit />);
    expect(container.querySelector('select:not([hidden])')).not.toBeInTheDocument();
    expect(trigger().tagName).toBe('BUTTON');
    expect(trigger()).toHaveAttribute('id', 'fruit');
    expect(trigger()).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(trigger()).toHaveAttribute('aria-controls', 'fruit-listbox');
    expect(trigger()).toHaveAttribute('aria-labelledby', 'fruit-label');
    expect(trigger()).toHaveTextContent('Choose');
    expect(container.querySelector('.trazos-select-value')).toHaveClass('trazos-select-value-placeholder');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('opens on click and selects with the mouse, keeping focus on the trigger', async () => {
    const onValue = vi.fn();
    render(<Fruit onValue={onValue} />);
    await userEvent.click(trigger());
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    const listbox = screen.getByRole('listbox', { name: 'Fruit' });
    expect(listbox).toHaveAttribute('id', 'fruit-listbox');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Apple', 'Banana', 'Cherry', 'Blueberry']);
    expect(screen.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(screen.getByRole('option', { name: 'Cherry' }));
    expect(onValue).toHaveBeenCalledWith('cherry');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger()).toHaveTextContent('Cherry');
    expect(trigger()).toHaveFocus();
  });

  it('ignores clicks on a disabled option', async () => {
    const onValue = vi.fn();
    render(<Fruit onValue={onValue} />);
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('option', { name: 'Banana' }));
    expect(onValue).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('closes when clicking outside', async () => {
    render(<Fruit />);
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('navigates with arrows, Home and End, skipping disabled options, and Enter selects', async () => {
    const onValue = vi.fn();
    render(<Fruit onValue={onValue} />);
    trigger().focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(active()).toBe('fruit-option-0');
    expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowDown}');
    expect(active()).toBe('fruit-option-2');
    await userEvent.keyboard('{ArrowUp}');
    expect(active()).toBe('fruit-option-0');
    await userEvent.keyboard('{End}');
    expect(active()).toBe('fruit-option-3');
    await userEvent.keyboard('{Home}');
    expect(active()).toBe('fruit-option-0');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onValue).toHaveBeenCalledTimes(1);
    expect(onValue).toHaveBeenCalledWith('cherry');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger()).not.toHaveAttribute('aria-activedescendant');
    expect(trigger()).toHaveFocus();
  });

  it('opens and selects with Space', async () => {
    const onValue = vi.fn();
    render(<Fruit onValue={onValue} />);
    trigger().focus();
    await userEvent.keyboard(' ');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await userEvent.keyboard('{End} ');
    expect(onValue).toHaveBeenCalledTimes(1);
    expect(onValue).toHaveBeenCalledWith('blueberry');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('Escape closes without changing the value', async () => {
    const onValue = vi.fn();
    render(<Fruit initial="apple" onValue={onValue} />);
    trigger().focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Escape}');
    expect(onValue).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger()).toHaveTextContent('Apple');
  });

  it('Tab closes the list and moves focus on', async () => {
    render(<Fruit />);
    trigger().focus();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.tab();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Elsewhere' })).toHaveFocus();
  });

  it('opens on the selected option, which carries a check', async () => {
    const { container } = render(<Fruit initial="cherry" />);
    trigger().focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(active()).toBe('fruit-option-2');
    const cherry = screen.getByRole('option', { name: 'Cherry' });
    expect(cherry).toHaveClass('trazos-select-option-selected');
    expect(cherry.querySelector('.trazos-select-check')).toBeInTheDocument();
    expect(container.querySelectorAll('.trazos-select-check')).toHaveLength(1);
  });

  it('type-ahead moves to the first matching enabled option', async () => {
    render(<Fruit />);
    trigger().focus();
    await userEvent.keyboard('c');
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(active()).toBe('fruit-option-2');
    await userEvent.keyboard('{Escape}b');
    // Banana is disabled.
    expect(active()).toBe('fruit-option-3');
    await userEvent.keyboard('{Escape}bl');
    expect(active()).toBe('fruit-option-3');
  });

  it('does not open while disabled', async () => {
    const { container } = render(<Fruit disabled />);
    expect(trigger()).toBeDisabled();
    expect(container.querySelector('.trazos-select-wrapper')).toHaveClass('trazos-input-is-disabled');
    await userEvent.click(trigger());
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('wires error, helper and required to the trigger', () => {
    const { container } = render(
      <SelectInput id="fruit" label="Fruit" options={fruits} required helperText="Seasonal" error="Pick one" />,
    );
    expect(trigger()).toHaveAttribute('aria-invalid', 'true');
    expect(trigger()).toHaveAttribute('aria-required', 'true');
    expect(trigger()).toHaveAccessibleDescription('Pick one');
    expect(container.querySelector('.trazos-select-wrapper')).toHaveClass('trazos-input-has-error');
  });

  it('works uncontrolled and submits the value through a hidden select with the name and ref', async () => {
    const ref = createRef<HTMLSelectElement>();
    const onValueChange = vi.fn();
    render(
      <form aria-label="Form">
        <SelectInput ref={ref} label="Fruit" name="fruit" options={fruits} defaultValue="apple" onValueChange={onValueChange} />
      </form>,
    );
    expect(trigger()).toHaveTextContent('Apple');
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('option', { name: 'Blueberry' }));
    expect(onValueChange).toHaveBeenCalledWith('blueberry');
    expect(trigger()).toHaveTextContent('Blueberry');
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
    expect(ref.current?.value).toBe('blueberry');
    const data = new FormData(screen.getByRole<HTMLFormElement>('form', { name: 'Form' }));
    expect(data.get('fruit')).toBe('blueberry');
  });

  it('a null value shows the placeholder, which is not an option', async () => {
    render(<Fruit initial={null} />);
    expect(trigger()).toHaveTextContent('Choose');
    await userEvent.click(trigger());
    expect(screen.queryByRole('option', { name: 'Choose' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(4);
  });

  it('has no accessibility violations, closed and open', async () => {
    const { container } = render(<Fruit error="Pick one" />);
    await expectNoA11yViolations(container);
    await userEvent.click(trigger());
    await expectNoA11yViolations(container);
  });
});
